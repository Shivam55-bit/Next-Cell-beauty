import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Sparkles,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

import beautyOne from "../../assets/instagram/beauty-1.png";
import beautyTwo from "../../assets/instagram/beauty-2.png";
import beautyThree from "../../assets/instagram/beauty-3.png";
import beautyFour from "../../assets/instagram/beauty-4.png";
import beautyFive from "../../assets/instagram/beauty-5.png";
import beautySix from "../../assets/instagram/beauty-6.png";

import { useLanguage } from "../../context/LanguageContext.jsx";
import styles from "./NewsletterSection.module.css";

const galleryImages = [
  {
    id: 1,
    image: beautyOne,
    alt: "Premium skincare products",
  },
  {
    id: 2,
    image: beautyTwo,
    alt: "Beauty makeup collection",
  },
  {
    id: 3,
    image: beautyThree,
    alt: "NEXT CELL BEAUTY cosmetics",
  },
  {
    id: 4,
    image: beautyFour,
    alt: "Daily skincare routine",
  },
  {
    id: 5,
    image: beautyFive,
    alt: "Luxury fragrance collection",
  },
  {
    id: 6,
    image: beautySix,
    alt: "Makeup and beauty essentials",
  },
];

function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus({
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({
        type: "",
        message: "",
      });

      // Later replace this delay with the newsletter API request.
      await new Promise((resolve) => {
        window.setTimeout(resolve, 800);
      });

      setStatus({
        type: "success",
        message: "Thank you! You have joined our beauty community.",
      });

      setEmail("");
    } catch (error) {
      setStatus({
        type: "error",
        message: "Subscription failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.galleryHeader}>
          <div>
            <span className={styles.eyebrow}>Follow Our Beauty Journey</span>

            <h2>
              Beauty Inspiration from
              <span> NEXT CELL BEAUTY</span>
            </h2>
          </div>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className={styles.instagramLink}
          >
            <FaInstagram size={19} />
            Follow on Instagram
            <ArrowRight size={17} />
          </a>
        </div>

        <div className={styles.galleryGrid}>
          {galleryImages.map((item, index) => (
            <a
              key={item.id}
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className={`${styles.galleryItem} ${
                index === 0 || index === 5 ? styles.largeItem : ""
              }`}
              aria-label={`View ${item.alt} on Instagram`}
            >
              <img src={item.image} alt={item.alt} loading="lazy" />

              <div className={styles.galleryOverlay}>
                <FaInstagram size={28} />
                <span>View Post</span>
              </div>
            </a>
          ))}
        </div>

        <div className={styles.newsletterBox}>
          <div className={styles.decorativeShapeOne} />
          <div className={styles.decorativeShapeTwo} />

          <div className={styles.newsletterContent}>
            <div className={styles.iconBox}>
              <Sparkles size={26} />
            </div>

            <span className={styles.newsletterLabel}>
              {t("joinClub")}
            </span>

            <h2>{t("joinClub")}</h2>

            <p>
              {t("newsletterSubtitle")}
            </p>
          </div>

          <div className={styles.formArea}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.inputWrapper}>
                <Mail size={20} />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (status.message) {
                      setStatus({
                        type: "",
                        message: "",
                      });
                    }
                  }}
                  placeholder={t("emailPlaceholder")}
                  aria-label="Email address"
                  autoComplete="email"
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                <span className={styles.submitButtonContent}>
                  <ArrowRight size={18} />
                  <span>{isSubmitting ? t("subscribing") : t("subscribe")}</span>
                </span>
              </button>
            </form>

            {status.message && (
              <div
                className={`${styles.statusMessage} ${
                  status.type === "success"
                    ? styles.successMessage
                    : styles.errorMessage
                }`}
                role="status"
              >
                {status.type === "success" && <CheckCircle2 size={17} />}

                <span>{status.message}</span>
              </div>
            )}

            <p className={styles.privacyText}>
              By subscribing, you agree to receive promotional emails. You can
              unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;