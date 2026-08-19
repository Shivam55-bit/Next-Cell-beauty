import api from './api.js'

export async function fetchFaqs() {
  const { data } = await api.get('/faqs')
  const faqs = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  return faqs.filter((faq) => !faq.status || ['active', 'published'].includes(String(faq.status).toLowerCase()))
}
