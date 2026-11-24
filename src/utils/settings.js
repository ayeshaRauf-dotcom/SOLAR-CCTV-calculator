// Checks that settings.json has everything the calculators need.
// Returns a list of readable problems. An empty list means the file is usable.

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isPos = (v) => isNum(v) && v > 0
const isStr = (v) => typeof v === 'string' && v.length > 0

export function validateSettings(s) {
  const e = []
  const need = (cond, msg) => { if (!cond) e.push(msg) }
  if (!s || typeof s !== 'object') return ['settings.json is empty or not an object.']

  need(s.company && isStr(s.company.name), 'company.name is missing.')
  need(s.company && /^\+?[0-9\s-]{10,15}$/.test(String(s.company.whatsappNumber || '')), 'company.whatsappNumber must be a phone number with country code, for example 923001234567.')
  need(s.colors && isStr(s.colors.ink) && isStr(s.colors.accent), 'colors are missing.')
  need(s.format && isStr(s.format.currencyLabel) && isStr(s.format.locale), 'format.currencyLabel and format.locale are required.')
  need(s.content && s.content.hero && s.content.whatsapp && Array.isArray(s.content.faq), 'content section is incomplete.')

  const cities = s.cities
  need(Array.isArray(cities) && cities.length > 0, 'cities must be a non-empty list.')
  if (Array.isArray(cities)) {
    cities.forEach((c, i) => need(c && isStr(c.id) && isStr(c.name) && isPos(c.peakSunHours) && isPos(c.costMultiplier), `cities[${i}] needs id, name, peakSunHours > 0 and costMultiplier > 0.`))
  }

  const so = s.solar
  if (!so) e.push('solar section is missing.')
  else {
    const i = so.input || {}
    need(isPos(i.minBill) && isPos(i.maxBill) && i.maxBill > i.minBill, 'solar.input minBill/maxBill must be positive and max > min.')
    need(isPos(i.minUnits) && isPos(i.maxUnits) && i.maxUnits > i.minUnits, 'solar.input minUnits/maxUnits must be positive and max > min.')
    need(['bill', 'units'].includes(i.defaultMode), 'solar.input.defaultMode must be "bill" or "units".')
    need(isPos(so.tariffPerUnit), 'solar.tariffPerUnit must be greater than 0.')
    need(isPos(so.daysPerMonth), 'solar.daysPerMonth must be greater than 0.')
    need(isPos(so.systemEfficiency) && so.systemEfficiency <= 1, 'solar.systemEfficiency must be between 0 and 1.')
    need(isPos(so.targetOffset) && so.targetOffset <= 1, 'solar.targetOffset must be between 0 and 1.')
    const z = so.sizing || {}
    need(isPos(z.stepKw) && isPos(z.minKw) && isPos(z.maxKw) && z.maxKw >= z.minKw, 'solar.sizing needs stepKw, minKw, maxKw (max >= min).')
    need(isPos(so.pricePerKw), 'solar.pricePerKw must be greater than 0.')
    need(isNum(so.fixedCharges) && so.fixedCharges >= 0, 'solar.fixedCharges must be 0 or more.')
    const cr = so.costRange || {}, sr = so.savingsRange || {}
    need(isPos(cr.low) && isPos(cr.high) && cr.low <= cr.high, 'solar.costRange needs low <= high, both > 0.')
    need(isPos(sr.low) && isPos(sr.high) && sr.low <= sr.high, 'solar.savingsRange needs low <= high, both > 0.')
    const r = so.rounding || {}
    need(isPos(r.costTo) && isPos(r.savingsTo) && isNum(r.paybackDecimals), 'solar.rounding is incomplete.')
    need(Array.isArray(so.roofTypes) && so.roofTypes.length > 0 && so.roofTypes.every((x) => isStr(x.id) && isStr(x.label) && isPos(x.costMultiplier) && isPos(x.yieldMultiplier)), 'solar.roofTypes needs id, label, costMultiplier, yieldMultiplier on every item.')
    need(Array.isArray(so.explanation), 'solar.explanation must be a list.')
  }

  const c = s.cctv
  if (!c) e.push('cctv section is missing.')
  else {
    const cam = c.cameras || {}
    need(isPos(cam.min) && isPos(cam.max) && cam.max >= cam.min && cam.default >= cam.min && cam.default <= cam.max, 'cctv.cameras needs min, max, default (min <= default <= max).')
    const np = c.networkPoints || {}
    need(isNum(np.min) && np.min >= 0 && isPos(np.max) && np.max >= np.min && isNum(np.pricePerPoint) && np.pricePerPoint >= 0 && isNum(np.default), 'cctv.networkPoints is incomplete.')
    need(Array.isArray(c.locations) && c.locations.length > 0 && c.locations.every((x) => isStr(x.id) && isStr(x.label) && isPos(x.installMultiplier)), 'cctv.locations needs id, label, installMultiplier.')
    need(Array.isArray(c.placements) && ['indoor', 'outdoor', 'both'].every((id) => c.placements.some((p) => p.id === id)), 'cctv.placements must include indoor, outdoor and both.')
    need(isNum(c.bothOutdoorShare) && c.bothOutdoorShare > 0 && c.bothOutdoorShare < 1, 'cctv.bothOutdoorShare must be between 0 and 1.')
    need(c.cameraPrices && isNum(c.cameraPrices.indoor) && isNum(c.cameraPrices.outdoor), 'cctv.cameraPrices.indoor/outdoor are required.')
    need(c.nightVision && isNum(c.nightVision.addOnPerCamera), 'cctv.nightVision.addOnPerCamera is required.')
    need(Array.isArray(c.recordingOptions) && c.recordingOptions.length > 0 && c.recordingOptions.every((x) => isPos(x.days) && isStr(x.label)), 'cctv.recordingOptions needs days and label.')
    const st = c.storage || {}
    need(isPos(st.gbPerCameraPerDay) && isPos(st.gbPerTb) && Array.isArray(st.drives) && st.drives.length > 0 && st.drives.every((d) => isPos(d.sizeTb) && isNum(d.price) && isStr(d.label)), 'cctv.storage is incomplete.')
    const rec = c.recorders
    need(Array.isArray(rec) && rec.length > 0 && rec.every((x) => isPos(x.maxCameras) && isNum(x.price) && isStr(x.label)), 'cctv.recorders is incomplete.')
    if (Array.isArray(rec) && rec.length && cam.max) {
      need(Math.max(...rec.map((x) => x.maxCameras)) >= cam.max, 'cctv.cameras.max is larger than the biggest recorder. Add a bigger recorder or lower the maximum.')
    }
    const ins = c.installation || {}
    need(isNum(ins.perCamera) && isNum(ins.cablingPerCamera) && isNum(ins.minimumCharge), 'cctv.installation is incomplete.')
    need(isNum(c.switchReservePorts) && Array.isArray(c.switches) && c.switches.length > 0 && c.switches.every((x) => isPos(x.maxPorts) && isNum(x.price) && isStr(x.label)), 'cctv.switches is incomplete.')
    if (Array.isArray(c.switches) && c.switches.length && np.max) {
      need(Math.max(...c.switches.map((x) => x.maxPorts)) >= np.max + (c.switchReservePorts || 0), 'cctv.networkPoints.max needs a bigger switch (max ports must cover points plus reserve ports).')
    }
    const er = c.estimateRange || {}
    need(isPos(er.low) && isPos(er.high) && er.low <= er.high && isPos(c.roundTo), 'cctv.estimateRange and cctv.roundTo are required.')
    need(Array.isArray(c.steps) && c.steps.length === 6, 'cctv.steps must list the 6 steps.')
    need(c.included && typeof c.included === 'object', 'cctv.included is required.')
  }
  return e
}
