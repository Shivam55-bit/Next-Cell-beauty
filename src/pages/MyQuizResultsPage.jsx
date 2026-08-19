import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, RotateCcw, Loader2, AlertCircle, Clock, Settings, ShoppingBag, MapPin, ReceiptText, Heart, LogOut } from 'lucide-react'
import { fetchMyQuizHistory } from '../services/quizApi.js'
import styles from './PageStyles.module.css'

const navItems = [
  { label: 'Account Details', path: '/profile', icon: Settings },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Invoices', path: '/account/invoices', icon: ReceiptText },
  { label: 'Wishlist', path: '/wishlist', icon: Heart },
  { label: 'Skin Quiz', path: '/account/skin-quiz', icon: Sparkles },
]

export default function MyQuizResultsPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const items = await fetchMyQuizHistory()
        setHistory(Array.isArray(items) ? items : [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Could not load quiz history.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className={`${styles.pageSpacing} bg-[#fffdfb]`}>
      <div className={styles.pageWrapper}>
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[1.7rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF5A00]">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-[1.5rem] font-bold text-[#0B1F3A]">Skin Quiz</h3>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/account/skin-quiz'

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold text-[#0F172A] opacity-100 transition ${isActive ? 'bg-[#FFF4EC] text-[#0B1F3A] ring-1 ring-[#FFD2AF]' : 'hover:bg-[#F8FAFC]'}`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#FF5A00]' : 'text-[#0F172A]'} />
                    {item.label}
                  </Link>
                )
              })}

              <button
                type="button"
                className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold text-[#0F172A] opacity-100 transition hover:bg-[#FFF1F1] hover:text-[#B91C1C]"
              >
                <LogOut size={18} className="text-[#0F172A]" />
                Logout
              </button>
            </nav>
          </aside>

          <main className="rounded-[1.7rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="mb-6">
              <h2 className="text-[1.9rem] font-bold tracking-[-0.03em] text-[#0B1F3A]">My Skin Quiz Results</h2>
              <p className="mt-2 text-sm text-[#475569]">View your personalised routines and retake the quiz any time.</p>
            </div>

            <Link
              to="/skin-quiz"
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]"
            >
              <Sparkles size={16} />
              Take the Skin Quiz
            </Link>

            {loading && (
              <div className="flex items-center gap-3 py-8 text-[#475569]">
                <Loader2 size={22} className="animate-spin text-[#FF5A00]" />
                <span>Loading your quiz history…</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-3 rounded-2xl border border-[#FECACA] bg-[#FFF1F2] p-4 text-[#B91C1C]">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && history.length === 0 && (
              <div className="rounded-[1.8rem] border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF4EC] text-[#FF5A00]">
                  <Sparkles size={36} />
                </div>
                <p className="mt-5 text-[1.1rem] font-semibold text-[#0B1F3A]">You haven&apos;t taken the skin quiz yet.</p>
                <Link
                  to="/skin-quiz"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]"
                >
                  <Sparkles size={16} />
                  Take the Quiz Now
                </Link>
              </div>
            )}

            {!loading && !error && history.length > 0 && (
              <div className="space-y-4">
                {history.map((attempt, idx) => (
                  <div
                    key={attempt.id || idx}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF7F0] text-[#008A5B]">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-[#0B1F3A]">{attempt.resultTitle || 'Skin Quiz Result'}</div>
                        {attempt.createdAt && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-[#64748B]">
                            <Clock size={13} />
                            {new Date(attempt.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      to="/skin-quiz"
                      className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] transition hover:bg-[#F8FAFC]"
                    >
                      <RotateCcw size={14} />
                      Retake Quiz
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  )
}
