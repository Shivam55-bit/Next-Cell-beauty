import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Power } from "lucide-react";

import { apiClient } from "../../services/apiClient";
import { categoryService } from "../../services/categoryService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./CategoriesPage.module.css";

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
  parentCategory: "None",
  status: "Active",
  productCount: 0
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const fileInputRef = useRef(null);
  const [imageError, setImageError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    const res = await categoryService.getAll();
    if (res.data) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setImageError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData(cat);
    setSelectedImageFile(null);
    setSelectedImagePreview("");
    setImageError("");
    setIsFormOpen(true);
  };

  const handleOpenDelete = (cat) => {
    setActiveCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (cat) => {
    await categoryService.toggleStatus(cat.id, cat.status);
    setToast({ message: `Updated status for ${cat.name}`, type: "success" });
    loadCategories();
  };

  const handleDeleteConfirm = async () => {
    if (activeCategory) {
      await categoryService.delete(activeCategory.id);
      setToast({ message: "Category deleted successfully", type: "success" });
      loadCategories();
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
    setFormData((prev) => ({ ...prev, image: "" }));
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let imageUrl = formData.image;
    if (selectedImageFile) {
      setImageError("");
      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedImageFile);

      const API_BASE = apiClient.getApiBaseUrl();
      const response = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST",
        headers: { ...apiClient.getAuthHeaders() },
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setImageError(errorData.message || "Failed to upload category image.");
        return;
      }

      const uploadResult = await response.json();
      if (uploadResult?.data?.url) {
        imageUrl = uploadResult.data.url;
      }
    }

    if (editingId) {
      await categoryService.update(editingId, { ...formData, image: imageUrl });
      setToast({ message: "Category updated successfully", type: "success" });
    } else {
      await categoryService.create({
        ...formData,
        image: imageUrl,
        slug: formData.name.toLowerCase().replace(/\s+/g, "-")
      });
      setToast({ message: "Category created successfully", type: "success" });
    }

    setIsFormOpen(false);
    loadCategories();
  };

  const columns = [
    {
      label: "Category",
      key: "name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={row.image}
            alt={row.name}
            style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }}
          />
          <div>
            <strong style={{ color: "var(--admin-heading)", fontSize: "13px" }}>{row.name}</strong>
            <small style={{ display: "block", color: "var(--admin-muted)", fontSize: "11px" }}>/{row.slug}</small>
          </div>
        </div>
      )
    },
    { label: "Description", key: "description" },
    { label: "Parent Category", key: "parentCategory" },
    { label: "Products", key: "productCount", render: (row) => `${row.productCount || 0} items` },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Category Management</h2>
          <p>Organize products into hierarchical skincare and makeup categories</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Search categories..."
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
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Edit Category" : "Add New Category"}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Cleansers"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Parent Category</label>
            <select value={formData.parentCategory} onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}>
              <option value="None">None (Root Category)</option>
              <option value="Skincare">Skincare</option>
              <option value="Makeup">Makeup</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Category Image</label>
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
              {selectedImagePreview || formData.image ? "Change Image" : "Upload Image"}
            </button>
            {(selectedImagePreview || formData.image) && (
              <div style={{ marginTop: "10px", position: "relative" }}>
                <img
                  src={selectedImagePreview || formData.image}
                  alt="Category preview"
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
            <button type="submit" className={styles.saveBtn}>Save Category</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category "${activeCategory?.name}"?`}
      />
    </div>
  );
}
