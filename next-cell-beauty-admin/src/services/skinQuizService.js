import { apiClient } from "./apiClient";

export const skinQuizService = {
  // ─── Questions (admin endpoints) ───────────────────────────────────────────
  getAdminQuestions: () => apiClient.get("admin/skin-quiz"),
  createQuestion: (data) => apiClient.post("admin/skin-quiz", data),
  updateQuestion: (id, data) => apiClient.put("admin/skin-quiz", id, data),
  deleteQuestion: (id) => apiClient.delete("admin/skin-quiz", id),

  // ─── Results (admin endpoints) ─────────────────────────────────────────────
  getAdminResults: () => apiClient.get("admin/skin-quiz/results"),
  createResult: (data) => apiClient.post("admin/skin-quiz/results", data),
  updateResult: (id, data) => apiClient.put("admin/skin-quiz/results", id, data),
  deleteResult: (id) => apiClient.delete("admin/skin-quiz/results", id),

  // ─── Bulk reorder ──────────────────────────────────────────────────────────
  reorderQuestions: async (orderedIds) => {
    try {
      const endpoint = "admin/skin-quiz/reorder";
      const url = `${apiClient.getApiBaseUrl()}/${endpoint}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...apiClient.getAuthHeaders() },
        body: JSON.stringify({ orderedIds }),
      });
      const data = await res.json().catch(() => ({}));
      return res.ok ? data : { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // ─── Toggle status ─────────────────────────────────────────────────────────
  toggleStatus: async (id, currentStatus, type = "question") => {
    const nextStatus = currentStatus === "ACTIVE" || currentStatus === "Active" ? "INACTIVE" : "ACTIVE";
    const resource = type === "result" ? "admin/skin-quiz/results" : "admin/skin-quiz";
    return apiClient.put(resource, id, { status: nextStatus });
  },
};
