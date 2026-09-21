import { COLLEGE_NAME, LogoMark } from './Logo'

export default function AuthLayout({
  children,
  heading,
  sub,
  asideTitle,
  asideAccent,
  asideSub,
  asideQuote,
  admin = false,
}) {
  return (
    <div className={`auth-layout ${admin ? 'admin-login' : ''} page-enter`}>
      <aside className="auth-aside">
        <div className="aside-brand">
          <LogoMark size={42} />
          <span className="aside-brand-text">
            <span className="aside-brand-name">{COLLEGE_NAME}</span>
            <span className="aside-brand-sub">
              {admin ? 'Examination Administration' : 'Online Quiz Competition'}
            </span>
          </span>
        </div>
        <div>
          <h1>
            {asideTitle} {asideAccent && <span>{asideAccent}</span>}
          </h1>
          <p className="aside-sub">{asideSub}</p>
        </div>
        <div className="aside-quote">
          {asideQuote}
          {admin && (
            <span style={{ display: 'block', marginTop: 10, color: 'var(--gold)' }}>
              Restricted access · Authorized staff only
            </span>
          )}
        </div>
      </aside>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-brandline">
            <div className="auth-logo">
              <LogoMark size={34} className="" />
            </div>
            <div className="auth-brandline-text">
              <span className="auth-college">{COLLEGE_NAME}</span>
              <span className="auth-college-sub">{admin ? 'Staff Portal' : 'Student Portal'}</span>
            </div>
          </div>
          <h2 className="auth-title">{heading}</h2>
          {sub && <p className="auth-sub">{sub}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}