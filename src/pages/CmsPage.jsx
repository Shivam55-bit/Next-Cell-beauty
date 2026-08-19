import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NotFoundPage from './NotFoundPage.jsx'
import { fetchCmsPageBySlug, sanitizeHtml, getPageMeta } from '../utils/cmsPages.js'
import styles from './PageStyles.module.css'

function CmsPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      const foundPage = await fetchCmsPageBySlug(slug)
      setPage(foundPage)
      setLoading(false)
    }

    loadPage()
    window.addEventListener('naflin-cms-updated', loadPage)
    return () => window.removeEventListener('naflin-cms-updated', loadPage)
  }, [slug])

  const safeContent = useMemo(() => sanitizeHtml(page?.content || ''), [page])
  const meta = useMemo(() => getPageMeta(page), [page])

  useEffect(() => {
    if (!page) return
    document.title = meta.title
    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute('content', meta.description)
    }
    const keywords = document.querySelector('meta[name="keywords"]')
    if (keywords) {
      keywords.setAttribute('content', meta.keywords)
    }
  }, [meta, page])

  if (loading) {
    return (
      <div className={styles.pageSpacing}>
        <div className={styles.pageWrapper}>
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 rounded-full bg-slate-200" />
              <div className="h-10 w-3/4 rounded-full bg-slate-200" />
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-5/6 rounded-full bg-slate-200" />
              <div className="h-4 w-2/3 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!page || page.status !== 'Published') {
    return <NotFoundPage />
  }

  return (
    <div className={styles.pageSpacing}>
      <div className={styles.pageWrapper}>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#111827] via-[#7c2d12] to-[#f97316] p-8 text-white shadow-2xl sm:p-10 lg:p-12 dark:from-slate-900 dark:via-slate-800 dark:to-orange-500">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl dark:bg-orange-500/20" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-xl dark:bg-white/10" />

          <div className="relative">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/80">
              <Link to="/" className="font-medium text-white transition hover:text-white/90">Home</Link>
              <span className="text-white/60">/</span>
              <span className="font-semibold text-white">{page.title}</span>
            </nav>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {page.title}
            </h1>

            <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
              {page.meta_description || `Read our ${page.title.toLowerCase()} to understand how we serve you better.`}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-10 lg:p-12 dark:border-slate-700 dark:bg-slate-900">
          <article className="prose prose-slate max-w-none prose-headings:text-slate-900 dark:text-slate-100 prose-a:text-brand-700 prose-p:text-slate-600 prose-li:text-slate-600">
            <div dangerouslySetInnerHTML={{ __html: safeContent }} />
          </article>
        </div>
      </div>
    </div>
  )
}

export default CmsPage
