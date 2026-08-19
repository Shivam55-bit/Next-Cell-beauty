import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, DollarSign, Eye, MessageSquare } from "lucide-react";

import { returnService } from "../../services/returnService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";

import styles from "./ReturnsPage.module.css";

const RETURN_STATUSES = ["Requested", "Approved", "Rejected", "Picked Up", "Received", "Refunded"];

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadReturns = async () => {
    setLoading(true);
    const res = await returnService.getAll();
    if (res.data) setReturns(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleOpenView = (item) => {
    setSelectedReturn(item);
    setAdminNote(item.adminNote || "");
    setIsModalOpen(true);
  };

  const handleAction = async (newReturnStatus, newRefundStatus) => {
    if (!selectedReturn) return;

    await returnService.updateStatus(selectedReturn.id, newReturnStatus, newRefundStatus, adminNote);
    setToast({ message: `Return #${selectedReturn.id} updated to ${newReturnStatus}`, type: "success" });
    setIsModalOpen(false);
    loadReturns();
  };

  const columns = [
    { label: "Return ID", key: "id", render: (row) => <strong>{row.id}</strong> },
    { label: "Order ID", key: "orderId" },
    {
      label: "Customer",
      key: "customerName",
      render: (row) => (
        <div>
          <strong>{row.customerName}</strong>
          <small style={{ display: "block", color: "var(--admin-muted)" }}>{row.customerEmail}</small>
        </div>
      )
    },
    { label: "Product", key: "productName" },
    { label: "Reason", key: "reason" },
    { label: "Amount", key: "amount", render: (row) => <strong style={{ color: "var(--admin-green)" }}>₹{row.amount}</strong> },
    { label: "Return Status", key: "returnStatus", render: (row) => <StatusBadge status={row.returnStatus} /> },
    { label: "Refund Status", key: "refundStatus", render: (row) => <StatusBadge status={row.refundStatus} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Returns & Refunds Management</h2>
          <p>Review customer return claims, approve replacements, and trigger refunds</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={returns}
        searchKey="customerName"
        searchPlaceholder="Search by return ID or customer..."
        statusFilterKey="returnStatus"
        statusOptions={RETURN_STATUSES}
        loading={loading}
        actions={(row) => (
          <button type="button" className={styles.viewBtn} onClick={() => handleOpenView(row)}>
            <Eye size={15} />
            Manage Claim
          </button>
        )}
      />

      {/* Return Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Return Request #${selectedReturn?.id}`}>
        {selectedReturn && (
          <div className={styles.modalContent}>
            <div className={styles.infoCard}>
              <p><strong>Order ID:</strong> {selectedReturn.orderId}</p>
              <p><strong>Customer:</strong> {selectedReturn.customerName} ({selectedReturn.customerEmail})</p>
              <p><strong>Product:</strong> {selectedReturn.productName}</p>
              <p><strong>Reason:</strong> {selectedReturn.reason}</p>
              <p><strong>Claim Amount:</strong> ₹{selectedReturn.amount}</p>
              <p><strong>Current Status:</strong> {selectedReturn.returnStatus}</p>
            </div>

            <div className={styles.formGroup}>
              <label>Admin Note / Internal Logs</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter notes on verification, packaging photos, or refund approval..."
              />
            </div>

            <div className={styles.actionsBar}>
              <button
                type="button"
                className={styles.approveBtn}
                onClick={() => handleAction("Approved", "Pending")}
              >
                <CheckCircle2 size={15} /> Approve Claim
              </button>

              <button
                type="button"
                className={styles.refundBtn}
                onClick={() => handleAction("Received", "Refunded")}
              >
                <DollarSign size={15} /> Process Refund
              </button>

              <button
                type="button"
                className={styles.rejectBtn}
                onClick={() => handleAction("Rejected", "Rejected")}
              >
                <XCircle size={15} /> Reject Claim
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
