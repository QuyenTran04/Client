import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NavBar from "./components/NavBar";
//import { useAuth } from "./context/AuthContext";
import AuthProvider from "./context/AuthContext";
import { AdminRoute, ProtectedRoute, GuestOnly } from "./context/RouteGuards";
 // đã tạo ở bước trước
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import AIChat from "./components/AIChat";
// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses"; // <— tránh trùng với trang public



function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
      {/* Ẩn NavBar trong admin area */}
      {!isAdmin && <NavBar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />
          {/* bạn có thể tạo thêm pages rỗng để Sidebar không lỗi */}
          <Route path="products" element={<div />} />
          <Route path="favorites" element={<div />} />
          <Route path="inbox" element={<div />} />
          <Route path="orders" element={<div />} />
          <Route path="stock" element={<div />} />
          <Route path="pricing" element={<div />} />
          <Route path="calendar" element={<div />} />
          <Route path="todo" element={<div />} />
          <Route path="team" element={<div />} />
          <Route path="table" element={<div />} />
          <Route path="support" element={<div />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  // Nếu bạn đã bọc BrowserRouter + QueryClientProvider ở main.jsx thì giữ nguyên.
  // Ở đây chỉ trả về AppShell.
  return <AppShell />;
}
