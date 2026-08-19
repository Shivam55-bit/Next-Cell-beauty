import { apiClient } from "./apiClient";

export const bannerService = {
  getAll: () => apiClient.get("banners"),
  create: (data) => apiClient.post("banners", data),
  update: (id, data) => apiClient.put("banners", id, data),
  delete: (id) => apiClient.delete("banners", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("banners", id, { status: nextStatus });
  }
};
