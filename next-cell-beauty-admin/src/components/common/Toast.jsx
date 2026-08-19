import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import styles from "./Toast.module.css";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toast} ${type === "error" ? styles.error : styles.success}`}>
      {type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span>{message}</span>
      <button type="button" className={styles.close} onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
