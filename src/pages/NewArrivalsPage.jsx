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

import { fetchNewArrivals } from "../services/productService.js";
import styles from "./NewArrivalsPage.module.css";

function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const productsRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchNewArrivals().catch(() => []),
    ]).then(([prods]) => {
      if (!mounted) return;
      setProducts(prods || []);
    })
    .catch(() => {
      if (!mounted) return;
      setError("Unable to load new arrivals. Please try again.");
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
    } else if (sortBy === "featured") {
      list.sort((a, b) => (Number(b.featured || 0) - Number(a.featured || 0)));
    }

    return list;
  }, [products, search, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSortBy("newest");
  };

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Just In</span>
            <h1>
              New <span>Arrivals</span>
            </h1>
            <p>
              Discover the latest beauty essentials, fresh launches and newest
              additions to our collection.
            </p>
          </div>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={scrollToProducts}
          >
            Shop New Arrivals
            <ArrowRight size={18} />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search new arrivals..."
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
                  fetchNewArrivals()
                    .then(setProducts)
                    .catch(() => setError("Unable to load new arrivals. Please try again."))
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
              <h2>No new arrivals available</h2>
              <p>Check back soon for our latest beauty launches.</p>
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
                          <span className={styles.newBadge}>NEW</span>
                          {discountPercentage > 0 && (
                            <span className={styles.discountBadge}>
                              -{discountPercentage}%
                            </span>
                          )}
                          {product.bestSeller && (
                            <span className={styles.featureBadge}>Best Seller</span>
                          )}
                          {product.featured && !product.bestSeller && (
                            <span className={styles.featureBadge}>Featured</span>
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

export default NewArrivalsPage;
