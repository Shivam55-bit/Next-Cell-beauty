import { createContext, useContext, useEffect, useState } from 'react'
import { fetchProfile } from '../services/profileApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('authUser')
        return stored ? JSON.parse(stored) : null
      } catch (e) {
        return null
      }
    }
    return null
  })

  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || null
    }
    return null
  })

  const [authLoading, setAuthLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('rememberUser')
    setToken(null)
    setUser(null)
    window.dispatchEvent(new Event('auth:changed'))
  }

  const initAuth = async () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (!storedToken) {
      setUser(null)
      setToken(null)
      setAuthLoading(false)
      return
    }

    try {
      setToken(storedToken)
      const res = await fetchProfile()
      const data = res?.data?.data || res?.data
      if (data) {
        const normalizedUser = {
          id: data.id || data._id,
          name: data.fullName || data.name || '',
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          avatar: data.avatar || data.profileImage || '',
          profileImage: data.profileImage || data.avatar || '',
          role: data.role || 'user',
          provider: data.provider || 'email',
        }
        setUser(normalizedUser)
        localStorage.setItem('authUser', JSON.stringify(normalizedUser))
      }
    } catch (err) {
      // Token is invalid/expired
      if (err?.response?.status === 401) {
        logout()
      }
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    initAuth()

    const handleAuthChange = () => {
      initAuth()
    }

    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener('auth:changed', handleAuthChange)
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:changed', handleAuthChange)
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = (newToken, newUser) => {
    const normalizedUser = {
      id: newUser?.id || newUser?._id,
      name: newUser?.fullName || newUser?.name || newUser?.email || 'User',
      fullName: newUser?.fullName || newUser?.name || newUser?.email || 'User',
      email: newUser?.email || '',
      phone: newUser?.phone || '',
      address: newUser?.address || '',
      profileImage: newUser?.profileImage || newUser?.avatar || '',
      role: newUser?.role || 'user',
      provider: newUser?.provider || 'email',
    }

    localStorage.setItem('authToken', newToken)
    localStorage.setItem('authUser', JSON.stringify(normalizedUser))
    setToken(newToken)
    setUser(normalizedUser)
    window.dispatchEvent(new Event('auth:changed'))
  }

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields }
      localStorage.setItem('authUser', JSON.stringify(nextUser))
      return nextUser
    })
  }

  const value = {
    user,
    token,
    authLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
    refreshProfile: initAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
