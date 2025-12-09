import React from "react";
import { Link, NavLink } from "react-router-dom";
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
  FileText,
  Settings as SettingsIcon,
  Clock,
  TrendingUp,
  Megaphone,
  Award,
  PieChart,
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
      <div className="sidebar__brand">
        <div className="brand-logo">AL</div>
        <div>
          <p className="brand-name">AlphaLearn</p>
          <small>Admin Suite</small>
        </div>
      </div>
      <p className="sidebar__tagline">
        Giám sát lộ trình đào tạo, học viên và doanh thu theo thời gian thực.
      </p>

      <div className="sb-section sidebar__section">
        <div className="sb-cap">TỔNG QUAN</div>
        <Item to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
      </div>

      <div className="sb-section sidebar__section">
        <div className="sb-cap">NỘI DUNG</div>
        <Item to="/admin/courses" icon={<BookOpen size={18} />} label="Khóa học" />
        <Item to="/admin/categories" icon={<Tag size={18} />} label="Danh mục" />
      </div>

      <div className="sb-section sidebar__section">
        <div className="sb-cap">NGƯỜI DÙNG</div>
        <Item
          to="/admin/users"
          icon={<Users size={18} />}
          label="Quản lý người dùng"
        />
      </div>

      <div className="sb-section sidebar__section">
        <div className="sb-cap">KINH DOANH</div>
        <Item to="/admin/orders" icon={<ShoppingBag size={18} />} label="Đơn hàng" />
        <Item to="/admin/reviews" icon={<Star size={18} />} label="Đánh giá" />
        <Item to="/admin/analytics" icon={<PieChart size={18} />} label="Phân tích" />
        <Item to="/admin/reports" icon={<TrendingUp size={18} />} label="Báo cáo" />
      </div>

      <div className="sb-section sidebar__section">
        <div className="sb-cap">HỆ THỐNG</div>
        <Item to="/admin/announcements" icon={<Megaphone size={18} />} label="Thông báo" />
        <Item to="/admin/certificates" icon={<Award size={18} />} label="Chứng chỉ" />
        <Item to="/admin/documents" icon={<FileText size={18} />} label="Tài liệu" />
        <Item
          to="/admin/activity-logs"
          icon={<Clock size={18} />}
          label="Nhật ký"
        />
        <Item to="/admin/settings" icon={<SettingsIcon size={18} />} label="Cài đặt" />
      </div>

      <div className="sidebar__panel">
        <p className="sidebar__panel-title">Trạng thái hệ thống</p>
        <span className="sidebar__status success">Đang hoạt động</span>
        <small>Đồng bộ lần cuối 5 phút trước</small>
        <Link to="/admin/settings">Trung tâm cài đặt</Link>
      </div>
    </aside>
  );
}
