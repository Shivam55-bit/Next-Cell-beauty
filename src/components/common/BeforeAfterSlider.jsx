import { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, MoveHorizontal } from "lucide-react";
import api from "../../services/api.js";
import styles from "./BeforeAfterSlider.module.css";

export default function BeforeAfterSlider({ comparisons: initialComparisons }) {
  const [comparisons, setComparisons] = useState(initialComparisons || []);
  const [loading, setLoading] = useState(!initialComparisons);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBeforeAfter = async () => {
      try {
        const res = await api.get("/before-after");
        const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        const activeList = list.filter((item) => (item.status === "Active" || item.status === "ACTIVE") && item.beforeImage && item.afterImage);
        if (mounted) {
          setComparisons(activeList);
        }
      } catch (err) {
        if (mounted) setComparisons([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!initialComparisons) {
      loadBeforeAfter();
    } else {
      setLoading(false);
    }

    return () => { mounted = false; };
  }, [initialComparisons]);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  };

  // If loading or no active comparisons in database, do not render section
  if (loading || comparisons.length === 0) {
    return null;
  }

  const activeData = comparisons[activeIndex] || comparisons[0];
  if (!activeData || !activeData.beforeImage || !activeData.afterImage) {
    return null;
  }

  return (
    <section className={styles.sectionWrapper}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={16} />
            <span>Proven Efficacy</span>
          </div>
          <h2>Real Results: Before & After</h2>
          <p>See the visible transformation with Next Cell Beauty formulas. Slide to compare.</p>
        </div>

        {comparisons.length > 1 && (
          <div className={styles.tabButtons}>
            {comparisons.map((item, idx) => (
              <button
                key={item.id || item._id || idx}
                type="button"
                className={`${styles.tabBtn} ${activeIndex === idx ? styles.activeTab : ""}`}
                onClick={() => {
                  setActiveIndex(idx);
                  setSliderPosition(50);
                }}
              >
                {item.category || item.title}
              </button>
            ))}
          </div>
        )}

        <div className={styles.sliderCard}>
          <div
            ref={containerRef}
            className={styles.comparisonContainer}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (Background) */}
            <img
              src={activeData.afterImage}
              alt={activeData.afterLabel || "After"}
              className={styles.imageLayer}
            />
            <span className={styles.afterBadge}>{activeData.afterLabel || "After"}</span>

            {/* Before Image (Clipped Layer) */}
            <div
              className={styles.clippedLayer}
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img
                src={activeData.beforeImage}
                alt={activeData.beforeLabel || "Before"}
                className={styles.imageLayer}
              />
              <span className={styles.beforeBadge}>{activeData.beforeLabel || "Before"}</span>
            </div>

            {/* Slider Handle */}
            <div
              className={styles.handleLine}
              style={{ left: `${sliderPosition}%` }}
            >
              <div className={styles.handleKnob}>
                <MoveHorizontal size={18} />
              </div>
            </div>
          </div>

          <div className={styles.detailsFooter}>
            <div>
              <h3>{activeData.title}</h3>
              <p>{activeData.period}</p>
            </div>
            <span className={styles.instruction}>Drag slider left or right</span>
          </div>
        </div>
      </div>
    </section>
  );
}
