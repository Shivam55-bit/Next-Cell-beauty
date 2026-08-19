import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  X,
  ChevronDown,
  Truck,
  Gift,
  WalletCards,
} from "lucide-react";
import BrandLogo from "./common/BrandLogo";
import styles from "./Navbar.module.css";
import { getMyWishlist } from "../services/wishlistService.js";
import { addToWishlist, removeFromWishlist } from "../redux/wishlistSlice.js";
import { useAuth } from "../context/AuthContext.jsx";

const categories = [
  { label: "Skincare", path: "/shop?category=skincare" },
  { label: "Makeup", path: "/shop?category=makeup" },
  { label: "Haircare", path: "/shop?category=haircare" },
  { label: "Fragrance", path: "/shop?category=fragrance" },
  { label: "Bath & Body", path: "/shop?category=bath-body" },
  { label: "Beauty Tools", path: "/shop?category=beauty-tools" },
  { label: "Beauty Blog", path: "/blog" },
  { label: "FAQs", path: "/faq" },
  { label: "Brands", path: "/brands" },
  { label: "Offers", path: "/offers" },
  { label: "New Arrivals", path: "/new-arrivals" },
  { label: "Best Sellers", path: "/best-sellers" },
];

function Navbar() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const cartCount = useSelector((state) => state.cart?.items?.length || 0);
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);
  const categoryRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!categoryDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return;

    const loadWishlist = async () => {
      try {
        const res = await getMyWishlist();
        const items = Array.isArray(res) ? res : res.data || [];
        items.forEach((product) => {
          const normalized = { ...product, id: product._id || product.id };
          dispatch(addToWishlist(normalized));
        });
      } catch {
        // ignore wishlist sync errors
      }
    };

    loadWishlist();
  }, [dispatch]);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen((current) => !current);
  };

  return (
    <>
      <header className={styles.siteHeader}>
        <div className={styles.topBar}>
          <div className={`container ${styles.topBarInner}`}>
            <span>
              <Truck size={15} />
              Free Shipping on Orders Above ₹999
            </span>

            <span className={styles.topBarCenter}>
              <WalletCards size={15} />
              COD Available Across India
            </span>

            <span className={styles.topBarRight}>
              <Gift size={15} />
              Exclusive Offers on Premium Beauty
            </span>
          </div>
        </div>

        <div className={styles.mainHeader}>
          <div className={`container ${styles.mainHeaderInner}`}>
            <button
              type="button"
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={25} />
            </button>

            <BrandLogo />

            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search for skincare, makeup, haircare and more..."
                aria-label="Search products"
              />

              <button type="submit" aria-label="Search">
                <Search size={22} />
              </button>
            </form>

            <div className={styles.headerActions}>
              <Link to={isAuthenticated ? "/profile" : "/login"} className={styles.actionItem} title={isAuthenticated ? "My Account" : "Login"}>
                <UserRound size={25} />
                <span>{isAuthenticated ? (user?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "Account") : "Login"}</span>
              </Link>

              <Link to="/wishlist" className={styles.actionItem}>
                <span className={styles.iconWrapper}>
                  <Heart size={25} />
                  <small>{wishlistCount}</small>
                </span>
                <span>Wishlist</span>
              </Link>

              <Link to="/cart" className={styles.actionItem}>
                <span className={styles.iconWrapper}>
                  <ShoppingBag size={25} />
                  <small>{cartCount}</small>
                </span>
                <span>Cart</span>
              </Link>
            </div>

            <button
              type="button"
              className={styles.mobileSearchButton}
              onClick={() => setMobileSearchOpen((current) => !current)}
              aria-label="Open search"
            >
              <Search size={24} />
            </button>

          <Link
            to="/cart"
            className={styles.mobileCartButton}
            aria-label="Open cart"
          >
            <ShoppingBag size={24} />
            <small>{cartCount}</small>
          </Link>
          </div>

          {mobileSearchOpen && (
            <form
              className={`container ${styles.mobileSearch}`}
              onSubmit={handleSearch}
            >
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search beauty products..."
                autoFocus
              />

              <button type="submit" aria-label="Search">
                <Search size={20} />
              </button>
            </form>
          )}
        </div>

        <nav className={styles.desktopNav}>
          <div className={`container ${styles.desktopNavInner}`}>
            <div ref={categoryRef} className={styles.categoryDropdownWrapper}>
              <button
                type="button"
                className={`${styles.categoryButton} ${categoryDropdownOpen ? styles.categoryButtonOpen : ""}`}
                onClick={toggleCategoryDropdown}
                aria-expanded={categoryDropdownOpen}
                aria-haspopup="true"
              >
                <Menu size={20} />
                Shop by Category
                <ChevronDown size={17} />
              </button>

              {categoryDropdownOpen && (
                <div className={styles.categoryDropdown}>
                  {categories.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={styles.categoryDropdownLink}
                      onClick={() => setCategoryDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.navLinks}>
              {categories.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navLink} ${
                      isActive ? styles.navLinkActive : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <div
        className={`${styles.mobileOverlay} ${
          mobileMenuOpen ? styles.mobileOverlayVisible : ""
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`${styles.mobileDrawer} ${
          mobileMenuOpen ? styles.mobileDrawerOpen : ""
        }`}
      >
        <div className={styles.mobileDrawerHeader}>
          <div className={styles.mobileBrand}>
            <BrandLogo variant="iconOnly" showText={false} />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={25} />
          </button>
        </div>

        <div className={styles.mobileAccountLinks}>
          <Link to={isAuthenticated ? "/profile" : "/login"} onClick={() => setMobileMenuOpen(false)}>
            <UserRound size={20} />
            {isAuthenticated ? (user?.fullName || user?.name || "My Account") : "Login / Register"}
          </Link>

          <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
            <Heart size={20} />
            My Wishlist
          </Link>
        </div>

        <div className={styles.mobileNavLinks}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>

          {categories.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
            About Us
          </Link>

          <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>
            Beauty Blog
          </Link>

          <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>
            FAQs
          </Link>

          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
            Contact Us
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Navbar;