import api from "./api";

// Lấy bài luyện tập theo bài học
export const getPracticeByLesson = async (lessonId) => {
  const response = await api.get(`/practice/lesson/${lessonId}`);
  return response.data;
};

// Tạo bài luyện tập mới
export const createPractice = async (lessonId, practiceData) => {
  const response = await api.post(`/practice`, {
    lessonId,
    ...practiceData
  });
  return response.data;
};

// Nộp câu trả lời luyện tập
export const submitPracticeAnswer = async (practiceId, answer) => {
  const response = await api.post(`/practice/${practiceId}/submit`, {
    answer
  });
  return response.data;
};

// Lấy lịch sử luyện tập của người dùng
export const getPracticeHistory = async (userId, lessonId) => {
  const response = await api.get(`/practice/history/${userId}/${lessonId}`);
  return response.data;
};