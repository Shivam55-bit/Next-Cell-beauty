import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  IndianRupee,
  Package,
  ShoppingBag,
  Users,
  Clock,
  RotateCcw,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { analyticsService } from "../../services/analyticsService";
import StatusBadge from "../../components/common/StatusBadge";
import { AreaChart } from "../../components/common/Charts";

import styles from "./DashboardPage.module.css";

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getOverview("Monthly");
      if (res.success) {
        setOverview(res.data);
      } else {
        setError("Failed to load dashboard metrics");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Revenue",
      value: overview ? `₹${overview.totalRevenue.toLocaleString()}` : "₹0",
      note: "Combined store sales",
      icon: IndianRupee,
    },
    {
      label: "Total Orders",
      value: overview ? overview.totalOrders : "0",
      note: "Total customer orders",
      icon: ShoppingBag,
    },
    {
      label: "Products",
      value: overview ? overview.totalProducts : "0",
      note: "Catalog items active",
      icon: Package,
    },
    {
      label: "Customers",
      value: overview ? overview.totalCustomers : "0",
      note: "Registered accounts",
      icon: Users,
    },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.welcomeCard}>
        <div>
          <span>WELCOME BACK</span>

          <h2>NEXT CELL BEAUTY Dashboard</h2>

          <p>
            Monitor store performance and manage your ecommerce
            operations from one place.
          </p>
        </div>

        <button type="button" onClick={() => navigate("/analytics")}>
          View Store Analytics
          <ArrowUpRight size={17} />
        </button>
      </section>

      {error && (
        <div style={{ padding: "14px 20px", background: "rgba(200,59,59,0.1)", borderRadius: "12px", color: "var(--admin-danger)", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchDashboardData} style={{ marginLeft: "auto", padding: "4px 10px", background: "var(--admin-danger)", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px" }}>Retry</button>
        </div>
      )}

      <section className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon size={21} />
              </div>

              <div>
                <span>{stat.label}</span>
                <strong>{loading ? "..." : stat.value}</strong>
                <small>{stat.note}</small>
              </div>
            </article>
          );
        })}
      </section>

      {/* Secondary Quick Metrics Row */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "17px" }}>
        <article className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#fef3c7", color: "#d97706" }}>
            <Clock size={20} />
          </div>
          <div>
            <span>Pending Orders</span>
            <strong>{loading ? "..." : overview?.pendingOrders || 0}</strong>
            <small>Orders awaiting fulfillment</small>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(200, 59, 59, 0.1)", color: "var(--admin-danger)" }}>
            <RotateCcw size={20} />
          </div>
          <div>
            <span>Pending Returns</span>
            <strong>{loading ? "..." : overview?.pendingReturns || 0}</strong>
            <small>Return requests pending review</small>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(6, 25, 54, 0.08)", color: "var(--admin-primary)" }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span>Avg Order Value</span>
            <strong>{loading ? "..." : `₹${overview?.avgOrderValue?.toLocaleString() || 0}`}</strong>
            <small>Average spending per cart</small>
          </div>
        </article>
      </section>

      <section className={styles.placeholderGrid}>
        <article>
          <span>SALES OVERVIEW</span>
          <h3>Revenue Analytics</h3>

          {loading ? (
            <div className={styles.emptyChart}>Loading chart data...</div>
          ) : overview?.revenueChartData ? (
            <div style={{ paddingTop: "10px" }}>
              <AreaChart
                labels={overview.chartLabels}
                data={overview.revenueChartData}
                color="#00633f"
                height={230}
              />
            </div>
          ) : (
            <div className={styles.emptyChart}>
              No revenue data available yet.
            </div>
          )}
        </article>

        <article>
          <span>RECENT ACTIVITY</span>
          <h3>Latest Orders</h3>

          {loading ? (
            <div className={styles.emptyOrders}>Loading recent orders...</div>
          ) : overview?.recentOrders && overview.recentOrders.length > 0 ? (
            <div style={{ display: "grid", gap: "12px", marginTop: "10px" }}>
              {overview.recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => navigate("/orders")}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid var(--admin-border)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    background: "#fff",
                    transition: "all 0.15s"
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "13px", display: "block", color: "var(--admin-heading)" }}>
                      {ord.id} - {ord.customerName}
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>
                      {ord.date} • ₹{ord.totalAmount?.toLocaleString()}
                    </span>
                  </div>

                  <StatusBadge status={ord.orderStatus} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyOrders}>
              No orders available yet.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;