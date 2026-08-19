import api from './api.js'

export async function submitReturnRequest(payload) {
  const { data } = await api.post('/returns', payload)
  return data
}

export default { submitReturnRequest }
