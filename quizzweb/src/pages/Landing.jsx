import Button from '../components/Button'
import Navbar from '../components/Navbar'

function Editor() {
  return (
    <div className="hero-visual">
      <div className="editor">
        <div className="editor-bar">
          <span className="editor-dot" />
          <span className="editor-dot" />
          <span className="editor-dot" />
          <span className="editor-title">quiz_competition.py</span>
          <div className="editor-tabs">
            <span className="active">Python</span>
            <span>Java</span>
          </div>
        </div>
        <div className="editor-body">
          <span className="cm"># 50 questions · 30 minutes</span>
          <br />
          <span className="kw">def</span> <span className="fn">ready</span>(student):
          <br />
          &nbsp;&nbsp;<span className="kw">return</span> <span className="str">f"Best&nbsp;of&nbsp;luck,&nbsp;{'{name}'}"</span>
          <br />
          <br />
          <span className="kw">class</span> <span className="fn">JavaChallenge</span> {'{'}
          <br />
          &nbsp;&nbsp;<span className="kw">public</span> <span className="kw">static</span> <span className="py-b">int</span>{' '}
          <span className="fn">score</span>() {'{'}
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">return</span> <span className="jv-b">50</span>;
          <br />
          &nbsp;&nbsp;<span className="cm">&rbrace;</span>
          <br />
          {'}'}
          <span className="cursor" />
        </div>
      </div>
      <div className="float-card float-tl">
        <span className="fc-icon fc-python">Py</span>
        <div>
          <div className="fc-label">Language</div>
          <div className="fc-value">Python</div>
        </div>
      </div>
      <div className="float-card float-br">
        <span className="fc-icon fc-java">Ja</span>
        <div>
          <div className="fc-label">Language</div>
          <div className="fc-value">Java</div>
        </div>
      </div>
      <div className="float-card float-score">
        <div className="big">42/50</div>
        <div className="sm">Your Score</div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="landing page-enter">
      <Navbar />
      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <span className="hero-eyebrow">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M8 9h8" />
                  <path d="M8 13h5" />
                </svg>
                Python &amp; Java Programming
              </span>
              <h1 className="hero-title">
                Sengunthar Engineering <br />
                College <span className="accent">Quiz Competition</span>
              </h1>
              <div className="hero-badge-line">
                <span className="lang-chip">
                  <span className="lang-dot python" /> Python
                </span>
                <span className="lang-chip">
                  <span className="lang-dot java" /> Java
                </span>
              </div>
              <p className="hero-desc">
                Test your Python and Java programming knowledge in a fast, focused
                online competition. 50 carefully designed questions, 30 minutes,
                one score that counts.
              </p>
              <div className="hero-cta">
                <Button variant="primary" size="lg" to="/register">
                  Register Now
                </Button>
                <Button variant="outline" size="lg" to="/login">
                  Login
                </Button>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="num">50</div>
                  <div className="label">Questions</div>
                </div>
                <div className="hero-stat">
                  <div className="num">30 min</div>
                  <div className="label">Time Limit</div>
                </div>
                <div className="hero-stat">
                  <div className="num">2</div>
                  <div className="label">Languages</div>
                </div>
              </div>
            </div>
            <Editor />
          </div>
        </section>

        <section className="section" id="features">
          <div className="container">
            <div className="section-head">
              <span className="section-kicker">Competition Features</span>
              <h2 className="section-title">Built like a real examination system</h2>
              <p className="section-sub">Everything you need for a smooth, fair and professional competition experience.</p>
            </div>
            <div className="feature-grid">
              <div className="card feature-card card-enter">
                <span className="feature-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M9 3v18M14.5 9 17 7l-2.5-2M17 15l-2.5 2L17 19" />
                  </svg>
                </span>
                <h3>50 Curated Questions</h3>
                <p>25 Python and 25 Java questions spanning basic, easy and intermediate difficulty.</p>
              </div>
              <div className="card feature-card card-enter">
                <span className="feature-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="13" r="8" />
                    <path d="M12 9v4l2.5 2.5" />
                    <path d="M9 2h6" />
                  </svg>
                </span>
                <h3>30-Minute Timer</h3>
                <p>Automatic submission when time runs out, with backend-verified duration.</p>
              </div>
              <div className="card feature-card card-enter">
                <span className="feature-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3 2.5 20h19L12 3Z" />
                    <path d="M12 9v5" />
                    <path d="M12 17.5h.01" />
                  </svg>
                </span>
                <h3>Instant Results</h3>
                <p>Your score is calculated securely on the server the moment you submit.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works" style={{ background: 'linear-gradient(180deg, var(--bg), #fff)' }}>
          <div className="container">
            <div className="section-head">
              <span className="section-kicker">How it works</span>
              <h2 className="section-title">Get started in four simple steps</h2>
            </div>
            <div className="steps">
              {[
                { t: 'Register', d: 'Create your student account with a valid phone number.' },
                { t: 'Login', d: 'Sign in securely and open your quiz session.' },
                { t: 'Take the Quiz', d: 'Answer 50 questions under the 30-minute timer.' },
                { t: 'View Score', d: 'Get your result instantly with time taken.' },
              ].map((s, i) => (
                <div key={s.t} className="card step-card card-enter">
                  <div className="step-num">{i + 1}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container">
            <div className="cta-card">
              <h2>Ready to test your programming skills?</h2>
              <p>Register now and compete with your peers. Good luck - code it to the top!</p>
              <Button variant="primary" size="lg" to="/register">
                Register Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>Sengunthar Engineering College © {new Date().getFullYear()}</span>
          <span>Quiz Competition · Python + Java</span>
        </div>
      </footer>
    </div>
  )
}