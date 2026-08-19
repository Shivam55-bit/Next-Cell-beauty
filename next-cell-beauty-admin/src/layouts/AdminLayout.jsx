import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import styles from "./AdminLayout.module.css";

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={styles.adminLayout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() =>
          setSidebarCollapsed((current) => !current)
        }
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`${styles.mainArea} ${
          sidebarCollapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;