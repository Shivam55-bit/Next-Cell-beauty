import { apiClient } from "./apiClient";

export const faqService = {
  getAll: () => apiClient.get("faqs"),
  create: (data) => apiClient.post("faqs", data),
  update: (id, data) => apiClient.put("faqs", id, data),
  delete: (id) => apiClient.delete("faqs", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("faqs", id, { status: nextStatus });
  }
};
