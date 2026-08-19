import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Power, Eye } from "lucide-react";

import { apiClient } from "../../services/apiClient";
import { bannerService } from "../../services/bannerService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./BannersPage.module.css";

const INITIAL_FORM = {
  title: "",
  subtitle: "",
  description: "",
  image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  mobileImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
  buttonText: "Shop Collection",
  buttonUrl: "/shop",
  position: 1,
  startDate: "2026-08-01",
  endDate: "2026-09-30",
  status: "Active"
};

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [activeBanner, setActiveBanner] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [imageError, setImageError] = useState("");

  const loadBanners = async () => {
    setLoading(true);
    const res = await bannerService.getAll();
    if (res.data) setBanners(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setDesktopPreview("");
    setMobilePreview("");
    setDesktopFile(null);
    setMobileFile(null);
    setImageError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingId(b.id);
    setFormData(b);
    setDesktopPreview("");
    setMobilePreview("");
    setDesktopFile(null);
    setMobileFile(null);
    setImageError("");
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (b) => {
    await bannerService.toggleStatus(b.id, b.status);
    setToast({ message: `Banner status updated for ${b.title}`, type: "success" });
    loadBanners();
  };

  const handleDeleteConfirm = async () => {
    if (activeBanner) {
      await bannerService.delete(activeBanner.id);
      setToast({ message: "Banner deleted successfully", type: "success" });
      loadBanners();
    }
  };

  const handleDesktopSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, PNG and WEBP are supported.");
      setDesktopFile(null);
      setDesktopPreview("");
      return;
    }
    setDesktopFile(file);
    setDesktopPreview(URL.createObjectURL(file));
    setImageError("");
  };

  const handleMobileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, PNG and WEBP are supported.");
      setMobileFile(null);
      setMobilePreview("");
      return;
    }
    setMobileFile(file);
    setMobilePreview(URL.createObjectURL(file));
    setImageError("");
  };

  const handleRemoveDesktop = () => {
    setDesktopFile(null);
    setDesktopPreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
    if (desktopInputRef.current) desktopInputRef.current.value = "";
  };

  const handleRemoveMobile = () => {
    setMobileFile(null);
    setMobilePreview("");
    setFormData((prev) => ({ ...prev, mobileImage: "" }));
    if (mobileInputRef.current) mobileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setImageError("");
    let imageUrl = formData.image;
    let mobileImageUrl = formData.mobileImage;
    const apiBase = apiClient.getApiBaseUrl();
    const authHeaders = apiClient.getAuthHeaders();

    if (desktopFile) {
      const payload = new FormData();
      payload.append("file", desktopFile);
      const response = await fetch(`${apiBase}/admin/upload`, {
        method: "POST",
        headers: { ...authHeaders },
        body: payload
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setImageError(errorData.message || "Failed to upload desktop image.");
        return;
      }
      const result = await response.json();
      if (result?.data?.url) imageUrl = result.data.url;
    }

    if (mobileFile) {
      const payload = new FormData();
      payload.append("file", mobileFile);
      const response = await fetch(`${apiBase}/admin/upload`, {
        method: "POST",
        headers: { ...authHeaders },
        body: payload
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setImageError(errorData.message || "Failed to upload mobile image.");
        return;
      }
      const result = await response.json();
      if (result?.data?.url) mobileImageUrl = result.data.url;
    }

    const submitData = { ...formData, desktopImage: imageUrl, mobileImage: mobileImageUrl };

    const result = editingId
      ? await bannerService.update(editingId, submitData)
      : await bannerService.create(submitData);

    if (!result?.success) {
      setImageError(result?.message || "Failed to save banner.");
      return;
    }

    setToast({ message: editingId ? "Banner updated successfully" : "Banner created successfully", type: "success" });
    setIsFormOpen(false);
    loadBanners();
  };

  const columns = [
    {
      label: "Banner Image",
      key: "image",
      render: (row) => (
        <img src={row.image} alt={row.title} style={{ width: "90px", height: "45px", borderRadius: "6px", objectFit: "cover" }} />
      )
    },
    {
      label: "Title & CTA",
      key: "title",
      render: (row) => (
        <div>
          <strong style={{ fontSize: "13px", color: "var(--admin-heading)", display: "block" }}>{row.title}</strong>
          <small style={{ color: "var(--admin-muted)", fontSize: "11px" }}>{row.buttonText} → {row.buttonUrl}</small>
        </div>
      )
    },
    { label: "Order", key: "position", render: (row) => `Pos #${row.position}` },
    { label: "Schedule", key: "startDate", render: (row) => `${row.startDate} to ${row.endDate}` },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Website Banner CMS</h2>
          <p>Manage homepage hero sliders, promotional top banners, and mobile banners</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add Banner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        searchKey="title"
        searchPlaceholder="Search banner title..."
        statusOptions={["Active", "Inactive"]}
        loading={loading}
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
            <button type="button" className={styles.iconBtn} onClick={() => { setActiveBanner(row); setIsPreviewOpen(true); }}>
              <Eye size={15} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => handleOpenEdit(row)}>
              <Edit2 size={15} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => handleToggleStatus(row)}>
              <Power size={15} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => { setActiveBanner(row); setIsDeleteOpen(true); }}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* Add / Edit Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Edit Banner" : "Add New Banner"} maxWidth="680px">
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Banner Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Next Cell Bio-Tech Collection" />
          </div>

          <div className={styles.formGroup}>
            <label>Subtitle / Tagline</label>
            <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Desktop Image</label>
            <input
              ref={desktopInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleDesktopSelect}
            />
            <button
              type="button"
              onClick={() => desktopInputRef.current && desktopInputRef.current.click()}
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
              {desktopPreview || formData.image ? "Change Desktop Image" : "Upload Desktop Image"}
            </button>
            {(desktopPreview || formData.image) && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={desktopPreview || formData.image}
                  alt="Desktop preview"
                  style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveDesktop}
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
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Mobile Image</label>
            <input
              ref={mobileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleMobileSelect}
            />
            <button
              type="button"
              onClick={() => mobileInputRef.current && mobileInputRef.current.click()}
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
              {mobilePreview || formData.mobileImage ? "Change Mobile Image" : "Upload Mobile Image"}
            </button>
            {(mobilePreview || formData.mobileImage) && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={mobilePreview || formData.mobileImage}
                  alt="Mobile preview"
                  style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveMobile}
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
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Button Text</label>
            <input type="text" value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Button Link URL</label>
            <input type="text" value={formData.buttonUrl} onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Display Position #</label>
            <input type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })} />
          </div>

          <div className={styles.formGroup}>
            <label>Start Date</label>
            <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save Banner</button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Live Banner Preview" maxWidth="750px">
        {activeBanner && (
          <div className={styles.bannerPreviewCard}>
            <img src={activeBanner.image} alt={activeBanner.title} style={{ width: "100%", height: "240px", objectFit: "cover", borderRadius: "12px" }} />
            <div style={{ marginTop: "12px" }}>
              <span style={{ color: "var(--admin-green)", fontSize: "11px", fontWeight: 700 }}>{activeBanner.subtitle}</span>
              <h3 style={{ margin: "4px 0" }}>{activeBanner.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--admin-text)" }}>{activeBanner.description}</p>
              <button type="button" style={{ padding: "8px 16px", background: "var(--admin-green)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, fontSize: "12px" }}>
                {activeBanner.buttonText}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Banner"
        message={`Are you sure you want to delete banner "${activeBanner?.title}"?`}
      />
    </div>
  );
}
