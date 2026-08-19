import { apiClient } from "./apiClient";

export const beforeAfterService = {
  getAll: () => apiClient.get("before-after"),
  getById: (id) => apiClient.get("before-after", id),
  create: (data) => apiClient.post("before-after", data),
  update: (id, data) => apiClient.put("before-after", id, data),
  delete: (id) => apiClient.delete("before-after", id),
  toggleStatus: (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("before-after", id, { status: nextStatus });
  }
};
