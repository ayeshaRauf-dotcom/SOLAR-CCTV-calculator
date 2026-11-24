import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateSolarInputs, calculateSolar, solarSummary } from '../src/utils/solarCalculations.js'
import { validateCctv, calculateCctv, cctvSummary } from '../src/utils/cctvCalculations.js'
import { validateEnquiry, normalizePhone } from '../src/utils/validation.js'
import { buildMessage, buildWhatsAppUrl } from '../src/utils/whatsapp.js'
import { validateSettings } from '../src/utils/settings.js'

const load = () => JSON.parse(readFileSync(new URL('../public/settings.json', import.meta.url), 'utf8'))
const S = load()
const solar = (o = {}) => validateSolarInputs({ mode: 'bill', amount: '30000', cityId: 'lahore', roofId: 'flat-rcc', ...o }, S)

test('settings.json passes its own validation', () => assert.deepEqual(validateSettings(S), []))

test('solar: bill result is a sane range', () => {
  const { values, errors } = solar()
  assert.deepEqual(errors, {})
  const r = calculateSolar(values, S)
  assert.ok(r.sizeKw >= S.solar.sizing.minKw)
  assert.ok(r.cost.min < r.cost.max)
  assert.ok(r.savings.min < r.savings.max)
  assert.ok(r.payback.min < r.payback.max)
  assert.ok(r.savings.max <= r.monthlyBill)
  assert.equal(r.explanation.length, S.solar.explanation.length)
  assert.ok(!r.explanation.join(' ').includes('{'))
})

test('solar: units mode works and needs no bill', () => {
  const { values } = solar({ mode: 'units', amount: '600' })
  const r = calculateSolar(values, S)
  assert.equal(r.monthlyUnits, 600)
  assert.ok(r.cost.max > 0)
})

test('solar: bad inputs give errors, never results', () => {
  for (const amount of ['', '   ', '0', '-500', 'abc', '12abc', '1e5', '1.2.3', '999999999999999999999', '500', '<script>']) {
    const { values, errors } = solar({ amount })
    assert.equal(values, null, `amount "${amount}" should be rejected`)
    assert.ok(errors.amount, `amount "${amount}" needs a message`)
  }
  assert.ok(solar({ cityId: '' }).errors.city)
  assert.ok(solar({ roofId: 'nope' }).errors.roof)
  assert.ok(solar({ amount: '1,500' }).values, 'commas are allowed')
})

test('solar: very large bill is refused with a contact message', () => {
  const { errors } = solar({ amount: '5000000' })
  assert.match(errors.amount, /contact us/i)
})

test('solar: biggest allowed inputs stay finite', () => {
  const r = calculateSolar(solar({ amount: String(S.solar.input.maxBill) }).values, S)
  for (const n of [r.sizeKw, r.cost.min, r.cost.max, r.savings.min, r.savings.max, r.payback.min, r.payback.max]) assert.ok(Number.isFinite(n) && n > 0)
})

test('solar: changing a price in settings changes the result', () => {
  const before = calculateSolar(solar().values, S)
  const S2 = load(); S2.solar.pricePerKw *= 2
  const after = calculateSolar(validateSolarInputs({ mode: 'bill', amount: '30000', cityId: 'lahore', roofId: 'flat-rcc' }, S2).values, S2)
  assert.ok(after.cost.min > before.cost.min * 1.5)
})

const cctvAnswers = (o = {}) => ({ locationId: 'shop', cameras: '8', placement: 'both', nightVision: 'yes', recordingDays: '30', networkPoints: '2', ...o })
const cctv = (o, s = S) => validateCctv(cctvAnswers(o), s)

test('cctv: full quote is a sane range with included items', () => {
  const { values, errors } = cctv()
  assert.deepEqual(errors, {})
  const r = calculateCctv(values, S)
  assert.equal(r.indoor + r.outdoor, 8)
  assert.ok(r.estimate.min < r.estimate.max)
  assert.ok(r.included.some((i) => /network switch/.test(i)))
  assert.ok(r.included.some((i) => /Night vision/.test(i)))
})

test('cctv: no network points means no switch line', () => {
  const r = calculateCctv(cctv({ networkPoints: '0' }).values, S)
  assert.equal(r.networkSwitch, null)
  assert.ok(!r.included.some((i) => /network/i.test(i)))
})

