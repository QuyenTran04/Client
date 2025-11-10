import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ShoppingBag,
  Star,
  Folder,
  BarChart3,
  Tag,
} from "lucide-react";

const Item = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === "/admin"}
    className={({ isActive }) => "sb-item " + (isActive ? "active" : "")}
  >
    <span className="sb-ic">{icon}</span>
    <span className="sb-txt">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="dot" /> <span className="brand-text">Nền tảng học tập</span>
      </div>

      <div className="sb-section">
        <div className="sb-cap">THỐNG KÊ</div>
        <Item
          to="/admin"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />
      </div>

      <div className="sb-section">
        <div className="sb-cap">QUẢN LÝ NỘI DUNG</div>
        <Item
          to="/admin/courses"
          icon={<BookOpen size={18} />}
          label="Khóa học"
        />
        <Item
          to="/admin/categories"
          icon={<Tag size={18} />}
          label="Danh mục"
        />
        <Item
          to="/admin/lessons"
          icon={<Folder size={18} />}
          label="Bài học"
        />
        <Item
          to="/admin/quiz"
          icon={<BarChart3 size={18} />}
          label="Quiz"
        />
      </div>

      <div className="sb-section">
        <div className="sb-cap">QUẢN LÝ NGƯỜI DÙNG</div>
        <Item
          to="/admin/users"
          icon={<Users size={18} />}
          label="Tất cả người dùng"
        />
        <Item
          to="/admin/instructors"
          icon={<GraduationCap size={18} />}
          label="Giảng viên"
        />
        <Item
          to="/admin/students"
          icon={<Users size={18} />}
          label="Học viên"
        />
      </div>

      <div className="sb-section">
        <div className="sb-cap">QUẢN LÝ KINH DOANH</div>
        <Item
          to="/admin/orders"
          icon={<ShoppingBag size={18} />}
          label="Đơn hàng"
        />
        <Item
          to="/admin/reviews"
          icon={<Star size={18} />}
          label="Đánh giá"
        />
      </div>
    </aside>
  );
}
