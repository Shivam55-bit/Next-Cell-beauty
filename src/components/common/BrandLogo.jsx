import { Link } from "react-router-dom";
import logo from "../../assets/next-cell-beauty-logo.png";
import footerLogo from "../../assets/logo/logo-footer.png";
import styles from "./BrandLogo.module.css";

function BrandLogo({
  to = "/",
  variant = "default",
  className = "",
  showText = true,
}) {
  const logoSrc = variant === "footer" ? footerLogo : logo;

  return (
    <Link
      to={to}
      className={`${styles.brandLogo} ${styles[variant] ?? ""} ${className}`.trim()}
      aria-label="NEXT CELL BEAUTY home"
    >
      <span className={styles.logoImageWrapper}>
        <img
          src={logoSrc}
          alt="NEXT CELL BEAUTY"
          className={styles.logoImage}
        />
      </span>

      {showText && (
        <span className={styles.brandText}>
          <strong>NEXT CELL</strong>
          <span>BEAUTY</span>
        </span>
      )}
    </Link>
  );
}

export default BrandLogo;
