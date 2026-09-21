import { memo } from 'react'

function StatCard({ icon, label, value, tone = 'primary' }) {
  return (
    <div className="card stat-card">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

export default memo(StatCard)