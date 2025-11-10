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

  // INSTRUCTORS
  listInstructors: (params) =>
    api.get("/admin/instructors", { params }).then((r) => r.data),
  createInstructor: (payload) =>
    api.post("/admin/instructors", payload).then((r) => r.data),
  updateInstructor: (id, payload) =>
    api.put(`/admin/instructors/${id}`, payload).then((r) => r.data),
  deleteInstructor: (id) =>
    api.delete(`/admin/instructors/${id}`).then((r) => r.data),

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
};
