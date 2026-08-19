import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react'
import { fetchTutorials } from '../services/tutorialApi.js'
import styles from './BeautyTutorialsPage.module.css'

const filters = ['All', 'Makeup', 'Skincare', 'Haircare', 'Product Guides']

function BeautyTutorialsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [tutorials, setTutorials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTutorials = async () => {
      setLoading(true)
      const loaded = await fetchTutorials()
      setTutorials(Array.isArray(loaded) ? loaded : [])
      setLoading(false)
    }

    loadTutorials()
  }, [])

  const featuredTutorial = tutorials.find((t) => t.featured) || tutorials[0] || {}

  const filteredTutorials = useMemo(() => {
    const base = tutorials.filter((tutorial) => tutorial.id !== featuredTutorial.id)
    if (activeFilter === 'All') return base
    return base.filter((tutorial) => tutorial.category === activeFilter)
  }, [activeFilter, tutorials, featuredTutorial.id])

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Beauty education</span>
            <h1>Beauty Tips & Tutorials</h1>
            <p>
              Learn makeup techniques, skincare routines, haircare tips and product usage through simple,
              step-by-step guides.
            </p>
          </div>

          <div className={styles.heroBadge}>
            <Sparkles size={20} />
            <span>Expert guidance in minutes</span>
          </div>
        </div>

        <div className={styles.filters}>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`${styles.filterButton} ${activeFilter === filter ? styles.filterButtonActive : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={styles.featuredCard}>
          <img src={featuredTutorial.thumbnail || featuredTutorial.image || ''} alt={featuredTutorial.title} className={styles.featuredImage} />
          <div className={styles.featuredContent}>
            <span className={styles.featuredLabel}>Featured tutorial</span>
            <h2>{featuredTutorial.title}</h2>
            <p>{featuredTutorial.description}</p>
            <div className={styles.metaRow}>
              <span>{featuredTutorial.category}</span>
              <span>{featuredTutorial.duration}</span>
              <span>{featuredTutorial.difficulty}</span>
            </div>
            <Link to={`/beauty-tutorials/${featuredTutorial.id}`} className={styles.primaryButton}>
              Watch tutorial
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

            {filteredTutorials.length > 0 ? (
          <div className={styles.grid}>
            {filteredTutorials.map((tutorial) => (
              <article key={tutorial.id || tutorial.slug} className={styles.card}>
                <img src={tutorial.thumbnail || tutorial.image || ''} alt={tutorial.title} className={styles.cardImage} />
                <div className={styles.cardContent}>
                  <span className={styles.cardCategory}>{tutorial.category}</span>
                  <h3>{tutorial.title}</h3>
                  <p>{tutorial.description}</p>
                  <div className={styles.metaRow}>
                    <span>{tutorial.duration}</span>
                    <span>{tutorial.difficulty}</span>
                  </div>
                  <Link to={`/beauty-tutorials/${tutorial.id}`} className={styles.cardButton}>
                    <PlayCircle size={18} />
                    Read / Watch
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No tutorials match this category yet.</h3>
            <p>Try another filter to explore more beauty guidance.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default BeautyTutorialsPage
