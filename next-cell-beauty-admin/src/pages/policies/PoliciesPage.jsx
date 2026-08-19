import { useEffect, useState } from "react";
import { Save, Eye, FileText, CheckCircle2 } from "lucide-react";

import { policyService } from "../../services/policyService";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";

import styles from "./PoliciesPage.module.css";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activePolicyId, setActivePolicyId] = useState("privacy-policy");
  const [editForm, setEditForm] = useState({ title: "", content: "", status: "Published" });
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadPolicies = async () => {
    setLoading(true);
    const res = await policyService.getAll();
    if (res.data) {
      setPolicies(res.data);
      const current = res.data.find((p) => p.id === activePolicyId) || res.data[0];
      if (current) {
        setActivePolicyId(current.id);
        setEditForm({ title: current.title, content: current.content, status: current.status });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleSelectPolicy = (p) => {
    setActivePolicyId(p.id);
    setEditForm({ title: p.title, content: p.content, status: p.status });
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    const updatedDate = new Date().toISOString().split("T")[0];

    await policyService.update(activePolicyId, {
      ...editForm,
      lastUpdated: updatedDate
    });

    setToast({ message: `${editForm.title} saved and published successfully`, type: "success" });
    loadPolicies();
  };

  const activePolicy = policies.find((p) => p.id === activePolicyId);

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Site Legal & Policy CMS</h2>
          <p>Update privacy policy, terms, return policy, and legal compliance disclaimers</p>
        </div>
      </div>

      <div className={styles.editorLayout}>
        {/* Sidebar Selector */}
        <div className={styles.policyNav}>
          <span className={styles.navHeading}>SELECT POLICY</span>
          {policies.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.navItem} ${p.id === activePolicyId ? styles.activeNavItem : ""}`}
              onClick={() => handleSelectPolicy(p)}
            >
              <FileText size={16} />
              <div>
                <strong>{p.title}</strong>
                <small>Last updated: {p.lastUpdated}</small>
              </div>
            </button>
          ))}
        </div>

        {/* Editor Main */}
        <div className={styles.editorMain}>
          {loading ? (
            <div className={styles.loadingState}>Loading policy document...</div>
          ) : (
            <form onSubmit={handleSavePolicy} className={styles.editorForm}>
              <div className={styles.editorHeader}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className={styles.titleInput}
                  />
                  <small style={{ color: "var(--admin-muted)", display: "block", marginTop: "4px" }}>
                    Last saved: {activePolicy?.lastUpdated || "N/A"}
                  </small>
                </div>

                <div className={styles.actionBtns}>
                  <button type="button" className={styles.previewBtn} onClick={() => setIsPreviewOpen(true)}>
                    <Eye size={15} /> Preview
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    <Save size={15} /> Save & Publish
                  </button>
                </div>
              </div>

              <div className={styles.contentBox}>
                <label>Legal Document Content (Markdown / HTML supported)</label>
                <textarea
                  rows={16}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className={styles.contentArea}
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={`Preview: ${editForm.title}`} maxWidth="720px">
        <div className={styles.previewContainer}>
          <h3>{editForm.title}</h3>
          <small style={{ color: "var(--admin-muted)" }}>Last updated: {activePolicy?.lastUpdated}</small>
          <hr style={{ margin: "16px 0", borderColor: "var(--admin-border)" }} />
          <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.7", color: "var(--admin-text)" }}>
            {editForm.content}
          </div>
        </div>
      </Modal>
    </div>
  );
}
