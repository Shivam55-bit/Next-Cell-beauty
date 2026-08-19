import api from './api.js'

export async function fetchBlogs() {
  const { data } = await api.get('/blogs')
  const blogs = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  return blogs.filter((blog) => !blog.status || String(blog.status).toLowerCase() === 'published')
}

export async function fetchBlogBySlug(slug) {
  const { data } = await api.get(`/blogs/${encodeURIComponent(slug)}`)
  return data?.data || data || null
}
