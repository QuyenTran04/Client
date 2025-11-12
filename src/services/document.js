import api from "./api";

export const getDocumentByLesson = async (lessonId) => {
  const { data } = await api.get(`/documents/lesson/${lessonId}`);
  return data;
};

export const getDocumentsByCourse = async (courseId) => {
  const { data } = await api.get(`/documents/course/${courseId}`);
  return data;
};

export const getDocument = async (id) => {
  const { data } = await api.get(`/documents/${id}`);
  return data;
};

export const createDocument = async (payload) => {
  const { data } = await api.post(`/documents`, payload);
  return data;
};

export const updateDocument = async (id, payload) => {
  const { data } = await api.put(`/documents/${id}`, payload);
  return data;
};

export const deleteDocument = async (id) => {
  const { data } = await api.delete(`/documents/${id}`);
  return data;
};

export const askAboutDocument = async (id, question, language = "vi") => {
  const { data } = await api.post(`/documents/${id}/ask`, {
    question,
    language,
  });
  return data;
};

export const generateExample = async (id, topic, language = "vi") => {
  const { data } = await api.post(`/documents/${id}/generate-example`, {
    topic,
    language,
  });
  return data;
};
