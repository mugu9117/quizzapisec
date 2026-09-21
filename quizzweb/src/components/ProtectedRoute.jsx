import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { student, isAuthenticated } = useAuth()
  const { admin, isAuthenticated: isAdmin } = useAdminAuth()
  const location = useLocation()

  if (role === 'admin') {
    if (!isAdmin || !admin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />
    }
    return children
  }

  if (!isAuthenticated || !student) {
    return <Navigate to="/" state={{ from: location }} replace />
  }
  return children
}