import { apiClient } from "./apiClient";

export const brandService = {
  getAll: () => apiClient.get("brands"),
  create: (data) => apiClient.post("brands", data),
  update: (id, data) => apiClient.put("brands", id, data),
  delete: (id) => apiClient.delete("brands", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("brands", id, { status: nextStatus });
  }
};
