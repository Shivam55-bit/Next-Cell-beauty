import { useEffect, useState } from "react";
import { Eye, Edit2, Trash2, Power, UserCheck, Mail, Phone, MapPin } from "lucide-react";

import { customerService } from "../../services/customerService";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import styles from "./CustomersPage.module.css";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", status: "Active" });
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadCustomers = async () => {
    setLoading(true);
    const res = await customerService.getAll();
    if (res.data) setCustomers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenDetails = (c) => {
    setSelectedCustomer(c);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (c) => {
    setSelectedCustomer(c);
    setFormData({ name: c.name, email: c.email, phone: c.phone || "", status: c.status || "Active" });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (c) => {
    setSelectedCustomer(c);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (c) => {
    await customerService.toggleStatus(c.id, c.status);
    setToast({ message: `Account status updated for ${c.name}`, type: "success" });
    loadCustomers();
  };

  const handleDeleteConfirm = async () => {
    if (selectedCustomer) {
      await customerService.delete(selectedCustomer.id);
      setToast({ message: "Customer profile deleted successfully", type: "success" });
      loadCustomers();
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (selectedCustomer) {
      await customerService.update(selectedCustomer.id, formData);
      setToast({ message: "Customer profile updated successfully", type: "success" });
      setIsEditOpen(false);
      loadCustomers();
    }
  };

  const columns = [
    {
      label: "Customer",
      key: "name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--admin-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px" }}>
            {row.name?.charAt(0) || "U"}
          </div>
          <div>
            <strong style={{ display: "block", color: "var(--admin-heading)", fontSize: "13px" }}>{row.name}</strong>
            <small style={{ color: "var(--admin-muted)", fontSize: "11px" }}>{row.email}</small>
          </div>
        </div>
      )
    },
    { label: "Phone", key: "phone", render: (row) => row.phone || "N/A" },
    { label: "Orders", key: "totalOrders", render: (row) => `${row.totalOrders || 0} orders` },
    { label: "Total Spent", key: "totalSpent", render: (row) => <strong style={{ color: "var(--admin-green)" }}>₹{row.totalSpent?.toLocaleString() || 0}</strong> },
    { label: "Registered", key: "registrationDate" },
    { label: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>Customer Account Management</h2>
          <p>Monitor shopper registrations, purchase activity, and account status</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customer by name or email..."
        statusOptions={["Active", "Disabled"]}
        loading={loading}
        actions={(row) => (
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
            <button type="button" className={styles.iconBtn} title="View Details" onClick={() => handleOpenDetails(row)}>
              <Eye size={15} />
            </button>
            <button type="button" className={styles.iconBtn} title="Edit Profile" onClick={() => handleOpenEdit(row)}>
              <Edit2 size={15} />
            </button>
            <button type="button" className={styles.iconBtn} title="Enable/Disable" onClick={() => handleToggleStatus(row)}>
              <Power size={15} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.dangerIcon}`} title="Delete" onClick={() => handleOpenDelete(row)}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* Customer Details Drawer */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Customer Profile Details" drawer>
        {selectedCustomer && (
          <div className={styles.drawerBody}>
            <div className={styles.profileCard}>
              <div className={styles.largeAvatar}>
                {selectedCustomer.name?.charAt(0) || "U"}
              </div>
              <h3>{selectedCustomer.name}</h3>
              <StatusBadge status={selectedCustomer.status} />
            </div>

            <div className={styles.sectionCard}>
              <h4>Contact & Registration</h4>
              <p><Mail size={14} /> {selectedCustomer.email}</p>
              <p><Phone size={14} /> {selectedCustomer.phone || "N/A"}</p>
              <p>Registered on: {selectedCustomer.registrationDate}</p>
            </div>

            <div className={styles.sectionCard}>
              <h4>Activity Summary</h4>
              <p><strong>Total Orders:</strong> {selectedCustomer.totalOrders || 0}</p>
              <p><strong>Lifetime Value:</strong> ₹{selectedCustomer.totalSpent?.toLocaleString() || 0}</p>
              <p><strong>Last Order Date:</strong> {selectedCustomer.lastOrderDate || "N/A"}</p>
            </div>

            <div className={styles.sectionCard}>
              <h4>Saved Shipping Addresses</h4>
              {selectedCustomer.addresses?.map((addr, idx) => (
                <div key={idx} className={styles.addrBox}>
                  <MapPin size={14} />
                  <span>{addr}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Account">
        <form onSubmit={handleSaveEdit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Customer Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          <div className={styles.formFooter}>
            <button type="button" onClick={() => setIsEditOpen(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Account"
        message={`Are you sure you want to delete profile for "${selectedCustomer?.name}"?`}
      />
    </div>
  );
}
