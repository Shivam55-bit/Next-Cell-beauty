import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../services/api.js";
import styles from "./CategorySection.module.css";

function CategorySkeleton() {
  return (
    <div className={styles.categoryCard} aria-hidden="true">
      <div className={styles.imageWrapper}>
        <div className={styles.skeletonImage} />
      </div>
      <div className={styles.categoryInfo}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonCount} />
      </div>
    </div>
  );
}

function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScroll, setCanScroll] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const gridRef = useRef(null);

  const checkScrollState = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScroll(el.scrollWidth > el.clientWidth + 1);
    setIsAtEnd(el.scrollLeft >= maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    fetch(`${API_BASE_URL}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (!mounted) return;
        const items = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];

        const mapped = items
          .filter((category) => {
            if (!category) return false;
            const status = String(category.status || "Published").toLowerCase();
            return (
              category.isActive !== false &&
              ["published", "active"].includes(status)
            );
          })
          .map((category, index) => ({
            id: category._id || category.id || index + 1,
            name: category.name || category.title || "",
            description: category.description || category.subtitle || "",
            image: category.image || "",
            link: `/shop?categories=${encodeURIComponent(
              category.name || category.title || ""
            )}`,
          }))
          .filter((category) => category.name);

        setCategories(mapped);
      })
      .catch(() => {
        if (mounted) {
          setError("Unable to load categories.");
          setCategories([]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = gridRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScrollState);
    window.addEventListener("resize", checkScrollState);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [categories, checkScrollState]);

  const handleScrollNext = () => {
    const el = gridRef.current;
    if (!el) return;
    const card = el.querySelector("." + styles.categoryCard);
    const cardWidth = card ? card.offsetWidth : 0;
    const gap = 18;
    el.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
  };

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className={`section ${styles.categorySection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>Explore Our Collections</span>
            <h2>Shop by Category</h2>
            <p>
              Discover beauty essentials thoughtfully selected for your daily
              routine.
            </p>
          </div>

          <Link to="/shop" className={styles.viewAllLink}>
            View All Products
          </Link>
        </div>

        {loading ? (
          <div className={styles.categoryGridWrapper}>
            <div ref={gridRef} className={styles.categoryGrid}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <CategorySkeleton key={n} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <p>{error}</p>
            <Link
              to="/shop"
              style={{
                color: "#e879a0",
                fontWeight: 600,
                marginTop: 12,
                display: "inline-block",
              }}
            >
              Browse all products →
            </Link>
          </div>
        ) : categories.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <p style={{ marginBottom: 12 }}>No categories available yet.</p>
            <Link to="/shop" style={{ color: "#e879a0", fontWeight: 600 }}>
              Browse all products →
            </Link>
          </div>
        ) : (
          <div className={styles.categoryGridWrapper}>
            <div ref={gridRef} className={styles.categoryGrid}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={category.link}
                  className={styles.categoryCard}
                >
                  <div className={styles.imageWrapper}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg,#1e293b,#0f172a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 40,
                        }}
                      >
                        🛍️
                      </div>
                    )}
                    <div className={styles.imageOverlay} />
                  </div>

                  <div className={styles.cardContent}>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <span>Shop Now</span>
                  </div>
                </Link>
              ))}
            </div>

            {canScroll && (
              <button
                type="button"
                className={styles.scrollButton}
                onClick={handleScrollNext}
                disabled={isAtEnd}
                aria-label="Scroll categories"
              >
                &gt;
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategorySection;
