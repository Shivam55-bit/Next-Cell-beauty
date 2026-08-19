import { apiClient } from "./apiClient";

export const categoryService = {
  getAll: () => apiClient.get("categories"),
  create: (data) => apiClient.post("categories", data),
  update: (id, data) => apiClient.put("categories", id, data),
  delete: (id) => apiClient.delete("categories", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("categories", id, { status: nextStatus });
  }
};
