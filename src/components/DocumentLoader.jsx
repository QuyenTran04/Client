import { useEffect, useState } from "react";
import { getLessonDocument } from "../services/document";
import DocumentViewer from "./DocumentViewer";

export default function DocumentLoader({ lessonId, lessonTitle }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    let alive = true;
    let pollInterval = null;

    const checkDocument = async () => {
      try {
        const doc = await getLessonDocument(lessonId);
        if (!alive) return;

        if (doc) {
          setDocument(doc);
          setLoading(false);
          setError("");
          if (pollInterval) clearInterval(pollInterval);
        } else if (pollCount < 60) {
          // Still polling, max 60 attempts (2s * 60 = 2 minutes)
          setPollCount((prev) => prev + 1);
        } else {
          // Max attempts reached
          setError("Tài liệu không thể tạo được. Vui lòng thử lại sau.");
          setLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("[DocumentLoader] Error:", err.message);
        if (!alive) return;
        setError(err.message || "Lỗi khi tải tài liệu");
        setLoading(false);
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    checkDocument();

    // Setup polling if document not ready
    if (!document && pollCount < 60) {
      pollInterval = setInterval(checkDocument, 2000);
    }

    return () => {
      alive = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [lessonId, pollCount]);

  if (loading) {
    return (
      <div
        style={{
          padding: "60px 40px",
          textAlign: "center",
          background: "#f8fafc",
          borderRadius: 12,
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "4px solid #e2e8f0",
            borderTopColor: "#5b7cfd",
            animation: "spin 1s linear infinite",
            marginBottom: 20,
          }}
        />
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
          Đang tạo tài liệu bài học
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          {lessonTitle && `"${lessonTitle}"`} - Vui lòng đợi...
        </p>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#94a3b8" }}>
          Lần kiểm tra: {pollCount}
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 20,
          background: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: 12,
          color: "#b91c1c",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
      </div>
    );
  }

  return document ? <DocumentViewer lessonId={lessonId} document={document} /> : null;
}
