import { Link } from 'react-router-dom'
import styles from './PageStyles.module.css'

const endpoints = [
  {
    title: 'Health check',
    method: 'GET',
    path: '/health',
    description: 'Check if the backend is running.',
    curl: 'curl https://api.deliveryplus.tech/naflin-api/health',
  },
  {
    title: 'Get all products',
    method: 'GET',
    path: '/api/products',
    description: 'Return all products for the storefront.',
    curl: 'curl -X GET \'https://api.deliveryplus.tech/naflin-api/api/products\' -H \'Content-Type: application/json\'',
  },
  {
    title: 'Get one product by slug',
    method: 'GET',
    path: '/api/products/:slug',
    description: 'Fetch a product detail by its slug.',
    curl: 'curl -X GET \'https://api.deliveryplus.tech/naflin-api/api/products/test-product\' -H \'Content-Type: application/json\'',
  },
  {
    title: 'Get categories',
    method: 'GET',
    path: '/api/categories',
    description: 'Return all unique categories.',
    curl: 'curl -X GET \'https://api.deliveryplus.tech/naflin-api/api/categories\' -H \'Content-Type: application/json\'',
  },
  {
    title: 'User login',
    method: 'POST',
    path: '/api/user/login',
    description: 'Authenticate user with credentials.',
    curl: 'curl -X POST https://api.deliveryplus.tech/naflin-api/api/user/login -H "Content-Type: application/json" -d \'{"email":"user@viralshop.com","password":"user1234"}\'',
  },
  {
    title: 'Admin login',
    method: 'POST',
    path: '/api/admin/login',
    description: 'Authenticate the admin panel with demo credentials.',
    curl: 'curl -X POST https://api.deliveryplus.tech/naflin-api/api/admin/login -H "Content-Type: application/json" -d \'{"email":"admin@viralshop.com","password":"admin1234"}\'',
  },
]

function ApiDocsPage() {
  return (
    <main className={`${styles.pageSpacing} min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fffaf7_45%,#fff_100%)] px-4 py-8 text-slate-900 md:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100`}>
      <div className={`${styles.pageWrapper} flex flex-col gap-8 pt-14`}>
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft md:p-10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-600">API Docs</p>
          <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-slate-100 md:text-5xl">NEXT CELL BEAUTY API & curl examples</h1>
          <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-400">
            Use this page to test the frontend and admin backend quickly. The base URL is <strong>https://api.deliveryplus.tech/naflin-api</strong>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link to="/" className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-brand-600">Back to Home</Link>
            <a href="https://api.deliveryplus.tech/naflin-api/health" target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:text-brand-400">Open health endpoint</a>
          </div>
        </section>

        <section className="grid gap-6">
          {endpoints.map((item) => (
            <article key={item.path} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:p-8 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">{item.method}</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.title}</h2>
              </div>
              <p className="mt-3 text-slate-600">{item.description}</p>
              <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-900">{item.path}</p>
              <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-4 text-sm text-emerald-100">{item.curl}</pre>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-soft dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          <h2 className="text-xl font-bold">Admin credentials</h2>
          <p className="mt-2 text-sm">Email: admin@viralshop.com</p>
          <p className="mt-1 text-sm">Password: admin1234</p>
        </section>
      </div>
    </main>
  )
}

export default ApiDocsPage
