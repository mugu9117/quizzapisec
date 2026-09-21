import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import QuestionNavigator from '../components/QuestionNavigator'
import Timer, { formatTime } from '../components/Timer'
import { Brand } from '../components/Logo'
import { useToast } from '../context/ToastContext'
import { errorMessage, studentApi } from '../services/api'

const SESSION_KEY = 'quiz_session'
const ANSWERS_KEY = 'quiz_answers'

const AI_SEARCH_DETECT_MS = 3000

const VIOLATION_MESSAGES = {
  TAB_SWITCH: 'You switched to another tab or closed the quiz tab.',
  WINDOW_BLUR: 'The quiz window lost focus.',
  FULLSCREEN_EXIT: 'You exited fullscreen mode.',
  COPY: 'Copying is not allowed during the quiz.',
  PASTE: 'Pasting is not allowed during the quiz.',
  CUT: 'Cutting is not allowed during the quiz.',
  CONTEXT_MENU: 'Opening the right-click menu is not allowed during the quiz.',
  AI_APP_SWITCH:
    'You returned after being away from the quiz window. Time away to look up answers (including AI tools or search engines) is recorded.',
}

export default function Quiz() {
  const [phase, setPhase] = useState('loading')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [violationLimit, setViolationLimit] = useState(3)
  const [remaining, setRemaining] = useState(1800)
  const [warning, setWarning] = useState(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [escapeOpen, setEscapeOpen] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const deadlineRef = useRef(null)
  const answersRef = useRef({})
  const questionsRef = useRef([])
  const submittingRef = useRef(false)
  const leaveActive = useRef(false)
  const violationCountRef = useRef(0)
  const hiddenAtRef = useRef(null)
  const verifiedTimerRef = useRef(null)
  const escapeOpenRef = useRef(false)
  const lastReportRef = useRef(null)

  useEffect(() => {
    answersRef.current = answers
    if (phase === 'ready') {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
    }
  }, [answers, phase])

  useEffect(() => {
    questionsRef.current = questions
  }, [questions])

  /* ---------- load quiz ---------- */

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await studentApi.get('/quiz/start')
        if (cancelled) return
        if (data.submitted) {
          navigate('/result', { replace: true })
          return
        }
        const nextDeadlineMs = Date.now() + data.remaining * 1000
        deadlineRef.current = nextDeadlineMs
        setRemaining(data.remaining)
        setQuestions(data.questions)
        setViolationLimit(data.violation_limit)
        const saved = loadSavedAnswers(data.questions)
        setAnswers(saved)
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ startedAt: data.started_at, duration: data.duration }),
        )
        setPhase('ready')
        enterFullscreen()
      } catch (err) {
        if (cancelled) return
        if (err?.response?.status === 401) {
          localStorage.removeItem('quiz_token')
          navigate('/login', { replace: true })
          return
        }
        toast.error(errorMessage(err))
        navigate('/login', { replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSavedAnswers = (qs) => {
    try {
      const raw = localStorage.getItem(ANSWERS_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      const validIds = new Set(qs.map((q) => String(q.id)))
      const valid = {}
      Object.entries(parsed).forEach(([qid, value]) => {
        if (validIds.has(qid) && typeof value === 'string') valid[qid] = value
      })
      return valid
    } catch {
      return {}
    }
  }

  const enterFullscreen = () => {
    const el = document.documentElement
    if (!el.requestFullscreen || document.fullscreenElement) return
    el.requestFullscreen().catch(() => {
      window.setTimeout(() => {
        if (!document.fullscreenElement && el.requestFullscreen) {
          el.requestFullscreen().catch(() => {})
        }
      }, 150)
    })
  }

  useEffect(() => {
    return () => {
      if (verifiedTimerRef.current) window.clearTimeout(verifiedTimerRef.current)
    }
  }, [])

  useEffect(() => {
    escapeOpenRef.current = escapeOpen
  }, [escapeOpen])

  /* ---------- timer ---------- */

  useEffect(() => {
    if (phase !== 'ready') return undefined
    const tick = () => {
      if (submittingRef.current) return
      const next = Math.max(0, Math.round(((deadlineRef.current || 0) - Date.now()) / 1000))
      setRemaining(next)
      if (next <= 0) {
        submitQuiz()
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  /* ---------- violation listeners ---------- */

  useEffect(() => {
    if (phase !== 'ready') return undefined

    const report = (type) => {
      if (submittingRef.current || leaveActive.current) return
      const now = Date.now()
      if (lastReportRef.current && lastReportRef.current.type === type && now - lastReportRef.current.at < 1500) return
      lastReportRef.current = { type, at: now }
      leaveActive.current = true
      const optimistic = violationCountRef.current + 1
      violationCountRef.current = optimistic
      setWarning({ message: VIOLATION_MESSAGES[type], count: optimistic, limit: violationLimit })
      studentApi
        .post('/quiz/violation', { type })
        .then((res) => {
          const count = res.data.violation_count
          violationCountRef.current = count
          if (res.data.should_submit) {
            submitQuiz()
          } else {
            setWarning({ message: VIOLATION_MESSAGES[type], count, limit: res.data.violation_limit })
          }
        })
        .catch(() => {})
    }

    const checkReturn = () => {
      leaveActive.current = false
      if (hiddenAtRef.current == null) return
      const awayMs = Date.now() - hiddenAtRef.current
      hiddenAtRef.current = null
      if (awayMs >= AI_SEARCH_DETECT_MS) {
        report('AI_APP_SWITCH')
      }
    }

    const onVisibility = () => {
      if (document.hidden) hiddenAtRef.current = Date.now()
      else checkReturn()
    }
    const onBlur = () => {
      if (hiddenAtRef.current == null) hiddenAtRef.current = Date.now()
    }
    const onFocus = () => checkReturn()
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        if (!escapeOpenRef.current) report('FULLSCREEN_EXIT')
        enterFullscreen()
      }
    }
    const onCopy = (e) => {
      e.preventDefault()
      report('COPY')
    }
    const onPaste = (e) => {
      e.preventDefault()
      report('PASTE')
    }
    const onCut = (e) => {
      e.preventDefault()
      report('CUT')
    }
    const onContext = (e) => {
      e.preventDefault()
      report('CONTEXT_MENU')
    }
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (submittingRef.current || escapeOpenRef.current) return
        studentApi.post('/quiz/violation', { type: 'FULLSCREEN_EXIT' }).catch(() => {})
        leaveActive.current = true
        escapeOpenRef.current = true
        enterFullscreen()
        setEscapeOpen(true)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    document.addEventListener('fullscreenchange', onFullscreen)
    document.addEventListener('copy', onCopy)
    document.addEventListener('paste', onPaste)
    document.addEventListener('cut', onCut)
    document.addEventListener('contextmenu', onContext)
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('fullscreenchange', onFullscreen)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('paste', onPaste)
      document.removeEventListener('cut', onCut)
      document.removeEventListener('contextmenu', onContext)
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  /* ---------- submit ---------- */

  const submitQuiz = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setWarning(null)
    setSubmitOpen(false)
    try {
      const payload = {}
      Object.entries(answersRef.current).forEach(([qid, value]) => {
        payload[qid] = value
      })
      const { data } = await studentApi.post('/quiz/submit', { answers: payload })
      sessionStorage.setItem('quiz_result', JSON.stringify(data.result))
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(ANSWERS_KEY)
      setPhase('verified')
      verifiedTimerRef.current = window.setTimeout(() => {
        navigate('/result', { replace: true })
      }, 2200)
    } catch (err) {
      submittingRef.current = false
      setSubmitting(false)
      toast.error(errorMessage(err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const handleSelect = (qid, option) => {
    if (submitting) return
    setAnswers((prev) => ({ ...prev, [String(qid)]: option }))
  }

  const selectFn = (option) => handleSelect(questions[current]?.id, option)

  const jumpTo = (i) => {
    setCurrent(i)
    if (window.matchMedia('(max-width: 1024px)').matches) {
      requestAnimationFrame(() => {
        document
          .querySelector('.question-card')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  const answeredCount = Object.keys(answers).length
  const progressPct = questions.length ? (answeredCount / questions.length) * 100 : 0

  const confirmedSubmit = () => {
    submitQuiz()
  }

  if (phase === 'verified') {
    return (
      <div className="verify-page">
        <div className="verify-tick" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle className="verify-circle-bg" cx="26" cy="26" r="24" />
            <path className="verify-check" d="M14 27l8 8 16-16" />
          </svg>
        </div>
        <h2>Quiz Submitted Successfully</h2>
        <p>Your responses have been received and verified by the exam server.</p>
        <p className="verify-redirect">Redirecting to your result…</p>
      </div>
    )
  }

  if (phase === 'loading' || phase === 'submitted') {
    return <LoadingSpinner centerScreen label="Preparing your quiz…" />
  }

  const question = questions[current]
  const answeredFlags = questions.map((q) => Boolean(answers[String(q.id)]))

  return (
    <div className="quiz-page page-enter">
      <header className="quiz-topbar">
        <div className="container quiz-topbar-inner">
          <Brand to="/" context="Quiz Competition · Python &amp; Java" size={34} />
          <Timer seconds={remaining} dangerAt={120} className="timer-desktop" />
        </div>
      </header>

      <div className="quiz-sticky">
        <div className="container quiz-sticky-inner">
          <ProgressBar
            value={progressPct}
            percent={progressPct}
            label={
              <>
                Question <span className="highlight">{current + 1}</span> of {questions.length}
              </>
            }
          />
          <Timer seconds={remaining} dangerAt={120} className="timer-mobile" />
          <Button
            variant="success"
            size="sm"
            disabled={submitting}
            onClick={() => setSubmitOpen(true)}
          >
            Submit
          </Button>
        </div>
      </div>

      <main className="container quiz-layout">
        <div className="quiz-main">
          <QuestionCard
            question={question}
            index={current + 1}
            total={questions.length}
            selected={answers[String(question.id)]}
            onSelect={selectFn}
          />
          <div className="quiz-nav-row">
            <Button
              variant="outline"
              disabled={current === 0 || submitting}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              ← Previous
            </Button>
            <div className="spacer" />
            {current < questions.length - 1 ? (
              <Button
                variant="primary"
                disabled={submitting}
                onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              >
                Next →
              </Button>
            ) : (
              <Button variant="success" disabled={submitting} onClick={() => setSubmitOpen(true)}>
                Finish &amp; Submit
              </Button>
            )}
          </div>
        </div>

        <aside className="quiz-side">
          <div className="card nav-card">
            <div className="nav-card-head">
              <span className="nav-card-title">Questions</span>
              <span className="nav-card-count">
                {answeredFlags.filter(Boolean).length}/{questions.length} Answered
              </span>
            </div>
            <QuestionNavigator
              total={questions.length}
              answered={answeredFlags}
              current={current}
              onSelect={jumpTo}
            />
            <div className="nav-legend">
              <span className="legend-item">
                <span className="legend-swatch answered" /> Answered
              </span>
              <span className="legend-item">
                <span className="legend-swatch current" /> Current
              </span>
              <span className="legend-item">
                <span className="legend-swatch unanswered" /> Not answered
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* violation warning modal */}
      <Modal open={!!warning} title="Exam Warning" icon="warning" onClose={null}>
        <p>
          <strong>You left the quiz window.</strong>
        </p>
        <p style={{ marginTop: 6 }}>{warning?.message} This activity has been recorded.</p>
        <span className="violation-count">
          Violation {warning?.count} / {warning?.limit}
          <span className="violation-dots">
            {Array.from({ length: warning?.limit || 0 }).map((_, i) => (
              <i key={i} className={i < (warning?.count || 0) ? 'on' : ''} />
            ))}
          </span>
        </span>
        <div className="modal-actions">
          <Button variant="primary" block onClick={() => setWarning(null)}>
            Continue Quiz
          </Button>
        </div>
      </Modal>

      {/* escape attempt: continue or submit dialog */}
      <Modal open={escapeOpen} title="Exit Attempt Detected" icon="warning" onClose={() => !submitting && setEscapeOpen(false)}>
        <p>
          <strong>You tried to exit the fullscreen quiz.</strong>
        </p>
        <p style={{ marginTop: 6 }}>
          This activity has been recorded as a violation. You can continue the quiz or submit
          your answers right now.
        </p>
        <div className="modal-actions">
          <Button variant="outline" disabled={submitting} onClick={() => setEscapeOpen(false)}>
            Continue Quiz
          </Button>
          <Button
            variant="success"
            loading={submitting}
            onClick={() => {
              setEscapeOpen(false)
              submitQuiz()
            }}
          >
            Submit Quiz
          </Button>
        </div>
      </Modal>

      {/* submit confirmation modal */}
      <Modal open={submitOpen} title="Submit your quiz?" icon="info" onClose={() => !submitting && setSubmitOpen(false)}>
        <p>Are you sure you want to submit the quiz?</p>
        <div className="modal-stats">
          <div className="modal-stat">
            <div className="v good">{answeredCount}</div>
            <div className="l">Answered</div>
          </div>
          <div className="modal-stat">
            <div className="v bad">{questions.length - answeredCount}</div>
            <div className="l">Unanswered</div>
          </div>
          <div className="modal-stat">
            <div className="v warn">{formatTime(remaining)}</div>
            <div className="l">Time left</div>
          </div>
        </div>
        <div className="modal-actions">
          <Button variant="outline" disabled={submitting} onClick={() => setSubmitOpen(false)}>
            Cancel
          </Button>
          <Button variant="success" loading={submitting} onClick={confirmedSubmit}>
            Submit Quiz
          </Button>
        </div>
      </Modal>
    </div>
  )
}