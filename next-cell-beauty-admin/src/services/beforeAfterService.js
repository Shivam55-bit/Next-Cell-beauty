import { apiClient } from "./apiClient";

export const beforeAfterService = {
  getAll: () => apiClient.get("/admin/before-after"),
  getById: (id) => apiClient.get(`/admin/before-after/${id}`),
  create: (data) => apiClient.post("/admin/before-after", data),
  update: (id, data) => apiClient.put(`/admin/before-after/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/before-after/${id}`),
  toggleStatus: (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put(`/admin/before-after/${id}`, { status: nextStatus });
  }
};
