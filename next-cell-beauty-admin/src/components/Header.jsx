import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import styles from "./Header.module.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/products": "Products",
  "/categories": "Categories",
  "/brands": "Brands",
  "/orders": "Orders",
  "/returns": "Returns & Refunds",
  "/coupons": "Coupons & Offers",
  "/customers": "Customers",
  "/reviews": "Reviews",
  "/tutorials": "Beauty Tutorials",
  "/skin-quiz": "Skin Quiz",
  "/shade-finder": "Shade Finder",
  "/banners": "Banners",
  "/blog": "Blog",
  "/faq": "FAQ",
  "/policies": "Policies",
  "/settings": "Settings",
};

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const storedUser = localStorage.getItem("adminUser");

  let adminUser = {
    name: "Super Admin",
    email: "admin@nextcellbeauty.com",
  };

  try {
    if (storedUser) {
      adminUser = {
        ...adminUser,
        ...JSON.parse(storedUser),
      };
    }
  } catch {
    // Keep fallback user.
  }

  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/products/")
      ? "Product Details"
      : location.pathname.startsWith("/orders/")
        ? "Order Details"
        : "Admin Panel");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={21} />
        </button>

        <div className={styles.pageHeading}>
          <span>Admin Workspace</span>
          <h1>{currentTitle}</h1>
        </div>
      </div>

      <div className={styles.centerSection}>
        <div className={styles.searchBox}>
          <Search size={18} />

          <input
            type="search"
            placeholder="Search products, orders, customers..."
            aria-label="Search admin panel"
          />

          <kbd>⌘ K</kbd>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() =>
              setNotificationOpen((current) => !current)
            }
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span>3</span>
          </button>

          {notificationOpen && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeading}>
                <strong>Notifications</strong>
                <span>3 New</span>
              </div>

              <div className={styles.notificationItem}>
                <i />
                <div>
                  <strong>New order received</strong>
                  <span>Order #NCB-1024 was placed.</span>
                </div>
              </div>

              <div className={styles.notificationItem}>
                <i />
                <div>
                  <strong>Low stock alert</strong>
                  <span>2 products require attention.</span>
                </div>
              </div>

              <div className={styles.notificationItem}>
                <i />
                <div>
                  <strong>New product review</strong>
                  <span>A customer submitted a review.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() =>
              setProfileOpen((current) => !current)
            }
          >
            <div className={styles.avatar}>
              {adminUser.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className={styles.profileText}>
              <strong>{adminUser.name}</strong>
              <span>Super Admin</span>
            </div>

            <ChevronDown
              size={16}
              className={profileOpen ? styles.rotateIcon : ""}
            />
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileSummary}>
                <div className={styles.largeAvatar}>
                  {adminUser.name?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div>
                  <strong>{adminUser.name}</strong>
                  <span>{adminUser.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
              >
                <UserRound size={17} />
                Admin Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings size={17} />
                Settings
              </button>

              <hr />

              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;