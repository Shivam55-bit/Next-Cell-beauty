import { apiClient } from "./apiClient";

export const productService = {
  getAll: () => apiClient.get("products"),
  getById: (id) => apiClient.get(`products/${id}`),
  create: (data) => apiClient.post("products", data),
  update: (id, data) => apiClient.put("products", id, data),
  delete: (id) => apiClient.delete("products", id),
  toggleStatus: async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return apiClient.put("products", id, { status: nextStatus });
  },
  duplicate: async (product) => {
    const { id, _id, ...rest } = product;
    const newProduct = {
      ...rest,
      name: `${product.name || product.title} (Copy)`,
      title: `${product.title || product.name} (Copy)`,
      sku: `${product.sku || 'SKU'}-COPY-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split("T")[0]
    };
    return apiClient.post("products", newProduct);
  }
};
