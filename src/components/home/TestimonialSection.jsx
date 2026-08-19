import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  BadgeCheck,
} from "lucide-react";
import { API_BASE_URL } from "../../services/api.js";
import styles from "./TestimonialSection.module.css";

function getCardsPerView() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth <= 767) return 1;
  if (window.innerWidth <= 1199) return 2;
  return 3;
}

function ReviewSkeleton() {
  return (
    <article
      className={styles.reviewCard}
      aria-hidden="true"
      style={{ opacity: 0.5 }}
    >
      <div
        style={{
          height: 14,
          width: "60%",
          background: "#334155",
          borderRadius: 6,
          marginBottom: 16,
        }}
      />
      <div
        style={{
          height: 12,
          width: "90%",
          background: "#334155",
          borderRadius: 6,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          height: 12,
          width: "70%",
          background: "#334155",
          borderRadius: 6,
          marginBottom: 20,
        }}
      />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#334155",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              height: 14,
              width: 100,
              background: "#334155",
              borderRadius: 6,
              marginBottom: 6,
            }}
          />
          <div
            style={{
              height: 11,
              width: 70,
              background: "#334155",
              borderRadius: 6,
            }}
          />
        </div>
      </div>
    </article>
  );
}

function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/reviews`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (!mounted) return;
        const items = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];

        // Only show Approved reviews
        const approved = items.filter(
          (r) =>
            !r.status ||
            String(r.status).toLowerCase() === "approved"
        );

        setTestimonials(approved);
      })
      .catch(() => {
        if (mounted) setTestimonials([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.ceil(testimonials.length / cardsPerView);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
      setCurrentIndex(0);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isPaused || totalPages <= 1) return undefined;
    const interval = window.setInterval(() => {
      setCurrentIndex((current) =>
        current >= totalPages - 1 ? 0 : current + 1
      );
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isPaused, totalPages]);

  const handlePrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? totalPages - 1 : current - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((current) =>
      current >= totalPages - 1 ? 0 : current + 1
    );
  };

  // Loading state — skeletons
  if (loading) {
    return (
      <section className={styles.section} aria-labelledby="testimonial-heading">
        <div className={styles.backgroundShapeOne} />
        <div className={styles.backgroundShapeTwo} />
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.headingContent}>
              <span className={styles.eyebrow}>Real Experiences, Real Beauty</span>
              <h2 id="testimonial-heading">
                Loved by Our <span>Customers</span>
              </h2>
            </div>
          </div>
          <div
            className={styles.sliderViewport}
            style={{ overflow: "hidden" }}
          >
            <div
              className={styles.slidePage}
              style={{
                gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
                display: "grid",
                gap: 20,
              }}
            >
              {Array.from({ length: cardsPerView }).map((_, i) => (
                <ReviewSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state — no approved reviews yet
  if (testimonials.length === 0) {
    return null; // Section is hidden when no reviews exist — clean UX
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="testimonial-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.backgroundShapeOne} />
      <div className={styles.backgroundShapeTwo} />

      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>Real Experiences, Real Beauty</span>
            <h2 id="testimonial-heading">
              Loved by Our <span>Customers</span>
            </h2>
            <p>
              See why beauty lovers trust NEXT CELL BEAUTY for premium products,
              personalised recommendations and a seamless shopping experience.
            </p>
          </div>

          {totalPages > 1 && (
            <div className={styles.headerControls}>
              <button
                type="button"
                onClick={handlePrevious}
                aria-label="Previous customer reviews"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next customer reviews"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.sliderViewport}>
          <div
            className={styles.sliderTrack}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const pageReviews = testimonials.slice(
                pageIndex * cardsPerView,
                pageIndex * cardsPerView + cardsPerView
              );

              return (
                <div
                  key={pageIndex}
                  className={styles.slidePage}
                  style={{
                    gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
                  }}
                >
                  {pageReviews.map((testimonial) => {
                    const name =
                      testimonial.customerName ||
                      testimonial.name ||
                      "Customer";
                    const initials = name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();

                    return (
                      <article
                        key={testimonial.id || testimonial._id}
                        className={styles.reviewCard}
                      >
                        <div className={styles.quoteIcon}>
                          <Quote size={25} fill="currentColor" />
                        </div>

                        <div className={styles.rating}>
                          {Array.from({ length: Number(testimonial.rating) || 5 }).map(
                            (_, index) => (
                              <Star key={index} size={16} fill="currentColor" />
                            )
                          )}
                        </div>

                        <p className={styles.reviewText}>
                          "{testimonial.comment || testimonial.review || ""}"
                        </p>

                        {(testimonial.productName || testimonial.product) && (
                          <div className={styles.productPurchased}>
                            Purchased:{" "}
                            <strong>
                              {testimonial.productName || testimonial.product}
                            </strong>
                          </div>
                        )}

                        <div className={styles.customerFooter}>
                          <div className={styles.avatar}>{initials}</div>
                          <div className={styles.customerInfo}>
                            <h3>{name}</h3>
                            {testimonial.location && (
                              <span>{testimonial.location}</span>
                            )}
                          </div>
                          <div className={styles.verified}>
                            <BadgeCheck size={17} />
                            <span>Verified</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.paginationDot} ${
                  currentIndex === index ? styles.activeDot : ""
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Open customer review group ${index + 1}`}
                aria-current={currentIndex === index ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialSection;