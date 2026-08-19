import api from './api.js'

export async function getInvoiceByOrder(orderId) {
  const res = await api.get(`/invoices/order/${orderId}`)
  return res.data
}

export async function downloadInvoice(invoiceId) {
  // returns a download URL (backend provides download endpoint)
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/invoices/${invoiceId}/download`
}

export default { getInvoiceByOrder, downloadInvoice }
