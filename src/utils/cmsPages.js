import { API_BASE_URL } from '../services/api.js'

const STORAGE_KEY = 'naflin_cms_pages_v1'

const getCmsApiBase = () => {
  return API_BASE_URL.replace(/\/$/, '')
}

const readJson = async (resource) => {
  const response = await fetch(`${getCmsApiBase()}${resource}`)
  if (!response.ok) {
    throw new Error('Unable to load CMS data')
  }
  const payload = await response.json()
  return payload?.data || []
}

export const CMS_PAGE_DEFINITIONS = [
  { slug: 'terms-and-conditions', title: 'Terms & Conditions' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'refund-policy', title: 'Return & Refund Policy' },
  { slug: 'shipping-policy', title: 'Shipping & Delivery Policy' },
  { slug: 'return-refund-policy', title: 'Return & Refund Policy' },
  { slug: 'cancellation-policy', title: 'Cancellation Policy' },
  { slug: 'cookie-policy', title: 'Cookie Policy' },
  { slug: 'about-us', title: 'About Us' },
  { slug: 'contact-us', title: 'Contact Us' },
]

const buildDefaultPages = () => {
  const now = new Date().toISOString()
  return [
    {
      id: 1,
      slug: 'terms-and-conditions',
      title: 'Terms & Conditions',
      content: '<h2>Terms & Conditions</h2><p>These terms outline the rules for using our e-commerce services and placing orders with NAFLIN ENTERPRISES.</p><ul><li>Orders are subject to product availability and payment confirmation.</li><li>Customers must provide accurate contact and delivery details.</li><li>Any misuse of our platform may result in account restrictions.</li></ul>',
      meta_title: 'Terms & Conditions | NAFLIN ENTERPRISES',
      meta_description: 'Review the terms governing purchases, account usage, and customer obligations for NAFLIN ENTERPRISES.',
      meta_keywords: 'terms and conditions, ecommerce terms, NAFLIN',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: '<h2>Privacy Policy</h2><p>We respect your privacy and only collect the information needed to deliver orders, process payments, and provide support.</p><p>Personal data is stored securely and never shared without consent except as required by law.</p>',
      meta_title: 'Privacy Policy | NAFLIN ENTERPRISES',
      meta_description: 'Learn how NAFLIN ENTERPRISES handles customer data, security, and privacy preferences.',
      meta_keywords: 'privacy policy, customer data, data protection',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      slug: 'refund-policy',
      title: 'Return & Refund Policy',
      content: '<h2>Return & Refund Policy</h2><p>We aim to provide a smooth return experience for damaged, incorrect, or defective products.</p><p>Refunds are processed after approval and may take 5–7 business days to reflect in the original payment method.</p>',
      meta_title: 'Return & Refund Policy | NAFLIN ENTERPRISES',
      meta_description: 'Find out how returns, replacements, and refunds are handled for eligible purchases.',
      meta_keywords: 'refund policy, return policy, replacement',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      slug: 'shipping-policy',
      title: 'Shipping & Delivery Policy',
      content: '<h2>Shipping & Delivery Policy</h2><p>We dispatch orders promptly and provide tracking information wherever available.</p><p>Delivery timelines vary based on your location and item availability.</p>',
      meta_title: 'Shipping & Delivery Policy | NAFLIN ENTERPRISES',
      meta_description: 'Review shipping timelines, order dispatch, and delivery expectations for NAFLIN ENTERPRISES.',
      meta_keywords: 'shipping policy, delivery policy, shipping info',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 5,
      slug: 'cancellation-policy',
      title: 'Cancellation Policy',
      content: '<h2>Cancellation Policy</h2><p>Orders can be cancelled before dispatch. Once an order is shipped, cancellation may no longer be possible.</p><p>Customers can contact our support team for assistance with eligible cancellations.</p>',
      meta_title: 'Cancellation Policy | NAFLIN ENTERPRISES',
      meta_description: 'Understand when and how orders can be cancelled with NAFLIN ENTERPRISES.',
      meta_keywords: 'cancellation policy, order cancellation',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 6,
      slug: 'cookie-policy',
      title: 'Cookie Policy',
      content: '<h2>Cookie Policy</h2><p>Our website uses cookies to improve browsing, remember preferences, and understand how visitors use the store.</p><p>Users can manage cookie settings in their browser at any time.</p>',
      meta_title: 'Cookie Policy | NAFLIN ENTERPRISES',
      meta_description: 'Learn how cookies are used on the NAFLIN ENTERPRISES website and how to manage them.',
      meta_keywords: 'cookie policy, cookies, website tracking',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 7,
      slug: 'about-us',
      title: 'About Us',
      content: '<h2>About NAFLIN ENTERPRISES</h2><p>NAFLIN ENTERPRISES is committed to delivering premium lighting, decorative solutions, and dependable customer support for every occasion.</p><p>Our focus is quality, reliability, and a smooth shopping experience from order placement to delivery.</p>',
      meta_title: 'About Us | NAFLIN ENTERPRISES',
      meta_description: 'Discover NAFLIN ENTERPRISES, our mission, product values, and commitment to premium customer service.',
      meta_keywords: 'about us, NAFLIN ENTERPRISES, company info',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 8,
      slug: 'contact-us',
      title: 'Contact Us',
      content: '<h2>Contact Us</h2><p>Reach out to our sales and support team for order enquiries, returns, or product information.</p><p>You can contact us via email, phone, or the support form available on this website.</p>',
      meta_title: 'Contact Us | NAFLIN ENTERPRISES',
      meta_description: 'Contact NAFLIN ENTERPRISES for support, orders, and general questions.',
      meta_keywords: 'contact us, support, customer service',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
    {
      id: 9,
      slug: 'return-refund-policy',
      title: 'Return & Refund Policy',
      content: '<h2>Return & Refund Policy</h2><p>We offer returns for eligible items within the stated window and review refund requests within a few business days.</p><p>Products must be unused and returned in their original packaging to qualify for approval.</p>',
      meta_title: 'Return & Refund Policy | NEXT CELL BEAUTY',
      meta_description: 'Review the NEXT CELL BEAUTY return and refund policy for eligible orders.',
      meta_keywords: 'return refund policy, returns, refunds, NEXT CELL BEAUTY',
      status: 'Published',
      created_at: now,
      updated_at: now,
    },
  ]
}

const normalizePage = (page) => ({
  ...page,
  id: page.id ?? page.slug,
  slug: page.slug,
  title: page.title ?? 'Untitled Page',
  content: page.content ?? '',
  meta_title: page.meta_title ?? '',
  meta_description: page.meta_description ?? '',
  meta_keywords: page.meta_keywords ?? '',
  status: page.status ?? 'Published',
  updated_at: page.updated_at ?? page.updatedAt ?? new Date().toISOString(),
})

export const ensureCmsPagesSeed = () => {
  if (typeof window === 'undefined') return []
  const existing = window.localStorage.getItem(STORAGE_KEY)
  if (existing) {
    try {
      const parsed = JSON.parse(existing)
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map(normalizePage)
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const seeded = buildDefaultPages().map(normalizePage)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

export const getCmsPages = () => {
  if (typeof window === 'undefined') return []
  const fromStorage = window.localStorage.getItem(STORAGE_KEY)
  if (!fromStorage) {
    return ensureCmsPagesSeed()
  }

  try {
    const parsed = JSON.parse(fromStorage)
    return Array.isArray(parsed) ? parsed.map(normalizePage) : ensureCmsPagesSeed()
  } catch {
    return ensureCmsPagesSeed()
  }
}

export const fetchCmsPages = async () => {
  try {
    const pages = await readJson('/pages')
    if (Array.isArray(pages) && pages.length) {
      const normalized = pages.map(normalizePage)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      }
      return normalized
    }
  } catch {
    // fall back to local storage
  }

  return getCmsPages()
}

export const getCmsPageBySlug = (slug) => {
  const pages = getCmsPages()
  return pages.find((page) => page.slug === slug) || null
}

export const fetchCmsPageBySlug = async (slug) => {
  try {
    const page = await readJson(`/pages/${slug}`)
    if (page && typeof window !== 'undefined') {
      const normalized = normalizePage(page)
      const existing = getCmsPages().filter((item) => item.slug !== slug)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, normalized]))
      window.dispatchEvent(new Event('naflin-cms-updated'))
      return normalized
    }
  } catch {
    // fall back to local storage
  }

  return getCmsPageBySlug(slug)
}

