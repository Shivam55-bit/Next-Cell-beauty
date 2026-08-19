import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HelpCircle, Search } from 'lucide-react'
import { fetchFaqs } from '../services/faqApi.js'
import styles from './FaqPage.module.css'

const defaultCategories = ['All', 'Orders', 'Payments', 'Shipping', 'Returns & Refunds', 'Products', 'Account', 'Beauty Guidance']

function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState('')
  const [faqs, setFaqs] = useState([])
  const [categories, setCategories] = useState(defaultCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true)
      const loadedFaqs = await fetchFaqs()
      const items = Array.isArray(loadedFaqs) ? loadedFaqs : []
      setFaqs(items)
      setOpenId(items[0]?.id || '')
      const dynamicCategories = ['All', ...Array.from(new Set(items.map((item) => item.category || 'General')))]
      setCategories(dynamicCategories.length > 1 ? dynamicCategories : defaultCategories)
      setLoading(false)
    }

    loadFaqs()
  }, [])

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const searchValue = query.trim().toLowerCase()
      const matchesQuery = !searchValue || `${item.question} ${item.answer}`.toLowerCase().includes(searchValue)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query, faqs])

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Helpful support</span>
            <h1>Beauty shopping FAQs</h1>
            <p>Find fast answers about orders, returns, payments and beauty guidance.</p>
          </div>
          <div className={styles.heroBadge}>Need a hand? <Link to="/contact">Contact support</Link></div>
        </div>

        <div className={styles.searchWrap}>
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions" />
        </div>

        <div className={styles.tabs}>
          {categories.map((category) => (
            <button key={category} type="button" className={`${styles.tabButton} ${activeCategory === category ? styles.tabButtonActive : ''}`} onClick={() => setActiveCategory(category)}>
              {category}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.emptyState}>Loading FAQs...</div>
          ) : filteredFaqs.length > 0 ? filteredFaqs.map((item) => {
            const isOpen = item.id === openId
            return (
              <article key={item.id || item.question} className={styles.item}>
                <button className={styles.itemButton} onClick={() => setOpenId(isOpen ? '' : item.id)} type="button">
                  <span className={styles.itemQuestion}>{item.question}</span>
                  <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
                </button>
                {isOpen ? <div className={styles.answer}><HelpCircle size={16} /> <p>{item.answer}</p></div> : null}
              </article>
            )
          }) : <div className={styles.emptyState}>No FAQ matches your search yet. Please try a different term.</div>}
        </div>
      </div>
    </section>
  )
}

export default FaqPage
