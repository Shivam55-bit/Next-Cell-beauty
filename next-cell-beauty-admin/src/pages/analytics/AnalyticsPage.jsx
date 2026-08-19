import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Award,
  Filter
} from "lucide-react";

import { analyticsService } from "../../services/analyticsService";
import { AreaChart, BarChart } from "../../components/common/Charts";

import styles from "./AnalyticsPage.module.css";

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("Monthly");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const res = await analyticsService.getOverview(timeframe);
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    }
    loadAnalytics();
  }, [timeframe]);

  return (
    <div className={styles.container}>
      {/* Header & Timeframe Filters */}
      <div className={styles.topFilterBar}>
        <div>
          <h2>Store Analytics & Insights</h2>
          <p>Real-time revenue, order growth, and conversion reporting</p>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.timeframeToggle}>
            {["Daily", "Weekly", "Monthly", "Yearly"].map((tf) => (
              <button
                key={tf}
                type="button"
                className={timeframe === tf ? styles.activeTf : ""}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className={styles.datePicker}>
            <Calendar size={15} />
            <span>Select Range</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Total Revenue</span>
            <DollarSign size={18} className={styles.kpiIcon} />
          </div>
          <strong>{loading ? "..." : `₹${data?.totalRevenue?.toLocaleString() || 0}`}</strong>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Orders Placed</span>
            <ShoppingBag size={18} className={styles.kpiIcon} />
          </div>
          <strong>{loading ? "..." : data?.totalOrders || 0}</strong>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Avg Order Value (AOV)</span>
            <TrendingUp size={18} className={styles.kpiIcon} />
          </div>
          <strong>{loading ? "..." : `₹${data?.avgOrderValue?.toLocaleString() || 0}`}</strong>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Store Conversion Rate</span>
            <BarChart3 size={18} className={styles.kpiIcon} />
          </div>
          <strong>{loading ? "..." : (data?.totalOrders > 0 ? `${((data.totalOrders / Math.max(data?.totalCustomers || 1, 1)) * 100).toFixed(1)}%` : "—")}</strong>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardTitle}>
            <h3>Revenue Trend ({timeframe})</h3>
            <span>In INR (₹)</span>
          </div>
          {loading ? (
            <div className={styles.loadingPlaceholder}>Loading revenue chart...</div>
          ) : (
            <AreaChart labels={data?.chartLabels} data={data?.revenueChartData} color="#00633f" height={240} />
          )}
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardTitle}>
            <h3>Order Volume ({timeframe})</h3>
            <span>Total Completed Checkout Orders</span>
          </div>
          {loading ? (
            <div className={styles.loadingPlaceholder}>Loading orders chart...</div>
          ) : (
            <BarChart labels={data?.chartLabels} data={data?.ordersChartData} color="#061936" height={240} />
          )}
        </div>
      </div>

      {/* Customer Growth & Top Performers */}
      <div className={styles.bottomGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardTitle}>
            <h3>Customer Growth</h3>
            <span>New Registrations</span>
          </div>
          {loading ? (
            <div className={styles.loadingPlaceholder}>Loading customer growth...</div>
          ) : (
            <AreaChart labels={data?.chartLabels} data={data?.customerGrowthData} color="#061936" height={220} />
          )}
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardTitle}>
            <h3>Top Selling Products</h3>
            <Award size={16} />
          </div>
          <div className={styles.topList}>
            {loading ? (
              <div className={styles.loadingPlaceholder}>Loading top products...</div>
            ) : data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((prod, idx) => (
                <div key={prod.id} className={styles.topItem}>
                  <span className={styles.rank}>#{idx + 1}</span>
                  <img src={prod.images?.[0]} alt={prod.name} className={styles.thumb} />
                  <div className={styles.itemInfo}>
                    <strong>{prod.name}</strong>
                    <small>{prod.category} • {prod.brand}</small>
                  </div>
                  <strong className={styles.price}>₹{prod.salePrice || prod.price}</strong>
                </div>
              ))
            ) : (
              <div className={styles.loadingPlaceholder}>No top products found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
