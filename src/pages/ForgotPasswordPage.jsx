import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import styles from './ForgotPasswordPage.module.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setError('')
    setMessage('')

    try {
      await Promise.resolve()
      setStatus('success')
      setMessage('If that email is registered, we will send password reset instructions shortly.')
    } catch (err) {
      setStatus('error')
      setError('Unable to process your request right now. Please try again in a moment.')
    }
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <Link to="/login" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to login
          </Link>

          <div className={styles.header}>
            <span className={styles.eyebrow}>Account recovery</span>
            <h1>Forgot your password?</h1>
            <p>Enter the email used for your account and we will guide you through the reset flow.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>Email address</span>
              <div className={styles.inputWrap}>
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <button type="submit" className={styles.primaryButton} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {error ? <div className={styles.errorState}>{error}</div> : null}
          {message ? <div className={styles.successState}>{message}</div> : null}
        </div>
      </div>
    </section>
  )
}

export default ForgotPasswordPage
