import { apiClient } from "./apiClient";

export const comboService = {
  getAll: () => apiClient.get("/admin/combos"),
  getById: (id) => apiClient.get(`/admin/combos/${id}`),
  create: (data) => apiClient.post("/admin/combos", data),
  update: (id, data) => apiClient.put(`/admin/combos/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/combos/${id}`),
  toggleStatus: (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put(`/admin/combos/${id}`, { status: nextStatus });
  }
};
