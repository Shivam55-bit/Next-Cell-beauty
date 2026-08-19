import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power, MoveHorizontal, Sparkles } from "lucide-react";

import { beforeAfterService } from "../../services/beforeAfterService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./BeforeAfterPage.module.css";

const INITIAL_FORM = {
  title: "",
  category: "Skincare Transformation",
  period: "After 2 Weeks of Daily Use",
  beforeImage: "https://images.unsplash.com/photo-1512290900672-1f55b9e075fa?auto=format&fit=crop&w=800&q=80",
  afterImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  beforeLabel: "Before (Dull & Dry)",
  afterLabel: "After (Radiant Glow)",
  status: "Active",
  order: 1
};

export default function BeforeAfterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadData = async () => {
    setLoading(true);
    const res = await beforeAfterService.getAll();
    if (res.data) setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (item) => {
    await beforeAfterService.toggleStatus(item.id, item.status);
    setToast({ message: `Status updated for ${item.title}`, type: "success" });
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (activeItem) {
      await beforeAfterService.delete(activeItem.id);
      setToast({ message: "Before/After item deleted successfully", type: "success" });
      loadData();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      order: Number(formData.order || 0)
    };

    if (editingId) {
      await beforeAfterService.update(editingId, payload);
      setToast({ message: "Before/After item updated successfully", type: "success" });
    } else {
      await beforeAfterService.create(payload);
      setToast({ message: "Before/After item created successfully", type: "success" });
    }

    setIsFormOpen(false);
    loadData();
  };

  const columns = [
    {
      key: "preview",
      label: "Comparison Images",
      render: (row) => (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <img
              src={row.beforeImage}
              alt="Before"
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }}
            />
            <div style={{ fontSize: 9, color: "#64748b" }}>Before</div>
          </div>
          <MoveHorizontal size={14} color="#94a3b8" />
          <div style={{ textAlign: "center" }}>
            <img
              src={row.afterImage}
              alt="After"
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }}
            />
            <div style={{ fontSize: 9, color: "var(--admin-green)", fontWeight: 700 }}>After</div>
          </div>
        </div>
      )
    },
    {
      key: "title",
      label: "Treatment Title & Category",
      render: (row) => (
        <div>
          <strong style={{ color: "var(--admin-heading)", fontSize: 13 }}>{row.title}</strong>
          <div style={{ fontSize: 11, color: "#64748b" }}>{row.category} • {row.period}</div>
        </div>
      )
    },
    {
      key: "labels",
      label: "Labels",
      render: (row) => (
        <span style={{ fontSize: 12, color: "#475569" }}>
          <strong>{row.beforeLabel}</strong> ➔ <strong>{row.afterLabel}</strong>
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className={styles.iconBtn}
            title="Toggle Active/Inactive"
            onClick={() => handleToggleStatus(row)}
          >
            <Power size={14} color={row.status === "Active" ? "var(--admin-green)" : "#94a3b8"} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Edit Item"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.dangerIcon}`}
            title="Delete Item"
            onClick={() => {
              setActiveItem(row);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      )}

      <div className={styles.headerBar}>
        <div>
          <h2>Real Results: Before & After Management</h2>
          <p>Add and edit before/after transformation slides displayed on the storefront comparison slider.</p>
        </div>
        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add Before & After Slide
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="No comparison items found. Click 'Add Before & After Slide' to create one."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit Before & After Comparison" : "Add Before & After Slide"}
      >
        <form onSubmit={handleFormSubmit} className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Treatment / Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. HydraGlow Skin Serum Results"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Category Tab Label</label>
            <input
              type="text"
              placeholder="e.g. Skincare Transformation"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Usage Period / Timeline</label>
            <input
              type="text"
              placeholder="e.g. After 2 Weeks of Daily Use"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Before Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.beforeImage}
              onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>After Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.afterImage}
              onChange={(e) => setFormData({ ...formData, afterImage: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Before Label Badge</label>
            <input
              type="text"
              placeholder="e.g. Before (Dull & Dry)"
              value={formData.beforeLabel}
              onChange={(e) => setFormData({ ...formData, beforeLabel: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>After Label Badge</label>
            <input
              type="text"
              placeholder="e.g. After (Radiant Glow)"
              value={formData.afterLabel}
              onChange={(e) => setFormData({ ...formData, afterLabel: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                padding: "9px 12px",
                border: "1px solid var(--admin-border)",
                borderRadius: 8,
                fontSize: 13,
                outline: "none"
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.formFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              {editingId ? "Save Changes" : "Create Comparison"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Before & After Slide"
        message={`Are you sure you want to permanently delete "${activeItem?.title}"?`}
      />
    </div>
  );
}
