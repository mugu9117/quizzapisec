import { Link } from 'react-router-dom'
import logoImg from '../../logo/image.png'

export const COLLEGE_NAME = 'Sengunthar Engineering College'

export function LogoMark({ size = 38, className = 'brand-mark' }) {
  return (
    <span className={className} style={size ? { width: size, height: size } : undefined}>
      <img src={logoImg} alt="" aria-hidden="true" />
    </span>
  )
}

export function Brand({ to = '/', context, sub, size = 38, className = '' }) {
  const line = context ?? sub
  return (
    <Link to={to} className={['brand', className].filter(Boolean).join(' ')} title={COLLEGE_NAME}>
      <LogoMark size={size} />
      <span className="brand-text">
        <span className="brand-name">{COLLEGE_NAME}</span>
        {line && <span className="brand-sub">{line}</span>}
      </span>
    </Link>
  )
}