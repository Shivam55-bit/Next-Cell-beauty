import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import styles from './PageStyles.module.css'
import { getMyOrderById, getOrderById } from '../api/orderApi.js'
import { formatCurrency } from '../utils/format.js'

function OrderSuccessPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        // try public order fetch first (guest-friendly)
        const publicResp = await getOrderById(orderId)
        const publicData = publicResp?.data || publicResp
        if (publicData) {
          setOrder(publicData)
          return
        }
      } catch (publicErr) {
        // continue to try authenticated endpoint below
      }

      try {
        const response = await getMyOrderById(orderId)
        setOrder(response?.data || null)
      } catch (err) {
        setError(err?.response?.data?.message || 'Your payment succeeded, but the order could not be loaded yet. Please refresh or check your orders page.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [navigate, orderId])

  return (
    <div className={`${styles.centerPage} bg-[radial-gradient(circle_at_top,_rgba(255,122,0,0.15),transparent_30%)] px-4`}>
      <div className="max-w-3xl rounded-[3rem] border border-slate-200 bg-white p-12 text-center shadow-soft">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-600 shadow-glow">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">Order confirmed</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">Payment was successful. Your order is now being saved and linked to your account.</p>

        {loading ? <div className="mt-8 text-sm text-slate-500">Loading your order details...</div> : null}
        {error ? <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{error} <button type="button" onClick={() => window.location.reload()} className="ml-2 font-semibold underline">Retry</button></div> : null}

        {order ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-left">
              <p className="text-sm text-slate-500">Order number</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{order.orderNumber}</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-left">
              <p className="text-sm text-slate-500">Order total</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(order.grandTotal || 0)}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/shop" className="inline-flex items-center justify-center rounded-full bg-brand-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-brand-600">Continue shopping</Link>
          <Link to={order ? `/account/orders/${order.id || order._id}` : '/account/orders'} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 transition hover:bg-slate-100">View order details</Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
