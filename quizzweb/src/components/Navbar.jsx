import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from './Button'
import { Brand } from './Logo'

export default function Navbar() {
  const { student, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('You have been logged out.')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Brand to="/" />
        <div className="nav-links">
          <a className="nav-link" href="/#features">Features</a>
          <a className="nav-link" href="/#how-it-works">How it works</a>
          <Link className="nav-link" to="/admin/login">Admin Portal</Link>
        </div>
        <div className="nav-actions">
          {isAuthenticated && student ? (
            <>
              <Button variant="outline" size="sm" to="/result">
                My Result
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login">
                Login
              </Button>
              <Button variant="primary" size="sm" to="/register">
                Register Now
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}