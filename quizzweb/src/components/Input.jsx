export default function Input({
  label,
  error,
  hint,
  prefix,
  type = 'text',
  className = '',
  id,
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\W+/g, '-') : undefined)
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="input-wrap">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          id={inputId}
          type={type}
          className={[
            'input',
            prefix ? 'with-prefix' : '',
            error ? 'has-error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
      </div>
      {error && (
        <span className="field-error">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 7.5V13" />
            <path d="M12 16.5h.01" />
          </svg>
          {error}
        </span>
      )}
      {!error && hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}