import { Link } from 'react-router-dom'
import styles from './PageStyles.module.css'

function NotFoundPage() {
  return (
    <div className={`${styles.centerPage} bg-slate-50 px-4 dark:bg-slate-950`}>
      <div className="max-w-xl rounded-[3rem] border border-slate-200 bg-white p-16 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Page not found</p>
        <h1 className="mt-6 text-5xl font-semibold text-slate-900 dark:text-slate-100">404</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">Sorry, we couldn’t find that page. Explore the shop or return to home for premium deals.</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-600">
            Back to home
          </Link>
          <Link to="/shop" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
