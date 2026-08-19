import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getMyOrders } from '../api/orderApi.js'

/**
 * OrdersPage — redirected-to page (alias for account/orders).
 * Reads real orders from the backend API.
 * localStorage is NOT a database and is never used as a data source here.
 */
export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/login', { state: { from: '/account/orders' } })
      return
    }

    setLoading(true)
    setError('')

    getMyOrders({ page: 1, limit: 20 })
      .then((payload) => {
        setOrders(Array.isArray(payload.orders) ? payload.orders : [])
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            'Unable to load your orders right now. Please try again.'
        )
        setOrders([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review your recent purchases and track their status.
        </p>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-3 py-16 text-slate-500">
            <Loader2 size={24} className="animate-spin" />
            <span>Loading your orders…</span>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setError('')
                getMyOrders({ page: 1, limit: 20 })
                  .then((payload) => setOrders(Array.isArray(payload.orders) ? payload.orders : []))
                  .catch(() => setError('Unable to load your orders. Please try again.'))
                  .finally(() => setLoading(false))
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mb-4 text-4xl">🧾</div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              No orders yet
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              You have not placed any orders. Start shopping to create your
              first order.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-700"
            >
              Shop products
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id || order.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Order #{order.orderNumber || order._id || order.id}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('en-IN')
                        : order.date
                        ? new Date(order.date).toLocaleString('en-IN')
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {order.totalAmount
                        ? `₹${Number(order.totalAmount).toLocaleString('en-IN')}`
                        : order.total
                        ? `₹${Number(order.total).toLocaleString('en-IN')}`
                        : ''}
                    </span>
                    {order.status && (
                      <span className="rounded-full bg-pink-50 px-3 py-0.5 text-xs font-semibold text-pink-700">
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {(order.items || order.products || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {(item.image || item.productImage) && (
                        <img
                          src={item.image || item.productImage}
                          alt={item.name || item.productName}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {item.name || item.productName}
                        </div>
                        <div className="text-xs text-slate-600">
                          Qty: {item.quantity}
                          {item.price
                            ? ` · ₹${Number(item.price).toLocaleString('en-IN')}`
                            : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Link
                    to={`/account/orders/${order._id || order.id}`}
                    className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                  >
                    View order details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
