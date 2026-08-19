import { apiClient } from "./apiClient";

/**
 * Builds monthly revenue data from real orders.
 * Groups orders by their createdAt month and sums totalAmount.
 */
function buildMonthlyRevenue(orders) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sums = new Array(12).fill(0);
  for (const order of orders) {
    const date = new Date(order.createdAt || order.date || null);
    if (!isNaN(date.getTime())) {
      sums[date.getMonth()] += Number(order.totalAmount || 0);
    }
  }
  return { labels: months, data: sums };
}

function buildWeeklyRevenue(orders) {
  const labels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
  const sums = [0, 0, 0, 0];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  for (const order of orders) {
    const date = new Date(order.createdAt || order.date || null);
    if (!isNaN(date.getTime()) && date >= startOfMonth) {
      const dayOfMonth = date.getDate();
      const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
      sums[weekIndex] += Number(order.totalAmount || 0);
    }
  }
  return { labels, data: sums };
}

function buildDailyRevenue(orders) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sums = new Array(7).fill(0);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  for (const order of orders) {
    const date = new Date(order.createdAt || order.date || null);
    if (!isNaN(date.getTime()) && date >= weekAgo) {
      sums[date.getDay()] += Number(order.totalAmount || 0);
    }
  }
  return { labels: days, data: sums };
}

function buildYearlyRevenue(orders) {
  const now = new Date();
  const years = [now.getFullYear() - 3, now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];
  const sums = new Array(4).fill(0);
  for (const order of orders) {
    const date = new Date(order.createdAt || order.date || null);
    if (!isNaN(date.getTime())) {
      const idx = years.indexOf(date.getFullYear());
      if (idx !== -1) sums[idx] += Number(order.totalAmount || 0);
    }
  }
  return { labels: years.map(String), data: sums };
}

