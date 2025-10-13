// src/components/NavBar.jsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/navbar.css";
export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container nav-wrap">
        {/* Logo */}
        <Link to="/" className="brand">
          
          <span>Elearn</span>
        </Link>

        {/* Menu chính */}
        <ul className="menu">
          <li>
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/about">Giới thiệu</NavLink>
          </li>
          <li>
            <NavLink to="/courses">Khóa học</NavLink>
          </li>
          <li>
            <NavLink to="/blog">Blog</NavLink>
          </li>
          <li>
            <NavLink to="/contact">Liên hệ</NavLink>
          </li>
        </ul>

        {/* Phần phải */}
        <div className="auth-actions">
          {user ? (
            <>
              <span className="user">Xin chào, {user.name}</span>
              <button className="btn logout" onClick={logout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
