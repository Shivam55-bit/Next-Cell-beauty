import { apiClient } from "./apiClient";

export const reviewService = {
  getAll: () => apiClient.get("reviews"),
  updateStatus: (id, status) => apiClient.put("reviews", id, { status }),
  delete: (id) => apiClient.delete("reviews", id)
};
