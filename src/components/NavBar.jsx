// src/components/NavBar.jsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";
import "../css/navbar.css";
export default function NavBar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-wrap">
        {/* Logo */}
        <Link to="/" className="brand">
          {/* <img src="/logo.svg" alt="Elearn" className="logo" /> */}
          <span>AutoLearn</span>
        </Link>

        {/* Menu chính */}
        <ul className="menu">
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
            <NavLink to="/about">Về chúng tôi</NavLink>
          </li>
        </ul>

        {/* Tìm kiếm + Xác thực */}
        <div className="right-row">
          {user && (
            <Link to="/courses/create-ai" className="btn ai-course desktop-only">
              Tạo khóa học AI
            </Link>
          )}
          {user ? (
            <>
              <UserDropdown />
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
