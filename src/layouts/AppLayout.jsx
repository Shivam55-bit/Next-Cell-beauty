import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import WhatsAppFab from "../components/WhatsAppFab.jsx";
import BackToTop from "../components/BackToTop.jsx";

function AppLayout({ children, hideHeaderFooter = false }) {
  const darkMode = useSelector((state) => state.ui.darkMode);
  const { pathname } = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface text-slate-900 selection:bg-brand-100 selection:text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {!hideHeaderFooter && <Navbar />}

      <main className="w-full">{children}</main>

      {!hideHeaderFooter && <Footer />}

      <CartDrawer />
      <WhatsAppFab />
      <BackToTop />
    </div>
  );
}

export default AppLayout;