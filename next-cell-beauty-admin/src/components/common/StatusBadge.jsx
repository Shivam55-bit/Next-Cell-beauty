import styles from "./StatusBadge.module.css";

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let variantClass = styles.default;
  if (
    normalized === "active" ||
    normalized === "delivered" ||
    normalized === "approved" ||
    normalized === "published" ||
    normalized === "paid" ||
    normalized === "refunded"
  ) {
    variantClass = styles.success;
  } else if (
    normalized === "pending" ||
    normalized === "processing" ||
    normalized === "requested" ||
    normalized === "in transit" ||
    normalized === "scheduled" ||
    normalized === "draft"
  ) {
    variantClass = styles.warning;
  } else if (
    normalized === "inactive" ||
    normalized === "disabled" ||
    normalized === "rejected" ||
    normalized === "cancelled"
  ) {
    variantClass = styles.danger;
  }

  return (
    <span className={`${styles.badge} ${variantClass}`}>
      <span className={styles.dot} />
      {status}
    </span>
  );
}
