import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../css/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-wrap flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="admin-main flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0">
          <Topbar />
        </header>

        {/* Scrollable content area */}
        <main className="admin-content flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
