import api from './api.js'

const unwrap = (res) => res?.data?.data ?? res?.data

export async function addAddress(payload) {
  const res = await api.post('/addresses', payload)
  return unwrap(res)
}

export async function getMyAddresses() {
  const res = await api.get('/addresses')
  return unwrap(res)
}

export async function updateAddress(id, payload) {
  const res = await api.put(`/addresses/${id}`, payload)
  return unwrap(res)
}

export async function deleteAddress(id) {
  const res = await api.delete(`/addresses/${id}`)
  return unwrap(res)
}

export async function setDefaultAddress(id) {
  const res = await api.patch(`/addresses/${id}/default`)
  return unwrap(res)
}

export default { addAddress, getMyAddresses, updateAddress, deleteAddress, setDefaultAddress }
