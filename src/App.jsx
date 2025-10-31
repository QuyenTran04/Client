import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// 🏠 Trang chính & public
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";

// 🧭 Thành phần giao diện chung
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

// 🧩 Các UI components
import CategoryFilter from "./components/CategoryFilter";
import SubjectFilter from "./components/SubjectFilter";
import SearchInput from "./components/SearchInput";
import SearchSortBar from "./components/SearchSortBar";
import CourseGrid from "./components/CourseGrid";
import CourseCard from "./components/CourseCard";
import CTA from "./components/CTA";

// 🤖 Companions (AI)
import CompanionCard from "./components/CompanionCard";
import CompanionComponent from "./components/CompanionComponent";
import CompanionForm from "./components/CompanionForm";
import CompanionsList from "./components/CompanionsList";

// 🔐 Context và route bảo vệ
import AuthProvider from "./context/AuthContext";
import { AdminRoute, ProtectedRoute, GuestOnly } from "./context/RouteGuards";

// 🧱 Trang quản trị
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";

// ======================== APP SHELL ========================
function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Navbar chỉ hiện với trang người dùng */}
      {!isAdmin && <NavBar />}

      <Routes>
        {/* PUBLIC */}
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

        {/* USER ZONE */}
        <Route
          path="/companions"
          element={
            <ProtectedRoute>
              <CompanionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companions/new"
          element={
            <ProtectedRoute>
              <CompanionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companions/:id"
          element={
            <ProtectedRoute>
              <CompanionComponent />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ZONE */}
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
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// ======================== APP ROOT ========================
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
