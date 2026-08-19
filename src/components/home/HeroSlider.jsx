import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../services/api.js";
import styles from "./HeroSlider.module.css";

function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/banners`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (!mounted) return;
        const apiSlides = Array.isArray(payload.data)
          ? payload.data
              .filter((banner) => banner.status !== "Inactive")
              .map((banner, index) => ({
                id: banner._id || banner.id || index + 1,
                eyebrow: banner.subtitle || "Featured",
                title: banner.title || "",
                highlightedTitle: "",
                description: banner.description || "",
                buttonText: banner.buttonText || "Shop Now",
                buttonLink: banner.buttonUrl || "/shop",
                image: banner.desktopImage || banner.image || "",
                imagePosition: "center",
              }))
              .filter((s) => s.image)
          : [];
        setSlides(apiSlides);
      })
      .catch(() => {
        if (mounted) setSlides([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const goToPrevious = () => {
    setCurrentSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setCurrentSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1,
    );
  };

  useEffect(() => {
    if (isPaused || slides.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setCurrentSlide((current) =>
        current === slides.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, slides.length]);

  // Loading skeleton
  if (loading) {
    return (
      <section className={styles.heroSlider} aria-label="Loading banners">
        <div className={styles.slidesWrapper}>
          <article className={`${styles.slide} ${styles.activeSlide}`}>
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: 420,
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: "4px solid rgba(255,255,255,0.15)",
                  borderTopColor: "#e879a0",
                  borderRadius: "50%",
                  animation: "spin 0.9s linear infinite",
                }}
              />
            </div>
          </article>
        </div>
      </section>
    );
  }

  // Empty state — no banners configured in the database
  if (slides.length === 0) {
    return (
      <section
        className={styles.heroSlider}
        aria-label="No banners available"
        style={{ minHeight: 200 }}
      >
        <div
          style={{
            width: "100%",
            minHeight: 200,
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "rgba(255,255,255,0.5)",
            fontSize: 15,
          }}
        >
          <span style={{ fontSize: 32 }}>🖼️</span>
          <span>No banners configured.</span>
          <Link to="/shop" style={{ color: "#e879a0", fontWeight: 600 }}>
            Shop all products →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.heroSlider}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured beauty offers"
    >
      <div className={styles.slidesWrapper}>
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`${styles.slide} ${
              index === currentSlide ? styles.activeSlide : ""
            }`}
            aria-hidden={index !== currentSlide}
          >
            <img
              src={slide.image}
              alt=""
              className={styles.backgroundImage}
              style={{ objectPosition: slide.imagePosition }}
            />

            <div className={styles.imageOverlay} />

            <div className={`container ${styles.slideContainer}`}>
              <div className={styles.slideContent}>
                <p className={styles.eyebrow}>{slide.eyebrow}</p>

                <h1>
                  {slide.title}
                  <span>{slide.highlightedTitle}</span>
                </h1>

                <p className={styles.description}>{slide.description}</p>

                <div className={styles.actions}>
                  <Link to={slide.buttonLink} className={styles.primaryButton}>
                    {slide.buttonText}
                  </Link>

                  <Link to="/offers" className={styles.secondaryButton}>
                    View Offers
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrowButton} ${styles.previousButton}`}
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            <ChevronLeft size={26} />
          </button>

          <button
            type="button"
            className={`${styles.arrowButton} ${styles.nextButton}`}
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ChevronRight size={26} />
          </button>

          <div className={styles.pagination}>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`${styles.paginationDot} ${
                  index === currentSlide ? styles.activeDot : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Open slide ${index + 1}`}
                aria-current={index === currentSlide ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default HeroSlider;