import React from "react";
import { Bell, Search, Sun, Settings } from "lucide-react";

export default function Topbar() {
  const todayLabel = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="topbar">
      <div className="topbar__left">
        <div>
          <p className="topbar__eyebrow">Bảng điều khiển</p>
          <h2>Chào buổi sáng, Moni</h2>
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
        <button type="button" className="icon-btn" aria-label="Thông báo">
          <Bell size={18} />
          <span className="badge">9</span>
        </button>

        <div className="avatar-block">
          <img src="https://i.pravatar.cc/80?img=5" alt="Moni Roy" loading="lazy" />
          <div className="meta">
            <p>Moni Roy</p>
            <small>Quản trị viên</small>
          </div>
        </div>
      </div>
    </div>
  );
}
