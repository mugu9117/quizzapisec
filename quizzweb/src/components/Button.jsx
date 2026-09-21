import { Link } from 'react-router-dom'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  to,
  className = '',
  disabled,
  type,
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    size === 'lg' ? 'btn-lg' : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {loading && <LoadingDot />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type || 'button'} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}

function LoadingDot() {
  return <span className="spinner" aria-hidden="true" />
}