test('cctv: bad answers are rejected', () => {
  for (const o of [{ locationId: '' }, { cameras: '' }, { cameras: '0' }, { cameras: '-3' }, { cameras: 'two' }, { cameras: '2.5' }, { cameras: '1000' },
    { placement: '' }, { nightVision: '' }, { recordingDays: '' }, { recordingDays: '9999' }, { networkPoints: '' }, { networkPoints: '-1' }, { networkPoints: 'x' }, { networkPoints: '999' },
    { cameras: '1', placement: 'both' }]) {
    const { values, errors } = cctv(o)
    assert.equal(values, null, JSON.stringify(o))
    assert.ok(Object.keys(errors).length, JSON.stringify(o))
  }
})

test('cctv: every camera count and option combination gives finite prices', () => {
  for (let n = S.cctv.cameras.min; n <= S.cctv.cameras.max; n++)
    for (const placement of ['indoor', 'outdoor', 'both']) {
      if (placement === 'both' && n < 2) continue
      for (const days of S.cctv.recordingOptions.map((o) => o.days)) {
        const { values, errors } = cctv({ cameras: String(n), placement, recordingDays: String(days), networkPoints: String(S.cctv.networkPoints.max) })
        assert.deepEqual(errors, {})
        const r = calculateCctv(values, S)
        assert.ok(Number.isFinite(r.estimate.min) && r.estimate.min > 0 && r.estimate.max >= r.estimate.min)
      }
    }
})

test('cctv: changing a price in settings changes the result', () => {
  const before = calculateCctv(cctv().values, S)
  const S2 = load(); S2.cctv.cameraPrices.outdoor *= 3
  const after = calculateCctv(cctv({}, S2).values, S2)
  assert.ok(after.estimate.min > before.estimate.min)
})

test('phone validation', () => {
  for (const ok of ['03001234567', '0300 1234567', '+92 300 1234567', '923001234567', '0092-300-1234567', '(0345) 1234567']) assert.ok(normalizePhone(ok), ok)
  for (const bad of ['', '12345', '0200 1234567', '0300123456', '03001234567890', 'abcdefghijk', '+1 202 555 0100', '0300-12345a7']) assert.equal(normalizePhone(bad), null, bad)
})

test('enquiry validation', () => {
  const good = { name: 'Ali Khan', phone: '03001234567', cityId: 'lahore', note: '' }
  assert.ok(validateEnquiry(good, S).valid)
  assert.ok(validateEnquiry({ ...good, name: '  ' }, S).errors.name)
  assert.ok(validateEnquiry({ ...good, phone: '123' }, S).errors.phone)
  assert.ok(validateEnquiry({ ...good, cityId: '' }, S).errors.city)
  assert.ok(validateEnquiry({ ...good, note: 'x'.repeat(501) }, S).errors.note)
})

test('whatsapp message: script tag stays plain text, result and number are present', () => {
  const evil = '<script>alert(1)</script>'
  const v = validateEnquiry({ name: evil, phone: '03001234567', cityId: 'lahore', note: 'Call after 5pm' }, S)
  assert.ok(v.valid)
  const r = calculateSolar(solar().values, S)
  const msg = buildMessage({ settings: S, service: 'solar', customer: v.values, summary: solarSummary(r, S) })
  assert.ok(msg.includes(`Name: ${evil}`))
  assert.ok(msg.includes('Call after 5pm'))
  assert.ok(msg.includes('Recommended system size'))
  assert.ok(msg.includes(S.content.disclaimer))
  const url = buildWhatsAppUrl(S.company.whatsappNumber, msg)
  assert.ok(url.startsWith('https://wa.me/923001234567?text='))
  assert.equal(decodeURIComponent(url.split('?text=')[1]), msg)
  assert.ok(!url.includes('<'))
})

test('whatsapp message for CCTV holds the whole quote', () => {
  const v = validateEnquiry({ name: 'Sara', phone: '+92 321 7654321', cityId: 'karachi', note: '' }, S)
  const r = calculateCctv(cctv().values, S)
  const msg = buildMessage({ settings: S, service: 'cctv', customer: v.values, summary: cctvSummary(r, S) })
  for (const s of ['Installation location: Shop', 'Number of cameras: 8', 'Night vision: Yes', 'Recording duration: 30 days', 'Network points: 2', 'Estimated quotation: PKR', 'Free site survey']) assert.ok(msg.includes(s), s)
})

test('whatsapp number comes from settings', () => {
  const S2 = load(); S2.company.whatsappNumber = '+92 345 0000000'
  assert.ok(buildWhatsAppUrl(S2.company.whatsappNumber, 'hi').startsWith('https://wa.me/923450000000'))
})
