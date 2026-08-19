import api from './api.js'

/**
 * Fetch active skin quiz questions from the database, sorted by order ASC.
 * Returns [] on error — never returns hardcoded fallback data.
 */
export async function fetchSkinQuizQuestions() {
  const { data } = await api.get('/skin-quiz')
  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  return items
    .filter((q) => !q.status || ['ACTIVE', 'Active', 'active'].includes(q.status))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * Submit quiz answers to the backend rule engine.
 * Returns the matched result with morningRoutine, nightRoutine, categories, products.
 *
 * @param {Object} answers - { skinType: "Dry", concern: "Dullness", ... }
 * @param {string|null} customerId - optional, to save attempt for logged-in customers
 */
export async function submitSkinQuiz(answers, customerId = null) {
  const { data } = await api.post('/skin-quiz/submit', { answers, customerId })
  return Array.isArray(data?.data) ? data.data : (data?.data ?? data)
}

/**
 * Fetch the logged-in customer's past quiz attempts.
 * Requires authentication token.
 */
export async function fetchMyQuizHistory() {
  const { data } = await api.get('/skin-quiz/my-history')
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
}
