import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power, Tag } from "lucide-react";

import { couponService } from "../../services/couponService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./CouponsPage.module.css";

const INITIAL_FORM = {
  code: "",
  discountType: "Percentage",
  discountValue: 15,
  minOrderAmount: 1000,
  maxDiscount: 300,
  startDate: "2026-08-01",
  endDate: "2026-09-01",
  usageLimit: 100,
  usedCount: 0,
  perUserLimit: 1,
  applicableCategories: "Skincare",
  applicableProducts: "All Products",
  status: "Active"
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadCoupons = async () => {
    setLoading(true);
    const res = await couponService.getAll();
    if (res.data) setCoupons(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cp) => {
    setEditingId(cp.id);
    setFormData(cp);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (cp) => {
    setActiveCoupon(cp);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (cp) => {
    await couponService.toggleStatus(cp.id, cp.status);
    setToast({ message: `Updated coupon status for ${cp.code}`, type: "success" });
    loadCoupons();
  };

  const handleDeleteConfirm = async () => {
    if (activeCoupon) {
      await couponService.delete(activeCoupon.id);
      setToast({ message: "Coupon deleted successfully", type: "success" });
      loadCoupons();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    if (editingId) {
      await couponService.update(editingId, formData);
      setToast({ message: "Coupon updated successfully", type: "success" });
    } else {
      await couponService.create(formData);
      setToast({ message: "Coupon created successfully", type: "success" });
    }

    setIsFormOpen(false);
    loadCoupons();
  };

  const columns = [
    {
      label: "Code",
      key: "code",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "var(--admin-green)", background: "rgba(0,99,63,0.08)", padding: "4px 10px", borderRadius: "6px" }}>
          {row.code}
        </span>
      )
    },
    {
      label: "Discount",
      key: "discountValue",
      render: (row) => `${row.discountType === "Percentage" ? `${row.discountValue}%` : `₹${row.discountValue}`} Off`
    },
    { label: "Min Order", key: "minOrderAmount", render: (row) => `₹${row.minOrderAmount}` },
    { label: "Validity", key: "endDate", render: (row) => `${row.startDate} to ${row.endDate}` },
    { label: "Usage", key: "usedCount", render: (row) => `${row.usedCount} / ${row.usageLimit}` },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Coupons & Promotional Offers</h2>
          <p>Create percentage & flat discount promo codes for targeted marketing campaigns</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add Coupon
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        searchKey="code"
        searchPlaceholder="Search coupon code..."
        statusOptions={["Active", "Inactive"]}
        loading={loading}
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
            <button type="button" className={styles.iconBtn} onClick={() => handleOpenEdit(row)}>
              <Edit2 size={15} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => handleToggleStatus(row)}>
              <Power size={15} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => handleOpenDelete(row)}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Edit Coupon" : "Create Coupon"}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Coupon Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. BEAUTY200"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Discount Type</label>
            <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}>
              <option value="Percentage">Percentage (%)</option>
              <option value="Fixed amount">Fixed Amount (₹)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Discount Value *</label>
            <input
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Min Order Amount (₹)</label>
            <input
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Max Discount Cap (₹)</label>
            <input
              type="number"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Total Usage Limit</label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save Coupon</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon code "${activeCoupon?.code}"?`}
      />
    </div>
  );
}
