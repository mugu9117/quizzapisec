import { createContext, useContext, useEffect, useState } from 'react'

const AdminAuthContext = createContext(null)

const TOKEN_KEY = 'quiz_admin_token'
const ADMIN_KEY = 'quiz_admin_profile'

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const raw = localStorage.getItem(ADMIN_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) setAdmin(null)
  }, [])

  const login = (token, profile) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(profile))
    setAdmin(profile)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)