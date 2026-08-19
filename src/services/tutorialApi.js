import api from './api.js'

export async function fetchTutorials() {
  const { data } = await api.get('/tutorials')
  const tutorials = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  return tutorials.filter((tutorial) => !tutorial.status || String(tutorial.status).toLowerCase() === 'published')
}

export async function fetchTutorialById(id) {
  if (!id) return null
  const { data } = await api.get(`/tutorials/${encodeURIComponent(id)}`)
  return data?.data || data || null
}

export async function fetchTutorialBySlug(slug) {
  if (!slug) return null
  const { data } = await api.get(`/tutorials/${encodeURIComponent(slug)}`)
  return data?.data || data || null
}
