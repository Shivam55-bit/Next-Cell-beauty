import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './CategoryCard.module.css'

function CategoryCard({ category, className = '' }) {
  const hasImage = category.bgImage && typeof category.bgImage === 'string' && category.bgImage.trim()

  return (
    <Link to={`/shop?category=${encodeURIComponent(category.title)}`} className={`${styles.cardLink} ${className}`}>
      <motion.div
        className={styles.card}
        whileHover={{ y: -8, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className={styles.cardImageWrap}>
          {hasImage ? (
            <img
              src={category.bgImage}
              alt={category.title}
              className={styles.cardImage}
            />
          ) : (
            <div className={styles.cardPlaceholder} aria-hidden="true">
              {category.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className={styles.cardOverlay} />
        </div>

        <div className={styles.cardBody}>
          <span className={styles.cardLabel}>Luxury Edit</span>
          <h3 className={styles.cardTitle}>{category.title}</h3>
          <p className={styles.cardSubtitle}>{category.subtitle}</p>
          <span className={styles.cardAction} aria-hidden="true">
            Explore
          </span>
        </div>
      </motion.div>
    </Link>
  )
}

export default CategoryCard
