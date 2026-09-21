import { useState } from 'react'

export default function PasswordInput({ label = 'Password', id, className = '', ...rest }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={['input', 'with-icon', rest.error ? 'has-error' : '', className]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        <button
          type="button"
          className="input-icon-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 3 18 18" />
              <path d="M10.5 5.5A9.8 9.8 0 0 1 12 5.4c5.5 0 9.5 6.6 9.5 6.6a17 17 0 0 1-3.1 3.7" />
              <path d="M6.1 6.2A16.9 16.9 0 0 0 2.5 12S6.5 18.6 12 18.6c1.2 0 2.3-.3 3.3-.8" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          )}
        </button>
      </div>
      {rest.error && (
        <span className="field-error">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 7.5V13" />
            <path d="M12 16.5h.01" />
          </svg>
          {rest.error}
        </span>
      )}
      {!rest.error && rest.hint && <span className="field-hint">{rest.hint}</span>}
    </div>
  )
}