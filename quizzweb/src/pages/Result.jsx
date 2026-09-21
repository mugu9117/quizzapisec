import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import { Brand } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage, studentApi } from '../services/api'

export default function Result() {
  const [state, setState] = useState({ loading: true, result: null, submitted: false })
  const { student } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await studentApi.get('/quiz/result')
        if (cancelled) return
        if (data.submitted) {
          setState({ loading: false, result: data.result, submitted: true })
        } else {
          setState({ loading: false, result: null, submitted: false })
        }
      } catch (err) {
        if (cancelled) return
        if (err?.response?.status === 401) navigate('/login', { replace: true })
        else toast.error(errorMessage(err))
        setState((s) => ({ ...s, loading: false }))
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.loading) return <LoadingSpinner centerScreen label="Loading your result…" />

  return (
    <div className="result-page page-enter">
      <header className="result-hero">
        <div className="container result-hero-inner">
          <div className="quiz-brand">
            <Brand to="/" context="Quiz Competition" size={34} />
          </div>
          <div className="result-hero-text">
            <h1>Your Competition Result</h1>
            <p>Python &amp; Java Programming &middot; Sengunthar Engineering College</p>
          </div>
        </div>
      </header>

      <main className="container result-content">
        {state.submitted && state.result ? (
          <div className="result-card-wrap">
            <p className="result-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7" />
              </svg>
              You have already submitted your quiz — your score is recorded below.
            </p>
            <ResultCard result={state.result} studentName={student?.name} />
            <div className="result-actions">
              <Button variant="primary" size="lg" to="/">
                Back to Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="result-not-started">
            <span className="result-not-started-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
              </svg>
            </span>
            <h2>No quiz attempted yet</h2>
            <p>You haven&apos;t submitted a quiz yet. Head to the quiz to get started.</p>
            <div className="result-actions" style={{ marginTop: 18 }}>
              <Button variant="primary" size="lg" to="/quiz">
                Take the Quiz
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}