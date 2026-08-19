import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Power, MoveHorizontal, Upload, X, Image as ImageIcon } from "lucide-react";

import { apiClient } from "../../services/apiClient";
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
  beforeImage: "",
  afterImage: "",
  beforeLabel: "Before",
  afterLabel: "After",
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

  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

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
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview("");
    setAfterPreview("");
    setUploadError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview("");
    setAfterPreview("");
    setUploadError("");
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

  const handleBeforeSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPG, JPEG, PNG and WEBP image files are supported.");
      return;
    }
    setBeforeFile(file);
    setBeforePreview(URL.createObjectURL(file));
    setUploadError("");
  };

  const handleAfterSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPG, JPEG, PNG and WEBP image files are supported.");
      return;
    }
    setAfterFile(file);
    setAfterPreview(URL.createObjectURL(file));
    setUploadError("");
  };

  const handleRemoveBefore = () => {
    setBeforeFile(null);
    setBeforePreview("");
    setFormData((prev) => ({ ...prev, beforeImage: "" }));
    if (beforeInputRef.current) beforeInputRef.current.value = "";
  };

  const handleRemoveAfter = () => {
    setAfterFile(null);
    setAfterPreview("");
    setFormData((prev) => ({ ...prev, afterImage: "" }));
    if (afterInputRef.current) afterInputRef.current.value = "";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");

    let beforeImageUrl = formData.beforeImage;
    let afterImageUrl = formData.afterImage;
    const apiBase = apiClient.getApiBaseUrl();
    const authHeaders = apiClient.getAuthHeaders();

    if (!beforeFile && !beforeImageUrl) {
      setUploadError("Please upload a 'Before' image.");
      return;
    }
    if (!afterFile && !afterImageUrl) {
      setUploadError("Please upload an 'After' image.");
      return;
    }

    setUploading(true);

    try {
      if (beforeFile) {
        const payload = new FormData();
        payload.append("file", beforeFile);
        const res = await fetch(`${apiBase}/admin/upload`, {
          method: "POST",
          headers: { ...authHeaders },
          body: payload
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setUploadError(errData.message || "Failed to upload 'Before' image.");
          setUploading(false);
          return;
        }
        const json = await res.json();
        if (json?.data?.url) beforeImageUrl = json.data.url;
      }

      if (afterFile) {
        const payload = new FormData();
        payload.append("file", afterFile);
        const res = await fetch(`${apiBase}/admin/upload`, {
          method: "POST",
          headers: { ...authHeaders },
          body: payload
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setUploadError(errData.message || "Failed to upload 'After' image.");
          setUploading(false);
          return;
        }
        const json = await res.json();
        if (json?.data?.url) afterImageUrl = json.data.url;
      }

      const finalPayload = {
        ...formData,
        beforeImage: beforeImageUrl,
        afterImage: afterImageUrl,
        order: Number(formData.order || 0)
      };

      if (editingId) {
        await beforeAfterService.update(editingId, finalPayload);
        setToast({ message: "Before & After comparison updated successfully", type: "success" });
      } else {
        await beforeAfterService.create(finalPayload);
        setToast({ message: "Before & After comparison created successfully", type: "success" });
      }

      setIsFormOpen(false);
      loadData();
    } catch (err) {
      setUploadError("An error occurred while uploading. Please try again.");
    } finally {
      setUploading(false);
    }
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
              style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }}
            />
            <div style={{ fontSize: 9, color: "#64748b" }}>{row.beforeLabel || "Before"}</div>
          </div>
          <MoveHorizontal size={14} color="#94a3b8" />
          <div style={{ textAlign: "center" }}>
            <img
              src={row.afterImage}
              alt="After"
              style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }}
            />
            <div style={{ fontSize: 9, color: "var(--admin-green)", fontWeight: 700 }}>{row.afterLabel || "After"}</div>
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
          <p>Upload and manage before/after transformation slides displayed on the storefront slider.</p>
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
        emptyMessage="No comparison items found. Click 'Add Before & After Slide' to upload one."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit Before & After Comparison" : "Add Before & After Slide"}
      >
        <form onSubmit={handleFormSubmit} className={styles.formGrid}>
          {uploadError && (
            <div className={styles.fullWidth} style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: 8, fontSize: 12, border: "1px solid #fecaca" }}>
              {uploadError}
            </div>
          )}

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

          {/* Before Image Upload */}
          <div className={styles.formGroup}>
            <label>Before Image (Upload File) *</label>
            <input
              ref={beforeInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleBeforeSelect}
            />
            <button
              type="button"
              onClick={() => beforeInputRef.current && beforeInputRef.current.click()}
              style={{
                width: "100%",
                border: "1px dashed var(--admin-border)",
                borderRadius: "8px",
                background: "#f8fafc",
                color: "var(--admin-heading)",
                padding: "12px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Upload size={16} />
              {beforePreview || formData.beforeImage ? "Change Before Image" : "Upload Before Image"}
            </button>
            {(beforePreview || formData.beforeImage) && (
              <div style={{ marginTop: "8px", position: "relative", textAlign: "center" }}>
                <img
                  src={beforePreview || formData.beforeImage}
                  alt="Before preview"
                  style={{ width: "100%", maxHeight: "140px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--admin-border)" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveBefore}
                  style={{
                    marginTop: "4px",
                    border: "1px solid var(--admin-border)",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "var(--admin-danger)",
                    padding: "4px 8px",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  Remove Before Image
                </button>
              </div>
            )}
          </div>

          {/* After Image Upload */}
          <div className={styles.formGroup}>
            <label>After Image (Upload File) *</label>
            <input
              ref={afterInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleAfterSelect}
            />
            <button
              type="button"
              onClick={() => afterInputRef.current && afterInputRef.current.click()}
              style={{
                width: "100%",
                border: "1px dashed var(--admin-border)",
                borderRadius: "8px",
                background: "#f8fafc",
                color: "var(--admin-heading)",
                padding: "12px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Upload size={16} />
              {afterPreview || formData.afterImage ? "Change After Image" : "Upload After Image"}
            </button>
            {(afterPreview || formData.afterImage) && (
              <div style={{ marginTop: "8px", position: "relative", textAlign: "center" }}>
                <img
                  src={afterPreview || formData.afterImage}
                  alt="After preview"
                  style={{ width: "100%", maxHeight: "140px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--admin-border)" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveAfter}
                  style={{
                    marginTop: "4px",
                    border: "1px solid var(--admin-border)",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "var(--admin-danger)",
                    padding: "4px 8px",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  Remove After Image
                </button>
              </div>
            )}
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
              disabled={uploading}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={uploading}>
              {uploading ? "Uploading Images..." : (editingId ? "Save Changes" : "Create Comparison")}
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
