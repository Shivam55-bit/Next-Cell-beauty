import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach auth token for storefront requests when available
client.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
    if (token && typeof token === 'string' && token.trim()) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token.trim()}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

// Intercept 401 response from authenticated endpoints
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url || ''
      // Do not trigger global logout for login/register credentials errors
      const isAuthAuth = url.includes('/user/login') || url.includes('/user/register') || url.includes('/admin/auth/login')
      if (!isAuthAuth && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }
    return Promise.reject(error)
  }
)

export const getApiImageUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed

  const serverBase = API_BASE_URL.replace(/\/api\/?$/, '')
  const normalized = trimmed.replace(/^\/+/, '')

  if (serverBase && serverBase.startsWith('http')) {
    const base = serverBase.endsWith('/') ? serverBase : `${serverBase}/`
    return `${base}${normalized}`
  }

  return `/${normalized}`
}

export default client
