import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Truck } from 'lucide-react'
import { getMyOrderById, cancelMyOrder } from '../../api/orderApi.js'
import { formatCurrency } from '../../utils/format.js'

function OrderDetailsPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/login', { state: { from: `/account/orders/${orderId}` } })
      return
    }

    const loadOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getMyOrderById(orderId)
        setOrder(response || null)
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load order')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [navigate, orderId])

  const handleCancel = async () => {
    const reason = window.prompt('Tell us why you want to cancel this order?') || ''
    if (!reason && !window.confirm('Cancel this order?')) return
    setBusy(true)
    try {
      await cancelMyOrder(orderId, reason)
      const response = await getMyOrderById(orderId)
      setOrder(response || null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to cancel order')
    } finally {
      setBusy(false)
    }
  }
  const timeline = useMemo(() => [
    { label: 'Confirmed', done: ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes((order?.orderStatus || '').toLowerCase()) },
    { label: 'Processing', done: ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes((order?.orderStatus || '').toLowerCase()) },
    { label: 'Packed', done: ['packed', 'shipped', 'out_for_delivery', 'delivered'].includes((order?.orderStatus || '').toLowerCase()) },
    { label: 'Shipped', done: ['shipped', 'out_for_delivery', 'delivered'].includes((order?.orderStatus || '').toLowerCase()) },
    { label: 'Out for delivery', done: ['out_for_delivery', 'delivered'].includes((order?.orderStatus || '').toLowerCase()) },
    { label: 'Delivered', done: (order?.orderStatus || '').toLowerCase() === 'delivered' },
  ], [order?.orderStatus])

  if (loading) {
    return <div className="min-h-screen bg-slate-50 px-4 py-24 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">Loading order details...</div>
  }

  if (error || !order) {
    return <div className="min-h-screen bg-slate-50 px-4 py-24 dark:bg-slate-950"><div className="mx-auto max-w-4xl rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-200">{error || 'Order not found.'}</div></div>
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-100"><ArrowLeft className="h-4 w-4" />Back to orders</Link>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Order summary</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{order.orderNumber}</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">{order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING'}</span>
              <span className="rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">{order.orderStatus ? order.orderStatus.toUpperCase() : 'CONFIRMED'}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/80">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Products</h2>
                <div className="mt-4 space-y-4">
                  {(order.items || []).map((item) => (
                    <div key={item.product || item.productName} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                      <img src={item.image || '/placeholder.png'} alt={item.productName} className="h-16 w-16 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.productName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">SKU: {item.sku || '—'} • Qty {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.subtotal || 0)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(item.salePrice || item.price || 0)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/80">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Order timeline</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {timeline.map((step) => (
                    <div key={step.label} className={`rounded-2xl border p-4 ${step.done ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'}`}>
                      <p className="font-semibold">{step.label}</p>
                      <p className="mt-1 text-sm">{step.done ? 'Completed' : 'Pending'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/80">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payment & shipping</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between"><dt>Payment method</dt><dd className="font-semibold text-slate-900 dark:text-slate-100">{order.paymentMethod || 'Razorpay'}</dd></div>
                  <div className="flex items-center justify-between"><dt>Payment ID</dt><dd className="font-semibold text-slate-900 dark:text-slate-100">{order.razorpayPaymentId || '—'}</dd></div>
                  <div className="flex items-center justify-between"><dt>Courier</dt><dd className="font-semibold text-slate-900 dark:text-slate-100">{order.courierName || '—'}</dd></div>
                  <div className="flex items-center justify-between"><dt>Tracking</dt><dd className="font-semibold text-slate-900 dark:text-slate-100">{order.trackingNumber || '—'}</dd></div>
                </dl>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/80">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Price breakdown</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between"><dt>Subtotal</dt><dd className="dark:text-slate-100">{formatCurrency(order.subtotal || 0)}</dd></div>
                  <div className="flex items-center justify-between"><dt>Discount</dt><dd className="dark:text-slate-100">-{formatCurrency(order.discount || 0)}</dd></div>
                  <div className="flex items-center justify-between"><dt>Shipping</dt><dd className="dark:text-slate-100">{formatCurrency(order.shippingCharge || 0)}</dd></div>
                  <div className="flex items-center justify-between"><dt>Tax</dt><dd className="dark:text-slate-100">{formatCurrency(order.tax || 0)}</dd></div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100"><dt>Grand total</dt><dd>{formatCurrency(order.grandTotal || 0)}</dd></div>
                </dl>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/80">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Shipping address</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{order.shippingAddress?.fullName || order.customer?.name}<br />{order.shippingAddress?.addressLine1 || ''}<br />{order.shippingAddress?.city || ''} {order.shippingAddress?.state || ''} {order.shippingAddress?.postalCode || ''}<br />{order.shippingAddress?.phone || order.customer?.phone}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {['pending', 'confirmed', 'processing'].includes((order.orderStatus || '').toLowerCase()) ? <button type="button" onClick={handleCancel} disabled={busy} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 dark:border-rose-600 dark:bg-slate-900 dark:text-rose-200 dark:hover:bg-rose-500/10">{busy ? 'Cancelling...' : 'Cancel order'}</button> : null}
                <Link to={`/return-request/${orderId || order._id || order.id}`} className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
                  Request Return / Refund
                </Link>
                {order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><Truck className="mr-2 inline h-4 w-4" />Track shipment</a> : null}
                <Link to="/shop" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">Continue shopping</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsPage
