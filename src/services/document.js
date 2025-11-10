import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getDocumentByLesson = async (lessonId) => {
  const { data } = await axios.get(`${API_URL}/documents/lesson/${lessonId}`, {
    withCredentials: true,
  });
  return data;
};

export const getDocumentsByCourse = async (courseId) => {
  const { data } = await axios.get(`${API_URL}/documents/course/${courseId}`, {
    withCredentials: true,
  });
  return data;
};

export const getDocument = async (id) => {
  const { data } = await axios.get(`${API_URL}/documents/${id}`, {
    withCredentials: true,
  });
  return data;
};

export const createDocument = async (payload) => {
  const { data } = await axios.post(`${API_URL}/documents`, payload, {
    withCredentials: true,
  });
  return data;
};

export const updateDocument = async (id, payload) => {
  const { data } = await axios.put(`${API_URL}/documents/${id}`, payload, {
    withCredentials: true,
  });
  return data;
};

export const deleteDocument = async (id) => {
  const { data } = await axios.delete(`${API_URL}/documents/${id}`, {
    withCredentials: true,
  });
  return data;
};

export const askAboutDocument = async (id, question, language = "vi") => {
  const { data } = await axios.post(
    `${API_URL}/documents/${id}/ask`,
    { question, language },
    { withCredentials: true }
  );
  return data;
};

export const generateExample = async (id, topic, language = "vi") => {
  const { data } = await axios.post(
    `${API_URL}/documents/${id}/generate-example`,
    { topic, language },
    { withCredentials: true }
  );
  return data;
};
