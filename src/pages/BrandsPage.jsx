import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, X } from "lucide-react";

import { fetchBrands } from "../services/productService.js";
import styles from "./BrandsPage.module.css";

function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    fetchBrands()
      .then((data) => {
        if (!mounted) return;
        setBrands(data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Unable to load brands. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBrands = useMemo(() => {
    if (!search.trim()) return brands;
    const query = search.trim().toLowerCase();
    return brands.filter(
      (brand) =>
        String(brand.name || "").toLowerCase().includes(query) ||
        String(brand.description || "").toLowerCase().includes(query)
    );
  }, [brands, search]);

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Premium Beauty Collection</span>
            <h1>Beauty Brands</h1>
            <p>
              Discover premium beauty brands curated for your skincare, makeup,
              haircare and beauty needs.
            </p>
          </div>
        </div>

        <div className={styles.searchWrap}>
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
          />
          {search && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {error && (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setLoading(true);
                fetchBrands()
                  .then(setBrands)
                  .catch(() => setError("Unable to load brands. Please try again."))
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
                <div className={styles.skeletonLogo} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            ))}
          </div>
        )}

        {!error && !loading && filteredBrands.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={40} />
            <h2>No brands found</h2>
            <p>
              {search
                ? "Try a different search term."
                : "No brands available at the moment."}
            </p>
            {search && (
              <button type="button" onClick={() => setSearch("")}>
                Clear Search
              </button>
            )}
          </div>
        )}

        {!error && !loading && filteredBrands.length > 0 && (
          <div className={styles.brandGrid}>
            {filteredBrands.map((brand) => (
              <article key={brand.id} className={styles.brandCard}>
                <div className={styles.brandCardBody}>
                  <div className={styles.logoArea}>
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={styles.logoPlaceholder}
                      style={{ display: brand.logo ? "none" : "flex" }}
                    >
                      <span>
                        {brand.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                  </div>

                  <div className={styles.brandInfo}>
                    <h3>{brand.name}</h3>
                    {brand.description && (
                      <p>{brand.description}</p>
                    )}
                    {typeof brand.productCount === "number" && (
                      <span className={styles.productCount}>
                        {brand.productCount} product
                        {brand.productCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                  className={styles.viewProductsButton}
                >
                  View Products
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default BrandsPage;
