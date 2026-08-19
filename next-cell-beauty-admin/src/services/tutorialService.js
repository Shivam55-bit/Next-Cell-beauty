import { apiClient } from "./apiClient";

export const tutorialService = {
  getAll: () => apiClient.get("tutorials"),
  create: (data) => apiClient.post("tutorials", data),
  update: (id, data) => apiClient.put("tutorials", id, data),
  delete: (id) => apiClient.delete("tutorials", id),
  togglePublish: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    return apiClient.put("tutorials", id, { status: nextStatus });
  },
  toggleFeatured: (id) => apiClient.put(`tutorials/${id}/featured`, null, {})
};
