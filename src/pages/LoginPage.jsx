import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginUser, getGoogleAuthUrl } from '../services/authApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import BrandLogo from '../components/common/BrandLogo.jsx'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import styles from './PageStyles.module.css'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, authLoading, login: authLogin } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const dest = location.state?.from || '/profile'
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate, location])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)

    try {
      const response = await loginUser({ email, password })

      const token = response.data?.data?.token || response.data?.token
      const user = response.data?.data?.user || response.data?.user || { email }

      authLogin(token, user)

      if (remember) {
        localStorage.setItem('rememberUser', 'true')
      }

      toast.success(response.data.message || 'Login successful')

      const dest = location.state?.from || '/profile'
      navigate(dest, { replace: true })
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      const resp = await getGoogleAuthUrl()
      const url = resp?.data?.url

      if (!url) {
        toast.error('Google sign-in failed. Please try again.')
        return
      }

      window.location.href = url
    } catch (err) {
      if (err?.response?.status === 503) {
        toast.error('Google sign-in is not configured yet. Please try again later.')
      } else {
        toast.error('Google sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`${styles.pageSpacing} relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#eef5ff] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`}
    >
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-violet-500/10" />
      <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/10" />

      <div className={`${styles.pageWrapper} relative z-10 flex min-h-[80vh] items-center justify-center`}>
        <div className="w-full max-w-[520px] rounded-[32px] border border-white/80 bg-white/90 px-6 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition duration-300 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100 sm:px-10 sm:py-10">

          <div className="mb-8 text-center">
            <Link
              to="/"
              className="mb-4 flex items-center justify-center"
            >
              <BrandLogo className="py-2" />
            </Link>

            <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Welcome Back
            </h1>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Login to your account to continue shopping.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                Email Address
              </label>

              <div className="flex h-[58px] items-center rounded-[18px] border border-[#e6ecf5] bg-white px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-brand-400 dark:focus-within:ring-brand-500/20">
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="h-full w-full bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                Password
              </label>

              <div className="flex h-[58px] items-center rounded-[18px] border border-[#e6ecf5] bg-white px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-brand-400 dark:focus-within:ring-brand-500/20">
                <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-full w-full bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 transition hover:text-slate-700 dark:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                />
                Remember Me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-[58px] w-full items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-[#ff7a00] to-[#ff5a00] text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Login'}
              {!loading && (
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold tracking-wider text-slate-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[18px] border border-[#e6ecf5] bg-white text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:shadow-sm"
          >
            <span className="text-lg font-bold text-blue-600">G</span>
            Login with Google
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-blue-600 transition hover:text-blue-700"
            >
              Sign Up
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Your information is protected.
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage