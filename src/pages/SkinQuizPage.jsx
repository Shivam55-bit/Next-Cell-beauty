import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Droplets,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react'
import { fetchSkinQuizQuestions, submitSkinQuiz } from '../services/quizApi.js'
import styles from './SkinQuizPage.module.css'

/* ─── Quiz states ─────────────────────────────────────────────────── */
const STATE = { LOADING: 'loading', ERROR: 'error', EMPTY: 'empty', QUIZ: 'quiz', SUBMITTING: 'submitting', RESULT: 'result', SUBMIT_ERROR: 'submit_error' }

function SkinQuizPage() {
  const [uiState, setUiState] = useState(STATE.LOADING)
  const [questions, setQuestions] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  /* ─── Load questions from API ──────────────────────────────────── */
  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const items = await fetchSkinQuizQuestions()
        if (!mounted) return
        if (items.length === 0) {
          setUiState(STATE.EMPTY)
        } else {
          setQuestions(items)
          setUiState(STATE.QUIZ)
        }
      } catch (err) {
        if (!mounted) return
        setErrorMsg(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load quiz questions. Please check your connection and try again.'
        )
        setUiState(STATE.ERROR)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [])

  /* ─── Derived quiz state ───────────────────────────────────────── */
  const currentQuestion = questions[step]
  const answerKey = currentQuestion?.key || currentQuestion?.id || `step-${step}`
  const selectedValue = answers[answerKey] || ''
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0
  const isLastStep = step === questions.length - 1

  const selectOption = (value) => {
    setAnswers((prev) => ({ ...prev, [answerKey]: value }))
  }

  const goNext = () => {
    if (!selectedValue) return
    if (isLastStep) {
      handleSubmit()
    } else {
      setStep((s) => s + 1)
    }
  }

  const goBack = () => {
    if (step === 0) return
    setStep((s) => s - 1)
  }

  /* ─── Submit answers to backend rule engine ────────────────────── */
  const handleSubmit = async () => {
    setUiState(STATE.SUBMITTING)
    setErrorMsg('')

    // Build customerId from localStorage if customer is logged in
    let customerId = null
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || '{}')
      customerId = user?.id || user?._id || null
    } catch {
      // guest user
    }

    try {
      const matchedResult = await submitSkinQuiz(answers, customerId)
      if (!matchedResult || typeof matchedResult !== 'object') {
        throw new Error('Invalid result received from server.')
      }
      setResult(matchedResult)
      setUiState(STATE.RESULT)
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to calculate your result. Please try again.'
      )
      setUiState(STATE.SUBMIT_ERROR)
    }
  }

  /* ─── Retake quiz ──────────────────────────────────────────────── */
  const retakeQuiz = () => {
    setAnswers({})
    setStep(0)
    setResult(null)
    setErrorMsg('')
    loadQuestions()
  }

  /* ═══════════════════════════════ RENDER ═══════════════════════════ */

  return (
    <section className={styles.page}>
      <div className="container">
        {/* Hero card — always visible */}
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Personalised skincare guidance</span>
            <h1>Discover Your Ideal Skincare Routine</h1>
            <p>
              Answer a few simple questions and receive a skincare plan designed
              specifically for your skin type, goals and comfort level.
            </p>
          </div>
          <div className={styles.heroBadge}>
            <Sparkles size={20} />
            <span>Beauty science, made simple</span>
          </div>
        </div>

        {/* ── Loading ── */}
        {uiState === STATE.LOADING && (
          <div className={styles.quizCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '3rem' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--quiz-accent, #e879a0)' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Loading your personalised quiz…</p>
          </div>
        )}

        {/* ── API Error (questions) ── */}
        {uiState === STATE.ERROR && (
          <div className={styles.quizCard} style={{ textAlign: 'center', padding: '2.5rem' }}>
            <AlertCircle size={36} style={{ color: '#f87171', marginBottom: 12 }} />
            <h3 style={{ marginBottom: 8 }}>Quiz Unavailable</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontSize: 14 }}>{errorMsg}</p>
            <button type="button" className={styles.primaryButton} onClick={loadQuestions}>
              <RotateCcw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state (no active questions in DB) ── */}
        {uiState === STATE.EMPTY && (
          <div className={styles.quizCard} style={{ textAlign: 'center', padding: '2.5rem' }}>
            <Sparkles size={36} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 12 }} />
            <h3 style={{ marginBottom: 8 }}>Quiz Coming Soon</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontSize: 14 }}>
              The skin quiz is being configured. Please check back shortly.
            </p>
            <Link to="/shop" className={styles.primaryButton}>
              <ShoppingBag size={16} />
              Shop Products
            </Link>
          </div>
        )}

        {/* ── Quiz in progress ── */}
        {uiState === STATE.QUIZ && currentQuestion && (
          <div className={styles.quizCard}>
            {/* Progress bar */}
            <div className={styles.progressWrap}>
              <div className={styles.progressMeta}>
                <span>Question {step + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question */}
            <div className={styles.questionBlock}>
              <h2>{currentQuestion.title || `Question ${step + 1}`}</h2>
              <p>{currentQuestion.question || currentQuestion.description}</p>

              <div className={styles.optionGrid}>
                {(currentQuestion.options || []).map((option) => {
                  const label = typeof option === 'string' ? option : option.text || option.label || String(option)
                  const value = typeof option === 'string' ? option : option.value || option.text || label
                  const isSelected = selectedValue === value

                  return (
                    <button
                      key={label}
                      type="button"
                      className={`${styles.optionButton} ${isSelected ? styles.optionButtonActive : ''}`}
                      onClick={() => selectOption(value)}
                    >
                      {isSelected && <CheckCircle2 size={18} />}
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={goBack}
                disabled={step === 0}
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={goNext}
                disabled={!selectedValue}
              >
                {isLastStep ? 'See My Routine' : 'Continue'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── Submitting ── */}
        {uiState === STATE.SUBMITTING && (
          <div className={styles.quizCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '3rem' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--quiz-accent, #e879a0)' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Analysing your answers and building your routine…</p>
          </div>
        )}

        {/* ── Submit error ── */}
        {uiState === STATE.SUBMIT_ERROR && (
          <div className={styles.quizCard} style={{ textAlign: 'center', padding: '2.5rem' }}>
            <AlertCircle size={36} style={{ color: '#f87171', marginBottom: 12 }} />
            <h3 style={{ marginBottom: 8 }}>Could Not Calculate Result</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontSize: 14 }}>{errorMsg}</p>
            <div className={styles.resultActions}>
              <button type="button" className={styles.primaryButton} onClick={handleSubmit}>
                Try Again
              </button>
              <button type="button" className={styles.secondaryButton} onClick={retakeQuiz}>
                <RotateCcw size={16} />
                Retake Quiz
              </button>
            </div>
          </div>
        )}

        {/* ── Result ── */}
        {uiState === STATE.RESULT && result && (
          <div className={styles.resultCard}>
            {/* Result header */}
            <div className={styles.resultIntro}>
              <div className={styles.resultIcon}><Sparkles size={24} /></div>
              <div>
                <span className={styles.eyebrow}>Your personalised routine</span>
                <h2>{result.title}</h2>
                {result.description && <p style={{ marginTop: 6, opacity: 0.8 }}>{result.description}</p>}
                {result.note && <p style={{ marginTop: 8, fontSize: 13, opacity: 0.65 }}>{result.note}</p>}
              </div>
            </div>

            {/* Morning + Night routine grid */}
            {((result.morningRoutine?.length > 0) || (result.nightRoutine?.length > 0)) && (
              <div className={styles.routineGrid}>
                {result.morningRoutine?.length > 0 && (
                  <div className={styles.routinePanel}>
                    <div className={styles.panelHeading}>
                      <Droplets size={18} />
                      <h3>Morning routine</h3>
                    </div>
                    <ul>
                      {result.morningRoutine.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.nightRoutine?.length > 0 && (
                  <div className={styles.routinePanel}>
                    <div className={styles.panelHeading}>
                      <ShieldCheck size={18} />
                      <h3>Night routine</h3>
                    </div>
                    <ul>
                      {result.nightRoutine.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recommended categories */}
            {result.recommendedCategories?.length > 0 && (
              <div className={styles.recommendationPanel}>
                <h3>Recommended product categories</h3>
                <div className={styles.categoryList}>
                  {result.recommendedCategories.map((cat, i) => (
                    <Link
                      key={i}
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      className={styles.categoryChip}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended products from database */}
            {Array.isArray(result.products) && result.products.length > 0 && (
              <div className={styles.recommendationPanel}>
                <h3>Recommended for you</h3>
                <div className={styles.productGrid}>
                  {result.products.map((product) => (
                    <Link
                      key={product.id || product.slug}
                      to={`/product/${product.slug}`}
                      className={styles.productCard}
                    >
                      {product.image && (
                        <img src={product.image} alt={product.name} loading="lazy" />
                      )}
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.name}</span>
                        {product.price > 0 && (
                          <span className={styles.productPrice}>
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.resultActions}>
              <Link to="/shop" className={styles.primaryButton}>
                <ShoppingBag size={18} />
                Shop Recommended Products
              </Link>
              <button type="button" className={styles.secondaryButton} onClick={retakeQuiz}>
                <RotateCcw size={16} />
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default SkinQuizPage
