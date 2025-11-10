// src/services/quiz.js
import api from "./api";

// Lấy toàn bộ quiz của 1 lesson để LÀM BÀI (ẩn đáp án)
export const getQuizzesForLesson = async (lessonId, { shuffle = 1 } = {}) => {
  const res = await api.get(`/quizzes/by-lesson/${lessonId}/take`, {
    params: { shuffle },
  });
  return res.data; // { lessonId, count, items }
};

// Nộp kết quả 1 câu: selected là mảng các option đã chọn (string[])
export const submitQuiz = async (quizId, selected, durationSeconds) => {
  const res = await api.post(`/quizzes/${quizId}/submit`, {
    selected,
    durationSeconds,
  });
  return res.data; // { isCorrect, submission }
};
