import { memo, useEffect, useState } from 'react'
import { formatDuration } from './Timer'

const RADIUS = 84
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'there'
}

function bandOf(pct) {
  if (pct >= 75) return { tone: 'high', label: 'Outstanding' }
  if (pct >= 60) return { tone: 'good', label: 'Good Performance' }
  if (pct >= 40) return { tone: 'mid', label: 'Fair Attempt' }
  return { tone: 'low', label: 'Needs Practice' }
}

const STAT_ICONS = {
  correct: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  ),
  wrong: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  time: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
}

function ResultCard({ result, studentName }) {
  const pct = result ? Math.max(0, Math.min(100, result.percentage || 0)) : 0
  const [renderedPct, setRenderedPct] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => setRenderedPct(pct), 80)
    return () => window.clearTimeout(t)
  }, [pct])

  if (!result) return null
  const { score, total, correct, wrong, completed_time, violations } = result
  const dashOffset = CIRCUMFERENCE * (1 - renderedPct / 100)
  const livePct = Math.round(renderedPct)
  const band = bandOf(pct)

  const stats = [
    { key: 'correct', icon: STAT_ICONS.correct, tone: 'good', value: correct, label: 'Correct Answers' },
    { key: 'wrong', icon: STAT_ICONS.wrong, tone: 'bad', value: wrong, label: 'Wrong Answers' },
    { key: 'time', icon: STAT_ICONS.time, tone: 'time', value: formatDuration(completed_time), label: 'Time Taken' },
    { key: 'shield', icon: STAT_ICONS.shield, tone: 'shield', value: violations || 0, label: 'Violations' },
  ]

  return (
    <article className="result-card">
      <div className="result-card-head">
        <span className="result-eyebrow">Competition Score Report</span>
        <span className={`result-band ${band.tone}`}>{band.label}</span>
      </div>

      <h2 className="result-headline">Well done, {firstName(studentName)}!</h2>
      <p className="result-subhead">
        You answered <strong>{correct}</strong> of {total} questions correctly.
      </p>

      <div className="score-ring">
        <svg width="190" height="190" viewBox="0 0 190 190" aria-hidden="true">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ring-a, var(--success))" />
              <stop offset="100%" stopColor="var(--ring-b, var(--success-dark))" />
            </linearGradient>
          </defs>
          <circle className="track" cx="95" cy="95" r={RADIUS} />
          <circle
            className={`bar ${band.tone}`}
            cx="95"
            cy="95"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="score-ring-center">
          <span className="score">
            {score}
            <small>/{total}</small>
          </span>
          <span className={`pct ${band.tone}`}>{livePct}%</span>
        </div>
      </div>

      <div className="result-stats">
        {stats.map((s) => (
          <div className="result-stat" key={s.key}>
            <span className={`stat-ico ${s.tone}`}>{s.icon}</span>
            <div className="v">{s.value}</div>
            <div className="l">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="result-foot">
        {STAT_ICONS.shield}
        Verified and recorded by the exam server
      </div>
    </article>
  )
}

export default memo(ResultCard)