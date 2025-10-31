import api from "./api"; 

export async function chatWithAI({
  message,
  userId,
  courseId = null,
  lessonId = null,
  uiState = {},
}) {
  const payload = { message, userId, courseId, lessonId, uiState };
  const { data } = await api.post("/ai/agent-chat", payload); // gọi proxy server
  return data;
}
