import { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  Filter,
  Grid2X2,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import ProductCard from "../components/ProductCard.jsx";
import styles from "./ShopPage.module.css";
import { fetchProducts, fetchCategories } from "../services/productService.js"
import { useLocation } from 'react-router-dom'

const concerns = [
  "Dryness",
  "Acne",
  "Pigmentation",
  "Anti-Ageing",
  "Dullness",
  "Hair Fall",
];

const ratings = ["4 Stars & Above", "3 Stars & Above"];

function ShopPage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState(4);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([fetchProducts().catch((e) => { setError('Failed to load products'); return [] }), fetchCategories().catch(() => [])])
      .then(([prods, cats]) => {
        if (!mounted) return
        setProducts(prods || [])
        setCategories(cats || [])

        // preselect category from query param if present
        const params = new URLSearchParams(location.search)
        const qcat = params.get('category') || params.get('categories')
        if (qcat) {
          const normalized = qcat.replace(/[-_]/g, ' ').toLowerCase()
          const match = (cats || []).find(c => (c.slug || c.name || '').toLowerCase() === (qcat || '').toLowerCase() || (c.name||'').toLowerCase() === normalized)
          if (match) setSelectedCategories([match.name || match.title || match.slug])
        }

        const qbrand = params.get('brand')
        if (qbrand) setSelectedBrand(qbrand)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [location.search])

  const filteredProducts = useMemo(() => {
    let list = (products || []).slice()

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      list = list.filter((product) => {
        const cat = (product.category && (product.category.name || product.category)) || ''
        return (
          String(product.name || '').toLowerCase().includes(query) ||
          String(cat).toLowerCase().includes(query)
        )
      })
    }

    if (selectedCategories.length > 0) {
          list = list.filter((product) => {
            const cat = (product.category && (product.category.name || product.category)) || ''
            return selectedCategories.includes(cat)
          })
    }

    if (selectedBrand) {
      const brandQuery = selectedBrand.toLowerCase().replace(/[-_]/g, ' ')
      list = list.filter((product) => {
        const productBrand = String(product.brand || product.brandName || '').toLowerCase().replace(/[-_]/g, ' ')
        return productBrand.includes(brandQuery) || productBrand === brandQuery
      })
    }

        if (sortBy === "price-low") {
          list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        }

        if (sortBy === "price-high") {
          list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        }

        if (sortBy === "rating") {
          list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        }

        return list;
  }, [search, selectedCategories, selectedBrand, sortBy, products]);

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedBrand("");
    setSortBy("featured");
  };

  const filterContent = (
    <div className={styles.filterContent}>
      <div className={styles.filterHeader}>
        <div>
          <span>Refine Your Search</span>
          <h2>Filters</h2>
        </div>

        <button type="button" onClick={clearFilters}>
          Clear All
        </button>
      </div>

      <div className={styles.filterSearch}>
        <Search size={18} />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
        />
      </div>

      <div className={styles.filterGroup}>
        <h3>Categories</h3>

        <div className={styles.checkboxList}>
        {categories.map((category) => {
          const categoryName = category.name || category.title || category.slug || ''
          const categoryKey = category._id || category.id || category.slug || categoryName
          return (
            <label key={categoryKey}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(categoryName)}
                onChange={() => toggleCategory(categoryName)}
              />

              <span className={styles.customCheckbox} />
              <span>{categoryName}</span>
            </label>
          )
        })}
      </div>
      </div>

      <div className={styles.filterGroup}>
        <h3>Price Range</h3>

        <div className={styles.priceInputs}>
          <input type="number" placeholder="Min ₹" />
          <span>—</span>
          <input type="number" placeholder="Max ₹" />
        </div>

        <input
          type="range"
          min="0"
          max="5000"
          defaultValue="2500"
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <h3>Beauty Concerns</h3>

        <div className={styles.checkboxList}>
          {concerns.map((concern) => (
            <label key={concern}>
              <input type="checkbox" />
              <span className={styles.customCheckbox} />
              <span>{concern}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3>Customer Rating</h3>

        <div className={styles.checkboxList}>
          {ratings.map((rating) => (
            <label key={rating}>
              <input type="checkbox" />
              <span className={styles.customCheckbox} />
              <span>{rating}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.applyFilterButton}
        onClick={() => setMobileFilterOpen(false)}
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <main className={styles.page}>
      <section className={styles.shopHero}>
        <div className={styles.heroPattern} />

        <div className={`container ${styles.heroContainer}`}>
          <span className={styles.heroEyebrow}>Premium Beauty Collection</span>

          <h1>
            Discover Beauty Made
            <span> for You</span>
          </h1>

          <p>
            Shop skincare, makeup, haircare, fragrances and premium beauty
            essentials selected for every routine.
          </p>

          <div className={styles.breadcrumb}>
            <a href="/">Home</a>
            <span>/</span>
            <strong>Shop</strong>
          </div>
        </div>
      </section>

      <section className={styles.shopSection}>
        <div className="container">
          <div className={styles.mobileToolbar}>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
            >
              <Filter size={19} />
              Filters
            </button>

            <label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              <ChevronDown size={16} />
            </label>
          </div>

          <div className={styles.shopLayout}>
            <aside className={styles.desktopSidebar}>{filterContent}</aside>

            <div className={styles.productsArea}>
              <div className={styles.productsToolbar}>
                <div>
                  <span className={styles.resultLabel}>
                    Beauty Products
                  </span>

                  <p>
                    Showing <strong>{filteredProducts.length}</strong> products
                  </p>
                </div>

                <div className={styles.toolbarActions}>
                  <div className={styles.gridButtons}>
                    <button
                      type="button"
                      className={gridColumns === 3 ? styles.activeGrid : ""}
                      onClick={() => setGridColumns(3)}
                      aria-label="Three-column product view"
                    >
                      <Grid2X2 size={19} />
                    </button>

                    <button
                      type="button"
                      className={gridColumns === 4 ? styles.activeGrid : ""}
                      onClick={() => setGridColumns(4)}
                      aria-label="Four-column product view"
                    >
                      <LayoutGrid size={19} />
                    </button>
                  </div>

                  <label className={styles.sortSelect}>
                    <SlidersHorizontal size={17} />

                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      <option value="featured">Sort by: Featured</option>
                      <option value="price-low">
                        Price: Low to High
                      </option>
                      <option value="price-high">
                        Price: High to Low
                      </option>
                      <option value="rating">Top Rated</option>
                    </select>

                    <ChevronDown size={16} />
                  </label>
                </div>
              </div>

              {selectedCategories.length > 0 && (
                <div className={styles.activeFilters}>
                  <span>Active filters:</span>

                  {selectedCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                      <X size={13} />
                    </button>
                  ))}

                  {selectedBrand && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrand("")}
                    >
                      {selectedBrand}
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {filteredProducts.length > 0 ? (
                <div
                  className={`${styles.productGrid} ${
                    gridColumns === 3
                      ? styles.threeColumns
                      : styles.fourColumns
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Search size={34} />

                  <h2>No products found</h2>

                  <p>
                    Try changing your search or removing some filters.
                  </p>

                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div
        className={`${styles.mobileOverlay} ${
          mobileFilterOpen ? styles.mobileOverlayOpen : ""
        }`}
        onClick={() => setMobileFilterOpen(false)}
      />

      <aside
        className={`${styles.mobileFilterDrawer} ${
          mobileFilterOpen ? styles.mobileFilterDrawerOpen : ""
        }`}
      >
        <div className={styles.mobileDrawerHeader}>
          <div>
            <span>Shop Filters</span>
            <strong>Refine Products</strong>
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(false)}
            aria-label="Close filters"
          >
            <X size={23} />
          </button>
        </div>

        {filterContent}
      </aside>
    </main>
  );
}

export default ShopPage;