import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power } from "lucide-react";

import { faqService } from "../../services/faqService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./FaqPage.module.css";

const INITIAL_FORM = {
  question: "",
  answer: "",
  category: "Product Safety",
  displayOrder: 1,
  status: "Active"
};

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadFaqs = async () => {
    setLoading(true);
    const res = await faqService.getAll();
    if (res.data) setFaqs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ ...INITIAL_FORM, displayOrder: faqs.length + 1 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingId(f.id);
    setFormData(f);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (f) => {
    await faqService.toggleStatus(f.id, f.status);
    setToast({ message: `Status updated for FAQ`, type: "success" });
    loadFaqs();
  };

  const handleDeleteConfirm = async () => {
    if (activeFaq) {
      await faqService.delete(activeFaq.id);
      setToast({ message: "FAQ item deleted successfully", type: "success" });
      loadFaqs();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) return;

    if (editingId) {
      await faqService.update(editingId, formData);
      setToast({ message: "FAQ updated successfully", type: "success" });
    } else {
      await faqService.create(formData);
      setToast({ message: "FAQ created successfully", type: "success" });
    }

    setIsFormOpen(false);
    loadFaqs();
  };

  const columns = [
    { label: "Order", key: "displayOrder", render: (row) => <strong>#{row.displayOrder}</strong> },
    { label: "Question", key: "question" },
    { label: "Category", key: "category" },
    { label: "Answer Snippet", key: "answer", render: (row) => row.answer?.slice(0, 60) + "..." },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>FAQ Management</h2>
          <p>Maintain customer help center questions, product usage, and delivery answers</p>
        </div>

        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add FAQ
        </button>
      </div>

      <DataTable
        columns={columns}
        data={faqs}
        searchKey="question"
        searchPlaceholder="Search FAQ questions..."
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
            <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} onClick={() => { setActiveFaq(row); setIsDeleteOpen(true); }}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Edit FAQ" : "Add New FAQ"}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Question *</label>
            <input type="text" required value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="e.g. Are products cruelty free?" />
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Product Safety, Shipping" />
          </div>

          <div className={styles.formGroup}>
            <label>Display Order #</label>
            <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })} />
          </div>

          <div className={styles.formGroup}>
            <label>Answer Content *</label>
            <textarea rows={4} required value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} />
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save FAQ</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ entry?"
      />
    </div>
  );
}
