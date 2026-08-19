import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Power, Eye } from "lucide-react";

import { apiClient } from "../../services/apiClient";
import { blogService } from "../../services/blogService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./BlogPage.module.css";

const INITIAL_FORM = {
  title: "",
  slug: "",
  featuredImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  shortDescription: "",
  fullContent: "",
  author: "Dr. Sophia Vance",
  category: "Dermatology",
  tags: "Skincare, Bio-Peptides",
  seoTitle: "",
  seoDescription: "",
  publishDate: "2026-08-05",
  status: "Published"
};

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const fileInputRef = useRef(null);
  const [imageError, setImageError] = useState("");
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    const res = await blogService.getAll();
    if (res.data) setPosts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setImageError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setFormData(p);
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setImageError("");
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (p) => {
    await blogService.toggleStatus(p.id, p.status);
    setToast({ message: `Updated publication status for "${p.title}"`, type: "success" });
    loadPosts();
  };

  const handleDeleteConfirm = async () => {
    if (activePost) {
      await blogService.delete(activePost.id);
      setToast({ message: "Blog post deleted successfully", type: "success" });
      loadPosts();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, PNG and WEBP files are supported.");
      setSelectedImageFile(null);
      setSelectedImagePreview("");
      return;
    }

    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    setImageError("");
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setFormData((prev) => ({ ...prev, featuredImage: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImageError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    let featuredImage = formData.featuredImage;
    if (selectedImageFile) {
      setImageError("");
      try {
        const uploadPayload = new FormData();
        uploadPayload.append("file", selectedImageFile);

        const API_BASE = apiClient.getApiBaseUrl();
        const response = await fetch(`${API_BASE}/admin/upload`, {
          method: "POST",
          headers: { ...apiClient.getAuthHeaders() },
          body: uploadPayload
        });

        if (!response.ok) {
          throw new Error((await response.json().catch(() => ({}))).message || "Failed to upload featured image.");
        }

        const uploadResult = await response.json().catch(() => ({}));
        if (uploadResult?.data?.url) {
          featuredImage = uploadResult.data.url;
        }
      } catch (err) {
        setImageError(err.message || "Failed to upload featured image.");
      }
    }

    const payload = {
      ...formData,
      featuredImage,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    };

    if (editingId) {
      await blogService.update(editingId, payload);
      setToast({ message: "Blog post updated successfully", type: "success" });
    } else {
      await blogService.create(payload);
      setToast({ message: "Blog post published successfully", type: "success" });
    }

    setIsFormOpen(false);
    loadPosts();
  };

  const columns = [
    {
      label: "Article",
      key: "title",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={row.featuredImage} alt={row.title} style={{ width: "50px", height: "35px", borderRadius: "6px", objectFit: "cover" }} />
          <div>
            <strong style={{ fontSize: "13px", color: "var(--admin-heading)", display: "block" }}>{row.title}</strong>
            <small style={{ color: "var(--admin-muted)", fontSize: "11px" }}>By {row.author} • /{row.slug}</small>
          </div>
        </div>
      )
    },
    { label: "Category", key: "category" },
    { label: "Publish Date", key: "publishDate" },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Blog CMS</h2>
          <p>Write dermatological articles, beauty trends, and SEO optimization guides</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Write Post
        </button>
      </div>

      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Search blog posts..."
        statusOptions={["Published", "Draft", "Scheduled"]}
        loading={loading}
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
            <button type="button" className={styles.iconBtn} onClick={() => { setActivePost(row); setIsPreviewOpen(true); }}>
              <Eye size={15} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => handleOpenEdit(row)}>
              <Edit2 size={15} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => handleToggleStatus(row)}>
              <Power size={15} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => { setActivePost(row); setIsDeleteOpen(true); }}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Edit Post" : "Write New Post"} maxWidth="720px">
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Blog Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Author Name</label>
            <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Featured Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleImageSelect}
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
              {selectedImagePreview || formData.featuredImage ? "Change Featured Image" : "Upload Featured Image"}
            </button>
            {(selectedImagePreview || formData.featuredImage) && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={selectedImagePreview || formData.featuredImage}
                  alt="Featured preview"
                  style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
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
            {imageError && <span style={{ color: "var(--admin-danger)", fontSize: "11px" }}>{imageError}</span>}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Short Description</label>
            <textarea rows={2} value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Full Content Body</label>
            <textarea rows={6} value={formData.fullContent} onChange={(e) => setFormData({ ...formData, fullContent: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>SEO Meta Title</label>
            <input type="text" value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>SEO Meta Description</label>
            <input type="text" value={formData.seoDescription} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} />
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Publish Post</button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Article Preview" drawer>
        {activePost && (
          <div style={{ display: "grid", gap: "12px" }}>
            <img src={activePost.featuredImage} alt={activePost.title} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }} />
            <h3>{activePost.title}</h3>
            <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>By {activePost.author} • {activePost.publishDate}</span>
            <p style={{ fontWeight: 600, fontSize: "13px" }}>{activePost.shortDescription}</p>
            <hr />
            <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--admin-text)" }}>{activePost.fullContent}</p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        message={`Are you sure you want to delete article "${activePost?.title}"?`}
      />
    </div>
  );
}
