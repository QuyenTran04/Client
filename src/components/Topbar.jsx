import React from "react";
import { Search, Sun, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

export default function Topbar() {
  const { user } = useAuth();

  // Lấy lời chào theo thời gian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 17) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Định dạng ngày
  const todayLabel = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  // Lấy avatar từ user hoặc dùng avatar mặc định
  const avatarUrl = user?.avatar || `https://i.pravatar.cc/80?u=${user?.email || 'admin'}`;

  return (
    <div className="topbar">
      <div className="topbar__left">
        <div>
          <p className="topbar__eyebrow">Bảng điều khiển</p>
          <h2>{getGreeting()}, {user?.name || user?.email?.split('@')[0] || 'Admin'}</h2>
          <span className="topbar__date">{todayLabel}</span>
        </div>
      </div>

      <div className="topbar__search">
        <Search size={18} />
        <input
          placeholder="Tìm khóa học, học viên, báo cáo..."
          aria-label="Tìm kiếm"
        />
      </div>

      <div className="topbar__actions">
        <button type="button" className="icon-btn ghost" aria-label="Chế độ hiển thị">
          <Sun size={18} />
        </button>
        <button type="button" className="icon-btn ghost" aria-label="Mở cài đặt nhanh">
          <Settings size={18} />
        </button>
        <NotificationDropdown />

        <div className="avatar-block">
          <img
            src={avatarUrl}
            alt={user?.name || 'Admin'}
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://i.pravatar.cc/80?img=5";
            }}
          />
          <div className="meta">
            <p>{user?.name || user?.email?.split('@')[0] || 'Admin'}</p>
            <small>
              {user?.role === 'admin' ? 'Quản trị viên' :
               user?.role === 'instructor' ? 'Người tạo nội dung' :
               'Thành viên'}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
