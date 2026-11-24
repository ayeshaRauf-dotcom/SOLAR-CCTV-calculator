// Accessible label + control + hint + error wrapper.
export default function Field({ id, label, hint, error, children }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  )
}

export function describedBy(id, hint, error) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}
