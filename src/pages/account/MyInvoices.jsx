import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText, Search, X, Eye, CalendarRange, Settings, ShoppingBag, MapPin, ReceiptText, Heart, Sparkles, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { getInvoiceByOrder, downloadInvoice } from '../../services/invoiceService.js'
import styles from '../PageStyles.module.css'

const sidebarItems = [
  { label: 'Account Details', path: '/profile', icon: Settings },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Invoices', path: '/account/invoices', icon: ReceiptText },
  { label: 'Wishlist', path: '/wishlist', icon: Heart },
  { label: 'Skin Quiz', path: '/account/skin-quiz', icon: Sparkles },
]

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const formatCurrency = (value) => {
  const num = Number(value ?? 0)
  if (Number.isNaN(num)) return '₹0'
  return currencyFormatter.format(num)
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getStatusTone = (status) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'paid') return { label: 'Paid', classes: 'bg-[#EAF7F0] text-[#008A5B]' }
  if (normalized === 'pending') return { label: 'Pending', classes: 'bg-[#FFF4EC] text-[#FF5A00]' }
  if (normalized === 'cancelled') return { label: 'Cancelled', classes: 'bg-[#FEE2E2] text-[#B91C1C]' }
  return { label: status || 'Pending', classes: 'bg-[#FFF4EC] text-[#FF5A00]' }
}

