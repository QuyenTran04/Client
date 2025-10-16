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
  togglePublishCourse: (id) =>
    api.patch(`/admin/courses/${id}/publish`).then((r) => r.data),

  // ANALYTICS course (nếu cần)
  courseAnalytics: (id) =>
    api.get(`/admin/courses/${id}/analytics`).then((r) => r.data),
};
