// src/components/NavBar.jsx
import { Link, NavLink } from "react-router-dom";
import React from "react";
import { useAuth } from "../context/AuthContext";
import "../css/navbar.css";
export default function NavBar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-wrap">
        {/* Logo */}
        <Link to="/" className="brand">
          {/* <img src="/logo.svg" alt="Elearn" className="logo" /> */}
          <span>AlphaLearn</span>
        </Link>

        {/* Mobile menu toggle */}
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Menu chính */}
        <ul className={`menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
          </li>
          <li>
            {user ? (
              <NavLink to="/my-courses">Khóa học</NavLink>
            ) : (
              <Link to="/login">Khóa học</Link>
            )}
          </li>
          <li>
            <NavLink to="/instructors">Giảng viên</NavLink>
          </li>
          <li>
            <NavLink to="/about">Về chúng tôi</NavLink>
          </li>
        </ul>

        {/* Tìm kiếm + Xác thực */}
        <div className="right-row">
          {user && (
            <>
              <Link to="/courses/create-ai" className="btn ai-course desktop-only">
                Tạo khóa học AI
              </Link>
              <Link to="/create-quiz" className="btn ai-course desktop-only">
                Tạo trắc nghiệm
              </Link>
            </>
          )}
          {user ? (
            <>
              <div className="userbox">
                <div className="avatar" title={user.name}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="user hide-sm">{user.name}</span>
              </div>
              <button className="btn logout" onClick={logout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn register desktop-only">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
