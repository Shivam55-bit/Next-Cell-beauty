import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Power, Upload, ShoppingBag } from "lucide-react";

import { apiClient } from "../../services/apiClient";
import { comboService } from "../../services/comboService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./ComboDealsPage.module.css";

const INITIAL_FORM = {
  name: "",
  badge: "Save 35%",
  tag: "Bestseller Bundle",
  originalPrice: 1999,
  bundlePrice: 1299,
  savings: 700,
  image: "",
  description: "",
  items: "Vitamin C Serum (30ml)\nMoisture Day Cream (50g)\nFree Velvet Beauty Pouch",
  status: "Active",
  order: 1
};

export default function ComboDealsPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [activeCombo, setActiveCombo] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [bundleFile, setBundleFile] = useState(null);
  const [bundlePreview, setBundlePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const imageInputRef = useRef(null);

  const loadCombos = async () => {
    setLoading(true);
    const res = await comboService.getAll();
    if (res.data) setCombos(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCombos();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setBundleFile(null);
    setBundlePreview("");
    setUploadError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      ...c,
      items: Array.isArray(c.items) ? c.items.join("\n") : (c.items || "")
    });
    setBundleFile(null);
    setBundlePreview("");
    setUploadError("");
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (c) => {
    await comboService.toggleStatus(c.id, c.status);
    setToast({ message: `Status updated for ${c.name}`, type: "success" });
    loadCombos();
  };

  const handleDeleteConfirm = async () => {
    if (activeCombo) {
      await comboService.delete(activeCombo.id);
      setToast({ message: "Combo deal deleted successfully", type: "success" });
      loadCombos();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPG, JPEG, PNG and WEBP image files are supported.");
      return;
    }
    setBundleFile(file);
    setBundlePreview(URL.createObjectURL(file));
    setUploadError("");
  };

  const handleRemoveImage = () => {
    setBundleFile(null);
    setBundlePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");

    let imageUrl = formData.image;
    const apiBase = apiClient.getApiBaseUrl();
    const authHeaders = apiClient.getAuthHeaders();

    if (!bundleFile && !imageUrl) {
      setUploadError("Please upload a bundle image.");
      return;
    }

    setUploading(true);

    try {
      if (bundleFile) {
        const payload = new FormData();
        payload.append("file", bundleFile);
        const res = await fetch(`${apiBase}/admin/upload`, {
          method: "POST",
          headers: { ...authHeaders },
          body: payload
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setUploadError(errData.message || "Failed to upload bundle image.");
          setUploading(false);
          return;
        }
        const json = await res.json();
        if (json?.data?.url) imageUrl = json.data.url;
      }

      const finalPayload = {
        ...formData,
        image: imageUrl,
        originalPrice: Number(formData.originalPrice),
        bundlePrice: Number(formData.bundlePrice),
        savings: Number(formData.originalPrice) - Number(formData.bundlePrice),
        order: Number(formData.order || 0),
        items: typeof formData.items === "string" ? formData.items.split("\n").map((s) => s.trim()).filter(Boolean) : formData.items
      };

      if (editingId) {
        await comboService.update(editingId, finalPayload);
        setToast({ message: "Combo deal updated successfully", type: "success" });
      } else {
        await comboService.create(finalPayload);
        setToast({ message: "Combo deal created successfully", type: "success" });
      }

      setIsFormOpen(false);
      loadCombos();
    } catch (err) {
      setUploadError("An error occurred while uploading image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) => (
        <img
          src={row.image}
          alt={row.name}
          style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" }}
        />
      )
    },
    {
      key: "name",
      label: "Bundle Name",
      render: (row) => (
        <div>
          <strong style={{ color: "var(--admin-heading)", fontSize: 13 }}>{row.name}</strong>
          <div style={{ fontSize: 11, color: "#64748b" }}>{row.tag} • {row.badge}</div>
        </div>
      )
    },
    {
      key: "prices",
      label: "Bundle Price / Original",
      render: (row) => (
        <div>
          <strong style={{ color: "var(--admin-green)", fontSize: 14 }}>₹{Number(row.bundlePrice).toLocaleString("en-IN")}</strong>
          <span style={{ color: "#94a3b8", textDecoration: "line-through", fontSize: 12, marginLeft: 6 }}>
            ₹{Number(row.originalPrice).toLocaleString("en-IN")}
          </span>
          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>Save ₹{row.savings}</div>
        </div>
      )
    },
    {
      key: "items",
      label: "Included Items",
      render: (row) => (
        <span style={{ fontSize: 12, color: "#475569" }}>
          {Array.isArray(row.items) ? `${row.items.length} items bundled` : "0 items"}
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
            title="Edit Combo"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.dangerIcon}`}
            title="Delete Combo"
            onClick={() => {
              setActiveCombo(row);
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
          <h2>Combo Deals & Bundles Management</h2>
          <p>Upload and manage value beauty kits with special discount pricing on the storefront.</p>
        </div>
        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add New Combo Deal
        </button>
      </div>

      <DataTable
        columns={columns}
        data={combos}
        loading={loading}
        emptyMessage="No combo deals found. Click 'Add New Combo Deal' to upload one."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit Combo Deal" : "Add New Combo Deal"}
      >
        <form onSubmit={handleFormSubmit} className={styles.formGrid}>
          {uploadError && (
            <div className={styles.fullWidth} style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: 8, fontSize: 12, border: "1px solid #fecaca" }}>
              {uploadError}
            </div>
          )}

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Bundle Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Complete Radiant Glow Combo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Badge Text</label>
            <input
              type="text"
              placeholder="e.g. Save 35%"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tag / Subtitle</label>
            <input
              type="text"
              placeholder="e.g. Bestseller Bundle"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Original Total Price (₹) *</label>
            <input
              type="number"
              required
              min={1}
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Combo Offer Price (₹) *</label>
            <input
              type="number"
              required
              min={1}
              value={formData.bundlePrice}
              onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
            />
          </div>

          {/* Bundle Image Upload */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Bundle Image (Upload File) *</label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current && imageInputRef.current.click()}
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
              {bundlePreview || formData.image ? "Change Bundle Image" : "Upload Bundle Image"}
            </button>
            {(bundlePreview || formData.image) && (
              <div style={{ marginTop: "8px", textAlign: "center" }}>
                <img
                  src={bundlePreview || formData.image}
                  alt="Bundle preview"
                  style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--admin-border)" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
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
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Short Description</label>
            <input
              type="text"
              placeholder="e.g. HydraGlow Vitamin C Serum + Rosehip Day Cream"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Bundled Products (1 item per line) *</label>
            <textarea
              rows={4}
              required
              placeholder={"Vitamin C Serum (30ml)\nMoisture Day Cream (50g)\nFree Velvet Pouch"}
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              style={{
                padding: "9px 12px",
                border: "1px solid var(--admin-border)",
                borderRadius: 8,
                fontSize: 13,
                outline: "none"
              }}
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
              {uploading ? "Uploading Image..." : (editingId ? "Save Changes" : "Create Combo Deal")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Combo Deal"
        message={`Are you sure you want to permanently delete "${activeCombo?.name}"?`}
      />
    </div>
  );
}
