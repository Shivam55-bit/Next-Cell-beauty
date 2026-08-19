import { useEffect, useState } from "react";
import { Store, User, Bell, CreditCard, Truck, ShieldCheck, Save } from "lucide-react";

import { settingsService } from "../../services/settingsService";
import Toast from "../../components/common/Toast";

import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    storeName: "NEXT CELL BEAUTY",
    logoUrl: "",
    faviconUrl: "",
    supportEmail: "support@nextcellbeauty.com",
    contactPhone: "+91 1800 234 5678",
    address: "Suite 804, Tech Park Tower B, Outer Ring Road, Bengaluru, KA - 560103",
    adminName: "Super Admin",
    adminEmail: "admin@nextcellbeauty.com",
    currentPassword: "",
    newPassword: "",
    orderNotifications: true,
    customerNotifications: true,
    reviewNotifications: true,
    returnNotifications: true,
    currency: "INR (₹)",
    shippingFee: 50,
    freeShippingThreshold: 1499,
    paymentProvider: "Razorpay / Stripe Live",
    testMode: false
  });

  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadSettings = async () => {
    setLoading(true);
    const res = await settingsService.get();
    if (res.data) setSettings((prev) => ({ ...prev, ...res.data }));
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await settingsService.update(settings);
    
    // Also sync localStorage adminUser for Header avatar
    localStorage.setItem("adminUser", JSON.stringify({
      name: settings.adminName,
      email: settings.adminEmail
    }));

    setToast({ message: "Admin settings updated successfully", type: "success" });
  };

  const tabs = [
    { id: "store", label: "Store Settings", icon: Store },
    { id: "profile", label: "Admin Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment", label: "Payment Gateway", icon: CreditCard },
    { id: "shipping", label: "Shipping Settings", icon: Truck },
    { id: "security", label: "Security & Access", icon: ShieldCheck }
  ];

  return (
    <div className={styles.container}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className={styles.headerBar}>
        <div>
          <h2>System Settings & Workspace</h2>
          <p>Configure store profile, administrative credentials, notifications, and shipping rules</p>
        </div>
      </div>

      <div className={styles.settingsLayout}>
        {/* Navigation Tabs */}
        <div className={styles.tabList}>
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.tabBtn} ${activeTab === t.id ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <Icon size={18} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className={styles.tabContent}>
          <form onSubmit={handleSave} className={styles.form}>
            {activeTab === "store" && (
              <div className={styles.sectionGroup}>
                <h3>Store Profile & Contact</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Support Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Contact Helpline Phone</label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Currency Format</label>
                    <input type="text" value={settings.currency} disabled style={{ background: "#f4f7f6" }} />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Physical Office / Warehouse Address</label>
                    <textarea
                      rows={3}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className={styles.sectionGroup}>
                <h3>Admin Profile Credentials</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Super Admin Name</label>
                    <input
                      type="text"
                      value={settings.adminName}
                      onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Admin Email</label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className={styles.sectionGroup}>
                <h3>Automated Admin Alerts</h3>
                <div className={styles.toggleList}>
                  <label className={styles.toggleItem}>
                    <div>
                      <strong>Order Placement Notifications</strong>
                      <span>Receive email notifications whenever a new order is paid</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.orderNotifications}
                      onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                    />
                  </label>

                  <label className={styles.toggleItem}>
                    <div>
                      <strong>Customer Account Alerts</strong>
                      <span>Notify admin on new shopper registration</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.customerNotifications}
                      onChange={(e) => setSettings({ ...settings, customerNotifications: e.target.checked })}
                    />
                  </label>

                  <label className={styles.toggleItem}>
                    <div>
                      <strong>Review Submission Alerts</strong>
                      <span>Alert admin when a customer submits a new product review</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.reviewNotifications}
                      onChange={(e) => setSettings({ ...settings, reviewNotifications: e.target.checked })}
                    />
                  </label>

                  <label className={styles.toggleItem}>
                    <div>
                      <strong>Return Request Alerts</strong>
                      <span>Notify admin immediately when a refund request is filed</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.returnNotifications}
                      onChange={(e) => setSettings({ ...settings, returnNotifications: e.target.checked })}
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className={styles.sectionGroup}>
                <h3>Payment Configuration Structure</h3>
                <p style={{ fontSize: "13px", color: "var(--admin-muted)" }}>
                  Configure checkout gateway endpoints (Razorpay, UPI, Credit Card, COD). Keys are loaded safely via server environment variables.
                </p>

                <div className={styles.formGrid} style={{ marginTop: "16px" }}>
                  <div className={styles.formGroup}>
                    <label>Active Payment Mode</label>
                    <select
                      value={settings.paymentProvider}
                      onChange={(e) => setSettings({ ...settings, paymentProvider: e.target.value })}
                    >
                      <option value="Razorpay / UPI / Cards">Razorpay / UPI / Cards</option>
                      <option value="Stripe Global">Stripe Global</option>
                      <option value="Cash on Delivery Only">Cash on Delivery Only</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Sandbox / Test Environment</label>
                    <select
                      value={settings.testMode ? "true" : "false"}
                      onChange={(e) => setSettings({ ...settings, testMode: e.target.value === "true" })}
                    >
                      <option value="false">Live Production Mode</option>
                      <option value="true">Sandbox Testing Mode</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className={styles.sectionGroup}>
                <h3>Shipping & Delivery Charges</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Standard Flat Shipping Charge (₹)</label>
                    <input
                      type="number"
                      value={settings.shippingFee}
                      onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Free Shipping Minimum Threshold (₹)</label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className={styles.sectionGroup}>
                <h3>Password & Admin Security</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={settings.currentPassword || ""}
                      onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={settings.newPassword || ""}
                      onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formFooter}>
              <button type="submit" className={styles.saveBtn}>
                <Save size={16} /> Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
