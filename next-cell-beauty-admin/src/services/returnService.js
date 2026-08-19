import { apiClient } from "./apiClient";

export const returnService = {
  getAll: () => apiClient.get("returns"),
  updateStatus: (id, returnStatus, refundStatus, adminNote) => {
    return apiClient.put("returns", id, {
      returnStatus,
      ...(refundStatus ? { refundStatus } : {}),
      ...(adminNote ? { adminNote } : {})
    });
  }
};
