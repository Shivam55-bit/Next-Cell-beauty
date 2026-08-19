import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import ProductsPage from "./pages/products/ProductsPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import BrandsPage from "./pages/brands/BrandsPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ReturnsPage from "./pages/returns/ReturnsPage";
import CouponsPage from "./pages/coupons/CouponsPage";
import CustomersPage from "./pages/customers/CustomersPage";
import ReviewsPage from "./pages/reviews/ReviewsPage";
import TutorialsPage from "./pages/tutorials/TutorialsPage";
import SkinQuizPage from "./pages/skin-quiz/SkinQuizPage";
import ShadeFinderPage from "./pages/shade-finder/ShadeFinderPage";
import BannersPage from "./pages/banners/BannersPage";
import BlogPage from "./pages/blog/BlogPage";
import FaqPage from "./pages/faq/FaqPage";
import PoliciesPage from "./pages/policies/PoliciesPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ComboDealsPage from "./pages/combos/ComboDealsPage";
import BeforeAfterPage from "./pages/before-after/BeforeAfterPage";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="tutorials" element={<TutorialsPage />} />
          <Route path="skin-quiz" element={<SkinQuizPage />} />
          <Route path="shade-finder" element={<ShadeFinderPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="combos" element={<ComboDealsPage />} />
          <Route path="before-after" element={<BeforeAfterPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="policies" element={<PoliciesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;