import api from './api.js'

export async function createPaymentOrder(payload) {
  // Use relative path; `api` client already prefixes with API base URL
  const response = await api.post('/payments/create-order', payload)
  return response.data
}

export async function verifyPayment(payload) {
  const response = await api.post('/payments/verify-payment', payload)
  return response.data
}
