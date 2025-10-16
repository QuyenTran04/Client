import React from "react";
import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <div className="topbar">
      <button className="burger">
        <span />
        <span />
        <span />
      </button>

      <div className="search">
        <Search size={18} />
        <input placeholder="Search" />
      </div>

      <div className="tb-right">
        <button className="icon-btn">
          <Bell size={18} />
          <span className="badge">9</span>
        </button>

        <div className="lang">
          <img src="https://flagcdn.com/w20/gb.png" alt="flag" />
          <span>English</span>
        </div>

        <div className="avatar">
          <img src="https://i.pravatar.cc/40?img=5" alt="avatar" />
          <div className="meta">
            <div className="name">Moni Roy</div>
            <div className="role">Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}
