import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import toast from "react-hot-toast";
import styles from "./RecentlyViewedSection.module.css";

export function recordRecentlyViewed(product) {
  if (!product || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("recently_viewed_products");
    let list = raw ? JSON.parse(raw) : [];
    // remove if already exists
    list = list.filter((item) => (item.id || item.slug) !== (product.id || product.slug));
    // add to front
    list.unshift({
      id: product.id || product._id || product.slug,
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: product.price,
      oldPrice: product.oldPrice || product.compareAtPrice,
      image: Array.isArray(product.images) && product.images[0] ? product.images[0] : product.image,
      category: product.category,
      rating: product.rating || 4.8
    });
    // keep maximum 8
    localStorage.setItem("recently_viewed_products", JSON.stringify(list.slice(0, 8)));
  } catch (e) {
    // ignore
  }
}

export default function RecentlyViewedSection() {
  const [items, setItems] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recently_viewed_products");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          setItems(list);
        }
      }
    } catch (e) {}
  }, []);

  if (!items.length) return null;

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
    );
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <section className={styles.sectionWrapper}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.badge}>
              <History size={16} />
              <span>Your Browsing History</span>
            </div>
            <h2>Recently Viewed Products</h2>
          </div>
          <Link to="/shop" className={styles.viewAll}>
            Explore Store <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.productGrid}>
          {items.slice(0, 4).map((product) => (
            <div key={product.id || product.slug} className={styles.productCard}>
              <Link to={`/product/${product.slug}`} className={styles.imageBox}>
                <img src={product.image} alt={product.name} loading="lazy" />
                <span className={styles.categoryBadge}>{product.category}</span>
              </Link>

              <div className={styles.cardContent}>
                <div className={styles.ratingRow}>
                  <Star size={13} className={styles.starIcon} fill="currentColor" />
                  <span>{product.rating}</span>
                </div>

                <Link to={`/product/${product.slug}`} className={styles.productName}>
                  {product.name}
                </Link>

                <div className={styles.priceRow}>
                  <span className={styles.currentPrice}>₹{Number(product.price).toLocaleString("en-IN")}</span>
                  {product.oldPrice && (
                    <span className={styles.oldPrice}>₹{Number(product.oldPrice).toLocaleString("en-IN")}</span>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingBag size={15} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
