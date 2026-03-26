# 🎓 EduPlatform Client

> **Ứng dụng học tập trực tuyến tích hợp AI** — Nền tảng e-learning hiện đại với trợ lý AI, luyện tập code, quiz tương tác và hệ thống thanh toán ví nội tệ.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Biến môi trường](#-biến-môi-trường)
- [Routing & Pages](#-routing--pages)
- [Kiến trúc & Thiết kế](#-kiến-trúc--thiết-kế)

---

## 🚀 Giới thiệu

**EduPlatform Client** là giao diện người dùng của hệ thống học tập trực tuyến, được xây dựng bằng **React 19 + Vite**. Ứng dụng cung cấp trải nghiệm học tập toàn diện bao gồm:

- Khóa học theo danh mục và môn học
- Bài học video và tài liệu
- Luyện tập lập trình (code sandbox)
- Quiz kiểm tra kiến thức
- AI Companion cá nhân hóa
- Chatbot hỗ trợ học tập (n8n)
- Hệ thống ví và thanh toán
- Bảng điều khiển Admin đầy đủ

---

## ✨ Tính năng

### 👤 Người dùng
| Tính năng | Mô tả |
|-----------|-------|
| **Xác thực** | Đăng ký, đăng nhập, Google OAuth |
| **Khóa học** | Duyệt, tìm kiếm, lọc theo danh mục & môn học |
| **Học bài** | Xem bài học, tài liệu đính kèm |
| **Luyện tập** | Code editor tích hợp (react-ace), chấm điểm |
| **Quiz** | Quiz tương tác sau mỗi bài học |
| **AI Companion** | Tạo & giao tiếp với AI học tập cá nhân |
| **AI Chat** | Chatbot nổi hỗ trợ học tập toàn cục |
| **Tạo Quiz AI** | Sinh câu hỏi quiz bằng AI |
| **Tạo Khóa học AI** | Tạo khóa học tự động với AI |
| **Ví điện tử** | Nạp tiền, xem lịch sử giao dịch |
| **Thanh toán** | Mua khóa học qua ví nội tệ |
| **Hồ sơ** | Quản lý thông tin cá nhân |
| **Thông báo** | Nhận thông báo realtime |

### 🔐 Admin
| Tính năng | Mô tả |
|-----------|-------|
| **Overview** | Thống kê tổng quan hệ thống |
| **Users** | Quản lý người dùng (khóa/mở khóa) |
| **Courses** | Quản lý khóa học (CRUD) |
| **Categories** | Quản lý danh mục |
| **Orders** | Quản lý đơn hàng |
| **Reviews** | Kiểm duyệt đánh giá |
| **Documents** | Quản lý tài liệu |
| **Activity Logs** | Nhật ký hoạt động hệ thống |
| **Reports** | Báo cáo thống kê |
| **Announcements** | Quản lý thông báo |
| **Certificates** | Quản lý chứng chỉ |
| **Analytics** | Phân tích dữ liệu |
| **Settings** | Cấu hình hệ thống |

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Framework** | React 19 + Vite 7 |
| **Routing** | React Router DOM v7 |
| **State / Data Fetching** | TanStack Query v5 (React Query) |
| **Form & Validation** | React Hook Form + Zod v4 |
| **HTTP Client** | Axios |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Code Editor** | React Ace (ace-builds) |
| **UI Components** | Radix UI (Label, Select) |
| **Icons** | Lucide React + React Icons |
| **Markdown** | React Markdown + remark-gfm |
| **Code Highlighting** | React Syntax Highlighter |
| **Date Utils** | date-fns |
| **Styling** | Vanilla CSS (custom design system) |
| **Linting** | ESLint 9 + plugin-react-hooks |

---

## 📁 Cấu trúc thư mục

```
client/
├── public/                     # Static assets
├── src/
│   ├── components/             # UI components tái sử dụng
│   │   ├── admin/              # Components dành riêng cho Admin
│   │   ├── ui/                 # Components UI cơ bản (Radix-based)
│   │   ├── AIChat.jsx          # Chatbot AI nổi
│   │   ├── CompanionCard.jsx   # Card AI Companion
│   │   ├── CompanionComponent.jsx
│   │   ├── CompanionForm.jsx
│   │   ├── CompanionsList.jsx
│   │   ├── CourseCard.jsx      # Card khóa học
│   │   ├── CourseGrid.jsx
│   │   ├── CourseReview.jsx    # Hệ thống đánh giá
│   │   ├── DocumentViewer.jsx  # Xem tài liệu
│   │   ├── ExplanationCard.jsx # Giải thích AI
│   │   ├── GenerateQuizModal.jsx
│   │   ├── NavBar.jsx          # Thanh điều hướng
│   │   ├── NotificationDropdown.jsx
│   │   ├── Sidebar.jsx         # Sidebar Admin
│   │   ├── SkillAssessment.jsx # Đánh giá kỹ năng
│   │   ├── WalletCard.jsx      # Widget ví
│   │   └── ...
│   ├── context/                # React Context (global state)
│   │   ├── AuthContext.jsx     # Xác thực người dùng
│   │   ├── WalletContext.jsx   # Trạng thái ví
│   │   └── RouteGuards.jsx     # Bảo vệ route (ProtectedRoute, AdminRoute, GuestOnly)
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useNotifications.js
│   │   ├── useProfileData.js
│   │   └── useWalletRefresh.js
│   ├── pages/                  # Page components
│   │   ├── admin/              # Dashboard Admin
│   │   ├── auth/               # Login, Register
│   │   ├── Home.jsx
│   │   ├── Courses.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── MyCourses.jsx
│   │   ├── Lessons.jsx
│   │   ├── Quiz.jsx
│   │   ├── Practice.jsx
│   │   ├── PracticeList.jsx
│   │   ├── PracticeCompleted.jsx
│   │   ├── CreateCourseWithAI.jsx
│   │   ├── CreateQuiz.jsx
│   │   ├── Payment.jsx
│   │   ├── TopUp.jsx
│   │   ├── Profile.jsx
│   │   └── About.jsx
│   ├── services/               # API service layer
│   │   ├── api.js              # Axios instance + interceptors
│   │   ├── auth.js
│   │   ├── course.js
│   │   ├── lesson.js
│   │   ├── quiz.js
│   │   ├── practice.js
│   │   ├── payment.js
│   │   ├── review.js
│   │   ├── document.js
│   │   ├── category.js
│   │   ├── ai.js
│   │   ├── walletService.js
│   │   └── admin.js
│   ├── constants/              # Hằng số & config
│   ├── lib/                    # Utilities & helpers
│   ├── css/                    # Global CSS modules
│   ├── App.jsx                 # App root & routing
│   ├── main.jsx                # Entry point
│   ├── index.css               # Design system & global styles
│   └── App.css
├── .env                        # Biến môi trường (không commit)
├── .env.example                # Template biến môi trường
├── vite.config.js              # Cấu hình Vite
├── eslint.config.js
└── package.json
```

---

## ⚙️ Cài đặt & Chạy

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** >= 9.x

### 1. Clone & cài đặt dependencies

```bash
git clone <repo-url>
cd client
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` theo hướng dẫn ở phần [Biến môi trường](#-biến-môi-trường).

### 3. Chạy môi trường Development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

### 4. Build Production

```bash
npm run build
```

### 5. Preview build

```bash
npm run preview
```

---

## 🔐 Biến môi trường

Tạo file `.env` tại thư mục gốc của `client/`:

```env
# API Backend URL
VITE_API_URL=http://localhost:5000/api

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

> **Lưu ý:** Tất cả biến môi trường phía client PHẢI có tiền tố `VITE_` để Vite expose chúng ra browser.

---

## 🗺 Routing & Pages

### Public Routes
| Route | Component | Mô tả |
|-------|-----------|-------|
| `/` | `Home` | Trang chủ |
| `/courses` | `Courses` | Danh sách khóa học |
| `/courses/:id` | `CourseDetail` | Chi tiết khóa học |
| `/about` | `About` | Giới thiệu |

### Guest-only Routes (redirect nếu đã đăng nhập)
| Route | Component | Mô tả |
|-------|-----------|-------|
| `/login` | `Login` | Đăng nhập |
| `/register` | `Register` | Đăng ký |

### Protected Routes (yêu cầu đăng nhập)
| Route | Component | Mô tả |
|-------|-----------|-------|
| `/my-courses` | `MyCourses` | Khóa học của tôi |
| `/courses/:id/lessons` | `LessonsPage` | Xem bài học |
| `/lessons/:id/quiz` | `QuizPage` | Quiz bài học |
| `/lessons/:lessonId/practice-list` | `PracticeList` | Danh sách bài tập |
| `/practice/:id` | `Practice` | Luyện tập code |
| `/practice-completed` | `PracticeCompleted` | Hoàn thành luyện tập |
| `/companions` | `CompanionsList` | Danh sách AI Companion |
| `/companions/new` | `CompanionForm` | Tạo AI Companion |
| `/companions/:id` | `CompanionComponent` | Chat với Companion |
| `/create-quiz` | `CreateQuiz` | Tạo quiz |
| `/courses/create-ai` | `CreateCourseWithAI` | Tạo khóa học với AI |
| `/payment` | `Payment` | Thanh toán |
| `/topup` | `TopUp` | Nạp ví |
| `/profile` | `Profile` | Hồ sơ cá nhân |
| `/wallet` | `Profile` | Ví điện tử |

### Admin Routes (yêu cầu quyền Admin)
| Route | Component |
|-------|-----------|
| `/admin` → `/admin/overview` | Tổng quan |
| `/admin/users` | Quản lý người dùng |
| `/admin/courses` | Quản lý khóa học |
| `/admin/categories` | Danh mục |
| `/admin/orders` | Đơn hàng |
| `/admin/reviews` | Đánh giá |
| `/admin/documents` | Tài liệu |
| `/admin/activity-logs` | Nhật ký hoạt động |
| `/admin/reports` | Báo cáo |
| `/admin/announcements` | Thông báo |
| `/admin/certificates` | Chứng chỉ |
| `/admin/analytics` | Phân tích |
| `/admin/settings` | Cài đặt |

---

## 🏗 Kiến trúc & Thiết kế

### API Client (Axios)

File `src/services/api.js` là Axios instance trung tâm với các interceptors:

- **Response interceptor**: Tự động phát `wallet_update` event khi giao dịch hoàn tất (AI, practice, quiz)
- **401 handler**: Xóa token, redirect về `/login` với `?redirect=` param
- **403 handler**: Phát hiện tài khoản bị khóa, đưa người dùng về login

### Route Guards

```
ProtectedRoute  →  Yêu cầu đăng nhập
AdminRoute      →  Yêu cầu role ADMIN
GuestOnly       →  Chỉ cho phép chưa đăng nhập (login/register)
```

### Wallet Event Bus

Hệ thống ví dùng **CustomEvent** (`wallet_update`) để đồng bộ số dư thời gian thực giữa các component mà không cần polling:

```
API transaction response
    → Axios interceptor fires
    → window.dispatchEvent('wallet_update')
    → WalletContext listener updates balance
    → WalletCard re-renders
```

### AI Chat

- `AIChat` component hỗ trợ layout `floating` (nổi toàn màn hình)
- Chỉ hiện ở trang `/` (Home), tự ẩn ở các trang khác
- Kết nối với n8n workflow thông qua `page="global"`

---

## 📜 Scripts

```bash
npm run dev       # Khởi động dev server (Vite)
npm run build     # Build production bundle
npm run preview   # Preview production build
npm run lint      # Chạy ESLint
```

---

## 🔗 Liên quan

- **Backend API**: `../server/` — Node.js + Express + MongoDB
- **AI Workflow**: n8n automation server
- **Port mặc định**: Client `:5173`, API Backend `:5000`
