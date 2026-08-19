import { apiClient } from "./apiClient";

export const blogService = {
  getAll: () => apiClient.get("blogs"),
  create: (data) => apiClient.post("blogs", data),
  update: (id, data) => apiClient.put("blogs", id, data),
  delete: (id) => apiClient.delete("blogs", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    return apiClient.put("blogs", id, { status: nextStatus });
  }
};
