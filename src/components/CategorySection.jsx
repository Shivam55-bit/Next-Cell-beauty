import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CategoryCard from './CategoryCard.jsx'
import { fetchCategories } from '../services/productService.js'
import styles from './CategorySection.module.css'

function CategorySection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories()
        const categoryObjects = (fetchedCategories || []).map((category) => {
          if (typeof category === 'string') {
            return {
              title: category,
              subtitle: `Explore the ${category} edit`,
              bgImage: '',
              slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            }
          }
          return {
            title: category.name || category.title || '',
            subtitle: category.description || `Explore the ${category.name} edit`,
            bgImage: category.image || '',
            slug: category.slug || category.id || category.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            id: category.id || category._id,
          }
        })
        setCategories(categoryObjects)
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <section className={styles.section} aria-labelledby="category-section-title">
      <div className="container">
        <div className={styles.headerRow}>
          <div>
            <p className={styles.tagline}>Shop by Category</p>
            <h2 id="category-section-title" className={styles.sectionHeading}>
              Curated collections for a premium beauty edit
            </h2>
            <p className={styles.sectionDescription}>
              Discover your next luxury ritual with elegantly selected categories designed for every skin and beauty mood.
            </p>
          </div>
        </div>

        <div className={styles.categoriesGrid}>
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <motion.div
                  key={index}
                  className={styles.placeholder}
                  initial={{ opacity: 0.3, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                />
              ))
            : categories.map((category) => (
                <CategoryCard key={category.slug || category.title} category={category} />
              ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection


