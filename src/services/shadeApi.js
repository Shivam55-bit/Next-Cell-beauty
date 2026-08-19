import api from './api.js'

export async function fetchShades() {
  const { data } = await api.get('/shade-finder')
  const shades = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  return shades.filter((shade) => !shade.status || ['active', 'published'].includes(String(shade.status).toLowerCase()))
}

export async function fetchShadeFinderQuestions() {
  const { data } = await api.get('/shade-finder/questions')
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
}

export async function fetchShadeFinderResults() {
  const { data } = await api.get('/shade-finder/results')
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
}
