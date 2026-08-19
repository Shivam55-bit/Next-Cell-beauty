import { useEffect, useState } from "react";
import { Eye, Clock, CheckCircle2, Truck, PackageCheck, AlertCircle } from "lucide-react";

import { orderService } from "../../services/orderService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";

import styles from "./OrdersPage.module.css";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadOrders = async () => {
    setLoading(true);
    const res = await orderService.getAll();
    if (res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setUpdatingStatus(order.orderStatus);
    setStatusNote("");
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    await orderService.updateStatus(selectedOrder.id, updatingStatus, null, statusNote);
    setToast({ message: `Order #${selectedOrder.id} status updated to ${updatingStatus}`, type: "success" });
    setIsDetailsOpen(false);
    loadOrders();
  };

  const columns = [
    {
      label: "Order ID",
      key: "id",
      render: (row) => <strong style={{ color: "var(--admin-heading)" }}>{row.id}</strong>
    },
    {
      label: "Customer",
      key: "customerName",
      render: (row) => (
        <div>
          <strong style={{ fontSize: "13px", color: "var(--admin-heading)", display: "block" }}>{row.customerName}</strong>
          <small style={{ color: "var(--admin-muted)", fontSize: "11px" }}>{row.customerEmail}</small>
        </div>
      )
    },
    { label: "Date", key: "date" },
    {
      label: "Items",
      key: "products",
      render: (row) => `${row.products?.length || 0} product(s)`
    },
    {
      label: "Total Amount",
      key: "totalAmount",
      render: (row) => <strong style={{ color: "var(--admin-green)" }}>₹{row.totalAmount?.toLocaleString()}</strong>
    },
    { label: "Payment Status", key: "paymentStatus", render: (row) => <StatusBadge status={row.paymentStatus} /> },
    { label: "Order Status", key: "orderStatus", render: (row) => <StatusBadge status={row.orderStatus} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Order Management</h2>
          <p>Track store checkout orders, shipping dispatch, and payment status updates</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKey="customerName"
        searchPlaceholder="Search by customer or Order ID..."
        statusFilterKey="orderStatus"
        statusOptions={STATUS_OPTIONS}
        loading={loading}
        actions={(row) => (
          <button type="button" className={styles.viewBtn} onClick={() => handleOpenDetails(row)}>
            <Eye size={15} />
            View Order
          </button>
        )}
      />

      {/* Order Details & Timeline Drawer */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title={`Order Details #${selectedOrder?.id}`} drawer>
        {selectedOrder && (
          <div className={styles.detailsBody}>
            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className={styles.statusBox}>
              <strong>Update Order Status</strong>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <select
                  value={updatingStatus}
                  onChange={(e) => setUpdatingStatus(e.target.value)}
                  className={styles.statusSelect}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <button type="submit" className={styles.updateBtn}>Update</button>
              </div>
              <input
                type="text"
                placeholder="Add optional internal note..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className={styles.noteInput}
              />
            </form>

            {/* Customer Info */}
            <div className={styles.sectionCard}>
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> {selectedOrder.customerName || selectedOrder.customer?.name || selectedOrder.shippingAddress?.fullName || "Guest Customer"}</p>
              <p><strong>Email:</strong> {selectedOrder.customerEmail || selectedOrder.customer?.email || "N/A"}</p>
              <p><strong>Phone:</strong> {selectedOrder.customerPhone || selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone || "N/A"}</p>
              <div>
                <strong>Shipping Address:</strong>{" "}
                {typeof selectedOrder.shippingAddress === "object" && selectedOrder.shippingAddress !== null ? (
                  <div style={{ marginTop: "6px", padding: "8px 12px", background: "var(--admin-bg, #f8fafc)", borderRadius: "8px", border: "1px solid var(--admin-border, #e2e8f0)", color: "var(--admin-heading, #1e293b)", fontSize: "12px", lineHeight: "1.6" }}>
                    {selectedOrder.shippingAddress.fullName && <div><strong>{selectedOrder.shippingAddress.fullName}</strong></div>}
                    <div>{[selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.addressLine1 || selectedOrder.shippingAddress.street, selectedOrder.shippingAddress.addressLine2].filter(Boolean).join(", ")}</div>
                    {selectedOrder.shippingAddress.landmark && <div>Landmark: {selectedOrder.shippingAddress.landmark}</div>}
                    <div>{[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state, selectedOrder.shippingAddress.postalCode || selectedOrder.shippingAddress.zipCode].filter(Boolean).join(" - ")}</div>
                    {selectedOrder.shippingAddress.phone && <div>Phone: {selectedOrder.shippingAddress.phone}</div>}
                  </div>
                ) : (
                  <span>{selectedOrder.shippingAddress || "N/A"}</span>
                )}
              </div>
            </div>

            {/* Ordered Products */}
            <div className={styles.sectionCard}>
              <h4>Ordered Items</h4>
              <div className={styles.itemsList}>
                {(selectedOrder.products || selectedOrder.items || []).map((item, idx) => {
                  const itemName = item.name || item.productName || item.product?.name || "Product";
                  const itemQty = Number(item.quantity || 1);
                  const itemPrice = Number(item.price || item.salePrice || 0);
                  return (
                    <div key={idx} className={styles.itemRow}>
                      <div>
                        <strong>{itemName}</strong>
                        <small>Qty: {itemQty} x ₹{itemPrice.toLocaleString()}</small>
                      </div>
                      <strong>₹{(itemQty * itemPrice).toLocaleString()}</strong>
                    </div>
                  );
                })}
              </div>

              <div className={styles.billSummary}>
                <div><span>Subtotal:</span> ₹{Number(selectedOrder.subtotal ?? selectedOrder.totalAmount ?? 0).toLocaleString()}</div>
                <div><span>Discount ({typeof selectedOrder.couponCode === 'string' ? selectedOrder.couponCode : (selectedOrder.coupon?.code || "None")}):</span> -₹{Number(selectedOrder.discount || 0).toLocaleString()}</div>
                <div><span>Tax (GST):</span> +₹{Number(selectedOrder.tax || 0).toLocaleString()}</div>
                <div><span>Shipping Charge:</span> +₹{Number(selectedOrder.shippingCharge || 0).toLocaleString()}</div>
                <hr />
                <div className={styles.finalTotal}>
                  <span>Total Amount Paid:</span>
                  <strong>₹{Number(selectedOrder.totalAmount ?? selectedOrder.grandTotal ?? 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className={styles.sectionCard}>
              <h4>Order Timeline</h4>
              <div className={styles.timeline}>
                {(selectedOrder.timeline || []).map((step, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong>{typeof step === 'object' ? (step.status || step.title || "Updated") : String(step)}</strong>
                      <small>{typeof step === 'object' ? (step.date || step.timestamp || "") : ""}</small>
                      <p>{typeof step === 'object' ? (step.note || step.description || "") : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
