import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage, studentApi } from '../services/api'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) nextErrors.phone = 'Enter a valid 10-digit phone number'
    if (!password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      const { data } = await studentApi.post('/auth/login', { phone_number: phone, password })
      login(data.token, data.student)
      toast.success(`Welcome back, ${data.student.name.split(' ')[0]}!`)
      const from = location.state?.from?.pathname
      if (data.student?.completed) {
        navigate('/result', { replace: true })
      } else {
        navigate(from && from !== '/' ? from : '/quiz', { replace: true })
      }
    } catch (err) {
      const field = err?.response?.data?.field
      setErrors({ [field || '_']: undefined, ...(field ? { [field]: errorMessage(err) } : {}) })
      toast.error(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      heading="Welcome Back"
      sub="Login to continue your quiz"
      asideTitle="Good to see"
      asideAccent="you again."
      asideSub="Sign in with the phone number you registered with and pick up right where you left off."
      asideQuote={'&gt; python quiz.py\n&gt; Welcome back, coder.'}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Phone Number"
          placeholder="10-digit mobile number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          error={errors.phone}
        />
        <PasswordInput
          label="Password"
          id="login-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Login
        </Button>
      </form>
      <p className="auth-alt">
        Don&apos;t have an account? <Link to="/register">Register now</Link>
      </p>
    </AuthLayout>
  )
}