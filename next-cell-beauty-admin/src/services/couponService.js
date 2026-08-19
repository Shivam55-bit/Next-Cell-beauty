import { apiClient } from "./apiClient";

export const couponService = {
  getAll: () => apiClient.get("coupons"),
  create: (data) => apiClient.post("coupons", data),
  update: (id, data) => apiClient.put("coupons", id, data),
  delete: (id) => apiClient.delete("coupons", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("coupons", id, { status: nextStatus });
  }
};
