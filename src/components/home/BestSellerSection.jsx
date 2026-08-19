import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { addToCart } from "../../redux/cartSlice.js";
import { addToWishlist } from "../../redux/wishlistSlice.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import toast from "react-hot-toast";
import styles from "./BestSellerSection.module.css";

import { fetchBestSellers } from "../../services/productService.js";

function ProductSkeleton() {
  return (
    <article className={styles.productCard} aria-hidden="true">
      <div
        className={styles.imageArea}
        style={{ background: "#1e293b", borderRadius: 16, minHeight: 280 }}
      />
      <div className={styles.productContent}>
        <div
          style={{ height: 12, width: "50%", background: "#334155", borderRadius: 6, marginBottom: 8 }}
        />
        <div
          style={{ height: 16, width: "80%", background: "#334155", borderRadius: 6, marginBottom: 12 }}
        />
        <div
          style={{ height: 20, width: "40%", background: "#334155", borderRadius: 6 }}
        />
      </div>
    </article>
  );
}

function BestSellerSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const items = await fetchBestSellers(4);
        if (!mounted) return;
        const mapped = items.map((product) => {
          const price = Number(product.price || product.salePrice || 0);
          const oldPrice = Number(product.compareAtPrice || product.originalPrice || price);
          const discount = oldPrice > price && price > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

          return {
            id: product.id || product._id,
            name: product.name || product.title || "",
            slug: product.slug || product.id || product._id,
            category: typeof product.category === "object" ? product.category?.name : (product.category || ""),
            image: product.image || product.gallery?.[0] || "",
            price,
            oldPrice,
            discount,
            rating: Number(product.rating) || 0,
            reviews: Number(product.reviewsCount || product.reviews) || 0,
            badge: product.bestSeller ? "Best Seller" : product.featured ? "Featured" : "",
          };
        });

        setProducts(mapped);
      } catch (err) {
        if (mounted) {
          setError("Unable to load products.");
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart!");
      navigate("/login");
      return;
    }
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success("Product added to cart");
  };

  const handleWishlist = (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist!");
      navigate("/login");
      return;
    }
    dispatch(addToWishlist(product));
    toast.success("Added to wishlist");
  };

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.decorativeCircleOne} />
      <div className={styles.decorativeCircleTwo} />

      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>{t("lovedByEnthusiasts")}</span>
            <h2>{t("ourBestSellers")}</h2>
            <p>{t("bestSellersSubtitle")}</p>
          </div>

          <Link to="/products" className={styles.viewAllButton}>
            {t("viewAllProducts")}
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.productGrid}>
            {[1, 2, 3, 4].map((n) => (
              <ProductSkeleton key={n} />
            ))}
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <p>{error}</p>
            <Link
              to="/shop"
              style={{ color: "#e879a0", fontWeight: 600, marginTop: 12, display: "inline-block" }}
            >
              {t("viewAllProducts")} →
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <p style={{ marginBottom: 12 }}>No products available yet.</p>
            <Link
              to="/shop"
              style={{ color: "#e879a0", fontWeight: 600 }}
            >
              {t("viewAllProducts")} →
            </Link>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product) => (
              <article key={product.id} className={styles.productCard}>
                <div className={styles.imageArea}>
                  <Link
                    to={`/product/${product.slug}`}
                    className={styles.imageLink}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span>{product.name?.[0]}</span>
                      </div>
                    )}
                  </Link>

                  {product.badge && (
                    <span className={styles.badge}>{product.badge}</span>
                  )}

                  <button
                    type="button"
                    className={styles.wishlistButton}
                    onClick={() => handleWishlist(product)}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={18} />
                  </button>

                  <button
                    type="button"
                    className={styles.quickAddButton}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag size={18} />
                    {t("addToCart")}
                  </button>
                </div>

                <div className={styles.productContent}>
                  <span className={styles.category}>{product.category}</span>

                  <Link
                    to={`/product/${product.slug}`}
                    className={styles.productName}
                  >
                    {product.name}
                  </Link>

                  {product.rating > 0 && (
                    <div className={styles.ratingRow}>
                      <div className={styles.stars}>
                        <Star size={14} fill="currentColor" />
                        <span>{product.rating}</span>
                      </div>
                      <span className={styles.reviews}>
                        ({product.reviews} {t("customerReviews")})
                      </span>
                    </div>
                  )}

                  <div className={styles.priceRow}>
                    <span className={styles.currentPrice}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.oldPrice > product.price && (
                      <span className={styles.oldPrice}>
                        ₹{product.oldPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.mobileCartButton}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag size={17} />
                    {t("addToCart")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BestSellerSection;