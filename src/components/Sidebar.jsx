import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Heart,
  Mail,
  ListOrdered,
  Layers,
  DollarSign,
  CalendarDays,
  CheckSquare,
  Users,
  Table,
  LifeBuoy,
} from "lucide-react";

const Item = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end
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
        <span className="dot" /> <span className="brand-text">DashStack</span>
      </div>

      <div className="sb-section">
        <div className="sb-cap">MENU</div>
        <Item
          to="/admin"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />
        <Item to="/admin/products" icon={<Box size={18} />} label="Products" />
        <Item
          to="/admin/favorites"
          icon={<Heart size={18} />}
          label="Favorites"
        />
        <Item to="/admin/inbox" icon={<Mail size={18} />} label="Inbox" />
        <Item
          to="/admin/orders"
          icon={<ListOrdered size={18} />}
          label="Order Lists"
        />
        <Item
          to="/admin/stock"
          icon={<Layers size={18} />}
          label="Product Stock"
        />
      </div>

      <div className="sb-section">
        <div className="sb-cap">PAGES</div>
        <Item
          to="/admin/pricing"
          icon={<DollarSign size={18} />}
          label="Pricing"
        />
        <Item
          to="/admin/calendar"
          icon={<CalendarDays size={18} />}
          label="Calender"
        />
        <Item to="/admin/todo" icon={<CheckSquare size={18} />} label="To-Do" />
        <Item to="/admin/team" icon={<Users size={18} />} label="Team" />
        <Item to="/admin/table" icon={<Table size={18} />} label="Table" />
        <Item
          to="/admin/support"
          icon={<LifeBuoy size={18} />}
          label="Contact"
        />
      </div>
    </aside>
  );
}
