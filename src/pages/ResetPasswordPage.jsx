import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import styles from './ResetPasswordPage.module.css'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState(token ? 'idle' : 'missing')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const strength = useMemo(() => {
    if (password.length < 8) return { label: 'Weak', value: 1 }
    if (password.length < 12) return { label: 'Fair', value: 2 }
    return { label: 'Strong', value: 3 }
  }, [password])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setStatus('missing')
      setError('The reset token is missing. Please use the link sent to your email.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setStatus('loading')

    try {
      await Promise.resolve()
      setStatus('success')
      setMessage('Your password has been updated. You can now sign in using your new password.')
      setTimeout(() => navigate('/login'), 1600)
    } catch (err) {
      setStatus('error')
      setError('Unable to reset your password right now. Please request a new link and try again.')
    }
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <Link to="/forgot-password" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back
          </Link>

          <div className={styles.header}>
            <span className={styles.eyebrow}>Secure account reset</span>
            <h1>Create a new password</h1>
            <p>Choose a strong password to protect your account.</p>
          </div>

          {status === 'missing' ? (
            <div className={styles.infoState}>The reset link is invalid or expired. Please request a new password reset link.</div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                <span>New password</span>
                <div className={styles.inputWrap}>
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter a new password"
                    required
                  />
                  <button type="button" className={styles.toggleButton} onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className={styles.strengthBar}>
                <span>Strength: {strength.label}</span>
                <div className={styles.strengthTrack}>
                  <div className={styles.strengthFill} style={{ width: `${(strength.value / 3) * 100}%` }} />
                </div>
              </div>

              <label className={styles.field}>
                <span>Confirm password</span>
                <div className={styles.inputWrap}>
                  <Lock size={18} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <button type="button" className={styles.toggleButton} onClick={() => setShowConfirm((value) => !value)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <button type="submit" className={styles.primaryButton} disabled={status === 'loading'}>
                {status === 'loading' ? 'Updating...' : 'Reset password'}
              </button>
            </form>
          )}

          {error ? <div className={styles.errorState}>{error}</div> : null}
          {message ? <div className={styles.successState}>{message}</div> : null}
        </div>
      </div>
    </section>
  )
}

export default ResetPasswordPage
