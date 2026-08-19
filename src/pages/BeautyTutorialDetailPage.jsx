import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3, Sparkles } from 'lucide-react'
import { fetchTutorialById, fetchTutorials } from '../services/tutorialApi.js'
import styles from './BeautyTutorialDetailPage.module.css'

function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/shorts\/([^?\s]+)/
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }

  return null
}

function BeautyTutorialDetailPage() {
  const { slug } = useParams()
  const [tutorial, setTutorial] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTutorial = async () => {
      setLoading(true)
      setError('')
      setTutorial(null)

      try {
        const id = slug || ''
        const result = await fetchTutorialById(id)
        setTutorial(result)

        const tutorials = await fetchTutorials()
        const list = Array.isArray(tutorials) ? tutorials : []
        setRelated(list.filter((item) => item.id !== id).slice(0, 2))
      } catch (err) {
        console.error('Failed to load tutorial', err)
        setError('Failed to load tutorial. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) loadTutorial()
  }, [slug])

  const steps = useMemo(() => {
    if (!tutorial) return []
    if (Array.isArray(tutorial.stepByStepGuide) && tutorial.stepByStepGuide.length > 0) {
      return tutorial.stepByStepGuide
    }
    return []
  }, [tutorial])

  const products = useMemo(() => {
    if (!tutorial) return []
    if (Array.isArray(tutorial.products) && tutorial.products.length) return tutorial.products
    if (typeof tutorial.productsUsed === 'string' && tutorial.productsUsed.trim()) {
      return tutorial.productsUsed.split(/\s*,\s*/).filter(Boolean)
    }
    return []
  }, [tutorial])

  const embedUrl = useMemo(() => getYouTubeEmbedUrl(tutorial?.videoUrl), [tutorial])

  if (loading) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.notFoundCard}>
            <h1>Loading tutorial...</h1>
          </div>
        </div>
      </section>
    )
  }

  if (error || !tutorial) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.notFoundCard}>
            <h1>Tutorial not found</h1>
            <p>{error || 'The tutorial you are looking for is not available right now.'}</p>
            <Link to="/beauty-tutorials" className={styles.primaryButton}>
              View all tutorials
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <Link to="/beauty-tutorials" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to tutorials
        </Link>

        <div className={styles.heroCard}>
          {embedUrl ? (
            <div className={styles.heroVideo}>
              <iframe
                src={embedUrl}
                title={tutorial.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img src={tutorial.thumbnail || tutorial.image || ''} alt={tutorial.title} className={styles.heroImage} />
          )}
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>{tutorial.category}</span>
            <h1>{tutorial.title}</h1>
            <p>{tutorial.description}</p>
            <div className={styles.metaRow}>
              <span><Clock3 size={15} />{tutorial.duration || tutorial.publishedDate}</span>
              <span><Sparkles size={15} />{tutorial.difficulty || ''}</span>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.card}>
            <h2>Step-by-step guide</h2>
            <ol className={styles.steps}>
              {steps.map((step, index) => (
                <li key={step.id || `${step.title}-${index}`}>
                  <span>{step.stepNumber || index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.card}>
            <h2>Products used</h2>
            <ul className={styles.productList}>
              {products.length > 0 ? (
                products.map((product) => (<li key={product}>{product}</li>))
              ) : (
                <li>{tutorial.productsUsed || 'Ingredients and product recommendations will appear here.'}</li>
              )}
            </ul>
          </div>
        </div>

        {related.length > 0 ? (
          <div className={styles.relatedSection}>
            <h2>Related tutorials</h2>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <Link key={item.id || item.slug} to={`/beauty-tutorials/${item.id}`} className={styles.relatedCard}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default BeautyTutorialDetailPage
