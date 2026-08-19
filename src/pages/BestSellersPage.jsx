import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  X,
  Star,
  Heart,
  ShoppingBag,
} from "lucide-react";

import { fetchBestSellers } from "../services/productService.js";
import styles from "./BestSellersPage.module.css";

function BestSellersPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const productsRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchBestSellers().catch(() => []),
    ]).then(([prods]) => {
      if (!mounted) return;
      setProducts(prods || []);
    })
    .catch(() => {
      if (!mounted) return;
      setError("Unable to load best sellers. Please try again.");
    })
    .finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false };
  }, []);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredProducts = useMemo(() => {
    let list = (products || []).slice();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const cat = (p.category && (p.category.name || p.category)) || "";
        return (
          String(p.name || "").toLowerCase().includes(q) ||
          String(p.brand || "").toLowerCase().includes(q) ||
          String(cat).toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === "price-low") {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "popular") {
      list.sort((a, b) => {
        const aScore = (Number(a.rating) || 0) * Math.log((Number(a.reviewsCount) || 0) + 1) + (a.bestSeller ? 100 : 0) + (a.featured ? 50 : 0)
        const bScore = (Number(b.rating) || 0) * Math.log((Number(b.reviewsCount) || 0) + 1) + (b.bestSeller ? 100 : 0) + (b.featured ? 50 : 0)
        return bScore - aScore
      });
    }

    return list;
  }, [products, search, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSortBy("popular");
  };

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Loved by Beauty Enthusiasts</span>
            <h1>
              Our Best <span>Sellers</span>
            </h1>
            <p>
              Discover our most-loved beauty products, selected for quality,
              performance and everyday confidence.
            </p>
          </div>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={scrollToProducts}
          >
            View All Products
            <ArrowRight size={18} />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search best sellers..."
          />
          {search && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

          {(search) && (
            <div className={styles.activeFilters}>
              <span>Active filters:</span>
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  Search: &ldquo;{search}&rdquo;
                  <X size={13} />
                </button>
              )}
              <button type="button" className={styles.clearAllBtn} onClick={clearFilters}>
                Clear All
              </button>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setLoading(true);
                  fetchBestSellers()
                    .then(setProducts)
                    .catch(() => setError("Unable to load best sellers. Please try again."))
                    .finally(() => setLoading(false));
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!error && loading && (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonLine} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!error && !loading && filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <Search size={40} />
              <h2>No best sellers available</h2>
              <p>Check back soon to discover our most-loved beauty products.</p>
              <Link to="/shop" className={styles.browseButton}>
                Browse All Products
              </Link>
            </div>
          )}

          {!error && !loading && filteredProducts.length > 0 && (
            <>
              <p ref={productsRef} className={styles.resultCount}>
                Showing <strong>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
              <div className={styles.productGrid}>
                {filteredProducts.map((product) => {
                  const cat = (product.category && (product.category.name || product.category)) || "";
                  const originalPrice = Number(product.compareAtPrice || product.oldPrice || 0);
                  const currentPrice = Number(product.price || 0);
                  const discountPercentage = originalPrice > currentPrice && currentPrice > 0
                    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                    : 0;

                  return (
                    <article key={product.id} className={styles.productCard}>
                      <div className={styles.imageArea}>
                        <Link
                          to={`/product/${product.slug}`}
                          className={styles.imageLink}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                          />
                        </Link>

                        <div className={styles.badges}>
                          {product.bestSeller && (
                            <span className={styles.bestSellerBadge}>Best Seller</span>
                          )}
                          {!product.bestSeller && product.featured && (
                            <span className={styles.featuredBadge}>Featured</span>
                          )}
                          {discountPercentage > 0 && (
                            <span className={styles.discountBadge}>
                              -{discountPercentage}%
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={styles.wishlistButton}
                          aria-label={`Add ${product.name} to wishlist`}
                        >
                          <Heart size={18} />
                        </button>

                        <Link
                          to={`/product/${product.slug}`}
                          className={styles.quickCartButton}
                        >
                          <ShoppingBag size={16} />
                          Add to Cart
                        </Link>
                      </div>

                      <div className={styles.productContent}>
                        {cat && (
                          <span className={styles.category}>{cat}</span>
                        )}

                        <Link
                          to={`/product/${product.slug}`}
                          className={styles.productName}
                        >
                          {product.name}
                        </Link>

                        {product.brand && (
                          <span className={styles.productBrand}>{product.brand}</span>
                        )}

                        <div className={styles.ratingRow}>
                          <div className={styles.stars}>
                            <Star size={13} fill="currentColor" />
                            <span>{product.rating || "4.5"}</span>
                          </div>
                          {typeof product.reviewsCount === "number" && (
                            <span className={styles.reviews}>
                              ({product.reviewsCount} review{product.reviewsCount !== 1 ? "s" : ""})
                            </span>
                          )}
                        </div>

                        <div className={styles.priceRow}>
                          <span className={styles.currentPrice}>
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>
                          {originalPrice > currentPrice && (
                            <span className={styles.oldPrice}>
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    );
}

export default BestSellersPage;
