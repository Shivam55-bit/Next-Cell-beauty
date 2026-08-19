import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Power, Globe } from "lucide-react";

import { apiClient } from "../../services/apiClient";
import { brandService } from "../../services/brandService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./BrandsPage.module.css";

const INITIAL_FORM = {
  name: "",
  logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80",
  description: "",
  website: "https://nextcellbeauty.com",
  status: "Active",
  productCount: 0
};

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const fileInputRef = useRef(null);
  const [imageError, setImageError] = useState("");
  const [selectedLogoPreview, setSelectedLogoPreview] = useState("");
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);

  const loadBrands = async () => {
    setLoading(true);
    const res = await brandService.getAll();
    if (res.data) setBrands(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setSelectedLogoFile(null);
    setSelectedLogoPreview("");
    setImageError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingId(brand.id);
    setFormData(brand);
    setSelectedLogoFile(null);
    setSelectedLogoPreview("");
    setImageError("");
    setIsFormOpen(true);
  };

  const handleOpenDelete = (brand) => {
    setActiveBrand(brand);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (brand) => {
    await brandService.toggleStatus(brand.id, brand.status);
    setToast({ message: `Updated status for ${brand.name}`, type: "success" });
    loadBrands();
  };

  const handleDeleteConfirm = async () => {
    if (activeBrand) {
      await brandService.delete(activeBrand.id);
      setToast({ message: "Brand deleted successfully", type: "success" });
      loadBrands();
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, PNG and WEBP files are supported.");
      setSelectedLogoFile(null);
      setSelectedLogoPreview("");
      return;
    }

    setSelectedLogoFile(file);
    setSelectedLogoPreview(URL.createObjectURL(file));
    setImageError("");
  };

  const handleRemoveLogo = () => {
    setSelectedLogoFile(null);
    setSelectedLogoPreview("");
    setFormData((prev) => ({ ...prev, logo: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImageError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let logoUrl = formData.logo;
    if (selectedLogoFile) {
      setImageError("");
      const uploadPayload = new FormData();
      uploadPayload.append("file", selectedLogoFile);

      const API_BASE = apiClient.getApiBaseUrl();
      const response = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST",
        headers: { ...apiClient.getAuthHeaders() },
        body: uploadPayload
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setImageError(errorData.message || "Failed to upload logo image.");
        return;
      }

      const uploadResult = await response.json();
      if (uploadResult?.data?.url) {
        logoUrl = uploadResult.data.url;
      }
    }

    if (editingId) {
      await brandService.update(editingId, { ...formData, logo: logoUrl });
      setToast({ message: "Brand updated successfully", type: "success" });
    } else {
      await brandService.create({ ...formData, logo: logoUrl });
      setToast({ message: "Brand created successfully", type: "success" });
    }

    setIsFormOpen(false);
    loadBrands();
  };

  const columns = [
    {
      label: "Brand",
      key: "name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={row.logo}
            alt={row.name}
            style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }}
          />
          <strong style={{ color: "var(--admin-heading)", fontSize: "13px" }}>{row.name}</strong>
        </div>
      )
    },
    { label: "Description", key: "description" },
    {
      label: "Website",
      key: "website",
      render: (row) => (
        <a href={row.website} target="_blank" rel="noreferrer" style={{ color: "var(--admin-green)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <Globe size={13} />
          {row.website?.replace("https://", "")}
        </a>
      )
    },
    { label: "Products", key: "productCount", render: (row) => `${row.productCount || 0} items` },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Brand Management</h2>
          <p>Manage store partner brands and official manufacturer profiles</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add Brand
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        searchKey="name"
        searchPlaceholder="Search brands..."
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

      {/* Add / Edit Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Edit Brand" : "Add New Brand"}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Brand Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Lumière Cell"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Logo Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleLogoSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                width: "100%",
                border: "1px solid var(--admin-border)",
                borderRadius: "8px",
                background: "#fff",
                color: "var(--admin-heading)",
                padding: "9px 12px",
                textAlign: "left",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              {selectedLogoPreview || formData.logo ? "Change Logo" : "Upload Logo"}
            </button>
            {(selectedLogoPreview || formData.logo) && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={selectedLogoPreview || formData.logo}
                  alt="Logo preview"
                  style={{ width: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "8px" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  style={{
                    marginTop: "8px",
                    border: "1px solid var(--admin-border)",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "var(--admin-heading)",
                    padding: "8px 12px",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Remove Logo
                </button>
              </div>
            )}
            {imageError && <span style={{ color: "var(--admin-danger)", fontSize: "11px" }}>{imageError}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Official Website</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save Brand</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Brand"
        message={`Are you sure you want to delete brand "${activeBrand?.name}"?`}
      />
    </div>
  );
}
