import api from "./api";

// Danh sách
export const getCourses = async (params = {}) => {
  const query = new URLSearchParams({
    page: params.page ?? 1,
    limit: params.limit ?? 12,
    q: params.q ?? "",
    category: params.category ?? "",
    sort: params.sort ?? "-createdAt",
    published: "true",
  });
  const { data } = await api.get(`/courses/getCourses`);
  if (Array.isArray(data))
    return { items: data, total: data.length, page: 1, limit: data.length };
  return data; // {items,total,page,limit}
};

// Chi tiết
export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/getCourseById/${id}`);
  return data;
};

// (tùy chọn) Ghi danh
export const enrollCourse = async (id) => {
  const { data } = await api.post(`/enrollments`, { courseId: id });
  return data;
};
