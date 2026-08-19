import api from './api.js'

/**
 * Submit a product review (goes to moderation queue).
 */
export async function submitReview(payload) {
  const { data } = await api.post('/reviews', payload)
  return data
}

/**
 * Fetch approved public reviews.
 */
export async function fetchPublicReviews() {
  const { data } = await api.get('/reviews')
  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  return items
}

export default { submitReview, fetchPublicReviews }
