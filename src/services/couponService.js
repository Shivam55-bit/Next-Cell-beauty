import api from './api.js'

const unwrap = (res) => res?.data?.data ?? res?.data ?? []

export async function fetchCoupons() {
  const res = await api.get('/coupons')
  return unwrap(res)
}

export default { fetchCoupons }
