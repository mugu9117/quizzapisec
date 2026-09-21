import { useEffect } from 'react'

const ICONS = {
  warning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.5h.01" />
    </svg>
  ),
  danger: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7.5V13" />
      <path d="M12 16.5h.01" />
    </svg>
  ),
  success: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m8.5 12.5 2.5 2.5 5-5.5" />
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-5" />
      <path d="M12 8h.01" />
    </svg>
  ),
}

export default function Modal({ open = false, onClose, title, icon = 'info', children, dismissable = true }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable && onClose) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, dismissable, onClose])

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (dismissable && onClose) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {(icon in ICONS) && <div className={`modal-icon ${icon}`}>{ICONS[icon]}</div>}
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}