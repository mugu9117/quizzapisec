import { memo } from 'react'

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds || 0))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds || 0))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  if (m <= 0) return `${s} sec`
  return `${m} min ${s} sec`
}

function Timer({ seconds = 0, dangerAt = 60, className = '' }) {
  const danger = seconds <= dangerAt
  return (
    <span className={`timer-pill ${danger ? 'danger' : ''} ${className}`.trim()}>
      <svg className="timer-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" />
        <path d="M9 2h6" />
      </svg>
      {formatTime(seconds)}
    </span>
  )
}

export default memo(Timer)