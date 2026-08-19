// Central API Client for Admin Panel
const getBaseUrl = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://next-cell-beauty-backend.onrender.com/api';
  }
  return 'http://localhost:4001/api';
};

const API_BASE_URL = getBaseUrl();


export const apiClient = {
  getApiBaseUrl() {
    return API_BASE_URL;
  },

  getAuthHeaders() {
    const token = localStorage.getItem("adminToken");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  async get(resource) {
    try {
      const endpoint = resource.startsWith("admin/") ? resource : `admin/${resource}`;
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: { ...this.getAuthHeaders() }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return data;
      }
      return { success: false, message: data.message || `Request failed with status ${res.status}`, data: [] };
    } catch (e) {
      console.error(`API GET Error for ${resource}:`, e);
      return { success: false, message: e.message || "Network error", data: [] };
    }
  },

  async post(resource, newItem) {
    try {
      const endpoint = resource.startsWith("admin/") ? resource : `admin/${resource}`;
      const isFormData = typeof FormData !== "undefined" && newItem instanceof FormData;
      const headers = { ...this.getAuthHeaders() };
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers,
        body: isFormData ? newItem : JSON.stringify(newItem)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return data;
      }
      return { success: false, message: data.message || `Failed to create record (${res.status})` };
    } catch (e) {
      console.error(`API POST Error for ${resource}:`, e);
      return { success: false, message: e.message || "Network error" };
    }
  },

  async put(resource, id, updatedFields) {
    try {
      const endpoint = resource.startsWith("admin/") ? resource : `admin/${resource}`;
      const url = id ? `${API_BASE_URL}/${endpoint}/${id}` : `${API_BASE_URL}/${endpoint}`;
      const isFormData = typeof FormData !== "undefined" && updatedFields instanceof FormData;
      const headers = { ...this.getAuthHeaders() };
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: isFormData ? updatedFields : JSON.stringify(updatedFields)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return data;
      }
      return { success: false, message: data.message || `Failed to update record (${res.status})` };
    } catch (e) {
      console.error(`API PUT Error for ${resource}:`, e);
      return { success: false, message: e.message || "Network error" };
    }
  },

  async delete(resource, id) {
    try {
      const endpoint = resource.startsWith("admin/") ? resource : `admin/${resource}`;
      const url = id ? `${API_BASE_URL}/${endpoint}/${id}` : `${API_BASE_URL}/${endpoint}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { ...this.getAuthHeaders() }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return data;
      }
      return { success: false, message: data.message || `Failed to delete record (${res.status})` };
    } catch (e) {
      console.error(`API DELETE Error for ${resource}:`, e);
      return { success: false, message: e.message || "Network error" };
    }
  }
};
