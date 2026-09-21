import { memo } from 'react'

function ProgressBar({ value = 0, label, percent }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="progress-block">
      {(label || percent != null) && (
        <div className="progress-meta">
          {label && <span className="progress-label">{label}</span>}
          {percent != null && <span className="progress-pct">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className="progress-track" role="progressbar" aria-valuenow={clamped} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

export default memo(ProgressBar)