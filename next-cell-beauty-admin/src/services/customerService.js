import { apiClient } from "./apiClient";

export const customerService = {
  getAll: () => apiClient.get("customers"),
  getById: (id) => apiClient.get(`customers/${id}`),
  update: (id, data) => apiClient.put("customers", id, data),
  delete: (id) => apiClient.delete("customers", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Disabled" : "Active";
    return apiClient.put("customers", id, { status: nextStatus });
  }
};
