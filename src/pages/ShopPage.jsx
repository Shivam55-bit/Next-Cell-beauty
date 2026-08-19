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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [selectedRating, setSelectedRating] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchProducts().catch((e) => {
        setError('Failed to load products');
        return [];
      }),
      fetchCategories().catch(() => []),
    ])
      .then(([prods, cats]) => {
        if (!mounted) return;
        setProducts(prods || []);
        setCategories(cats || []);

        // preselect category from query param if present
        const params = new URLSearchParams(location.search);
        const qcat = params.get('category') || params.get('categories');
        if (qcat) {
          const normalized = qcat.replace(/[-_]/g, ' ').toLowerCase().trim();
          const match = (cats || []).find(
            (c) =>
              (c.slug || '').toLowerCase() === qcat.toLowerCase() ||
              (c.name || '').toLowerCase().trim() === normalized ||
              (c.title || '').toLowerCase().trim() === normalized
          );
          if (match) {
            setSelectedCategories([match.name || match.title || match.slug]);
          } else {
            // capitalise for display
            const formatted = qcat.charAt(0).toUpperCase() + qcat.slice(1);
            setSelectedCategories([formatted]);
          }
        }

        const qbrand = params.get('brand');
        if (qbrand) setSelectedBrand(qbrand);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    let list = (products || []).slice();

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter((product) => {
        const cat =
          typeof product.category === 'object'
            ? product.category?.name || product.category?.title || ''
            : product.category || '';
        const brand =
          typeof product.brand === 'object'
            ? product.brand?.name || product.brand?.title || ''
            : product.brand || '';

        return (
          String(product.name || '').toLowerCase().includes(query) ||
          String(cat).toLowerCase().includes(query) ||
          String(brand).toLowerCase().includes(query)
        );
      });
    }

    if (selectedCategories.length > 0) {
      const lowerCats = selectedCategories.map((c) => String(c).toLowerCase().trim());
      list = list.filter((product) => {
        const cat =
          typeof product.category === 'object'
            ? product.category?.name || product.category?.title || product.category?.slug || ''
            : product.category || '';
        const catLower = String(cat).toLowerCase().trim();
        return lowerCats.some(
          (lc) => lc === catLower || catLower.includes(lc) || lc.includes(catLower)
        );
      });
    }

    if (selectedBrand) {
      const brandQuery = selectedBrand.toLowerCase().replace(/[-_]/g, ' ').trim();
      list = list.filter((product) => {
        const productBrand = String(
          (typeof product.brand === 'object' ? product.brand?.name : product.brand) ||
            product.brandName ||
            ''
        )
          .toLowerCase()
          .replace(/[-_]/g, ' ')
          .trim();
        return productBrand.includes(brandQuery) || productBrand === brandQuery;
      });
    }

    if (minPrice !== '') {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        list = list.filter((product) => Number(product.price || 0) >= min);
      }
    }

    if (maxPrice !== '') {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        list = list.filter((product) => Number(product.price || 0) <= max);
      }
    }

    if (selectedRating) {
      const minStars = selectedRating.includes('4') ? 4 : 3;
      list = list.filter((product) => Number(product.rating || 4.5) >= minStars);
    }

    if (selectedConcerns.length > 0) {
      list = list.filter((product) => {
        const desc = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();
        return selectedConcerns.some((c) => desc.includes(c.toLowerCase()));
      });
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }

    return list;
  }, [
    search,
    selectedCategories,
    selectedBrand,
    minPrice,
    maxPrice,
    selectedRating,
    selectedConcerns,
    sortBy,
    products,
  ]);

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const toggleConcern = (concern) => {
    setSelectedConcerns((current) =>
      current.includes(concern)
        ? current.filter((item) => item !== concern)
        : [...current, concern]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedConcerns([]);
    setSelectedRating('');
    setSortBy('featured');
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
            const categoryName = category.name || category.title || category.slug || '';
            const categoryKey = category._id || category.id || category.slug || categoryName;
            return (
              <label key={categoryKey}>
                <input
                  type="checkbox"
                  checked={selectedCategories.some(
                    (sc) => sc.toLowerCase() === categoryName.toLowerCase()
                  )}
                  onChange={() => toggleCategory(categoryName)}
                />

                <span className={styles.customCheckbox} />
                <span>{categoryName}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3>Price Range</h3>

        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3>Beauty Concerns</h3>

        <div className={styles.checkboxList}>
          {concerns.map((concern) => (
            <label key={concern}>
              <input
                type="checkbox"
                checked={selectedConcerns.includes(concern)}
                onChange={() => toggleConcern(concern)}
              />
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
              <input
                type="checkbox"
                checked={selectedRating === rating}
                onChange={() =>
                  setSelectedRating(selectedRating === rating ? '' : rating)
                }
              />
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

              {(selectedCategories.length > 0 || selectedBrand || minPrice || maxPrice || selectedRating || selectedConcerns.length > 0) && (
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
                      Brand: {selectedBrand}
                      <X size={13} />
                    </button>
                  )}

                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                    >
                      ₹{minPrice || '0'} - ₹{maxPrice || '5000+'}
                      <X size={13} />
                    </button>
                  )}

                  {selectedRating && (
                    <button
                      type="button"
                      onClick={() => setSelectedRating('')}
                    >
                      {selectedRating}
                      <X size={13} />
                    </button>
                  )}

                  {selectedConcerns.map((concern) => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleConcern(concern)}
                    >
                      {concern}
                      <X size={13} />
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div
                  className={`${styles.productGrid} ${
                    gridColumns === 3
                      ? styles.threeColumns
                      : styles.fourColumns
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="animate-pulse rounded-[18px] bg-slate-100 dark:bg-slate-800 p-4 min-h-[380px]"
                    />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div
                  className={`${styles.productGrid} ${
                    gridColumns === 3
                      ? styles.threeColumns
                      : styles.fourColumns
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id || product._id || product.slug} product={product} />
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