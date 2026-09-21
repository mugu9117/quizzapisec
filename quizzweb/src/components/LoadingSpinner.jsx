export default function LoadingSpinner({ label = 'Loading…', centerScreen = false }) {
  return (
    <div className={`spinner-wrap ${centerScreen ? 'center-screen' : ''}`}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}