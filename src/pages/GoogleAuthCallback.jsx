import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

function GoogleAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login: authLogin } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userRaw = searchParams.get('user')

    if (searchParams.get('error') || !token) {
      toast.error('Google sign-in failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    let googleUser = {}
    if (userRaw) {
      try {
        googleUser = JSON.parse(userRaw)
      } catch {
        googleUser = {}
      }
    }

    const displayName = googleUser.name || googleUser.fullName || 'Google User'

    authLogin(token, {
      name: displayName,
      fullName: displayName,
      email: googleUser.email || '',
      role: 'user',
      provider: 'google',
      profileImage: googleUser.profileImage || '',
    })

    toast.success('Login successful')
    navigate('/profile', { replace: true })
  }, [navigate, searchParams, authLogin])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#eef5ff] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Signing you in...
        </p>
      </div>
    </div>
  )
}

export default GoogleAuthCallback
