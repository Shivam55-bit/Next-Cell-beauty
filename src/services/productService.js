import api, { API_BASE_URL } from './api.js'

function dedupeProducts(products) {
  const seen = new Set()

  return products.filter((product) => {
    const key = product.slug || product.id || `${product.name || 'product'}-${product.category || 'general'}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

function fixImageUrl(url) {
  if (!url || typeof url !== 'string') return ''

  const trimmedUrl = url.trim()
  if (!trimmedUrl) return ''
  if (trimmedUrl.startsWith('http') || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:')) return trimmedUrl

  const normalizedPath = trimmedUrl.replace(/^\/+/, '')
  if (!normalizedPath) return ''

  if (IMAGE_BASE_URL) {
    const baseUrl = IMAGE_BASE_URL.endsWith('/') ? IMAGE_BASE_URL : `${IMAGE_BASE_URL}/`
    return `${baseUrl}${normalizedPath}`
  }

  return `/${normalizedPath}`
}

function determineDisplayPrice(product) {
  const priceCandidates = [
    product.regularPrice,
    product.price,
    product.salePrice,
    product.costPrice,
  ]

  const selectedPrice = priceCandidates.find((value) => Number.isFinite(value) && value > 0)
  return selectedPrice ?? 0
}

function normalizeProduct(product) {
  const sourceImages = Array.isArray(product.images) && product.images.length
    ? product.images
    : Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : []

  const gallery = sourceImages.map(fixImageUrl).filter(Boolean)
  const image = fixImageUrl(product.image) || gallery[0] || ''
  const youtubeVideoId = typeof product.youtubeVideoId === 'string' && product.youtubeVideoId.trim()
    ? product.youtubeVideoId.trim()
    : ''
  const youtubeThumbnail = typeof product.videoThumbnail === 'string' && product.videoThumbnail.trim()
    ? product.videoThumbnail.trim()
    : youtubeVideoId
      ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
      : ''

  return {
    ...product,
    id: product.id || product._id || (product._id ? String(product._id) : undefined),
    price: determineDisplayPrice(product),
    image,
    gallery,
    youtubeVideoId,
    youtubeThumbnail,
    youtubeUrl: product.youtubeUrl || '',
  }
}

function parseProductsResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.products)) return data.products
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function fetchProducts() {
  const { data } = await api.get('/products')
  const products = parseProductsResponse(data)
    return dedupeProducts(products)
      .map(normalizeProduct)
      .filter((product) => !product.status || ['published', 'active'].includes(String(product.status).toLowerCase()))
}

export async function fetchProductBySlug(slug) {
  const { data } = await api.get(`/products/${encodeURIComponent(slug)}`)
  const product = data?.product || data?.data || data
  return product ? normalizeProduct(product) : null
}

export async function fetchFeaturedProducts(limit = 6) {
  const products = await fetchProducts()
  return products.slice(0, limit)
}

export async function fetchDiscountedProducts() {
  const { data } = await api.get('/products')
  const raw = parseProductsResponse(data)

  const products = dedupeProducts(raw)
    .map(normalizeProduct)
    .filter((product) => !product.status || ['published', 'active'].includes(String(product.status).toLowerCase()))

  return products
    .map((product) => {
      const originalPrice = Number(product.compareAtPrice || product.oldPrice || 0)
      const currentPrice = Number(product.price || 0)
      if (originalPrice > currentPrice && currentPrice > 0) {
        const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        return {
          ...product,
          originalPrice,
          discountPercentage,
        }
      }
      return null
    })
    .filter(Boolean)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
}

export async function fetchNewArrivals(limit = 20) {
  const { data } = await api.get('/products')
  const raw = parseProductsResponse(data)

  const products = dedupeProducts(raw)
    .map(normalizeProduct)
    .filter((product) => !product.status || ['published', 'active'].includes(String(product.status).toLowerCase()))

  return products
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
    .slice(0, limit)
}

export async function fetchBestSellers(limit = 20) {
  const { data } = await api.get('/products', { params: { limit: 1000 } })
  const raw = parseProductsResponse(data)

  const products = dedupeProducts(raw)
    .map(normalizeProduct)
    .filter((product) => !product.status || ['published', 'active'].includes(String(product.status).toLowerCase()))

  const bestSellers = products.filter((p) => p.bestSeller || p.featured)

  if (bestSellers.length === 0) {
    return products
      .filter((p) => (Number(p.rating) || 0) > 0)
      .sort((a, b) => {
        const aScore = (Number(a.rating) || 0) * Math.log((Number(a.reviewsCount) || 0) + 1)
        const bScore = (Number(b.rating) || 0) * Math.log((Number(b.reviewsCount) || 0) + 1)
        return bScore - aScore
      })
      .slice(0, limit)
  }

  return bestSellers
    .sort((a, b) => {
      const aScore = (Number(a.rating) || 0) * Math.log((Number(a.reviewsCount) || 0) + 1) + (a.bestSeller ? 100 : 0)
      const bScore = (Number(b.rating) || 0) * Math.log((Number(b.reviewsCount) || 0) + 1) + (b.bestSeller ? 100 : 0)
      return bScore - aScore
    })
    .slice(0, limit)
}

export async function fetchCategories() {
  try {
    const { data } = await api.get('/categories')

    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : []

    return items
      .filter((category) => {
        if (!category) return false

        const isActive =
          category.isActive === undefined ||
          category.isActive === true

        const status = String(
          category.status || 'Published'
        ).toLowerCase()

        return (
          isActive &&
          ['published', 'active'].includes(status)
        )
      })
      .map((category) => ({
        id:
          category._id ||
          category.id ||
          category.slug ||
          category.name,

        name:
          category.name ||
          category.title ||
          '',

        title:
          category.name ||
          category.title ||
          '',

        slug:
          category.slug ||
          String(
            category.name ||
            category.title ||
            ''
          )
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),

        description:
          category.description || '',

        subtitle:
          category.description || '',

        image:
          fixImageUrl(category.image),

        bgImage:
          fixImageUrl(category.image),

        icon:
          category.icon || '🛍️',

        status:
          category.status || 'Published',

        isActive:
          category.isActive !== false,

        sortOrder:
          Number(category.sortOrder || 0),

        path: `/shop?categories=${encodeURIComponent(
          category.name ||
          category.title ||
          ''
        )}`,
      }))
      .filter((category) => category.name)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder
        }

        return a.name.localeCompare(b.name)
      })
  } catch (error) {
    console.error(
      'Failed to fetch categories:',
      error
    )

    return []
  }
}

export async function fetchBrands() {
  try {
    const { data } = await api.get('/brands')

    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : []

    return items
      .filter((brand) => {
        if (!brand) return false
        const status = String(brand.status || 'Active').toLowerCase()
        return ['active', 'published'].includes(status)
      })
      .map((brand) => ({
        id: brand.id || brand._id || brand.slug,
        name: brand.name || '',
        slug: brand.slug || String(brand.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: brand.description || '',
        logo: fixImageUrl(brand.logo),
        website: brand.website || '',
        status: brand.status || 'Active',
        productCount: Number(brand.productCount || 0),
      }))
      .filter((brand) => brand.name)
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Failed to fetch brands:', error)
    return []
  }
}
