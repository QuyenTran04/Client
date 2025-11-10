import api from "./api"; 

export async function chatWithAI({
  message,
  userId,
  courseId = null,
  lessonId = null,
  quizId = null,
  uiState = {},
}) {
  const payload = { message, userId, courseId, lessonId, quizId, uiState };
  const { data } = await api.post("/ai/chat", payload);
  return data;
}
