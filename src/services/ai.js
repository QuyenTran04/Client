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

export async function explainQuiz({
  quizId,
  submissionId = null,
  selected = [],
  lang = "vi",
}) {
  const payload = { quizId, submissionId, selected, lang };
  const { data } = await api.post("/ai/explain-quiz", payload);
  return data;
}

export async function pronounceText({
  text,
  voice,
  speed,
  format = "mp3",
} = {}) {
  const payload = { text, voice, speed, format };
  const { data } = await api.post("/ai/tts/pronounce", payload);
  return data;
}
