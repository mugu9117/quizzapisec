import { memo } from 'react'

function QuestionNavigator({ total, answered, current, onSelect }) {
  const dots = Array.from({ length: total }, (_, i) => i)
  return (
    <div className="nav-grid">
      {dots.map((i) => (
        <button
          key={i}
          type="button"
          className={[
            'nav-dot',
            answered[i] ? 'answered' : '',
            current === i ? 'current' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onSelect?.(i)}
          aria-label={`Go to question ${i + 1}${answered[i] ? ' (answered)' : ''}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}

export default memo(QuestionNavigator)