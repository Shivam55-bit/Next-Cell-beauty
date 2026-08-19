import { useEffect, useState, useRef } from "react";
import { Plus, Eye, Edit2, Trash2, Copy, Power, Image as ImageIcon } from "lucide-react";

import { productService } from "../../services/productService";
import { apiClient } from "../../services/apiClient";
import { categoryService } from "../../services/categoryService";
import { brandService } from "../../services/brandService";

import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./ProductsPage.module.css";

const INITIAL_FORM = {
  name: "",
  sku: "",
  brand: "Lumière Cell",
  category: "Skincare",
  shortDescription: "",
  fullDescription: "",
  images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"],
  price: 0,
  salePrice: 0,
  stockQuantity: 10,
  lowStockThreshold: 5,
  status: "Active",
  featured: false,
  bestSeller: false,
  ingredients: "",
  howToUse: "",
  benefits: "",
  skinType: "All Skin Types",
  concern: "Hydration",
  shade: "N/A",
  tags: "Skincare, Glow"
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]); // { url?, file?, preview?, isExisting }
  const [imageError, setImageError] = useState("");
  const [pendingReplaceIndex, setPendingReplaceIndex] = useState(null);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadData = async () => {
    setLoading(true);
    const [pRes, cRes, bRes] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      brandService.getAll()
    ]);
    if (pRes.data) setProducts(pRes.data);
    if (cRes.data) setCategories(cRes.data);
    if (bRes.data) setBrands(bRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setIsFormOpen(true);
    setImageFiles([]);
  };

  const handleOpenEdit = (prod) => {
    setEditingId(prod.id);
    setFormData({
      ...prod,
      images: prod.images && prod.images.length > 0 ? prod.images : [INITIAL_FORM.images[0]]
    });
    setFormErrors({});
    setIsFormOpen(true);
    // Populate imageFiles from existing product images
    setImageFiles((prod.images || []).slice(0,5).map((url) => ({ url, isExisting: true })));
  };

  const handleOpenView = (prod) => {
    setActiveProduct(prod);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (prod) => {
    setActiveProduct(prod);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (prod) => {
    await productService.toggleStatus(prod.id, prod.status);
    setToast({ message: `Status updated for ${prod.name}`, type: "success" });
    loadData();
  };

  const handleDuplicate = async (prod) => {
    await productService.duplicate(prod);
    setToast({ message: `Duplicated product ${prod.name}`, type: "success" });
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (activeProduct) {
      await productService.delete(activeProduct.id);
      setToast({ message: "Product deleted successfully", type: "success" });
      loadData();
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.sku.trim()) errors.sku = "SKU is required";
    if (!formData.price || Number(formData.price) <= 0) errors.price = "Valid price required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare images: upload any new files first, then build ordered images array
    try {
      setImageError("");

      const MAX_IMAGES = 5;
      // Ensure we don't exceed max images
      if (imageFiles.length > MAX_IMAGES) {
        setImageError(`You can upload up to ${MAX_IMAGES} images.`);
        return;
      }

      // Collect files to upload (in the order they appear)
      const filesToUpload = imageFiles.filter((f) => f.file).map((f) => f.file);
      let uploadedUrls = [];

      if (filesToUpload.length > 0) {
        const API_BASE = apiClient.getApiBaseUrl();
        const fd = new FormData();
        filesToUpload.forEach((f) => fd.append("files", f));

        const res = await fetch(`${API_BASE}/admin/products/upload`, {
          method: "POST",
          headers: { ...apiClient.getAuthHeaders() },
          body: fd
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setImageError(err.message || "Image upload failed.");
          return;
        }

        const json = await res.json();
        uploadedUrls = Array.isArray(json.data) ? json.data.map((i) => i.url) : [];
      }

      // Build final images array preserving order: for existing images use url, for new files replace with uploadedUrls sequentially
      const finalImages = [];
      let uploadIndex = 0;

      for (const item of imageFiles) {
        if (item.isExisting) {
          finalImages.push(item.url);
        } else if (item.file) {
          finalImages.push(uploadedUrls[uploadIndex]);
          uploadIndex += 1;
        }
      }

      // If no images selected, fallback to existing formData.images or default
      const submitData = { ...formData, images: finalImages.length ? finalImages : (formData.images || []) };

      if (editingId) {
        await productService.update(editingId, submitData);
        setToast({ message: "Product updated successfully", type: "success" });
      } else {
        await productService.create(submitData);
        setToast({ message: "Product created successfully", type: "success" });
      }

      setIsFormOpen(false);
      loadData();
    } catch (err) {
      setImageError("Failed to save product. Please try again.");
    }
  };

  // Image upload handlers
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


  const validateFile = (file) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return "Only JPG, JPEG, PNG and WEBP formats are allowed.";
    if (file.size > MAX_FILE_SIZE) return "Image too large. Max size is 5MB.";
    return "";
  };

  const handleFilesSelected = (filesList, replaceIndex = null) => {
    setImageError("");
    const filesArray = Array.from(filesList || []);
    if (replaceIndex !== null && filesArray.length > 0) {
      // Replace single image at index
      const f = filesArray[0];
      const err = validateFile(f);
      if (err) {
        setImageError(err);
        return;
      }
      handleReplaceImage(replaceIndex, f);
      return;
    }

    if (imageFiles.length + filesArray.length > MAX_IMAGES) {
      setImageError(`You can upload up to ${MAX_IMAGES} images in total.`);
      return;
    }

    const newItems = [];
    for (const f of filesArray) {
      const err = validateFile(f);
      if (err) {
        setImageError(err);
        return;
      }
      newItems.push({ file: f, preview: URL.createObjectURL(f), isExisting: false });
    }

    setImageFiles((current) => [...current, ...newItems].slice(0, MAX_IMAGES));
  };

  const handleRemoveImage = (idx) => {
    setImageFiles((current) => {
      const removed = current[idx];
      if (removed && removed.preview) URL.revokeObjectURL(removed.preview);
      const next = current.slice(0, idx).concat(current.slice(idx + 1));
      return next;
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleReplaceImage = (idx, file) => {
    const err = validateFile(file);
    if (err) {
      setImageError(err);
      return;
    }
    setImageFiles((current) => {
      const next = [...current];
      const old = next[idx];
      if (old && old.preview) URL.revokeObjectURL(old.preview);
      next[idx] = { file, preview: URL.createObjectURL(file), isExisting: false };
      return next;
    });
  };

  const reorder = (arr, from, to) => {
    const next = [...arr];
    if (from < 0 || from >= next.length || to < 0 || to >= next.length) return arr;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const moveLeft = (idx) => {
    if (idx > 0) setImageFiles((prev) => reorder(prev, idx, idx - 1));
  };

  const moveRight = (idx) => {
    setImageFiles((prev) => (idx < prev.length - 1 ? reorder(prev, idx, idx + 1) : prev));
  };

  const columns = [
    {
      label: "Product",
      key: "name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={row.images?.[0] || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80"}
            alt={row.name}
            style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
          />
          <div>
            <strong style={{ fontSize: "13px", color: "var(--admin-heading)", display: "block" }}>{row.name}</strong>
            <small style={{ color: "var(--admin-muted)", fontSize: "11px" }}>SKU: {row.sku}</small>
          </div>
        </div>
      )
    },
    { label: "Brand", key: "brand" },
    { label: "Category", key: "category" },
    {
      label: "Price",
      key: "price",
      render: (row) => (
        <div>
          <strong style={{ color: "var(--admin-green)", fontSize: "13px" }}>₹{row.salePrice || row.price}</strong>
          {row.salePrice && row.salePrice < row.price && (
            <span style={{ textDecoration: "line-through", color: "var(--admin-muted)", fontSize: "11px", marginLeft: "6px" }}>
              ₹{row.price}
            </span>
          )}
        </div>
      )
    },
    {
      label: "Stock",
      key: "stockQuantity",
      render: (row) => (
        <span style={{ color: row.stockQuantity <= row.lowStockThreshold ? "var(--admin-danger)" : "inherit", fontWeight: 600 }}>
          {row.stockQuantity} pcs
        </span>
      )
    },
    {
      label: "Status",
      key: "status",
      render: (row) => <StatusBadge status={row.status} />
    },
    { label: "Rating", key: "rating", render: (row) => `⭐ ${row.rating || 4.5}` }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Products Catalog</h2>
          <p>Manage skincare, makeup, and beauty products</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search product name or SKU..."
        statusOptions={["Active", "Inactive"]}
        loading={loading}
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
            <button type="button" title="View" className={styles.iconBtn} onClick={() => handleOpenView(row)}>
              <Eye size={15} />
            </button>
            <button type="button" title="Edit" className={styles.iconBtn} onClick={() => handleOpenEdit(row)}>
              <Edit2 size={15} />
            </button>
            <button type="button" title="Toggle Status" className={styles.iconBtn} onClick={() => handleToggleStatus(row)}>
              <Power size={15} />
            </button>
            <button type="button" title="Duplicate" className={styles.iconBtn} onClick={() => handleDuplicate(row)}>
              <Copy size={15} />
            </button>
            <button type="button" title="Delete" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => handleOpenDelete(row)}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* Add / Edit Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Edit Product" : "Add New Product"} maxWidth="720px">
        <form onSubmit={handleSubmitForm} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Cellular Renewal Night Cream"
            />
            {formErrors.name && <span className={styles.errorText}>{formErrors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>SKU Code *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. NCB-CRN-001"
            />
            {formErrors.sku && <span className={styles.errorText}>{formErrors.sku}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Brand</label>
            <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Regular Price (₹) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            {formErrors.price && <span className={styles.errorText}>{formErrors.price}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Sale Price (₹)</label>
            <input
              type="number"
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Stock Quantity</label>
            <input
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Low-Stock Threshold</label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Product Images</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                const files = e.target.files;
                if (pendingReplaceIndex !== null) {
                  handleFilesSelected(files, pendingReplaceIndex);
                  setPendingReplaceIndex(null);
                } else {
                  handleFilesSelected(files);
                }
                e.target.value = "";
              }}
            />

            <div className={styles.imageUploadSection}>
              <div className={styles.imageGrid}>
                {imageFiles.map((it, idx) => (
                  <div key={idx} className={styles.imageCard}>
                    <img src={it.preview || it.url} alt={`img-${idx}`} />
                    <button type="button" className={styles.removeImgBtn} onClick={() => handleRemoveImage(idx)}>×</button>
                    <div style={{ position: "absolute", left: 6, bottom: 6, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 6px", fontSize: 10, borderRadius: 6 }}>
                      {idx === 0 ? "Primary" : `#${idx + 1}`}
                    </div>
                    <div style={{ position: "absolute", right: 6, bottom: 6, display: "flex", gap: 6 }}>
                      <button type="button" className={styles.iconBtn} onClick={() => { setPendingReplaceIndex(idx); fileInputRef.current && fileInputRef.current.click(); }}>Replace</button>
                      <button type="button" className={styles.iconBtn} onClick={() => moveLeft(idx)} disabled={idx === 0}>◀</button>
                      <button type="button" className={styles.iconBtn} onClick={() => moveRight(idx)} disabled={idx === imageFiles.length - 1}>▶</button>
                    </div>
                  </div>
                ))}

                {imageFiles.length < MAX_IMAGES && (
                  <div className={styles.uploadDropzone} onClick={() => { setPendingReplaceIndex(null); fileInputRef.current && fileInputRef.current.click(); }}>
                    <Plus size={18} />
                    <div style={{ fontSize: 11, fontWeight: 700 }}>Upload</div>
                  </div>
                )}
              </div>

              <div className={styles.imageCountInfo}>{imageFiles.length} / {MAX_IMAGES} images</div>
              {imageError && <div className={styles.errorText}>{imageError}</div>}
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Short Description</label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Full Description</label>
            <textarea
              rows={3}
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Skin Type</label>
            <input
              type="text"
              value={formData.skinType}
              onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Skin Concern</label>
            <input
              type="text"
              value={formData.concern}
              onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.checkboxRow} ${styles.fullWidth}`}>
            <label>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              Featured Product
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.bestSeller}
                onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
              />
              Best Seller
            </label>
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal Drawer */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Product Overview" drawer>
        {activeProduct && (
          <div style={{ display: "grid", gap: "16px" }}>
            <img
              src={activeProduct.images?.[0]}
              alt={activeProduct.name}
              style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }}
            />
            <h3>{activeProduct.name}</h3>
            <p><strong>SKU:</strong> {activeProduct.sku}</p>
            <p><strong>Brand:</strong> {activeProduct.brand} | <strong>Category:</strong> {activeProduct.category}</p>
            <p><strong>Price:</strong> ₹{activeProduct.price} (Sale: ₹{activeProduct.salePrice || "N/A"})</p>
            <p><strong>Stock:</strong> {activeProduct.stockQuantity} pcs</p>
            <p><strong>Description:</strong> {activeProduct.shortDescription}</p>
            <p><strong>Ingredients:</strong> {activeProduct.ingredients}</p>
            <p><strong>How to Use:</strong> {activeProduct.howToUse}</p>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to permanentely delete "${activeProduct?.name}"?`}
      />
    </div>
  );
}
