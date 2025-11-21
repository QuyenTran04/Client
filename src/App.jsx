import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// 🏠 Trang chính & public
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import CourseDetail from "./pages/CourseDetail";

import Payment from "./pages/Payment";

import LessonsPage from "./pages/Lessons";
import QuizPage from "./pages/Quiz";
import CreateCourseWithAI from "./pages/CreateCourseWithAI";
import CreateQuiz from "./pages/CreateQuiz";
import AIChat from "./components/AIChat";
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
import { ThemeProvider } from "./context/ThemeContext";
import { AdminRoute, ProtectedRoute, GuestOnly } from "./context/RouteGuards";



// 🧱 Trang quản trị
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import Categories from "./pages/admin/Categories";
import Instructors from "./pages/admin/Instructors";
import Students from "./pages/admin/Students";
import Orders from "./pages/admin/Orders";
import Reviews from "./pages/admin/Reviews";
import Lessons from "./pages/admin/Lessons";
import Quiz from "./pages/admin/Quiz";
import Documents from "./pages/admin/Documents";
import Settings from "./pages/admin/Settings";
import ActivityLogs from "./pages/admin/ActivityLogs";
import Reports from "./pages/admin/Reports";

/**
 * Hiện chatbot nổi ở tất cả trang public, trừ:
 * - /login, /register (tránh che UI form)
 * - /admin/*
 */
function GlobalChatSwitcher() {
  const { pathname } = useLocation();

  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAdmin || isAuthPage) return null;

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

// ======================== APP SHELL ========================
function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {/* Navbar chỉ hiện với trang người dùng, không hiện ở trang login/register */}
      {!isAdmin && !isAuthPage && <NavBar />}

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
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route path="/courses/:id" element={<CourseDetail />} />
          <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/create-ai"
          element={
            <ProtectedRoute>
              <CreateCourseWithAI />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/lessons"
          element={
            <ProtectedRoute>
              <LessonsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons/:id/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />

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
        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <CreateQuiz />
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
          <Route path="categories" element={<Categories />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="students" element={<Students />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Chatbot nổi toàn cục (ẩn ở những trang đã loại trừ) */}
      <GlobalChatSwitcher />
    </>
  );
}

// ======================== APP ROOT ========================
export default function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
