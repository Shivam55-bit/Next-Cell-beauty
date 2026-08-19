import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power, GripVertical } from "lucide-react";

import { shadeFinderService } from "../../services/shadeFinderService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./ShadeFinderPage.module.css";

const INITIAL_QUESTION = {
  key: "",
  title: "",
  description: "",
  type: "choice",
  options: [{ id: "", label: "", value: "", swatch: "", accent: "", status: "ACTIVE" }],
  status: "ACTIVE"
};

const INITIAL_RESULT = {
  title: "",
  description: "",
  skinTone: "",
  undertone: "",
  productType: "",
  finish: "",
  shadeName: "",
  blendHex: "",
  toneHex: "",
  undertoneHex: "",
  explanation: "",
  suggestedProductType: "",
  recommendedProducts: [],
  status: "ACTIVE"
};

export default function ShadeFinderPage() {
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState("question");
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_QUESTION);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadQuestions = async () => {
    setLoading(true);
    const res = await shadeFinderService.getAdminQuestions();
    if (res.data) setQuestions(res.data);
    setLoading(false);
  };

  const loadResults = async () => {
    setLoading(true);
    const res = await shadeFinderService.getAdminResults();
    if (res.data) setResults(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "questions") {
      loadQuestions();
    } else {
      loadResults();
    }
  }, [activeTab]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setEditingType(activeTab === "results" ? "result" : "question");
    setFormData(activeTab === "results" ? INITIAL_RESULT : INITIAL_QUESTION);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setEditingType(activeTab === "results" ? "result" : "question");
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (item) => {
    const type = activeTab === "results" ? "result" : "question";
    await shadeFinderService.toggleStatus(item.id, item.status, type);
    setToast({ message: `Status updated`, type: "success" });
    if (activeTab === "questions") loadQuestions(); else loadResults();
  };

  const handleDeleteConfirm = async () => {
    if (activeItem) {
      if (activeTab === "results") {
        await shadeFinderService.deleteResult(activeItem.id);
      } else {
        await shadeFinderService.deleteQuestion(activeItem.id);
      }
      setToast({ message: "Item removed successfully", type: "success" });
      if (activeTab === "questions") loadQuestions(); else loadResults();
    }
  };

  const handleOptionChange = (idx, field, value) => {
    const nextOpts = [...formData.options];
    nextOpts[idx] = { ...nextOpts[idx], [field]: value };
    setFormData({ ...formData, options: nextOpts });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { id: "", label: "", value: "", swatch: "", accent: "", status: "ACTIVE" }]
    });
  };

  const handleRemoveOption = (idx) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== idx)
    });
  };

  const handleRecommendedProductsChange = (value) => {
    const arr = value.split(",").map((s) => s.trim()).filter(Boolean);
    setFormData({ ...formData, recommendedProducts: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingType === "question") {
      if (!formData.key.trim() || !formData.title.trim()) return;
    } else {
      if (!formData.title.trim()) return;
    }

    if (editingType === "question") {
      if (editingId) {
        await shadeFinderService.updateQuestion(editingId, formData);
        setToast({ message: "Question updated", type: "success" });
      } else {
        await shadeFinderService.createQuestion(formData);
        setToast({ message: "Question added", type: "success" });
      }
    } else {
      if (editingId) {
        await shadeFinderService.updateResult(editingId, formData);
        setToast({ message: "Result updated", type: "success" });
      } else {
        await shadeFinderService.createResult(formData);
        setToast({ message: "Result added", type: "success" });
      }
    }

    setIsFormOpen(false);
    if (activeTab === "questions") loadQuestions(); else loadResults();
  };

  const questionColumns = [
    { label: "Key", key: "key", render: (row) => <code style={{ fontSize: "11px", background: "#f6f8fa", padding: "2px 6px", borderRadius: "4px" }}>{row.key}</code> },
    { label: "Title", key: "title" },
    { label: "Type", key: "type", render: (row) => <span style={{ textTransform: "capitalize" }}>{row.type}</span> },
    { label: "Options", key: "options", render: (row) => `${row.options?.length || 0} choices` },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  const resultColumns = [
    { label: "Shade Name", key: "shadeName" },
    { label: "Title", key: "title" },
    { label: "Skin Tone", key: "skinTone" },
    { label: "Undertone", key: "undertone" },
    { label: "Product Type", key: "productType" },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Shade Finder Configuration</h2>
          <p>Configure shade finder questions, options, and matching results</p>
        </div>
        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add {activeTab === "results" ? "Result" : "Question"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "4px", background: "#f5f6f8", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        <button type="button" onClick={() => setActiveTab("questions")} style={{
          padding: "8px 18px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
          background: activeTab === "questions" ? "#fff" : "transparent", color: activeTab === "questions" ? "var(--admin-heading)" : "var(--admin-muted)", boxShadow: activeTab === "questions" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
        }}>
          Questions
        </button>
        <button type="button" onClick={() => setActiveTab("results")} style={{
          padding: "8px 18px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
          background: activeTab === "results" ? "#fff" : "transparent", color: activeTab === "results" ? "var(--admin-heading)" : "var(--admin-muted)", boxShadow: activeTab === "results" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
        }}>
          Results
        </button>
      </div>

      {activeTab === "questions" && (
        <DataTable
          columns={questionColumns}
          data={questions}
          searchKey="title"
          searchPlaceholder="Search questions..."
          statusOptions={["ACTIVE", "INACTIVE"]}
          loading={loading}
          actions={(row) => (
            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
              <button type="button" className={styles.iconBtn} onClick={() => handleOpenEdit(row)}>
                <Edit2 size={15} />
              </button>
              <button type="button" className={styles.iconBtn} onClick={() => handleToggleStatus(row)}>
                <Power size={15} />
              </button>
              <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => { setActiveItem(row); setIsDeleteOpen(true); }}>
                <Trash2 size={15} />
              </button>
            </div>
          )}
        />
      )}

      {activeTab === "results" && (
        <DataTable
          columns={resultColumns}
          data={results}
          searchKey="shadeName"
          searchPlaceholder="Search results..."
          statusOptions={["ACTIVE", "INACTIVE"]}
          loading={loading}
          actions={(row) => (
            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
              <button type="button" className={styles.iconBtn} onClick={() => handleOpenEdit(row)}>
                <Edit2 size={15} />
              </button>
              <button type="button" className={styles.iconBtn} onClick={() => handleToggleStatus(row)}>
                <Power size={15} />
              </button>
              <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => { setActiveItem(row); setIsDeleteOpen(true); }}>
                <Trash2 size={15} />
              </button>
            </div>
          )}
        />
      )}

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? (editingType === "result" ? "Edit Result" : "Edit Question") : (editingType === "result" ? "Add New Result" : "Add New Question")} maxWidth="720px">
        <form onSubmit={handleSubmit} className={styles.form}>
          {editingType === "question" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label>Key *</label>
                  <input type="text" required value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} placeholder="e.g. skinTone" />
                </div>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="choice">Choice</option>
                    <option value="swatch">Swatch</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Select Skin Tone" />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Helper text shown to users" />
              </div>

              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700 }}>Options</label>
                  <button type="button" onClick={handleAddOption} className={styles.addOptBtn}>
                    + Add Option
                  </button>
                </div>

                {formData.options.map((opt, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <GripVertical size={16} style={{ color: "var(--admin-muted)" }} />
                    <input
                      type="text"
                      placeholder="Label"
                      value={opt.label}
                      onChange={(e) => handleOptionChange(idx, "label", e.target.value)}
                      style={{ flex: 2, padding: "7px 10px", border: "1px solid var(--admin-border)", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={opt.value}
                      onChange={(e) => handleOptionChange(idx, "value", e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", border: "1px solid var(--admin-border)", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      placeholder="Swatch (hex)"
                      value={opt.swatch}
                      onChange={(e) => handleOptionChange(idx, "swatch", e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", border: "1px solid var(--admin-border)", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      placeholder="Accent"
                      value={opt.accent}
                      onChange={(e) => handleOptionChange(idx, "accent", e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", border: "1px solid var(--admin-border)", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <button type="button" className={styles.removeOptBtn} onClick={() => handleRemoveOption(idx)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Porcelain Rose" />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Short description" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label>Skin Tone</label>
                  <input type="text" value={formData.skinTone} onChange={(e) => setFormData({ ...formData, skinTone: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Undertone</label>
                  <input type="text" value={formData.undertone} onChange={(e) => setFormData({ ...formData, undertone: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label>Product Type</label>
                  <input type="text" value={formData.productType} onChange={(e) => setFormData({ ...formData, productType: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Finish</label>
                  <input type="text" value={formData.finish} onChange={(e) => setFormData({ ...formData, finish: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label>Shade Name</label>
                  <input type="text" value={formData.shadeName} onChange={(e) => setFormData({ ...formData, shadeName: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Blend Hex</label>
                  <input type="text" value={formData.blendHex} onChange={(e) => setFormData({ ...formData, blendHex: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Tone Hex</label>
                  <input type="text" value={formData.toneHex} onChange={(e) => setFormData({ ...formData, toneHex: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup}>
                  <label>Undertone Hex</label>
                  <input type="text" value={formData.undertoneHex} onChange={(e) => setFormData({ ...formData, undertoneHex: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Suggested Product Type</label>
                  <input type="text" value={formData.suggestedProductType} onChange={(e) => setFormData({ ...formData, suggestedProductType: e.target.value })} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Explanation</label>
                <textarea rows={2} value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label>Recommended Products (comma-separated slugs)</label>
                <input type="text" value={formData.recommendedProducts?.join(", ") || ""} onChange={(e) => handleRecommendedProductsChange(e.target.value)} />
              </div>
            </>
          )}

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save {editingType === "result" ? "Result" : "Question"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${editingType === "result" ? "Result" : "Question"}`}
        message={`Are you sure you want to delete "${activeItem?.title || activeItem?.shadeName || activeItem?.key}"?`}
      />
    </div>
  );
}