function buildOrderCounts(orders, timeframe) {
  if (timeframe === "Daily") {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const counts = new Array(7).fill(0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const o of orders) {
      const d = new Date(o.createdAt || o.date || null);
      if (!isNaN(d.getTime()) && d >= weekAgo) counts[d.getDay()]++;
    }
    return { labels: days, data: counts };
  }
  if (timeframe === "Weekly") {
    const labels = ["Wk 1","Wk 2","Wk 3","Wk 4"];
    const counts = [0,0,0,0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    for (const o of orders) {
      const d = new Date(o.createdAt || o.date || null);
      if (!isNaN(d.getTime()) && d >= startOfMonth) {
        counts[Math.min(Math.floor((d.getDate()-1)/7),3)]++;
      }
    }
    return { labels, data: counts };
  }
  if (timeframe === "Yearly") {
    const now = new Date();
    const years = [now.getFullYear()-3, now.getFullYear()-2, now.getFullYear()-1, now.getFullYear()];
    const counts = new Array(4).fill(0);
    for (const o of orders) {
      const d = new Date(o.createdAt || o.date || null);
      if (!isNaN(d.getTime())) {
        const idx = years.indexOf(d.getFullYear());
        if (idx !== -1) counts[idx]++;
      }
    }
    return { labels: years.map(String), data: counts };
  }
  // Monthly (default)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const counts = new Array(12).fill(0);
  for (const o of orders) {
    const d = new Date(o.createdAt || o.date || null);
    if (!isNaN(d.getTime())) counts[d.getMonth()]++;
  }
  return { labels: months, data: counts };
}

function buildCustomerGrowth(customers, timeframe) {
  if (timeframe === "Yearly") {
    const now = new Date();
    const years = [now.getFullYear()-3, now.getFullYear()-2, now.getFullYear()-1, now.getFullYear()];
    const counts = new Array(4).fill(0);
    for (const c of customers) {
      const d = new Date(c.createdAt || null);
      if (!isNaN(d.getTime())) {
        const idx = years.indexOf(d.getFullYear());
        if (idx !== -1) counts[idx]++;
      }
    }
    return { labels: years.map(String), data: counts };
  }
  if (timeframe === "Weekly") {
    const labels = ["Wk 1","Wk 2","Wk 3","Wk 4"];
    const counts = [0,0,0,0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    for (const c of customers) {
      const d = new Date(c.createdAt || null);
      if (!isNaN(d.getTime()) && d >= startOfMonth) {
        counts[Math.min(Math.floor((d.getDate()-1)/7),3)]++;
      }
    }
    return { labels, data: counts };
  }
  if (timeframe === "Daily") {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const counts = new Array(7).fill(0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const c of customers) {
      const d = new Date(c.createdAt || null);
      if (!isNaN(d.getTime()) && d >= weekAgo) counts[d.getDay()]++;
    }
    return { labels: days, data: counts };
  }
  // Monthly
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const counts = new Array(12).fill(0);
  for (const c of customers) {
    const d = new Date(c.createdAt || null);
    if (!isNaN(d.getTime())) counts[d.getMonth()]++;
  }
  return { labels: months, data: counts };
}

export const analyticsService = {
  getOverview: async (timeframe = "Monthly") => {
    const [ordersRes, productsRes, customersRes, returnsRes] = await Promise.all([
      apiClient.get("orders").catch(() => ({ data: [] })),
      apiClient.get("products").catch(() => ({ data: [] })),
      apiClient.get("customers").catch(() => ({ data: [] })),
      apiClient.get("returns").catch(() => ({ data: [] })),
    ]);

    const orders = Array.isArray(ordersRes.data)
      ? ordersRes.data
      : Array.isArray(ordersRes.data?.orders)
      ? ordersRes.data.orders
      : Array.isArray(ordersRes.data?.data)
      ? ordersRes.data.data
      : [];

    const products = Array.isArray(productsRes.data)
      ? productsRes.data
      : Array.isArray(productsRes.data?.products)
      ? productsRes.data.products
      : Array.isArray(productsRes.data?.data)
      ? productsRes.data.data
      : [];

    const customers = Array.isArray(customersRes.data)
      ? customersRes.data
      : Array.isArray(customersRes.data?.customers)
      ? customersRes.data.customers
      : Array.isArray(customersRes.data?.data)
      ? customersRes.data.data
      : [];

    const returns = Array.isArray(returnsRes.data)
      ? returnsRes.data
      : Array.isArray(returnsRes.data?.data)
      ? returnsRes.data.data
      : [];

    // Real computed metrics
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = customers.length;
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing"
    ).length;
    const pendingReturns = returns.filter(
      (r) => r.returnStatus === "Requested"
    ).length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Real time-series data computed from actual order/customer dates
    let revenueChart, orderChart, customerChart;
    if (timeframe === "Daily") {
      revenueChart = buildDailyRevenue(orders);
      orderChart = buildOrderCounts(orders, "Daily");
      customerChart = buildCustomerGrowth(customers, "Daily");
    } else if (timeframe === "Weekly") {
      revenueChart = buildWeeklyRevenue(orders);
      orderChart = buildOrderCounts(orders, "Weekly");
      customerChart = buildCustomerGrowth(customers, "Weekly");
    } else if (timeframe === "Yearly") {
      revenueChart = buildYearlyRevenue(orders);
      orderChart = buildOrderCounts(orders, "Yearly");
      customerChart = buildCustomerGrowth(customers, "Yearly");
    } else {
      revenueChart = buildMonthlyRevenue(orders);
      orderChart = buildOrderCounts(orders, "Monthly");
      customerChart = buildCustomerGrowth(customers, "Monthly");
    }

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        pendingReturns,
        avgOrderValue,
        chartLabels: revenueChart.labels,
        revenueChartData: revenueChart.data,
        ordersChartData: orderChart.data,
        customerGrowthData: customerChart.data,
        topProducts: products.slice(0, 5),
        recentOrders: orders.slice(0, 5),
        recentCustomers: customers.slice(0, 5),
      },
    };
  },
};
