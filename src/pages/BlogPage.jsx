import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { fetchBlogs } from '../services/blogApi.js'
import styles from './BlogPage.module.css'

const filters = ['All', 'Skincare', 'Makeup', 'Haircare']

function BlogPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true)
      const blogs = await fetchBlogs()
      setPosts(Array.isArray(blogs) ? blogs : [])
      setLoading(false)
    }

    loadBlogs()
  }, [])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesFilter = activeFilter === 'All' || post.category === activeFilter
      const matchesQuery = !query.trim() || `${post.title} ${post.excerpt || post.shortDescription}`.toLowerCase().includes(query.trim().toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [activeFilter, query, posts])

  const featuredPost = filteredPosts[0] || posts[0] || {}

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Beauty insights</span>
            <h1>Beauty Tips & Guides</h1>
            <p>Explore expert articles on skincare, makeup and haircare that help you shop with confidence.</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" />
          </div>
          <div className={styles.filters}>
            {filters.map((filter) => (
              <button key={filter} type="button" className={`${styles.filterButton} ${activeFilter === filter ? styles.filterButtonActive : ''}`} onClick={() => setActiveFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.featuredCard}>
          <img src={featuredPost.image} alt={featuredPost.title} className={styles.featuredImage} />
          <div className={styles.featuredContent}>
            <span className={styles.featuredLabel}>Featured article</span>
            <h2>{featuredPost.title}</h2>
            <p>{featuredPost.excerpt}</p>
            <div className={styles.metaRow}>
              <span>{featuredPost.category}</span>
              <span>{featuredPost.author}</span>
              <span>{featuredPost.readTime}</span>
            </div>
            <Link to={`/blog/${featuredPost.slug}`} className={styles.primaryButton}>
              Read more
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className={styles.grid}>
            {filteredPosts.map((post) => (
              <article key={post.id || post.slug} className={styles.card}>
                <img src={post.image || post.featuredImage} alt={post.title} className={styles.cardImage} />
                <div className={styles.cardContent}>
                  <span className={styles.cardCategory}>{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt || post.shortDescription}</p>
                  <div className={styles.metaRow}>
                    <span>{post.author}</span>
                    <span>{post.readTime || post.publishedAt || post.publishDate}</span>
                  </div>
                  <Link to={`/blog/${post.slug || post.id}`} className={styles.cardButton}>Read article</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>No articles match your search yet. Try another term.</div>
        )}
      </div>
    </section>
  )
}

export default BlogPage
