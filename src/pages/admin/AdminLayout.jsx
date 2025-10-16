import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../css/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-wrap">
      <Sidebar />

      <div className="admin-main">
        <Topbar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
