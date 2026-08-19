import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { addToCart } from '../redux/cartSlice.js';
import { toggleWishlist } from '../redux/wishlistSlice.js';
import toast from 'react-hot-toast';
import styles from './ProductCard.module.css';

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(
    product.image || product.gallery?.[0] || product.images?.[0] || DEFAULT_FALLBACK_IMAGE
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const id = product.id || product._id || product.slug || 'prod';
  const name = product.name || product.title || 'Beauty Product';
  const slug = product.slug || slugify(name) || String(id);
  const productLink = `/product/${slug}`;

  const category =
    typeof product.category === 'object'
      ? product.category?.name || product.category?.title || ''
      : product.category || '';

  const brand =
    typeof product.brand === 'object'
      ? product.brand?.name || product.brand?.title || ''
      : product.brand || '';

  const currentPrice = Number(product.price || product.salePrice || 0);
  const originalPrice = Number(
    product.compareAtPrice || product.oldPrice || product.regularPrice || 0
  );
  const discountPercentage =
    originalPrice > currentPrice && currentPrice > 0
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : Number(product.discount || 0);

  const rating = Number(product.rating || 4.8);
  const reviewsCount =
    typeof product.reviewsCount === 'number'
      ? product.reviewsCount
      : Math.floor((Math.abs(Number(currentPrice) || 400) % 35) + 14);

  const stock = Number(product.stock ?? 15);
  const isOutOfStock = stock <= 0;

  // Redux Wishlist state
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const isWishlisted = wishlistItems.some(
    (item) => String(item.id || item.slug) === String(id) || (item.slug && item.slug === slug)
  );

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      toggleWishlist({
        id,
        name,
        slug,
        price: currentPrice,
        originalPrice,
        image: imgSrc,
        category,
      })
    );

    if (isWishlisted) {
      toast.success(`Removed "${name}" from Wishlist`);
    } else {
      toast.success(`Saved "${name}" to Wishlist! ❤️`);
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('This product is currently out of stock.');
      return;
    }

    const item = {
      id: `${id}-standard`,
      productId: id,
      name,
      slug,
      price: currentPrice,
      originalPrice: originalPrice > currentPrice ? originalPrice : currentPrice,
      image: imgSrc,
      quantity: 1,
      stock,
    };

    dispatch(addToCart(item));
    setAddedAnimation(true);
    toast.success(`"${name}" added to cart!`);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  return (
    <article className={styles.productCard}>
      <div className={styles.imageArea}>
        <Link to={productLink} className={styles.imageLink}>
          <img
            src={imgSrc}
            alt={name}
            loading="lazy"
            onError={() => setImgSrc(DEFAULT_FALLBACK_IMAGE)}
          />
        </Link>

        {/* Floating Badges */}
        <div className={styles.badges}>
          {isOutOfStock ? (
            <span className={styles.outOfStockBadge}>Out of Stock</span>
          ) : (
            <>
              {discountPercentage > 0 && (
                <span className={styles.discountBadge}>-{discountPercentage}%</span>
              )}
              {product.bestSeller && (
                <span className={styles.bestSellerBadge}>Best Seller</span>
              )}
              {!product.bestSeller && product.featured && (
                <span className={styles.featuredBadge}>Featured</span>
              )}
              {!product.bestSeller && !product.featured && product.isNew && (
                <span className={styles.newBadge}>New</span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlisted : ''}`}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
        >
          <Heart
            size={18}
            className={isWishlisted ? styles.wishlistActiveIcon : ''}
            fill={isWishlisted ? '#e11d48' : 'none'}
          />
        </button>

        {/* Quick Add to Cart CTA */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className={styles.quickCartButton}
          >
            {addedAnimation ? (
              <>
                <Check size={16} />
                Added!
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                Quick Add
              </>
            )}
          </button>
        )}
      </div>

      <div className={styles.productContent}>
        <div className={styles.categoryRow}>
          {category && <span className={styles.category}>{category}</span>}
          {brand && <span className={styles.brand}>{brand}</span>}
        </div>

        <Link to={productLink} className={styles.productName} title={name}>
          {name}
        </Link>

        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            <Star size={12} fill="currentColor" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <span className={styles.reviews}>({reviewsCount})</span>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceGroup}>
            <span className={styles.currentPrice}>
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {originalPrice > currentPrice && (
              <span className={styles.oldPrice}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <span className={styles.saveBadge}>
              Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
