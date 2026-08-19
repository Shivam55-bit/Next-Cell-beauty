import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  X,
  Star,
  Heart,
  ShoppingBag,
  Tag,
  Copy,
} from "lucide-react";

import { fetchDiscountedProducts } from "../services/productService.js";
import { fetchCoupons } from "../services/couponService.js";
import toast from "react-hot-toast";
import styles from "./OffersPage.module.css";

function OffersPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("discount");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const productsRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchDiscountedProducts().catch(() => []),
      fetchCoupons().catch(() => []),
    ]).then(([prods, cps]) => {
      if (!mounted) return;
      setProducts(prods || []);
      setCoupons(Array.isArray(cps) ? cps : []);
    })
    .catch(() => {
      if (!mounted) return;
      setError("Unable to load offers. Please try again.");
    })
    .finally(() => {
      if (mounted) {
        setLoading(false);
        setCouponsLoading(false);
      }
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

    if (sortBy === "discount") {
      list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (sortBy === "price-low") {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, search, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSortBy("discount");
  };

  const copyCouponCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(`Coupon code ${code} copied!`)
    } catch {
      toast.error('Unable to copy code')
    }
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Exclusive Beauty Offers</span>
            <h1>
              Beauty Deals <span>You&apos;ll Love</span>
            </h1>
            <p>
              Discover exclusive offers, special discounts and limited-time deals on
              your favourite beauty products.
            </p>
          </div>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={scrollToProducts}
          >
            Shop Offers
            <ArrowRight size={18} />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers..."
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

        {!couponsLoading && coupons.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <Tag size={20} className="text-brand-600" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Available Coupon Codes
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id || coupon.code}
                  className="group relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Coupon Code</p>
                      <p className="mt-1 font-mono text-lg font-extrabold text-brand-700 dark:text-brand-300">
                        {coupon.code}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                      {coupon.status === 'Active' ? 'Active' : coupon.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                      {coupon.discountType === 'Percentage' || coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`}
                    </p>
                    {coupon.minOrderAmount > 0 && (
                      <p>Min. order value: ₹{coupon.minOrderAmount}</p>
                    )}
                    {coupon.maxDiscount > 0 && (
                      <p>Max discount: ₹{coupon.maxDiscount}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Valid: {coupon.startDate || 'Now'} — {coupon.endDate || 'No expiry'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyCouponCode(coupon.code)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Copy size={16} />
                    Copy Code
                  </button>
                </div>
              ))}
            </div>
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
                  fetchDiscountedProducts()
                    .then(setProducts)
                    .catch(() => setError("Unable to load offers. Please try again."))
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
              <h2>No active offers right now</h2>
              <p>Check back soon for new beauty deals.</p>
              <Link to="/shop" className={styles.browseButton}>
                Browse Products
              </Link>
            </div>
          )}

          {!error && !loading && filteredProducts.length > 0 && (
            <>
              <p ref={productsRef} className={styles.resultCount}>
                Showing <strong>{filteredProducts.length}</strong> deal{filteredProducts.length !== 1 ? "s" : ""}
              </p>
              <div className={styles.productGrid}>
                {filteredProducts.map((product) => {
                  const cat = (product.category && (product.category.name || product.category)) || "";
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
                          <span className={styles.discountBadge}>
                            -{product.discountPercentage}%
                          </span>
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
                          <span className={styles.oldPrice}>
                            ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                          </span>
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

export default OffersPage;

