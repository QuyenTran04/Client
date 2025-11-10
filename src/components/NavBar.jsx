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
          {/* <img src="/logo.svg" alt="Elearn" className="logo" /> */}
          <span>Elearn</span>
        </Link>

        {/* Menu chính */}
        <ul className="menu">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses">Courses</NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/my-courses">My Courses</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/instructors">Instructors</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          <li>
            <NavLink to="/contact">Contact</NavLink>
          </li>
        </ul>

        {/* Search + Auth */}
        <div className="right-row">
          <div className="nav-search">
            <input className="nav-input" placeholder="Search courses..." />
          </div>
          {user && (
            <Link to="/courses/create-ai" className="btn ai-course">
              Create AI Course
            </Link>
          )}
          {user ? (
            <>
              <div className="userbox">
                <div className="avatar" title={user.name}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="user hide-sm">{user.name}</span>
              </div>
              <button className="btn logout" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn login">Login</Link>
              <Link to="/register" className="btn register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
