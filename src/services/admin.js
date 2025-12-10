import api from "./api"; 

export const adminApi = {
  // OVERVIEW
  getOverview: () => api.get("/admin/overview").then((res) => res.data),

  // USERS
  listUsers: (params) =>
    api.get("/admin/users", { params }).then((r) => r.data),
  updateUser: (id, payload) =>
    api.patch(`/admin/users/${id}`, payload).then((r) => r.data),

  // COURSES
  listCourses: (params) =>
    api.get("/admin/courses", { params }).then((r) => r.data),
  createCourse: (payload) =>
    api.post("/admin/courses", payload).then((r) => r.data),
  updateCourse: (id, payload) =>
    api.put(`/admin/courses/${id}`, payload).then((r) => r.data),
  deleteCourse: (id) =>
    api.delete(`/admin/courses/${id}`).then((r) => r.data),
  togglePublishCourse: (id) =>
    api.patch(`/admin/courses/${id}/publish`).then((r) => r.data),
  publishCourse: (id) =>
    api.put(`/admin/courses/${id}/publish`).then((r) => r.data),
  unpublishCourse: (id) =>
    api.put(`/admin/courses/${id}/unpublish`).then((r) => r.data),

  // CATEGORIES
  listCategories: (params) =>
    api.get("/admin/categories", { params }).then((r) => r.data),
  createCategory: (payload) =>
    api.post("/admin/categories", payload).then((r) => r.data),
  updateCategory: (id, payload) =>
    api.put(`/admin/categories/${id}`, payload).then((r) => r.data),
  deleteCategory: (id) =>
    api.delete(`/admin/categories/${id}`).then((r) => r.data),

  // USERS/CREATORS
  listCreators: (params) =>
    api.get("/admin/creators", { params }).then((r) => r.data),
  createUser: (payload) =>
    api.post("/admin/users", payload).then((r) => r.data),
  updateUser: (id, payload) =>
    api.put(`/admin/users/${id}`, payload).then((r) => r.data),
  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`).then((r) => r.data),

  // WALLETS & TRANSACTIONS
  listWallets: (params) =>
    api.get("/admin/wallets", { params }).then((r) => r.data),
  getUserTransactions: (userId) =>
    api.get(`/admin/wallets/${userId}/transactions`).then((r) => r.data),
  listTopupTransactions: (params) =>
    api.get("/admin/topup-transactions", { params }).then((r) => r.data),

  // STUDENTS
  listStudents: (params) =>
    api.get("/admin/wallets", { params }).then((r) => r.data),
  getUserTransactions: (userId, params) =>
    api.get(`/admin/wallets/${userId}/transactions`, { params }).then((r) => r.data),
  listTopupTransactions: (params) =>
    api.get("/admin/topup-transactions", { params }).then((r) => r.data),
  creditUserWallet: (payload) =>
    api.post("/admin/wallet/credit", payload).then((r) => r.data),

  // STUDENTS
  listStudents: (params) =>
    api.get("/admin/students", { params }).then((r) => r.data),
  getStudentProgress: (id) =>
    api.get(`/admin/students/${id}/progress`).then((r) => r.data),

  // ORDERS
  listOrders: (params) =>
    api.get("/admin/orders", { params }).then((r) => r.data),
  refundOrder: (id) =>
    api.put(`/admin/orders/${id}/refund`).then((r) => r.data),

  // REVIEWS
  listReviews: (params) =>
    api.get("/admin/reviews", { params }).then((r) => r.data),
  deleteReview: (id) =>
    api.delete(`/admin/reviews/${id}`).then((r) => r.data),
  hideReview: (id) =>
    api.put(`/admin/reviews/${id}/hide`).then((r) => r.data),
  unhideReview: (id) =>
    api.put(`/admin/reviews/${id}/unhide`).then((r) => r.data),

  // LESSONS
  listLessons: (courseId, params) =>
    api.get(`/admin/courses/${courseId}/lessons`, { params }).then((r) => r.data),
  createLesson: (payload) =>
    api.post("/admin/lessons", payload).then((r) => r.data),
  updateLesson: (id, payload) =>
    api.put(`/admin/lessons/${id}`, payload).then((r) => r.data),
  deleteLesson: (id) =>
    api.delete(`/admin/lessons/${id}`).then((r) => r.data),
  reorderLessons: (courseId, payload) =>
    api.patch(`/admin/courses/${courseId}/lessons/reorder`, payload).then((r) => r.data),

  // QUIZ
  listQuiz: (params) =>
    api.get("/admin/quiz", { params }).then((r) => r.data),
  createQuiz: (payload) =>
    api.post("/admin/quiz", payload).then((r) => r.data),
  updateQuiz: (id, payload) =>
    api.put(`/admin/quiz/${id}`, payload).then((r) => r.data),
  deleteQuiz: (id) =>
    api.delete(`/admin/quiz/${id}`).then((r) => r.data),

  // NOTIFICATIONS
  getNotifications: () => api.get("/admin/notifications").then((r) => r.data),

  // ANNOUNCEMENTS
  listAnnouncements: (params) =>
    api.get("/admin/announcements", { params }).then((r) => r.data),
  createAnnouncement: (payload) =>
    api.post("/admin/announcements", payload).then((r) => r.data),
  updateAnnouncement: (id, payload) =>
    api.put(`/admin/announcements/${id}`, payload).then((r) => r.data),
  deleteAnnouncement: (id) =>
    api.delete(`/admin/announcements/${id}`).then((r) => r.data),
  toggleAnnouncement: (id) =>
    api.patch(`/admin/announcements/${id}/toggle`).then((r) => r.data),

  // CERTIFICATES
  listCertificates: (params) =>
    api.get("/admin/certificates", { params }).then((r) => r.data),
  issueCertificate: (payload) =>
    api.post("/admin/certificates", payload).then((r) => r.data),
  revokeCertificate: (id, reason) =>
    api.put(`/admin/certificates/${id}/revoke`, { reason }).then((r) => r.data),
  deleteCertificate: (id) =>
    api.delete(`/admin/certificates/${id}`).then((r) => r.data),

  // ANALYTICS
  getAnalyticsOverview: () =>
    api.get("/admin/analytics/overview").then((r) => r.data),
  getEnrollmentAnalytics: (params) =>
    api.get("/admin/analytics/enrollments", { params }).then((r) => r.data),
  getRevenueAnalytics: (params) =>
    api.get("/admin/analytics/revenue", { params }).then((r) => r.data),
  getCourseAnalytics: () =>
    api.get("/admin/analytics/courses").then((r) => r.data),
  getUserAnalytics: (params) =>
    api.get("/admin/analytics/users", { params }).then((r) => r.data),
};
