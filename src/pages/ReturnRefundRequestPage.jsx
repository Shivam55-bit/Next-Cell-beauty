import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ImagePlus, PackageCheck } from 'lucide-react'
import { getMyOrderById } from '../api/orderApi.js'
import { submitReturnRequest } from '../services/returnService.js'
import styles from './ReturnRefundRequestPage.module.css'

const reasons = ['Damaged item', 'Wrong item', 'Not as described', 'Quality issue', 'Other']

function ReturnRefundRequestPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getMyOrderById(orderId)
        const payload = response?.data || response || null
        setOrder(payload)
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load this order right now.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  const eligibleItems = useMemo(() => {
    return (order?.items || []).filter((item) => item?.quantity > 0)
  }, [order])

  const toggleItem = (itemKey) => {
    setSelectedItems((current) => current.includes(itemKey) ? current.filter((value) => value !== itemKey) : [...current, itemKey])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedItems.length || !reason) {
      setSubmitError('Please choose at least one eligible item and a reason for the request.')
      return
    }

    try {
      await submitReturnRequest({ orderId, items: selectedItems, reason, comments })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err?.message || 'Return service is currently unavailable. Please contact support instead.')
    }
  }

  if (loading) {
    return <div className={styles.page}><div className="container"><div className={styles.loadingState}>Loading order details...</div></div></div>
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <Link to={`/orders/${orderId}`} className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to order
        </Link>

        <div className={styles.heroCard}>
          <div>
            <span className={styles.eyebrow}>Return & refund</span>
            <h1>Request a return or refund</h1>
            <p>Select the items you want to return and tell us why.</p>
          </div>
          <div className={styles.heroBadge}><PackageCheck size={18} />Protected request</div>
        </div>

        {error ? <div className={styles.errorState}>{error}</div> : null}

        {submitted ? (
          <div className={styles.successState}>
            <CheckCircle2 size={24} />
            <div>
              <h2>Request received</h2>
              <p>Your return request has been recorded. Our support team will review it shortly.</p>
            </div>
          </div>
        ) : (
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.section}>
              <h2>Eligible items</h2>
              <div className={styles.itemList}>
                {eligibleItems.length ? eligibleItems.map((item, index) => {
                  const key = `${item.product || item.productName || 'item'}-${index}`
                  const checked = selectedItems.includes(key)
                  return (
                    <label key={key} className={`${styles.itemRow} ${checked ? styles.itemRowActive : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleItem(key)} />
                      <div>
                        <strong>{item.productName || item.product || 'Product'}</strong>
                        <p>Qty {item.quantity || 1}</p>
                      </div>
                    </label>
                  )
                }) : <p className={styles.emptyText}>No eligible items were found for this order.</p>}
              </div>
            </div>

            <div className={styles.section}>
              <h2>Return reason</h2>
              <select value={reason} onChange={(event) => setReason(event.target.value)} className={styles.select}>
                <option value="">Select a reason</option>
                {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className={styles.section}>
              <h2>Additional comments</h2>
              <textarea value={comments} onChange={(event) => setComments(event.target.value)} rows="4" placeholder="Share any details that may help our support team." />
            </div>

            <div className={styles.section}>
              <h2>Proof of issue</h2>
              <div className={styles.uploadBox}>
                <ImagePlus size={20} />
                <p>Upload product photos to support your request. This is optional and will be enabled when the backend supports media uploads.</p>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.checkboxRow}>
                <input type="checkbox" required />
                <span>I understand the return policy and accept that refunds are handled after review.</span>
              </label>
            </div>

            {submitError ? <div className={styles.errorState}>{submitError}</div> : null}

            <button type="submit" className={styles.primaryButton}>Submit return request</button>
          </form>
        )}
      </div>
    </section>
  )
}

export default ReturnRefundRequestPage
