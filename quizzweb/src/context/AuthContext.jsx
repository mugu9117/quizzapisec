import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'quiz_token'
const STUDENT_KEY = 'quiz_student'

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const raw = localStorage.getItem(STUDENT_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) setStudent(null)
  }, [])

  const login = (token, profile) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(STUDENT_KEY, JSON.stringify(profile))
    setStudent(profile)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(STUDENT_KEY)
    localStorage.removeItem('quiz_answers')
    localStorage.removeItem('quiz_session')
    setStudent(null)
  }

  const updateProfile = (profile) => {
    setStudent(profile)
    localStorage.setItem(STUDENT_KEY, JSON.stringify(profile))
  }

  return (
    <AuthContext.Provider value={{ student, isAuthenticated: !!student, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)