import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// 🏠 Trang chính & public
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import CourseDetail from "./pages/CourseDetail";

import Payment from "./pages/Payment";
import TopUp from "./pages/TopUp.jsx";
import Profile from "./pages/Profile.jsx";
import WalletCard from "./components/WalletCard.jsx";

import LessonsPage from "./pages/Lessons";
import QuizPage from "./pages/Quiz";
import Practice from "./pages/Practice";
import PracticeCompleted from "./pages/PracticeCompleted";
import CreateCourseWithAI from "./pages/CreateCourseWithAI";
import CreateQuiz from "./pages/CreateQuiz";
import AIChat from "./components/AIChat";
import About from "./pages/About";
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
import { WalletProvider } from "./context/WalletContext";
import { AdminRoute, ProtectedRoute, GuestOnly } from "./context/RouteGuards";



// 🧱 Trang quản trị
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Reviews from "./pages/admin/Reviews";
import Documents from "./pages/admin/Documents";
import Settings from "./pages/admin/Settings";
import ActivityLogs from "./pages/admin/ActivityLogs";
import Reports from "./pages/admin/Reports";
import Announcements from "./pages/admin/Announcements";
import Certificates from "./pages/admin/Certificates";
import Analytics from "./pages/admin/Analytics";

/**
 * Hiện chatbot nổi chỉ ở trang home, ẩn ở tất cả các trang khác:
 * - Chỉ hiện ở "/" (trang chủ)
 * - Ẩn ở tất cả các trang khác kể cả /login, /register, /admin/*
 */
function GlobalChatSwitcher() {
  const { pathname } = useLocation();

  const isHomePage = pathname === "/";

  // Chỉ hiển thị ở trang chủ, ẩn ở tất cả các trang khác
  if (!isHomePage) return null;

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
        <Route path="/about" element={<About />} />
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
          path="/topup"
          element={
            <ProtectedRoute>
              <TopUp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Profile />
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
        <Route
          path="/lessons/:id/practice"
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice-completed"
          element={
            <ProtectedRoute>
              <PracticeCompleted />
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
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="analytics" element={<Analytics />} />
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
    <AuthProvider>
      <WalletProvider>
        <AppShell />
      </WalletProvider>
    </AuthProvider>
  );
}
