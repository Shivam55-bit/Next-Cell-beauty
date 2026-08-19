import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search, Truck } from 'lucide-react'
import { getOrderById } from '../api/orderApi.js'
import styles from './OrderTrackingPage.module.css'

const statusSteps = [
  { key: 'order_placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

function OrderTrackingPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [inputOrderId, setInputOrderId] = useState(orderId || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(Boolean(orderId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) return
    let mounted = true
    const loadOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getOrderById(orderId)
        if (mounted) setOrder(response?.data || response || null)
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || 'Unable to load tracking details.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadOrder()
    return () => { mounted = false }
  }, [orderId])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!inputOrderId.trim()) return
    navigate(`/track-order/${encodeURIComponent(inputOrderId.trim())}`)
  }

  const timeline = useMemo(() => {
    const currentStatus = (order?.orderStatus || order?.status || '').toLowerCase()
    const currentIndex = statusSteps.findIndex((step) => step.key === currentStatus)
    return statusSteps.map((step, index) => ({ ...step, active: index <= Math.max(currentIndex, 0) && currentIndex >= 0 }))
  }, [order])

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Order tracking</span>
            <h1>Track your package in real time</h1>
            <p>Enter your order ID to review the latest status and shipment details.</p>
          </div>
        </div>

        {!orderId ? (
          <form className={styles.searchCard} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Order ID</span>
              <div className={styles.inputWrap}>
                <Search size={18} />
                <input value={inputOrderId} onChange={(event) => setInputOrderId(event.target.value)} placeholder="Enter your order ID" />
              </div>
            </label>
            <button type="submit" className={styles.primaryButton}>Track Order</button>
          </form>
        ) : null}

        {loading ? <div className={styles.loadingState}>Loading tracking details...</div> : null}
        {error ? <div className={styles.errorState}>{error}</div> : null}

        {order ? (
          <div className={styles.resultCard}>
            <div className={styles.summary}> 
              <div>
                <span className={styles.eyebrow}>Current status</span>
                <h2>{order.orderNumber || order.id || order._id}</h2>
                <p>{order.orderStatus ? order.orderStatus.replace(/_/g, ' ') : 'Processing'}</p>
              </div>
              <div className={styles.badge}><Truck size={18} />{order.courierName || 'Courier on the way'}</div>
            </div>

            <div className={styles.timeline}>
              {timeline.map((step) => (
                <div key={step.key} className={`${styles.timelineStep} ${step.active ? styles.timelineStepActive : ''}`}>
                  <span className={styles.timelineDot} />
                  <div>
                    <strong>{step.label}</strong>
                    {step.active ? <p>In progress</p> : <p>Pending</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h3>Shipment details</h3>
                <p><strong>Courier:</strong> {order.courierName || 'Pending'}</p>
                <p><strong>Tracking number:</strong> {order.trackingNumber || 'Not available yet'}</p>
                <p><strong>Tracking URL:</strong> {order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noreferrer">Open link</a> : 'Not available yet'}</p>
              </div>
              <div className={styles.detailCard}>
                <h3>Delivery estimate</h3>
                <p>{order.estimatedDeliveryDate || 'Estimated delivery will appear once the courier updates the shipment.'}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/orders" className={styles.secondaryButton}>View my orders</Link>
              <Link to="/contact" className={styles.secondaryButton}>Contact support</Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default OrderTrackingPage
