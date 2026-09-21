import { memo } from 'react'

const OPTION_KEYS = ['A', 'B', 'C', 'D']

function QuestionCard({ question, selected, onSelect, index = 1, total, disabled = false }) {
  if (!question) return null
  return (
    <div className="card question-card">
      <div className="question-top">
        <span className="question-no">
          Question {index} <span className="text-muted">of {total}</span>
        </span>
        <span className={`language-tag ${question.language}`}>
          <span className={`lang-dot ${question.language}`} />
          {question.language}
        </span>
      </div>
      <h2 className="question-text">{question.question}</h2>
      <div className="options" role="radiogroup" aria-label={`Question ${index}`}>
        {question.options.map((option, i) => {
          const isSelected = option === selected
          return (
            <button
              key={option}
              type="button"
              className={`option ${isSelected ? 'option-selected' : ''}`}
              onClick={() => onSelect?.(option)}
              disabled={disabled}
              role="radio"
              aria-checked={isSelected}
            >
              <span className="option-key">{OPTION_KEYS[i] ?? i + 1}</span>
              <span>{option}</span>
              <span className="option-indicator" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default memo(QuestionCard)