import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import BrandLogo from "./common/BrandLogo";
import { useLanguage } from "../context/LanguageContext.jsx";
import styles from "./Footer.module.css";

function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: t("aboutNextCell"), path: "/about" },
    { label: t("contact"), path: "/contact" },
    { label: t("shopByCategoryTitle"), path: "/shop" },
    { label: t("beautyBlog"), path: "/blog" },
    { label: t("faqs"), path: "/faq" },
    { label: t("bestSellers"), path: "/best-sellers" },
    { label: t("newArrivals"), path: "/new-arrivals" },
    { label: t("offers"), path: "/offers" },
  ];

  const categories = [
    { label: t("skincare"), path: "/shop?category=skincare" },
    { label: t("makeup"), path: "/shop?category=makeup" },
    { label: t("haircare"), path: "/shop?category=haircare" },
    { label: t("fragrance"), path: "/shop?category=fragrance" },
    { label: t("bathBody"), path: "/shop?category=bath-body" },
    { label: t("beautyTools"), path: "/shop?category=beauty-tools" },
  ];

  const supportLinks = [
    { label: t("account"), path: "/profile" },
    { label: t("myOrders"), path: "/orders" },
    { label: t("trackOrder"), path: "/track-order" },
    { label: t("reviews"), path: "/my-reviews" },
    { label: t("wishlist"), path: "/wishlist" },
    { label: t("shippingPolicy"), path: "/shipping-policy" },
    { label: t("returnPolicy"), path: "/refund-policy" },
    { label: t("privacyPolicy"), path: "/privacy-policy" },
    { label: t("termsConditions"), path: "/terms-and-conditions" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.topFeatures}>
        <div className="container">
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Truck size={23} />
              </div>

              <div>
                <h3>{t("fastDelivery")}</h3>
                <p>{t("codAvailableTop")}</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={23} />
              </div>

              <div>
                <h3>{t("authentic100")}</h3>
                <p>{t("authentic100Desc")}</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <CreditCard size={23} />
              </div>

              <div>
                <h3>{t("securePayments")}</h3>
                <p>{t("securePaymentsDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainFooter}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.brandColumn}>
              <BrandLogo variant="footer" />

              <p className={styles.brandDescription}>
                {t("aboutFooterText")}
              </p>

              <div className={styles.socialLinks}>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={18} />
                </a>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram size={18} />
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                >
                  <FaYoutube size={18} />
                </a>

                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn size={18} />
                </a>
              </div>
            </div>

            <div className={styles.linkColumn}>
              <h3>{t("quickLinks")}</h3>

              <ul>
                {quickLinks.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path}>
                      <ArrowRight size={14} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h3>{t("shopByCategoryTitle")}</h3>

              <ul>
                {categories.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path}>
                      <ArrowRight size={14} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h3>{t("customerService")}</h3>

              <ul>
                {supportLinks.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path}>
                      <ArrowRight size={14} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.contactColumn}>
              <h3>{t("contact")}</h3>

              <ul className={styles.contactList}>
                <li>
                  <div className={styles.contactIcon}>
                    <MapPin size={18} />
                  </div>
                  <span>Mumbai, Maharashtra, India</span>
                </li>

                <li>
                  <div className={styles.contactIcon}>
                    <Phone size={18} />
                  </div>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </li>

                <li>
                  <div className={styles.contactIcon}>
                    <Mail size={18} />
                  </div>
                  <a href="mailto:support@nextcellbeauty.com">
                    support@nextcellbeauty.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomBarInner}`}>
          <p>
            © {currentYear} NEXT CELL BEAUTY. {t("allRightsReserved")}
          </p>

          <p className={styles.designerCredit}>
            {t("madeWithLove")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;