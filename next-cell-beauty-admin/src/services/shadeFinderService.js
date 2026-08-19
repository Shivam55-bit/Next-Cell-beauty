import { apiClient } from "./apiClient";

export const shadeFinderService = {
  getQuestions: () => apiClient.get("shade-finder/questions"),
  getResults: () => apiClient.get("shade-finder/results"),
  getAdminQuestions: () => apiClient.get("shade-finder/questions"),
  createQuestion: (data) => apiClient.post("shade-finder/questions", data),
  updateQuestion: (id, data) => apiClient.put("shade-finder/questions", id, data),
  deleteQuestion: (id) => apiClient.delete("shade-finder/questions", id),
  getAdminResults: () => apiClient.get("shade-finder/results"),
  createResult: (data) => apiClient.post("shade-finder/results", data),
  updateResult: (id, data) => apiClient.put("shade-finder/results", id, data),
  deleteResult: (id) => apiClient.delete("shade-finder/results", id),
  toggleStatus: async (id, currentStatus, type = "question") => {
    const nextStatus = currentStatus === "ACTIVE" || currentStatus === "Active" ? "INACTIVE" : "ACTIVE";
    const resource = type === "result" ? "shade-finder/results" : "shade-finder/questions";
    return apiClient.put(resource, id, { status: nextStatus });
  }
};