const getInvoiceData = (invoice) => {
  const orderId = invoice?.orderId || invoice?.order?.id || invoice?.order?._id || invoice?.order || invoice?.orderNumber || '#N/A'
  const invoiceNumber = invoice?.invoiceNumber || invoice?.number || invoice?.invoiceNo || 'INV-N/A'
  const invoiceDate = invoice?.invoiceDate || invoice?.createdAt || invoice?.date || invoice?.issuedAt || new Date().toISOString()
  const amountValue = invoice?.grandTotal ?? invoice?.totalAmount ?? invoice?.amount ?? invoice?.total ?? 0
  const paymentStatus = invoice?.paymentStatus || invoice?.status || 'Pending'
  const customerName = invoice?.customerName || invoice?.customer?.name || invoice?.billingAddress?.name || 'Customer'
  const email = invoice?.customerEmail || invoice?.email || invoice?.customer?.email || ''
  const phone = invoice?.customerPhone || invoice?.phone || invoice?.customer?.phone || ''
  const billingAddress = invoice?.billingAddress || invoice?.customer?.billingAddress || invoice?.shippingAddress || ''
  const shippingAddress = invoice?.shippingAddress || invoice?.customer?.shippingAddress || invoice?.billingAddress || ''
  const items = Array.isArray(invoice?.items) ? invoice.items : Array.isArray(invoice?.orderItems) ? invoice.orderItems : []

  return {
    orderId,
    invoiceNumber,
    invoiceDate,
    amountValue,
    paymentStatus,
    customerName,
    email,
    phone,
    billingAddress,
    shippingAddress,
    items,
    pdfPath: invoice?.pdfPath || invoice?.downloadUrl || invoice?.fileUrl || '',
    _id: invoice?._id || invoice?.id || invoice?.invoiceId || invoice?.invoiceNumber || invoiceNumber,
  }
}

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All Dates')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const latest = JSON.parse(localStorage.getItem('latestOrder') || 'null')
        let items = []

        if (latest?.id) {
          const res = await getInvoiceByOrder(latest.id)
          const payload = Array.isArray(res) ? res : res?.data ? (Array.isArray(res.data) ? res.data : [res.data]) : []
          items = payload.map((invoice) => getInvoiceData(invoice))
        }

        setInvoices(items)
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load invoices')
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase()

    return invoices.filter((invoice) => {
      const matchesSearch = !query || [
        invoice.invoiceNumber,
        invoice.orderId,
        invoice.customerName,
        invoice.email,
        invoice.phone,
      ].join(' ').toLowerCase().includes(query)

      const matchesStatus = statusFilter === 'All' || invoice.paymentStatus.toLowerCase() === statusFilter.toLowerCase()

      let matchesDate = true
      if (dateFilter !== 'All Dates') {
        const dateValue = new Date(invoice.invoiceDate)
        const now = new Date()
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(now.getDate() - 30)

        if (dateFilter === 'Last 30 Days') {
          matchesDate = dateValue >= thirtyDaysAgo
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invoices, search, statusFilter, dateFilter])

  const activeDownloadUrl = invoices[0]?.pdfPath || (invoices[0]?._id ? downloadInvoice(invoices[0]._id) : '')

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
                <ReceiptText size={20} />
              </div>
              <div>
                <h3 className="text-[1.4rem] font-bold text-[#0F172A]">Invoices</h3>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/account/invoices'

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

          <main className="rounded-[1.8rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#FF5A00]">My Invoices</p>
                <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.03em] text-[#0F172A]">Invoice & Payment History</h1>
                <p className="mt-2 text-sm text-[#475569]">View, download and manage your previous invoices.</p>
              </div>

              {invoices.length > 0 && activeDownloadUrl ? (
                <a
                  href={activeDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]"
                >
                  <Download size={16} />
                  Download All
                </a>
              ) : null}
            </div>

            <div className="mb-6 rounded-[1.2rem] border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="grid gap-3 md:grid-cols-[1.5fr_0.7fr_0.7fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search invoices..."
                    className="w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-4 text-sm text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                  />
                </div>

                <div>
                  <select
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    className="w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#FF5A00]"
                  >
                    <option>All Dates</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#FF5A00]"
                  >
                    <option>All</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-[1.5rem] border border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center text-[#475569]">
                <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#FFE9DC]" />
                <p className="mt-4 text-sm font-medium">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="rounded-[1.8rem] border border-[#E2E8F0] bg-[#FFFFFF] p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-12">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4EC] text-[#FF5A00]">
                  <FileText size={42} />
                </div>
                <h2 className="mt-6 text-[1.8rem] font-bold text-[#0F172A]">No invoices available</h2>
                <p className="mx-auto mt-3 max-w-lg text-base text-[#475569]">Your invoices will appear here after you complete a purchase.</p>
                <Link
                  to="/shop"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-[#FF5A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-[1.5rem] border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left">
                      <thead className="bg-[#F8FAFC] text-[#475569]">
                        <tr>
                          {['Invoice', 'Order ID', 'Date', 'Amount', 'Status', 'Action'].map((heading) => (
                            <th key={heading} className="px-5 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[#475569]">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredInvoices.map((invoice) => {
                          const status = getStatusTone(invoice.paymentStatus)
                          return (
                            <tr key={invoice._id} className="border-t border-[#E2E8F0] text-[#0F172A]">
                              <td className="px-5 py-4 text-sm font-semibold text-[#0F172A]">{invoice.invoiceNumber}</td>
                              <td className="px-5 py-4 text-sm text-[#475569]">{invoice.orderId}</td>
                              <td className="px-5 py-4 text-sm text-[#475569]">{formatDate(invoice.invoiceDate)}</td>
                              <td className="px-5 py-4 text-sm font-semibold text-[#0F172A]">{formatCurrency(invoice.amountValue)}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${status.classes}`}>
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                                  >
                                    <Eye size={14} />
                                    View
                                  </button>
                                  {invoice.pdfPath || invoice._id ? (
                                    <a
                                      href={invoice.pdfPath || downloadInvoice(invoice._id)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#E94E00]"
                                    >
                                      <Download size={14} />
                                      Download
                                    </a>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 md:hidden">
                  {filteredInvoices.map((invoice) => {
                    const status = getStatusTone(invoice.paymentStatus)
                    return (
                      <div key={invoice._id} className="rounded-[1.5rem] border border-[#E2E8F0] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Invoice</p>
                            <p className="mt-1 text-base font-bold text-[#0F172A]">{invoice.invoiceNumber}</p>
                          </div>
                          <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${status.classes}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-[#475569]">
                          <div className="flex justify-between gap-3"><span>Order</span><span className="font-medium text-[#0F172A]">{invoice.orderId}</span></div>
                          <div className="flex justify-between gap-3"><span>Date</span><span className="font-medium text-[#0F172A]">{formatDate(invoice.invoiceDate)}</span></div>
                          <div className="flex justify-between gap-3"><span>Amount</span><span className="font-semibold text-[#0F172A]">{formatCurrency(invoice.amountValue)}</span></div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(invoice)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A]"
                          >
                            <Eye size={15} />
                            View Invoice
                          </button>
                          {invoice.pdfPath || invoice._id ? (
                            <a
                              href={invoice.pdfPath || downloadInvoice(invoice._id)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-4 py-3 text-sm font-semibold text-white"
                            >
                              <Download size={15} />
                              Download
                            </a>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {selectedInvoice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[1.8rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-8">
            <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-5">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#FF5A00]">NEXT CELL BEAUTY</p>
                <h2 className="mt-2 text-[1.8rem] font-bold text-[#0F172A]">Invoice Details</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] transition hover:bg-[#F8FAFC]"
                aria-label="Close invoice modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.2rem] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#64748B]">Invoice</p>
                <div className="mt-3 space-y-2 text-sm text-[#475569]">
                  <div className="flex justify-between gap-3"><span>Number</span><span className="font-semibold text-[#0F172A]">{selectedInvoice.invoiceNumber}</span></div>
                  <div className="flex justify-between gap-3"><span>Order ID</span><span className="font-semibold text-[#0F172A]">{selectedInvoice.orderId}</span></div>
                  <div className="flex justify-between gap-3"><span>Date</span><span className="font-semibold text-[#0F172A]">{formatDate(selectedInvoice.invoiceDate)}</span></div>
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#64748B]">Payment Status</p>
                <div className="mt-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${getStatusTone(selectedInvoice.paymentStatus).classes}`}>
                    {getStatusTone(selectedInvoice.paymentStatus).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.2rem] border border-[#E2E8F0] p-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Customer Information</h3>
                <div className="mt-4 space-y-2 text-sm text-[#475569]">
                  <div className="flex justify-between gap-3"><span>Name</span><span className="font-medium text-[#0F172A]">{selectedInvoice.customerName}</span></div>
                  <div className="flex justify-between gap-3"><span>Email</span><span className="font-medium text-[#0F172A]">{selectedInvoice.email || 'N/A'}</span></div>
                  <div className="flex justify-between gap-3"><span>Phone</span><span className="font-medium text-[#0F172A]">{selectedInvoice.phone || 'N/A'}</span></div>
                  <div className="mt-3 border-t border-[#E2E8F0] pt-3">
                    <p className="font-semibold text-[#0F172A]">Billing Address</p>
                    <p className="mt-1 text-[#475569]">{selectedInvoice.billingAddress || 'N/A'}</p>
                  </div>
                  <div className="mt-3 border-t border-[#E2E8F0] pt-3">
                    <p className="font-semibold text-[#0F172A]">Shipping Address</p>
                    <p className="mt-1 text-[#475569]">{selectedInvoice.shippingAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-[#E2E8F0] p-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Order Items</h3>
                <div className="mt-4 space-y-3">
                  {(selectedInvoice.items && selectedInvoice.items.length > 0) ? selectedInvoice.items.map((item, index) => (
                    <div key={`${item.name || item.productName || 'item'}-${index}`} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#0F172A]">{item.name || item.productName || 'Product'}</p>
                          <p className="mt-1 text-sm text-[#475569]">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="font-semibold text-[#0F172A]">{formatCurrency(item.totalPrice ?? item.price ?? 0)}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#475569]">No line items available.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="space-y-2 text-sm text-[#475569]">
                <div className="flex justify-between gap-3"><span>Subtotal</span><span className="font-medium text-[#0F172A]">{formatCurrency(selectedInvoice.amountValue || 0)}</span></div>
                <div className="flex justify-between gap-3"><span>Discount</span><span className="font-medium text-[#0F172A]">₹0</span></div>
                <div className="flex justify-between gap-3"><span>Shipping</span><span className="font-medium text-[#0F172A]">₹0</span></div>
                <div className="flex justify-between gap-3"><span>Tax</span><span className="font-medium text-[#0F172A]">₹0</span></div>
                <div className="flex justify-between gap-3 border-t border-[#E2E8F0] pt-2 text-base font-bold text-[#0F172A]">
                  <span>Grand Total</span>
                  <span>{formatCurrency(selectedInvoice.amountValue || 0)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {selectedInvoice.pdfPath || selectedInvoice._id ? (
                <a
                  href={selectedInvoice.pdfPath || downloadInvoice(selectedInvoice._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]"
                >
                  <Download size={16} />
                  Download Invoice
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="inline-flex items-center justify-center rounded-full border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
