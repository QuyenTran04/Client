import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <Link to="/" className="brand">
        LMS
      </Link>
      <div className="spacer" />
      {user ? (
        <>
          <span className="user">Xin chào, {user.name}</span>
          <button onClick={logout}>Đăng xuất</button>
        </>
      ) : (
        <>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register" className="btn">
            Đăng ký
          </Link>
        </>
      )}
    </nav>
  );
}
