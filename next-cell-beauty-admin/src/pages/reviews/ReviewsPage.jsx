import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Trash2, Star, Eye } from "lucide-react";

import { reviewService } from "../../services/reviewService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./ReviewsPage.module.css";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReview, setSelectedReview] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadReviews = async () => {
    setLoading(true);
    const res = await reviewService.getAll();
    if (res.data) setReviews(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    await reviewService.updateStatus(id, status);
    setToast({ message: `Review ${status.toLowerCase()} successfully`, type: "success" });
    if (isViewOpen) setIsViewOpen(false);
    loadReviews();
  };

  const handleDeleteConfirm = async () => {
    if (selectedReview) {
      await reviewService.delete(selectedReview.id);
      setToast({ message: "Review deleted successfully", type: "success" });
      loadReviews();
    }
  };

  const columns = [
    {
      label: "Customer",
      key: "customerName",
      render: (row) => <strong style={{ color: "var(--admin-heading)" }}>{row.customerName}</strong>
    },
    { label: "Product", key: "productName" },
    {
      label: "Rating",
      key: "rating",
      render: (row) => (
        <span style={{ color: "#d97706", fontWeight: 700 }}>
          {"★".repeat(row.rating)} ({row.rating}/5)
        </span>
      )
    },
    { label: "Review Comment", key: "comment", render: (row) => row.comment?.slice(0, 50) + "..." },
    { label: "Date", key: "date" },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Review Moderation</h2>
          <p>Approve or reject customer product ratings, feedback, and uploaded photos</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        searchKey="customerName"
        searchPlaceholder="Search reviews by customer or product..."
        statusFilterKey="status"
        statusOptions={["Pending", "Approved", "Rejected"]}
        loading={loading}
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
            <button type="button" className={styles.iconBtn} title="View Details" onClick={() => { setSelectedReview(row); setIsViewOpen(true); }}>
              <Eye size={15} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.successIcon}`} title="Approve" onClick={() => handleUpdateStatus(row.id, "Approved")}>
              <CheckCircle2 size={15} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} title="Reject" onClick={() => handleUpdateStatus(row.id, "Rejected")}>
              <XCircle size={15} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} title="Delete" onClick={() => { setSelectedReview(row); setIsDeleteOpen(true); }}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* View Review Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Review Details">
        {selectedReview && (
          <div className={styles.reviewCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{selectedReview.customerName}</strong>
              <StatusBadge status={selectedReview.status} />
            </div>
            <p><strong>Product:</strong> {selectedReview.productName}</p>
            <p style={{ color: "#d97706", fontWeight: 700, fontSize: "16px" }}>
              {"★".repeat(selectedReview.rating)} ({selectedReview.rating}/5)
            </p>
            <p style={{ fontSize: "14px", fontStyle: "italic", background: "#fafcfb", padding: "12px", borderRadius: "8px" }}>
              "{selectedReview.comment}"
            </p>
            {selectedReview.image && (
              <img src={selectedReview.image} alt="Review attachment" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }} />
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button type="button" className={styles.approveBtn} onClick={() => handleUpdateStatus(selectedReview.id, "Approved")}>
                Approve Review
              </button>
              <button type="button" className={styles.rejectBtn} onClick={() => handleUpdateStatus(selectedReview.id, "Rejected")}>
                Reject Review
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message="Are you sure you want to delete this customer review permanently?"
      />
    </div>
  );
}
