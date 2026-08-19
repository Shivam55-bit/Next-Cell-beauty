import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const ApiDocsPage = lazy(() => import('./pages/ApiDocsPage.jsx'))
const BestSellersPage = lazy(() => import('./pages/BestSellersPage.jsx'))
const BrandsPage = lazy(() => import('./pages/BrandsPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const CmsPage = lazy(() => import('./pages/CmsPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage.jsx'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const OrdersPage = lazy(() => import('./pages/OrdersPage.jsx'))
const MyOrdersPage = lazy(() => import('./pages/account/MyOrders.jsx'))
const OrderDetailsPage = lazy(() => import('./pages/account/OrderDetails.jsx'))
const MyAddressesPage = lazy(() => import('./pages/account/MyAddresses.jsx'))
const MyInvoicesPage = lazy(() => import('./pages/account/MyInvoices.jsx'))
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'))
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'))
const SkinQuizPage = lazy(() => import('./pages/SkinQuizPage.jsx'))
const ShadeFinderPage = lazy(() => import('./pages/ShadeFinderPage.jsx'))
const BeautyTutorialsPage = lazy(() => import('./pages/BeautyTutorialsPage.jsx'))
const BeautyTutorialDetailPage = lazy(() => import('./pages/BeautyTutorialDetailPage.jsx'))
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage.jsx'))
const FaqPage = lazy(() => import('./pages/FaqPage.jsx'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'))
const GoogleAuthCallback = lazy(() => import('./pages/GoogleAuthCallback.jsx'))
const OffersPage = lazy(() => import('./pages/OffersPage.jsx'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'))
const MyReviewsPage = lazy(() => import('./pages/MyReviewsPage.jsx'))
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage.jsx'))
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage.jsx'))
const ReturnRefundRequestPage = lazy(() => import('./pages/ReturnRefundRequestPage.jsx'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx'))
const MyQuizResultsPage = lazy(() => import('./pages/MyQuizResultsPage.jsx'))

const pageMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.35, ease: 'easeIn' } },
}

function App() {
  const location = useLocation()
  const hideHeaderFooter =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/auth/callback'

  return (
    <AuthProvider>
      <AppLayout hideHeaderFooter={hideHeaderFooter}>
        <AnimatePresence mode="wait">
          <motion.section
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageMotion}
            className="relative"
          >
            <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center px-4 pt-28 text-sm font-semibold text-slate-500">Loading...</div>}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/skin-quiz" element={<SkinQuizPage />} />
                <Route path="/shade-finder" element={<ShadeFinderPage />} />
                <Route path="/beauty-tutorials" element={<BeautyTutorialsPage />} />
                <Route path="/beauty-tutorials/:slug" element={<BeautyTutorialDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/my-reviews" element={<MyReviewsPage />} />
                <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                <Route path="/track-order" element={<OrderTrackingPage />} />
                <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
                <Route path="/return-request/:orderId" element={<ReturnRefundRequestPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<GoogleAuthCallback />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/account/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
                <Route path="/account/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                <Route path="/account/addresses" element={<ProtectedRoute><MyAddressesPage /></ProtectedRoute>} />
                <Route path="/account/invoices" element={<ProtectedRoute><MyInvoicesPage /></ProtectedRoute>} />
                <Route path="/account/skin-quiz" element={<ProtectedRoute><MyQuizResultsPage /></ProtectedRoute>} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/success" element={<OrderSuccessPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/best-sellers" element={<BestSellersPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/api-docs" element={<ApiDocsPage />} />
                <Route path="/:slug" element={<CmsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </motion.section>
        </AnimatePresence>
      </AppLayout>
    </AuthProvider>
  )
}

export default App
