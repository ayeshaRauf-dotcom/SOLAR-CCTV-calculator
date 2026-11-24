import { useRef, useState } from 'react'
import { useSettings } from '../hooks/useSettings.jsx'
import { validateEnquiry } from '../utils/validation.js'
import { buildMessage, buildWhatsAppUrl } from '../utils/whatsapp.js'
import Field, { describedBy } from './Field.jsx'
import Icon from './Icon.jsx'

// One enquiry form shared by both calculators.
// Nothing is saved: the form state lives in this component and ends in a WhatsApp link.
export default function EnquiryForm({ service, summary, defaultCityId = '' }) {
  const settings = useSettings()
  const { content } = settings
  const [form, setForm] = useState({ name: '', phone: '', cityId: defaultCityId, note: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(null) // { url, message }
  const refs = { name: useRef(null), phone: useRef(null), city: useRef(null), note: useRef(null) }

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setSent(null)
    if (errors[key === 'cityId' ? 'city' : key]) setErrors((er) => ({ ...er, [key === 'cityId' ? 'city' : key]: undefined }))
  }

  function submit(e) {
    e.preventDefault()
    const { errors: found, valid, values } = validateEnquiry(form, settings)
    setErrors(found)
    if (!valid) {
      const first = ['name', 'phone', 'city', 'note'].find((k) => found[k])
      refs[first]?.current?.focus()
      return
    }
    const message = buildMessage({ settings, service, customer: values, summary })
    const url = buildWhatsAppUrl(settings.company.whatsappNumber, message)
    const win = window.open(url, '_blank')
    if (win) win.opener = null
    setSent({ url, message, blocked: !win })
  }

  const errorList = ['name', 'phone', 'city', 'note'].filter((k) => errors[k])

  return (
    <section className="card enquiry" aria-labelledby={`enquiry-${service}-title`}>
      <h3 id={`enquiry-${service}-title`}>{content.enquiryTitle}</h3>
      <form onSubmit={submit} noValidate>
        {errorList.length > 0 && (
          <p className="form-alert" role="alert">Please fix {errorList.length === 1 ? 'the highlighted field' : `the ${errorList.length} highlighted fields`} and try again.</p>
        )}
        <Field id={`${service}-name`} label="Full name" error={errors.name}>
          <input ref={refs.name} id={`${service}-name`} className="input" type="text" autoComplete="name" maxLength={120}
            value={form.name} onChange={update('name')} aria-invalid={!!errors.name} aria-describedby={describedBy(`${service}-name`, null, errors.name)} aria-required="true" />
        </Field>
        <Field id={`${service}-phone`} label="Mobile number" hint="For example 0300 1234567" error={errors.phone}>
          <input ref={refs.phone} id={`${service}-phone`} className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={25}
            value={form.phone} onChange={update('phone')} aria-invalid={!!errors.phone} aria-describedby={describedBy(`${service}-phone`, true, errors.phone)} aria-required="true" />
        </Field>
        <Field id={`${service}-city`} label="City" error={errors.city}>
          <select ref={refs.city} id={`${service}-city`} className="input" autoComplete="address-level2"
            value={form.cityId} onChange={update('cityId')} aria-invalid={!!errors.city} aria-describedby={describedBy(`${service}-city`, null, errors.city)} aria-required="true">
            <option value="">Select your city</option>
            {settings.cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field id={`${service}-note`} label="Additional note (optional)" error={errors.note} hint="Anything we should know, like the best time to call.">
          <textarea ref={refs.note} id={`${service}-note`} className="input" rows={3} maxLength={600}
            value={form.note} onChange={update('note')} aria-invalid={!!errors.note} aria-describedby={describedBy(`${service}-note`, true, errors.note)} />
        </Field>

        <p className="privacy"><Icon name="shield" size={18} /><span>{content.privacyNotice}</span></p>

        <button type="submit" className="btn btn--whatsapp btn--block">
          <Icon name="whatsapp" size={20} /> {content.enquiryButton}
        </button>
      </form>

      {sent && (
        <div className="sent" role="status" aria-live="polite">
          <p className="sent__title"><Icon name="check" size={18} /> {sent.blocked ? 'Your browser blocked the new tab.' : 'WhatsApp is opening with your message.'}</p>
          <p>
            <a className="btn btn--secondary" href={sent.url} target="_blank" rel="noopener noreferrer">Open WhatsApp</a>
          </p>
          <details>
            <summary>See the message we prepared</summary>
            {/* Rendered as a plain text node: customer input can never become HTML. */}
            <pre className="sent__message" data-testid="wa-message">{sent.message}</pre>
          </details>
        </div>
      )}
    </section>
  )
}
