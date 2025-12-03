import api from "./api";

export const getLessonsByCourse = async (courseId, params = {}) => {
  const { keyword = "", page = 1, limit = 100 } = params;
  const res = await api.get(`/lessons/listLessonsByCourse/${courseId}`, {
    params: { keyword, page, limit },
  });
  return res.data; // { items, pagination }
};

export const getLessonById = async (lessonId) => {
  const res = await api.get(`/lessons/getLessonById/${lessonId}`);
  return res.data; // { lesson }
};
