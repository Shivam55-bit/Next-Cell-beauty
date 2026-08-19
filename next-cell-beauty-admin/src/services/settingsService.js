import { apiClient } from "./apiClient";

export const settingsService = {
  get: () => apiClient.get("settings"),
  update: (data) => apiClient.put("settings", null, data)
};
