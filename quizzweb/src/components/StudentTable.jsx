import { memo, useEffect, useRef } from 'react'
import { formatDuration } from './Timer'

function scoreTone(score) {
  if (score == null) return ''
  if (score >= 35) return 'high'
  if (score >= 20) return 'mid'
  return 'low'
}

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function StudentTable({
  students,
  emptyText = 'No students found.',
  selectable = false,
  selectedIds = [],
  onToggle = null,
  onToggleAll = null,
  onView = null,
}) {
  const headerRef = useRef(null)
  const selectedSet = new Set(selectedIds)
  const allSelected = students.length > 0 && students.every((s) => selectedSet.has(s.id))
  const someSelected = students.some((s) => selectedSet.has(s.id))
  const headerIndeterminate = someSelected && !allSelected

  useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = headerIndeterminate
  }, [headerIndeterminate])

  if (!students.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="table-scroll">
      <table className="student-table">
        <thead>
          <tr>
            {selectable && (
              <th className="checkbox-col">
                <input
                  ref={headerRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleAll?.()}
                  aria-label="Select all students"
                />
              </th>
            )}
            <th>Student</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Score</th>
            <th>Completed Time</th>
            <th>Submissions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr
              key={s.id}
              className={`${selectedSet.has(s.id) ? 'row-selected' : ''}${onView ? ' row-clickable' : ''}`}
              onClick={onView ? () => onView(s) : undefined}
              tabIndex={onView ? 0 : undefined}
              onKeyDown={onView ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onView(s)
                }
              } : undefined}
            >
              {selectable && (
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(s.id)}
                    onChange={() => onToggle?.(s.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${s.name}`}
                  />
                </td>
              )}
              <td>
                <div className="student-name-cell">
                  <span className="student-name-avatar">{initials(s.name)}</span>
                  <div>
                    <div className="full">{s.name}</div>
                    <div className="college">{s.college_name}</div>
                  </div>
                </div>
              </td>
              <td>{s.email}</td>
              <td className="time-cell">+91 {s.phone_number}</td>
              <td>
                {s.score != null ? (
                  <span className={`score-chip ${scoreTone(s.score)}`}>
                    {s.score} / 50
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>
                {s.completed_time != null ? (
                  <span className="time-cell">{formatDuration(s.completed_time)}</span>
                ) : (
                  <span className="muted-cell">Not attempted</span>
                )}
              </td>
              <td>
                <span className="muted-cell">{s.submissions ?? '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(StudentTable)