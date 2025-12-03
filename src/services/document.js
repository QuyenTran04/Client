import api from "./api";

export const getLessonDocument = async (lessonId) => {
  try {
    const response = await api.get(`/documents/lesson/${lessonId}`);
    return response.data;
  } catch (err) {
    return null;
  }
};

// Alias for DocumentViewer compatibility
export const getDocumentByLesson = getLessonDocument;

export const getLessonDocuments = async (lessonId) => {
  try {
    const response = await api.get(`/documents`, {
      params: { lessonId },
    });
    return response.data?.items || [];
  } catch (err) {
    return [];
  }
};

export const pollDocumentStatus = async (lessonId, onReady, maxAttempts = 60, interval = 2000) => {
  let attempts = 0;
  
  const check = async () => {
    try {
      const doc = await getLessonDocument(lessonId);
      if (doc) {
        console.log("[pollDocumentStatus] ✅ Document ready for lesson:", lessonId);
        onReady(doc);
        return true;
      }
    } catch (err) {
      console.error("[pollDocumentStatus] Error checking document:", err.message);
    }
    
    attempts++;
    if (attempts >= maxAttempts) {
      console.warn("[pollDocumentStatus] Max attempts reached for lesson:", lessonId);
      return false;
    }
    
    setTimeout(check, interval);
    return null;
  };
  
  return check();
};

export const askAboutDocument = async (documentId, question) => {
  try {
    const response = await api.post(`/documents/${documentId}/ask`, { question });
    return response.data;
  } catch (err) {
    console.error("[askAboutDocument] Error:", err.message);
    throw err;
  }
};

export const generateExample = async (documentId, topic) => {
  try {
    const response = await api.post(`/documents/${documentId}/generate-example`, { topic });
    return response.data;
  } catch (err) {
    console.error("[generateExample] Error:", err.message);
    throw err;
  }
};
