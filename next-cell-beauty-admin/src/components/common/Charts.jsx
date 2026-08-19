import styles from "./Charts.module.css";

export function AreaChart({ labels = [], data = [], height = 220, color = "#00633f" }) {
  if (!data || data.length === 0) return <div className={styles.emptyChart}>No data available</div>;

  const maxVal = Math.max(...data, 1);
  const minVal = 0;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1 || 1)) * 100;
    const y = 100 - ((val - minVal) / (maxVal - minVal)) * 80 - 10;
    return `${x},${y}`;
  });

  const pathD = `M 0,100 L ${points.join(" L ")} L 100,100 Z`;
  const lineD = `M ${points.join(" L ")}`;

  return (
    <div className={styles.chartContainer} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.svg}>
        <defs>
          <linearGradient id={`grad_${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={pathD} fill={`url(#grad_${color.replace("#", "")})`} />
        <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className={styles.labelsRow}>
        {labels.map((lbl, idx) => (
          <span key={lbl + idx} className={styles.labelItem}>
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ labels = [], data = [], height = 220, color = "#061936" }) {
  if (!data || data.length === 0) return <div className={styles.emptyChart}>No data available</div>;

  const maxVal = Math.max(...data, 1);

  return (
    <div className={styles.chartContainer} style={{ height }}>
      <div className={styles.barGrid}>
        {data.map((val, idx) => {
          const heightPercent = Math.max((val / maxVal) * 85, 4);
          return (
            <div key={idx} className={styles.barCol}>
              <div
                className={styles.bar}
                style={{ height: `${heightPercent}%`, backgroundColor: color }}
                title={`${labels[idx] || ""}: ${val}`}
              />
              <span className={styles.labelItem}>{labels[idx]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
