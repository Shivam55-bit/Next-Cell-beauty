import api from '../services/api.js'

export async function getMyOrders(params = {}) {
  const response = await api.get('/orders/my-orders', { params })
  return response.data
}

export async function getMyOrderById(orderId) {
  const response = await api.get(`/orders/my-orders/${orderId}`)
  return response.data
}

export async function cancelMyOrder(orderId, reason = '') {
  const response = await api.post(`/orders/my-orders/${orderId}/cancel`, { reason })
  return response.data
}

export async function createOrder(payload) {
  // creates a new customer order (guest or authenticated)
  const response = await api.post('/orders', payload)
  return response.data
}

export async function getOrderById(orderId) {
  // public order fetch (may be available for guest order lookup)
  const response = await api.get(`/orders/${orderId}`)
  return response.data
}
