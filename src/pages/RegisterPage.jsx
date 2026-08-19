import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, getGoogleAuthUrl } from '../services/authApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import BrandLogo from '../components/common/BrandLogo.jsx'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import styles from './PageStyles.module.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, authLoading, login: authLogin } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/profile', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const resp = await registerUser({
        fullName: name,
        email,
        password,
      })

      const token = resp.data?.data?.token || resp.data?.token
      const user = resp.data?.data?.user || resp.data?.user || { fullName: name, email }

      authLogin(token, user)

      toast.success(resp.data.message || 'Registration successful')
      navigate('/profile', { replace: true })
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl dark:bg-slate-900/50" />

      <div
        className={`${styles.pageWrapper} relative z-10 flex min-h-[80vh] items-center justify-center`}
      >
        <div className="w-full max-w-[540px] rounded-[32px] border border-white/80 bg-white/90 px-6 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition duration-300 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100 sm:px-10 sm:py-10">
          
          <div className="mb-8 text-center">
            <Link to="/" className="flex justify-center">
              <BrandLogo className="py-2" />
            </Link>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Create Account
            </h1>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Sign up to start shopping with{' '}
              <span className="font-semibold text-blue-600 dark:text-brand-200">
                NEXT CELL BEAUTY
              </span>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                Full Name
              </label>

              <div className="flex h-[58px] items-center rounded-[18px] border border-[#e6ecf5] bg-white px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-brand-400 dark:focus-within:ring-brand-500/20">
                <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter your full name"
                  className="h-full w-full bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
                Email Address
              </label>

              <div className="flex h-[58px] items-center rounded-[18px] border border-[#e6ecf5] bg-white px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-brand-400 dark:focus-within:ring-brand-500/20">
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your password"
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

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Password must be at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-[58px] w-full items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-[#ff7a00] to-[#ff5a00] text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
            onClick={handleGoogleSignup}
            className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[18px] border border-[#e6ecf5] bg-white text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:shadow-sm"
          >
            <span className="text-lg font-bold text-blue-600">G</span>
            Sign up with Google
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-blue-600 transition hover:text-blue-700"
            >
              Sign In
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Your account information is protected.
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage