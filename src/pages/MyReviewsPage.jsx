import { useEffect, useState } from 'react'
import { ImagePlus, Loader2, Star } from 'lucide-react'
import { submitReview, fetchPublicReviews } from '../services/reviewService.js'
import styles from './MyReviewsPage.module.css'

function MyReviewsPage() {
  const [tab, setTab] = useState('write')
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [customerName, setCustomerName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || '{}')
      return user?.fullName || user?.name || ''
    } catch {
      return ''
    }
  })
  const [productName, setProductName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Published reviews from API
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')

  const loadReviews = async () => {
    setReviewsLoading(true)
    setReviewsError('')
    try {
      const items = await fetchPublicReviews()
      // Only show reviews from this customer if logged in
      const myName = customerName.trim().toLowerCase()
      const myReviews = myName
        ? items.filter((r) =>
            (r.customerName || '').trim().toLowerCase() === myName
          )
        : items
      setReviews(myReviews)
    } catch (err) {
      setReviewsError(
        err?.response?.data?.message || 'Unable to load reviews right now.'
      )
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'published') {
      loadReviews()
    }
  }, [tab])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!customerName.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!productName.trim()) {
      setError('Please enter the product name.')
      return
    }
    if (!reviewText.trim()) {
      setError('Please write your review.')
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        customerName: customerName.trim(),
        productName: productName.trim(),
        rating,
        title: title.trim(),
        comment: reviewText.trim(),
      })
      setMessage(
        'Thanks! Your review has been submitted and will appear after moderation.'
      )
      setTitle('')
      setReviewText('')
      setProductName('')
      setRating(5)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to submit review right now. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div>
            <span className={styles.eyebrow}>My reviews</span>
            <h1>Your product feedback</h1>
            <p>
              Share your experience with products you have purchased, and browse
              the reviews you have already published.
            </p>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${tab === 'write' ? styles.tabButtonActive : ''}`}
            onClick={() => setTab('write')}
          >
            Write a review
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${tab === 'published' ? styles.tabButtonActive : ''}`}
            onClick={() => setTab('published')}
          >
            My published reviews
          </button>
        </div>

        {tab === 'write' ? (
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <h2>Share your experience</h2>

            <label className={styles.field}>
              <span>Your name *</span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Product name *</span>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Which product are you reviewing?"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Rating</span>
              <div className={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.starButton} ${value <= rating ? styles.starButtonActive : ''}`}
                    onClick={() => setRating(value)}
                    aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  >
                    <Star size={18} />
                  </button>
                ))}
              </div>
            </label>

            <label className={styles.field}>
              <span>Review title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What stood out?"
              />
            </label>

            <label className={styles.field}>
              <span>Your review *</span>
              <textarea
                rows="5"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell other customers about your experience with this product."
                required
              />
            </label>

            <div className={styles.uploadBox}>
              <ImagePlus size={18} />
              <p>Photo uploads will be available in a future update.</p>
            </div>

            {message && <div className={styles.successState}>{message}</div>}
            {error && <div className={styles.errorState}>{error}</div>}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting…
                </>
              ) : (
                'Submit review'
              )}
            </button>
          </form>
        ) : (
          <div className={styles.publishedList}>
            {reviewsLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <Loader2 size={20} className="animate-spin" />
                <span>Loading your reviews…</span>
              </div>
            ) : reviewsError ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#f87171',
                }}
              >
                {reviewsError}
              </div>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <p style={{ marginBottom: 12 }}>
                  You have not published any reviews yet.
                </p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => setTab('write')}
                >
                  Write your first review
                </button>
              </div>
            ) : (
              reviews.map((item) => (
                <div
                  key={item.id || item._id}
                  className={styles.publishedCard}
                >
                  <div className={styles.ratingRow}>
                    {Array.from({ length: Number(item.rating) || 0 }).map(
                      (_, index) => (
                        <Star key={index} size={16} fill="currentColor" />
                      )
                    )}
                  </div>
                  <h3>{item.productName || item.product}</h3>
                  <p>{item.comment || item.review}</p>
                  <div className={styles.metaRow}>
                    <span>{item.date || item.createdAt}</span>
                    <span
                      style={{
                        color:
                          item.status === 'Approved'
                            ? '#34d399'
                            : item.status === 'Rejected'
                            ? '#f87171'
                            : '#fbbf24',
                      }}
                    >
                      {item.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default MyReviewsPage
