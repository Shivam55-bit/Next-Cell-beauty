import {
  BarChart3,
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Gift,
  HelpCircle,
  Home,
  Image,
  LayoutDashboard,
  MessageSquareText,
  PackageSearch,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Tags,
  Users,
  X,
  Flame,
  MoveHorizontal,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import styles from "./Sidebar.module.css";

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        path: "/products",
        icon: ShoppingBag,
      },
      {
        label: "Categories",
        path: "/categories",
        icon: Tags,
      },
      {
        label: "Brands",
        path: "/brands",
        icon: Boxes,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Orders",
        path: "/orders",
        icon: ClipboardList,
      },
      {
        label: "Returns & Refunds",
        path: "/returns",
        icon: RefreshCcw,
      },
      {
        label: "Coupons & Offers",
        path: "/coupons",
        icon: Gift,
      },
      {
        label: "Combo Deals",
        path: "/combos",
        icon: Flame,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        label: "Customers",
        path: "/customers",
        icon: Users,
      },
      {
        label: "Reviews",
        path: "/reviews",
        icon: Star,
      },
    ],
  },
  {
    label: "Beauty Content",
    items: [
      {
        label: "Tutorials",
        path: "/tutorials",
        icon: BookOpen,
      },
      {
        label: "Before & After",
        path: "/before-after",
        icon: MoveHorizontal,
      },
      {
        label: "Skin Quiz",
        path: "/skin-quiz",
        icon: Sparkles,
      },
      {
        label: "Shade Finder",
        path: "/shade-finder",
        icon: PackageSearch,
      },
    ],
  },
  {
    label: "Website CMS",
    items: [
      {
        label: "Banners",
        path: "/banners",
        icon: Image,
      },
      {
        label: "Blog",
        path: "/blog",
        icon: FileText,
      },
      {
        label: "FAQ",
        path: "/faq",
        icon: HelpCircle,
      },
      {
        label: "Policies",
        path: "/policies",
        icon: MessageSquareText,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];

function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) {
  return (
    <>
      <div
        className={`${styles.mobileOverlay} ${
          mobileOpen ? styles.mobileOverlayVisible : ""
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`${styles.sidebar} ${
          collapsed ? styles.collapsed : ""
        } ${mobileOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <NavLink to="/dashboard" className={styles.brand}>
            <div className={styles.logoMark}>
              <span>N</span>
              <span>C</span>
            </div>

            {!collapsed && (
              <div className={styles.brandText}>
                <strong>NEXT CELL</strong>
                <span>BEAUTY ADMIN</span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className={styles.mobileClose}
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className={styles.storeCard}>
          {!collapsed ? (
            <>
              <div className={styles.storeIcon}>
                <Home size={19} />
              </div>

              <div>
                <span>Store Status</span>
                <strong>
                  <i />
                  Online
                </strong>
              </div>
            </>
          ) : (
            <div className={styles.collapsedStatus}>
              <i />
            </div>
          )}
        </div>

        <nav className={styles.navigation}>
          {menuGroups.map((group) => (
            <div key={group.label} className={styles.menuGroup}>
              {!collapsed && (
                <span className={styles.groupLabel}>{group.label}</span>
              )}

              <div className={styles.menuItems}>
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `${styles.menuItem} ${
                          isActive ? styles.activeItem : ""
                        }`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={19} />

                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;