export const updateCmsPage = (id, updates) => {
  if (typeof window === 'undefined') return null
  const nextPages = getCmsPages().map((page) => {
    if (page.id !== id && page.slug !== id) {
      return page
    }

    return normalizePage({
      ...page,
      ...updates,
      updated_at: new Date().toISOString(),
    })
  })

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPages))
  window.dispatchEvent(new Event('naflin-cms-updated'))
  return nextPages.find((page) => page.id === id || page.slug === id) || null
}

export const saveCmsPages = (pages) => {
  if (typeof window === 'undefined') return []
  const nextPages = pages.map(normalizePage)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPages))
  window.dispatchEvent(new Event('naflin-cms-updated'))
  return nextPages
}

export const sanitizeHtml = (value = '') => {
  if (typeof window === 'undefined') return value

  const parser = new DOMParser()
  const doc = parser.parseFromString(String(value || ''), 'text/html')
  const allowedTags = ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'blockquote', 'code', 'pre', 'span', 'div']

  const removeNode = (node) => {
    node.remove()
  }

  const sanitizeNode = (node) => {
    if (!node || node.nodeType !== 1) return

    const tagName = node.tagName.toLowerCase()
    if (!allowedTags.includes(tagName)) {
      const fragment = doc.createDocumentFragment()
      while (node.firstChild) {
        fragment.appendChild(node.firstChild)
      }
      node.replaceWith(fragment)
      return
    }

    if (tagName === 'a') {
      const href = node.getAttribute('href') || ''
      const cleanedHref = href.trim()
      if (!cleanedHref || (!cleanedHref.startsWith('http://') && !cleanedHref.startsWith('https://') && !cleanedHref.startsWith('mailto:') && !cleanedHref.startsWith('/'))) {
        node.removeAttribute('href')
      } else {
        node.setAttribute('href', cleanedHref)
      }
      node.removeAttribute('target')
      node.removeAttribute('rel')
      node.removeAttribute('onclick')
      node.removeAttribute('style')
    }

    Array.from(node.attributes || []).forEach((attr) => {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on') || name === 'style') {
        node.removeAttribute(name)
      }
    })

    Array.from(node.children).forEach(sanitizeNode)
  }

  doc.querySelectorAll('script, style, iframe, object, embed, svg, math, link').forEach(removeNode)
  Array.from(doc.body.children).forEach(sanitizeNode)
  return doc.body.innerHTML
}

export const getPageMeta = (page) => ({
  title: page?.meta_title || page?.title || 'Legal Page',
  description: page?.meta_description || 'Legal information and policy details from NAFLIN ENTERPRISES.',
  keywords: page?.meta_keywords || 'NAFLIN, policy, legal',
})
