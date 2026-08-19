import { apiClient } from "./apiClient";

export const comboService = {
  getAll: () => apiClient.get("combos"),
  getById: (id) => apiClient.get("combos", id),
  create: (data) => apiClient.post("combos", data),
  update: (id, data) => apiClient.put("combos", id, data),
  delete: (id) => apiClient.delete("combos", id),
  toggleStatus: (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("combos", id, { status: nextStatus });
  }
};
