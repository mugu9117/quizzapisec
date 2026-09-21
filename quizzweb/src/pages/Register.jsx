import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import { useToast } from '../context/ToastContext'
import { errorMessage, studentApi } from '../services/api'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const PHONE_RE = /^[6-9]\d{9}$/
const FIELD_MAP = { phone_number: 'phone', confirm_password: 'confirm' }

export default function Register() {
  const [form, setForm] = useState({ name: '', college_name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const set = (key) => (e) => {
    const value = key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your full name'
    if (!form.college_name.trim()) e.college_name = 'Please enter your college name'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address'
    if (!PHONE_RE.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      await studentApi.post('/auth/register', {
        name: form.name.trim(),
        college_name: form.college_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone,
        password: form.password,
        confirm_password: form.confirm,
      })
      toast.success('Account created successfully. Please login to continue.')
      navigate('/login', { replace: true })
    } catch (err) {
      const field = err?.response?.data?.field
      const key = FIELD_MAP[field] || field
      if (key) setErrors((prev) => ({ ...prev, [key]: errorMessage(err) }))
      else toast.error(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      heading="Create your account"
      sub="Register to join the quiz competition"
      asideTitle="Build, learn and"
      asideAccent="compete."
      asideSub="Join as a student with your college email and phone number. Registration takes less than a minute."
      asideQuote={'&gt; git commit -m "ready for the quiz"\n&gt; Now register and login.'}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Name"
          placeholder="Your full name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />
        <Input
          label="College Name"
          placeholder="Your college name"
          value={form.college_name}
          onChange={set('college_name')}
          error={errors.college_name}
        />
        <Input
          label="Gmail"
          type="email"
          placeholder="you@gmail.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          label="Phone Number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          prefix="+91"
          placeholder="10-digit mobile number"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
        <PasswordInput
          label="Password"
          id="reg-password"
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="Use 6 or more characters with a mix of letters and numbers."
        />
        <PasswordInput
          label="Confirm Password"
          id="reg-confirm"
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Create Account
        </Button>
      </form>
      <p className="auth-alt">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  )
}