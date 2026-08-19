import { apiClient } from "./apiClient";

export const policyService = {
  getAll: () => apiClient.get("policies"),
  update: (id, data) => apiClient.put("policies", id, data)
};
