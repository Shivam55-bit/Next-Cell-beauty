import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react'
import { fetchBlogBySlug } from '../services/blogApi.js'
import styles from './BlogDetailPage.module.css'

function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)
      const result = await fetchBlogBySlug(slug)
      setPost(result)
      setLoading(false)
    }

    if (slug) loadPost()
  }, [slug])

  if (loading) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.notFound}>
            <h1>Loading article...</h1>
          </div>
        </div>
      </section>
    )
  }

  if (!post) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.notFound}>
            <h1>Article not found</h1>
            <p>The blog post you are looking for cannot be found right now.</p>
            <Link to="/blog" className={styles.primaryButton}>Back to blog</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <Link to="/blog" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to blog
        </Link>

        <article className={styles.article}>
          <img src={post.image || post.featuredImage} alt={post.title} className={styles.heroImage} />
          <div className={styles.content}>
            <span className={styles.category}>{post.category}</span>
            <h1>{post.title}</h1>
            <div className={styles.metaRow}>
              <span><UserRound size={16} />{post.author}</span>
              <span><CalendarDays size={16} />{post.publishedAt || post.publishDate || post.date}</span>
              <span>{post.readTime || ''}</span>
            </div>
            <p className={styles.excerpt}>{post.excerpt || post.shortDescription}</p>
            <div className={styles.body}>
              {Array.isArray(post.content)
                ? post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                : String(post.content || post.fullContent || post.description || '').split(/\n{2,}|\.{1,}\s+/).map((paragraph, index) => paragraph.trim()).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default BlogDetailPage
