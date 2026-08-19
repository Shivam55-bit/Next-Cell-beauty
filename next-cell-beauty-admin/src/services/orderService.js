import { apiClient } from "./apiClient";

export const orderService = {
  getAll: () => apiClient.get("orders"),
  getById: (id) => apiClient.get(`orders/${id}`),
  updateStatus: async (id, orderStatus, shippingStatus, timelineNote) => {
    const res = await apiClient.get("orders");
    const orders = res.data || [];
    const existing = orders.find((o) => o.id === id);
    
    const newTimelineItem = {
      status: orderStatus,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      note: timelineNote || `Order status updated to ${orderStatus}`
    };
    
    const updatedTimeline = existing?.timeline
      ? [...existing.timeline, newTimelineItem]
      : [newTimelineItem];

    const updatedData = {
      orderStatus,
      ...(shippingStatus ? { shippingStatus } : {}),
      timeline: updatedTimeline
    };

    return apiClient.put("orders", id, updatedData);
  }
};
