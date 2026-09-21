import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-rosy-nine-54.vercel.app/'

const createApi = (tokenKey) => {
  const instance = axios.create({ baseURL: API_BASE, timeout: 15000 })
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenKey)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  return instance
}

export const studentApi = createApi('quiz_token')
export const adminApi = createApi('quiz_admin_token')

export function errorMessage(err) {
  const data = err?.response?.data
  if (data?.error) return data.error
  if (data?.msg) return data.msg
  if (err?.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  if (!err?.response) return 'Cannot reach the server. Please check your connection.'
  return 'Something went wrong. Please try again.'
}
