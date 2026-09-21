import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useToast } from '../context/ToastContext'
import { adminApi, errorMessage } from '../services/api'

export default function AdminLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAdminAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!phone.trim()) nextErrors.phone = 'Admin phone number is required'
    if (!password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      const { data } = await adminApi.post('/auth/admin-login', { phone_number: phone, password })
      login(data.token, data.admin)
      toast.success(`Welcome back, ${data.admin.name}!`)
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      admin
      heading="Admin Portal"
      sub="Quiz Competition · Secure staff access"
      asideTitle="Examination"
      asideAccent="command center."
      asideSub="Manage students, review scores and reset the competition database from a single dashboard."
      asideQuote={'&gt; sudo access granted\n&gt; Welcome, administrator.'}
    >
      <div className="auth-title-line" style={{ marginBottom: 22 }}>
        <span className="shield">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--secondary-800)' }}>
          Authorized personnel only
        </span>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Phone Number"
          placeholder="Admin phone number"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />
        <PasswordInput
          label="Password"
          id="admin-password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" variant="secondary" size="lg" block loading={loading}>
          Admin Login
        </Button>
      </form>
    </AuthLayout>
  )
}