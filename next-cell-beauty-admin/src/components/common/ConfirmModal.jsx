import Modal from "./Modal";
import styles from "./Modal.module.css";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = "Confirm Action", message, confirmText = "Delete", isDanger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div style={{ display: "grid", gap: "16px" }}>
        <p style={{ margin: 0, color: "var(--admin-text)", fontSize: "14px", lineHeight: "1.5" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              background: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              color: "var(--admin-heading)"
            }}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              background: isDanger ? "var(--admin-danger)" : "var(--admin-green)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px"
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
