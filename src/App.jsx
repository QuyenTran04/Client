import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NavBar from "./components/NavBar";
import AuthProvider from "./context/AuthContext";
import { AdminRoute, ProtectedRoute, GuestOnly } from "./context/RouteGuards";

import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import AIChat from "./components/AIChat";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses"; // dùng tên khác với trang public

/**
 * Hiện chatbot nổi ở tất cả trang public, trừ:
 * - /courses/:id (đã có drawer trong CourseDetail)
 * - /login, /register (tránh che UI form)
 * - /admin/*
 */
function GlobalChatSwitcher() {
  const { pathname } = useLocation();

  const isAdmin = pathname.startsWith("/admin");
  const isCourseDetail = /^\/courses\/[^/]+$/.test(pathname);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAdmin || isCourseDetail || isAuthPage) return null;

  return (
    <AIChat
      layout="floating"
      title="Hỗ trợ học tập"
      page="global"
      language="vi"
      // Không truyền courseId/lessonId => nhánh tư vấn chung trên n8n
    />
  );
}

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

        {/* Admin (bọc bằng AdminRoute) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="courses" element={<AdminCourses />} />

          {/* Các placeholder để sidebar không lỗi */}
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

      {/* Chatbot nổi toàn cục (ẩn ở những trang đã loại trừ) */}
      <GlobalChatSwitcher />
    </>
  );
}

export default function App() {
  // Nếu BrowserRouter đã bọc ở main.jsx thì giữ nguyên.
  // Bọc AuthProvider ở đây để toàn app có context user.
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
