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

import styles from "./Footer.module.css";

const quickLinks = [
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Shop", path: "/shop" },
  { label: "Beauty Blog", path: "/blog" },
  { label: "FAQs", path: "/faq" },
  { label: "Best Sellers", path: "/best-sellers" },
  { label: "New Arrivals", path: "/new-arrivals" },
  { label: "Offers", path: "/offers" },
];

const categories = [
  { label: "Skincare", path: "/shop?category=skincare" },
  { label: "Makeup", path: "/shop?category=makeup" },
  { label: "Haircare", path: "/shop?category=haircare" },
  { label: "Fragrance", path: "/shop?category=fragrance" },
  { label: "Bath & Body", path: "/shop?category=bath-body" },
  { label: "Beauty Tools", path: "/shop?category=beauty-tools" },
];

const supportLinks = [
  { label: "My Account", path: "/profile" },
  { label: "My Orders", path: "/orders" },
  { label: "Track Order", path: "/track-order" },
  { label: "My Reviews", path: "/my-reviews" },
  { label: "Wishlist", path: "/wishlist" },
  { label: "Shipping Policy", path: "/shipping-policy" },
  { label: "Return & Refund Policy", path: "/refund-policy" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms & Conditions", path: "/terms-and-conditions" },
];

function Footer() {
  const currentYear = new Date().getFullYear();

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
                <h3>Fast Delivery</h3>
                <p>Across India</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={23} />
              </div>

              <div>
                <h3>100% Original</h3>
                <p>Authentic Products</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <CreditCard size={23} />
              </div>

              <div>
                <h3>Secure Payment</h3>
                <p>Safe Checkout</p>
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
                NEXT CELL BEAUTY brings premium skincare, makeup, haircare,
                fragrance and beauty essentials together in one trusted online
                destination.
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
              <h3>Quick Links</h3>

              <ul>
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.path}>
                      <ArrowRight size={14} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h3>Beauty Categories</h3>

              <ul>
                {categories.map((item) => (
                  <li key={item.label}>
                    <Link to={item.path}>
                      <ArrowRight size={14} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h3>Customer Support</h3>

              <ul>
                {supportLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.path}>
                      <ArrowRight size={14} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.contactColumn}>
              <h3>Get in Touch</h3>

              <ul className={styles.contactList}>
                <li>
                  <div className={styles.contactIcon}>
                    <MapPin size={18} />
                  </div>

                  <div>
                    <span>Address</span>
                    <p>India</p>
                  </div>
                </li>

                <li>
                  <div className={styles.contactIcon}>
                    <Phone size={18} />
                  </div>

                  <div>
                    <span>Phone</span>
                    <a href="tel:+919999999999">+91 99999 99999</a>
                  </div>
                </li>

                <li>
                  <div className={styles.contactIcon}>
                    <Mail size={18} />
                  </div>

                  <div>
                    <span>Email</span>
                    <a href="mailto:support@nextcellbeauty.com">
                      support@nextcellbeauty.com
                    </a>
                  </div>
                </li>
              </ul>

              <div className={styles.supportNote}>
                <strong>Customer Support</strong>
                <p>Monday–Saturday, 10:00 AM–7:00 PM</p>
              </div>
            </div>
          </div>

          <div className={styles.paymentRow}>
            <div className={styles.paymentText}>
              <ShieldCheck size={18} />

              <span>
                Secure payments powered by trusted payment providers
              </span>
            </div>

            <div className={styles.paymentMethods}>
              <span>UPI</span>
              <span>VISA</span>
              <span>Mastercard</span>
              <span>RuPay</span>
              <span>COD</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomFooter}>
        <div className={`container ${styles.bottomFooterInner}`}>
          <p>
            © {currentYear} NEXT CELL BEAUTY. All Rights Reserved.
          </p>

          <p>
            Designed & Developed by <strong>Web2Export</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;