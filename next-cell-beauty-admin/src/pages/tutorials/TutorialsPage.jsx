import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power, Play, Upload, X, ImageIcon, Star, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

import { tutorialService } from "../../services/tutorialService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./TutorialsPage.module.css";

const INITIAL_FORM = {
  title: "",
  thumbnail: "",
  description: "",
  videoUrl: "",
  category: "Skincare Routine",
  productsUsed: "",
  author: "",
  publishedDate: "",
  status: "Published"
};

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [steps, setSteps] = useState([]);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadTutorials = async () => {
    setLoading(true);
    const res = await tutorialService.getAll();
    if (res.data) setTutorials(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadTutorials();
  }, []);

  const resetThumbnailState = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setUploadError("");
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setSteps([]);
    setEditingStepIndex(null);
    resetThumbnailState();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t.id);
    setFormData(t);
    setSteps(Array.isArray(t.stepByStepGuide) ? t.stepByStepGuide : []);
    setEditingStepIndex(null);
    setThumbnailPreview(t.thumbnail || "");
    setThumbnailFile(null);
    setUploadError("");
    setIsFormOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload JPG, JPEG, PNG, or WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setUploadError("");
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
    setThumbnailFile(file);
  };

  const clearUpload = () => {
    setThumbnailFile(null);
    setThumbnailPreview(formData.thumbnail || "");
    setUploadError("");
  };

  const handleAddStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, title: "", description: "" }]);
    setEditingStepIndex(steps.length);
  };

  const handleStepChange = (index, field, value) => {
    const next = [...steps];
    next[index] = { ...next[index], [field]: value };
    setSteps(next);
  };

  const handleRemoveStep = (index) => {
    const next = steps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setSteps(next);
    setEditingStepIndex(null);
  };

  const handleMoveStep = (index, direction) => {
    const next = [...steps];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((step, i) => { step.stepNumber = i + 1 });
    setSteps(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    let thumbnail = formData.thumbnail || "";

    if (thumbnailFile) {
      setUploading(true);
      setUploadError("");

      try {
        const baseUrl = tutorialService.getBaseUrl?.() || "http://localhost:4001/api";
        const token = localStorage.getItem("adminToken");

        const formDataObj = new FormData();
        formDataObj.append("file", thumbnailFile);

        const res = await fetch(`${baseUrl}/admin/tutorials/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataObj
        });

        const result = await res.json();
        if (res.ok && result.success && result.data?.url) {
          thumbnail = result.data.url;
        } else {
          setUploadError(result.message || "Failed to upload image.");
          setUploading(false);
          return;
        }
      } catch (err) {
        setUploadError("Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      setUploading(false);
    }

    const payload = { ...formData, thumbnail, stepByStepGuide: steps };

    if (editingId) {
      await tutorialService.update(editingId, payload);
      setToast({ message: "Tutorial updated successfully", type: "success" });
    } else {
      await tutorialService.create(payload);
      setToast({ message: "Tutorial created successfully", type: "success" });
    }

    setIsFormOpen(false);
    resetThumbnailState();
    loadTutorials();
  };

  const handleTogglePublish = async (t) => {
    await tutorialService.togglePublish(t.id, t.status);
    setToast({ message: `Updated publication status for "${t.title}"`, type: "success" });
    loadTutorials();
  };

  const handleToggleFeatured = async (t) => {
    await tutorialService.toggleFeatured(t.id);
    setToast({ message: `Featured status updated for "${t.title}"`, type: "success" });
    loadTutorials();
  };

  const handleDeleteConfirm = async () => {
    if (activeItem) {
      await tutorialService.delete(activeItem.id);
      setToast({ message: "Tutorial deleted successfully", type: "success" });
      loadTutorials();
    }
  };

  const columns = [
    {
      label: "Tutorial",
      key: "title",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={row.thumbnail} alt={row.title} style={{ width: "50px", height: "35px", borderRadius: "6px", objectFit: "cover" }} />
          <div>
            <strong style={{ fontSize: "13px", color: "var(--admin-heading)", display: "block" }}>{row.title}</strong>
            <small style={{ color: "var(--admin-muted)", fontSize: "11px" }}>By {row.author}</small>
          </div>
        </div>
      )
    },
    { label: "Category", key: "category" },
    { label: "Products Used", key: "productsUsed" },
    { label: "Date", key: "publishedDate" },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  const previewSrc = thumbnailPreview || formData.thumbnail;

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Beauty Tutorials CMS</h2>
          <p>Publish skincare routines, makeup masterclasses, and how-to video guides</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add Tutorial
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tutorials}
        searchKey="title"
        searchPlaceholder="Search tutorials..."
        statusOptions={["Published", "Draft"]}
        loading={loading}
          actions={(row) => (
            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
              <button type="button" className={styles.iconBtn} onClick={() => handleOpenEdit(row)}>
                <Edit2 size={15} />
              </button>
              <button type="button" className={styles.iconBtn} onClick={() => handleTogglePublish(row)}>
                <Power size={15} />
              </button>
              <button type="button" className={`${styles.iconBtn} ${row.featured ? styles.dangerIcon : ''}`} onClick={() => handleToggleFeatured(row)} title={row.featured ? "Remove featured" : "Set as featured"}>
                <Star size={15} />
              </button>
              <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => { setActiveItem(row); setIsDeleteOpen(true); }}>
                <Trash2 size={15} />
              </button>
            </div>
          )}
      />

      {/* Modal Form */}
      <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); resetThumbnailState(); }} title={editingId ? "Edit Tutorial" : "Add Tutorial"}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tutorial Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Thumbnail Image</label>
            <input
              type="text"
              value={formData.thumbnail}
              onChange={(e) => {
                setFormData({ ...formData, thumbnail: e.target.value });
                if (!thumbnailFile) setThumbnailPreview(e.target.value);
              }}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Upload Thumbnail Image</label>
            <div className={styles.uploadRow}>
              <label className={styles.uploadLabel}>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className={styles.uploadInput} />
                <span className={styles.uploadBtn}>
                  <Upload size={14} />
                  {thumbnailFile ? "Change Image" : "Choose Image"}
                </span>
              </label>

              {thumbnailFile && (
                <button type="button" className={styles.clearUploadBtn} onClick={clearUpload}>
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            {uploadError && <span className={styles.uploadError}>{uploadError}</span>}

            {previewSrc && (
              <div className={styles.thumbnailPreview}>
                <img src={previewSrc} alt="Thumbnail preview" />
                <span className={styles.previewLabel}>Preview</span>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Video URL (YouTube / Vimeo)</label>
            <input type="text" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Products Used</label>
            <input type="text" value={formData.productsUsed} onChange={(e) => setFormData({ ...formData, productsUsed: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Author / Host</label>
            <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Short Description</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700 }}>Step-by-step Guide</label>
              <button type="button" onClick={handleAddStep} className={styles.addOptBtn}>
                + Add Step
              </button>
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className={styles.stepRow}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <GripVertical size={16} style={{ color: "var(--admin-muted)" }} />
                  <strong style={{ fontSize: "12px", color: "var(--admin-heading)" }}>Step {step.stepNumber || idx + 1}</strong>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                    <button type="button" className={styles.iconBtn} onClick={() => handleMoveStep(idx, -1)} disabled={idx === 0}>
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" className={styles.iconBtn} onClick={() => handleMoveStep(idx, 1)} disabled={idx === steps.length - 1}>
                      <ChevronDown size={14} />
                    </button>
                    <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => handleRemoveStep(idx)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {editingStepIndex === idx ? (
                  <div style={{ display: "grid", gap: "6px", marginBottom: "8px" }}>
                    <input
                      type="text"
                      placeholder="Step title"
                      value={step.title}
                      onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                      style={{ padding: "7px 10px", border: "1px solid var(--admin-border)", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <textarea
                      rows={2}
                      placeholder="Step description"
                      value={step.description}
                      onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                      style={{ padding: "7px 10px", border: "1px solid var(--admin-border)", borderRadius: "6px", fontSize: "12px", resize: "vertical" }}
                    />
                    <button type="button" onClick={() => setEditingStepIndex(null)} className={styles.addOptBtn} style={{ width: "fit-content" }}>
                      Done
                    </button>
                  </div>
                ) : (
                  <div onClick={() => setEditingStepIndex(idx)} style={{ cursor: "pointer", padding: "8px 10px", border: "1px solid var(--admin-border)", borderRadius: "6px", marginBottom: "8px", background: "#fff" }}>
                    <div style={{ fontWeight: 600, fontSize: "12px", marginBottom: "2px" }}>{step.title || "Untitled step"}</div>
                    <div style={{ fontSize: "11px", color: "var(--admin-muted)" }}>{step.description || "No description"}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => { setIsFormOpen(false); resetThumbnailState(); }} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={uploading}>
              {uploading ? "Uploading..." : "Save Tutorial"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tutorial"
        message={`Are you sure you want to delete "${activeItem?.title}"?`}
      />
    </div>
  );
}
