import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Search, Truck, Settings, ShoppingBag, MapPin, ReceiptText, Heart, Sparkles, LogOut, UserCircle2 } from 'lucide-react'
import { getMyOrders, cancelMyOrder } from '../../api/orderApi.js'
import { formatCurrency } from '../../utils/format.js'
import styles from '../PageStyles.module.css'

const sidebarItems = [
  { label: 'Account Details', path: '/profile', icon: Settings },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Invoices', path: '/account/invoices', icon: ReceiptText },
  { label: 'Wishlist', path: '/wishlist', icon: Heart },
  { label: 'Skin Quiz', path: '/account/skin-quiz', icon: Sparkles },
]

const filterOptions = ['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [busyOrderId, setBusyOrderId] = useState('')

  const loadOrders = async (nextPage = 1, nextStatus = status, nextSearch = search) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: nextPage, limit: 8 }
      if (nextStatus && nextStatus !== 'All') params.status = nextStatus.toLowerCase()
      if (nextSearch.trim()) params.search = nextSearch.trim()
      const payload = await getMyOrders(params)
      setOrders(Array.isArray(payload.orders) ? payload.orders : [])
      setTotalPages(Number(payload.totalPages || 1))
      setPage(Number(payload.currentPage || nextPage))
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your orders right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/login', { state: { from: '/account/orders' } })
      return
    }
    let mounted = true
    const run = async () => {
      if (mounted) await loadOrders(1, status, search)
    }
    run()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const handleFilterChange = (nextStatus) => {
    setStatus(nextStatus)
    loadOrders(1, nextStatus, search)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadOrders(1, status, search)
  }

  const handleCancel = async (orderId) => {
    const reason = window.prompt('Tell us why you want to cancel this order?') || ''
    if (!reason && !window.confirm('Cancel this order?')) return
    setBusyOrderId(orderId)
    try {
      await cancelMyOrder(orderId, reason)
      await loadOrders(page, status, search)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to cancel this order.')
    } finally {
      setBusyOrderId('')
    }
  }

  const summaryText = useMemo(() => {
    if (orders.length === 0) return 'No orders yet'
    return `${orders.length} order${orders.length > 1 ? 's' : ''} shown`
  }, [orders.length])

  return (
    <div
      className={`${styles.pageSpacing} min-h-screen bg-[#F8FAFC] text-[#0F172A]`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <div className={`${styles.pageWrapper} max-w-[1180px]`}>
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[1.6rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF5A00]">
                <UserCircle2 size={20} />
              </div>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#64748B]">My Account</p>
              </div>
            </div>

            <div className="mb-4">
              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold text-[#334155] transition hover:bg-[#FFF7F2]"
              >
                <Settings size={18} className="text-[#475569]" />
                <span>Manage profile</span>
              </Link>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/account/orders'

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold transition ${isActive ? 'bg-[#FFF4EC] text-[#FF5A00] ring-1 ring-[#FFD2AF]' : 'text-[#334155] hover:bg-[#FFF7F2]'}`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#FF5A00]' : 'text-[#475569]'} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                )
              })}

              <button
                type="button"
                className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold text-[#334155] transition hover:bg-[#FFF1F1] hover:text-[#B91C1C]"
              >
                <LogOut size={18} className="text-[#475569]" />
                <span className="whitespace-nowrap">Logout</span>
              </button>
            </nav>
          </aside>

          <main className="overflow-hidden rounded-[1.8rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF5A00]">My Orders</p>
                <h1 className="mt-2 text-[1.9rem] font-bold tracking-[-0.03em] text-[#0B1F3A]">Recent purchases</h1>
                <p className="mt-2 max-w-2xl text-sm text-[#475569]">Track each order, view details, and manage cancellations from your account.</p>
              </div>
              <div className="inline-flex items-center rounded-2xl border border-[#E2E8F0] bg-[#FFF4EC] px-4 py-3 text-sm font-semibold text-[#0B1F3A]">{summaryText}</div>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 lg:max-w-md">
                <Search className="h-4 w-4 text-[#64748B]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order or customer" className="w-full bg-transparent text-sm text-[#0B1F3A] outline-none placeholder:text-[#64748B]" />
              </form>

              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleFilterChange(option)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${status === option ? 'border-[#FF5A00] bg-[#FF5A00] text-white shadow-[0_10px_22px_rgba(255,90,0,0.18)]' : 'border-[#E2E8F0] bg-white text-[#0B1F3A] hover:bg-[#FFF4EC]'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {error ? <div className="mt-6 rounded-2xl border border-[#FECACA] bg-[#FFF1F2] p-4 text-sm font-medium text-[#B91C1C]">{error}</div> : null}

            {loading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div key={item} className="animate-pulse rounded-[1.7rem] border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                    <div className="h-4 w-24 rounded-full bg-[#E2E8F0]" />
                    <div className="mt-4 h-6 w-2/3 rounded-full bg-[#E2E8F0]" />
                    <div className="mt-3 h-4 w-1/2 rounded-full bg-[#E2E8F0]" />
                  </div>
                ))}
              </div>
            ) : null}

            {!loading && orders.length === 0 ? (
              <div className="mt-6 rounded-[1.8rem] border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-10 text-center">
                <Package className="mx-auto h-12 w-12 text-[#FF5A00]" />
                <h2 className="mt-5 text-2xl font-bold text-[#0B1F3A]">No orders found</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-[#475569]">Your placed orders will appear here once payment is completed successfully.</p>
                <Link to="/shop" className="mt-6 inline-flex rounded-full bg-[#FF5A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,90,0,0.2)] transition hover:bg-[#E94E00]">Continue shopping</Link>
              </div>
            ) : null}

            {!loading && orders.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {orders.map((order) => {
                  const firstItem = order.items?.[0]
                  const canCancel = ['pending', 'confirmed', 'processing'].includes((order.orderStatus || '').toLowerCase())

                  return (
                    <div key={order.id || order._id} className="rounded-[1.7rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <img src={firstItem?.image || '/placeholder.png'} alt={firstItem?.productName || 'Order item'} className="h-20 w-20 rounded-2xl object-cover" />
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#64748B]">{order.orderNumber}</p>
                            <h3 className="mt-2 text-lg font-semibold text-[#0B1F3A]">{firstItem?.productName || 'Order placed'}</h3>
                            <p className="mt-1 text-sm text-[#475569]">{(order.createdAt || order.date) ? new Date(order.createdAt || order.date).toLocaleDateString() : 'Recent'} • {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[0.7rem] font-semibold text-[#0B1F3A]">{order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING'}</span>
                              <span className="rounded-full bg-[#FFF4EC] px-3 py-1 text-[0.7rem] font-semibold text-[#FF5A00]">{order.orderStatus ? order.orderStatus.toUpperCase() : 'CONFIRMED'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <p className="text-xl font-bold text-[#0B1F3A]">{formatCurrency(order.grandTotal || 0)}</p>
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/account/orders/${order.id || order._id}`} className="rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0B1F3A] transition hover:bg-[#F8FAFC]">View details</Link>
                            <Link to={`/return-request/${order.id || order._id}`} className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100">Return / Refund</Link>
                            {order.courierName && order.trackingNumber ? (
                              <a href={order.trackingUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white">
                                <Truck className="mr-2 inline h-4 w-4" />Track
                              </a>
                            ) : null}
                            {canCancel ? (
                              <button
                                type="button"
                                disabled={busyOrderId === (order.id || order._id)}
                                onClick={() => handleCancel(order.id || order._id)}
                                className="rounded-full border border-[#FECACA] px-4 py-2 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FFF1F2] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {busyOrderId === (order.id || order._id) ? 'Cancelling...' : 'Cancel'}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}

            {totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-3 pt-2">
                <button type="button" disabled={page <= 1} onClick={() => loadOrders(page - 1, status, search)} className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                <span className="text-sm text-[#475569]">Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => loadOrders(page + 1, status, search)} className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}

export default MyOrdersPage
