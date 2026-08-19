import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power, ArrowUp, ArrowDown } from "lucide-react";

import { skinQuizService } from "../../services/skinQuizService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./SkinQuizPage.module.css";

const INITIAL_QUESTION = {
  key: "",
  title: "",
  description: "",
  question: "",
  order: 0,
  options: [{ id: "", text: "", value: "", skinType: "", recommendedProduct: "", status: "ACTIVE" }],
  status: "ACTIVE",
};

const INITIAL_RESULT = {
  title: "",
  description: "",
  skinType: "",
  concern: "",
  ageRange: "",
  sensitivity: "",
  routine: "",
  priority: 0,
  morningRoutine: [],
  nightRoutine: [],
  recommendedCategories: [],
  recommendedProducts: [],
  note: "",
  status: "ACTIVE",
};

export default function SkinQuizPage() {
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

  const showToast = (message, type = "success") => setToast({ message, type });

  const loadQuestions = async () => {
    setLoading(true);
    const res = await skinQuizService.getAdminQuestions();
    if (res.data) {
      const sorted = [...res.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setQuestions(sorted);
    }
    setLoading(false);
  };

  const loadResults = async () => {
    setLoading(true);
    const res = await skinQuizService.getAdminResults();
    if (res.data) setResults(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "questions") loadQuestions();
    else loadResults();
  }, [activeTab]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setEditingType(activeTab === "results" ? "result" : "question");
    const nextOrder = questions.length > 0
      ? Math.max(...questions.map((q) => q.order ?? 0)) + 1
      : 1;
    setFormData(activeTab === "results" ? INITIAL_RESULT : { ...INITIAL_QUESTION, order: nextOrder });
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
    const res = await skinQuizService.toggleStatus(item.id, item.status, type);
    if (res.success === false) {
      showToast(res.message || "Failed to update status", "error");
    } else {
      showToast("Status updated");
    }
    if (activeTab === "questions") loadQuestions(); else loadResults();
  };

  const handleMoveOrder = async (item, direction) => {
    const sorted = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((q) => q.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const aOrder = a.order ?? idx;
    const bOrder = b.order ?? swapIdx;

    await skinQuizService.reorderQuestions([
      { id: a.id, order: bOrder },
      { id: b.id, order: aOrder },
    ]);
    showToast("Order updated");
    loadQuestions();
  };

  const handleDeleteConfirm = async () => {
    if (!activeItem) return;
    const res = activeTab === "results"
      ? await skinQuizService.deleteResult(activeItem.id)
      : await skinQuizService.deleteQuestion(activeItem.id);
    if (res.success === false) {
      showToast(res.message || "Delete failed", "error");
    } else {
      showToast("Item removed successfully");
    }
    setIsDeleteOpen(false);
    if (activeTab === "questions") loadQuestions(); else loadResults();
  };

  const handleOptionChange = (idx, field, value) => {
    const nextOpts = [...formData.options];
    nextOpts[idx] = { ...nextOpts[idx], [field]: value };
    setFormData({ ...formData, options: nextOpts });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { id: "", text: "", value: "", skinType: "", recommendedProduct: "", status: "ACTIVE" },
      ],
    });
  };

  const handleRemoveOption = (idx) => {
    setFormData({ ...formData, options: formData.options.filter((_, i) => i !== idx) });
  };

  const handleRoutineChange = (field, value) => {
    setFormData({ ...formData, [field]: value.split("\n").map((s) => s.trim()).filter(Boolean) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingType === "question") {
      if (!formData.key?.trim() || !formData.title?.trim() || !formData.question?.trim()) return;
    } else {
      if (!formData.title?.trim()) return;
    }

    let res;
    if (editingType === "question") {
      // Auto-set value = text if value is empty
      const cleanOptions = (formData.options || []).map((opt) => ({
        ...opt,
        value: opt.value?.trim() || opt.text?.trim() || "",
      }));
      const payload = { ...formData, options: cleanOptions, order: Number(formData.order) || 0 };
      res = editingId
        ? await skinQuizService.updateQuestion(editingId, payload)
        : await skinQuizService.createQuestion(payload);
    } else {
      const payload = {
        ...formData,
        priority: Number(formData.priority) || 0,
        recommendedProducts: typeof formData.recommendedProducts === "string"
          ? formData.recommendedProducts.split(",").map((s) => s.trim()).filter(Boolean)
          : formData.recommendedProducts || [],
        recommendedCategories: typeof formData.recommendedCategories === "string"
          ? formData.recommendedCategories.split(",").map((s) => s.trim()).filter(Boolean)
          : formData.recommendedCategories || [],
      };
      res = editingId
        ? await skinQuizService.updateResult(editingId, payload)
        : await skinQuizService.createResult(payload);
    }

    if (res.success === false) {
      showToast(res.message || "Save failed", "error");
      return;
    }

    showToast(editingId ? "Updated successfully" : "Created successfully");
    setIsFormOpen(false);
    if (activeTab === "questions") loadQuestions(); else loadResults();
  };

  const questionColumns = [
    {
      label: "Order",
      key: "order",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20 }}>{row.order ?? "—"}</span>
          <button type="button" className={styles.iconBtn} style={{ padding: 3 }} onClick={() => handleMoveOrder(row, "up")} title="Move up">
            <ArrowUp size={13} />
          </button>
          <button type="button" className={styles.iconBtn} style={{ padding: 3 }} onClick={() => handleMoveOrder(row, "down")} title="Move down">
            <ArrowDown size={13} />
          </button>
        </div>
      ),
    },
    { label: "Key", key: "key", render: (row) => <code style={{ fontSize: 11, background: "#f6f8fa", padding: "2px 6px", borderRadius: 4 }}>{row.key}</code> },
    { label: "Title", key: "title" },
    { label: "Prompt", key: "question" },
    { label: "Options", key: "options", render: (row) => `${row.options?.length || 0} choices` },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const resultColumns = [
    { label: "Title", key: "title" },
    { label: "Skin Type", key: "skinType", render: (row) => row.skinType || <span style={{ color: "#aaa" }}>any</span> },
    { label: "Concern", key: "concern", render: (row) => row.concern || <span style={{ color: "#aaa" }}>any</span> },
    { label: "Priority", key: "priority", render: (row) => <strong>{row.priority ?? 0}</strong> },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const ActionButtons = ({ row }) => (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
      <button type="button" className={styles.iconBtn} onClick={() => handleOpenEdit(row)} title="Edit"><Edit2 size={15} /></button>
      <button type="button" className={styles.iconBtn} onClick={() => handleToggleStatus(row)} title="Toggle status"><Power size={15} /></button>
      <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => { setActiveItem(row); setIsDeleteOpen(true); }} title="Delete"><Trash2 size={15} /></button>
    </div>
  );

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Skin Quiz Configuration</h2>
          <p>Manage quiz questions, answer options, match conditions and recommended routines</p>
        </div>
        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add {activeTab === "results" ? "Result" : "Question"}
        </button>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: "#f5f6f8", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 20 }}>
        {["questions", "results"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 18px", border: "none", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: 13, textTransform: "capitalize",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "var(--admin-heading)" : "var(--admin-muted)",
              boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "questions" && (
        <DataTable
          columns={questionColumns}
          data={questions}
          searchKey="title"
          searchPlaceholder="Search questions…"
          statusOptions={["ACTIVE", "INACTIVE"]}
          loading={loading}
          actions={(row) => <ActionButtons row={row} />}
        />
      )}

      {activeTab === "results" && (
        <DataTable
          columns={resultColumns}
          data={results}
          searchKey="title"
          searchPlaceholder="Search results…"
          statusOptions={["ACTIVE", "INACTIVE"]}
          loading={loading}
          actions={(row) => <ActionButtons row={row} />}
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId
          ? (editingType === "result" ? "Edit Result" : "Edit Question")
          : (editingType === "result" ? "Add New Result" : "Add Question")}
        maxWidth="760px"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {editingType === "question" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12 }}>
                <div className={styles.formGroup}>
                  <label>Key *</label>
                  <input type="text" required value={formData.key || ""} onChange={(e) => setFormData({ ...formData, key: e.target.value })} placeholder="e.g. skinType" />
                </div>
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input type="text" required value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Step 1: Skin Type" />
                </div>
                <div className={styles.formGroup}>
                  <label>Order</label>
                  <input type="number" min="0" value={formData.order ?? 0} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Question Prompt *</label>
                <textarea rows={2} required value={formData.question || ""} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="Choose the skin type that feels closest to your own." />
              </div>

              <div className={styles.formGroup}>
                <label>Description (helper text)</label>
                <input type="text" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description shown to users" />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Answer Options</label>
                  <button type="button" onClick={handleAddOption} className={styles.addOptBtn}>+ Add Choice</button>
                </div>
                {(formData.options || []).map((opt, idx) => (
                  <div key={idx} className={styles.optRow}>
                    <input type="text" placeholder="Choice text *" value={opt.text} onChange={(e) => handleOptionChange(idx, "text", e.target.value)} style={{ flex: 2 }} />
                    <input type="text" placeholder="Value (auto-fills from text)" value={opt.value} onChange={(e) => handleOptionChange(idx, "value", e.target.value)} style={{ flex: 1 }} />
                    <button type="button" className={styles.removeOptBtn} onClick={() => handleRemoveOption(idx)}>&times;</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label>Result Title *</label>
                <input type="text" required value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Dry Skin — Dullness Routine" />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea rows={2} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              {/* Match Conditions */}
              <div style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--admin-heading)" }}>
                  Match Conditions — leave empty or type "any" for wildcard
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Skin Type", field: "skinType", placeholder: "e.g. Dry" },
                    { label: "Concern", field: "concern", placeholder: "e.g. Dullness" },
                    { label: "Age Range", field: "ageRange", placeholder: "any" },
                  ].map(({ label, field, placeholder }) => (
                    <div className={styles.formGroup} key={field}>
                      <label>{label}</label>
                      <input type="text" value={formData[field] || ""} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} placeholder={placeholder} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 4 }}>
                  {[
                    { label: "Sensitivity", field: "sensitivity", placeholder: "any" },
                    { label: "Routine", field: "routine", placeholder: "any" },
                    { label: "Priority (higher = wins)", field: "priority", placeholder: "0" },
                  ].map(({ label, field, placeholder }) => (
                    <div className={styles.formGroup} key={field}>
                      <label>{label}</label>
                      <input
                        type={field === "priority" ? "number" : "text"}
                        min={field === "priority" ? 0 : undefined}
                        value={formData[field] ?? ""}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Morning Routine (one step per line)</label>
                <textarea rows={4} value={(formData.morningRoutine || []).join("\n")} onChange={(e) => handleRoutineChange("morningRoutine", e.target.value)} placeholder={"Gentle cleanser\nHydrating serum\nMoisturiser\nSPF 50"} />
              </div>

              <div className={styles.formGroup}>
                <label>Night Routine (one step per line)</label>
                <textarea rows={4} value={(formData.nightRoutine || []).join("\n")} onChange={(e) => handleRoutineChange("nightRoutine", e.target.value)} placeholder={"Cleanser\nTreatment serum\nNight moisturiser\nEye cream"} />
              </div>

              <div className={styles.formGroup}>
                <label>Recommended Categories (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.recommendedCategories || []).join(", ")}
                  onChange={(e) => setFormData({ ...formData, recommendedCategories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Cleansers, Serums, Moisturisers, Sunscreen"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Recommended Products (product slugs or IDs, comma-separated)</label>
                <input
                  type="text"
                  value={(formData.recommendedProducts || []).join(", ")}
                  onChange={(e) => setFormData({ ...formData, recommendedProducts: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="cellular-renewal-night-cream, radiant-vitamin-c-serum"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Note / Advice</label>
                <textarea rows={2} value={formData.note || ""} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Tip shown to customer on results page" />
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 12, fontWeight: 700 }}>Status</label>
              <select
                value={formData.status || "ACTIVE"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>Save {editingType === "result" ? "Result" : "Question"}</button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${editingType === "result" ? "Result" : "Question"}`}
        message={`Are you sure you want to delete "${activeItem?.title || activeItem?.key}"?`}
      />
    </div>
  );
}
