import { useState, useRef, useCallback } from "react";
import { Sparkles, MoveHorizontal } from "lucide-react";
import styles from "./BeforeAfterSlider.module.css";

const defaultComparisons = [
  {
    id: 1,
    title: "HydraGlow Skin Serum Results",
    category: "Skincare Transformation",
    period: "After 2 Weeks of Daily Use",
    beforeImage: "https://images.unsplash.com/photo-1512290900672-1f55b9e075fa?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    beforeLabel: "Before (Dull & Dry)",
    afterLabel: "After (Radiant Glow)"
  },
  {
    id: 2,
    title: "Velvet Matte Poreless Foundation",
    category: "Makeup Perfection",
    period: "Instant Application Result",
    beforeImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    beforeLabel: "Bare Skin",
    afterLabel: "Flawless Finish"
  }
];

export default function BeforeAfterSlider({ comparisons = defaultComparisons }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const activeData = comparisons[activeIndex] || comparisons[0];

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

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
                key={item.id}
                type="button"
                className={`${styles.tabBtn} ${activeIndex === idx ? styles.activeTab : ""}`}
                onClick={() => {
                  setActiveIndex(idx);
                  setSliderPosition(50);
                }}
              >
                {item.category}
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
              alt={activeData.afterLabel}
              className={styles.imageLayer}
            />
            <span className={styles.afterBadge}>{activeData.afterLabel}</span>

            {/* Before Image (Clipped Layer) */}
            <div
              className={styles.clippedLayer}
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img
                src={activeData.beforeImage}
                alt={activeData.beforeLabel}
                className={styles.imageLayer}
              />
              <span className={styles.beforeBadge}>{activeData.beforeLabel}</span>
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
