import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../services/course";
import { getLessonsByCourse } from "../services/lesson";
import { useAuth } from "../context/AuthContext";
import { getYouTubeEmbedUrl } from "../lib/utils";
import "../css/courses.css";

export default function Lessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonDetails, setLessonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(id),
          getLessonsByCourse(id),
        ]);

        if (!alive) return;
        setCourse(courseData);
        setLessons(lessonsData.items || []);

        if (lessonsData.items && lessonsData.items.length > 0) {
          setSelectedLesson(lessonsData.items[0]._id);
        }
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Không tải được dữ liệu!");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, user, navigate]);

  useEffect(() => {
    if (!selectedLesson) return;

    setDetailLoading(true);
    const selected = lessons.find((l) => l._id === selectedLesson);
    if (selected) {
      setLessonDetails(selected);
    }
    setDetailLoading(false);
  }, [selectedLesson, lessons]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px", minHeight: "100vh" }}>
        <div style={{ animation: "pulse 2s infinite", height: 40, background: "#eee", borderRadius: 12, marginBottom: 30 }} />
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 30 }}>
          <div style={{ animation: "pulse 2s infinite", height: 400, background: "#eee", borderRadius: 12 }} />
          <div style={{ animation: "pulse 2s infinite", height: 500, background: "#eee", borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px", minHeight: "100vh" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            background: "#f1b24a",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          ← Quay lại
        </button>
        <div style={{ padding: 20, background: "#fee", border: "1px solid #fcc", borderRadius: 12, color: "#c33" }}>
          {error || "Không tìm thấy khóa học."}
        </div>
      </div>
    );
  }

  const embedUrl = lessonDetails?.videoUrl ? getYouTubeEmbedUrl(lessonDetails.videoUrl) : null;

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "20px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid #ddd",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ← Quay lại
          </button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, flex: 1 }}>{course.title}</h1>
          <span style={{ color: "#666", fontSize: 14 }}>
            📚 {lessons.length} bài học
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "30px 20px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 30 }}>
        {/* Left Sidebar - Lessons List */}
        <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ padding: 16, borderBottom: "1px solid #eee", background: "#f9f9f9" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111" }}>Danh sách bài học</h3>
            </div>
            <div style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
              {lessons.length > 0 ? (
                lessons.map((lesson, idx) => (
                  <div
                    key={lesson._id}
                    onClick={() => setSelectedLesson(lesson._id)}
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      background: selectedLesson === lesson._id ? "#f1b24a" : "#fff",
                      transition: "all 0.2s ease",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: selectedLesson === lesson._id ? "rgba(255,255,255,0.3)" : "#f1b24a",
                        color: selectedLesson === lesson._id ? "#fff" : "#111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: selectedLesson === lesson._id ? 600 : 500,
                          color: selectedLesson === lesson._id ? "#fff" : "#111",
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lesson.title}
                      </div>
                      {lesson.duration && (
                        <div
                          style={{
                            fontSize: 11,
                            color: selectedLesson === lesson._id ? "rgba(255,255,255,0.8)" : "#999",
                            marginTop: 4,
                          }}
                        >
                          ⏱️ {lesson.duration} phút
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "#999", fontSize: 13 }}>
                  Chưa có bài học nào
                </div>
              )}
            </div>
          </div>

          {/* Course Info Card */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginTop: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#111" }}>Thông tin khóa học</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Mức độ:</span>
                <span style={{ fontWeight: 500, color: "#111" }}>{course.level || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Giáo viên:</span>
                <span style={{ fontWeight: 500, color: "#111" }}>{course.instructor?.name || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Đánh giá:</span>
                <span style={{ fontWeight: 500, color: "#111" }}>{course.avgRating ? `${course.avgRating}/5` : "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Lesson Detail */}
        <div>
          {detailLoading ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 30, textAlign: "center", color: "#999" }}>
              <div style={{ animation: "pulse 2s infinite", height: 30, background: "#eee", borderRadius: 6, marginBottom: 20 }} />
              <div style={{ animation: "pulse 2s infinite", height: 300, background: "#eee", borderRadius: 6, marginBottom: 20 }} />
              <div style={{ animation: "pulse 2s infinite", height: 100, background: "#eee", borderRadius: 6 }} />
            </div>
          ) : !selectedLesson ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#999" }}>
              Chọn một bài học để bắt đầu học
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              {/* Video Player */}
              {embedUrl ? (
                <div style={{ aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
                  <iframe
                    src={embedUrl}
                    title={lessonDetails?.title || "Lesson"}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div style={{ aspectRatio: "16/9", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                  Không có video cho bài học này
                </div>
              )}

              {/* Lesson Content */}
              <div style={{ padding: 30 }}>
                <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 700, color: "#111" }}>
                  {lessonDetails?.title || "Bài học"}
                </h2>

                <div style={{ display: "flex", gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #eee", fontSize: 14, color: "#666" }}>
                  {lessonDetails?.duration && (
                    <div>
                      <span style={{ fontWeight: 600, color: "#111" }}>⏱️ {lessonDetails.duration}</span> phút
                    </div>
                  )}
                  {lessonDetails?.createdAt && (
                    <div>
                      📅 {new Date(lessonDetails.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>

                {/* Description */}
                {lessonDetails?.description && (
                  <div style={{ marginBottom: 30 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111" }}>Mô tả</h3>
                    <p style={{ lineHeight: 1.6, color: "#555", whiteSpace: "pre-wrap" }}>
                      {lessonDetails.description}
                    </p>
                  </div>
                )}

                {/* Content */}
                {lessonDetails?.content && (
                  <div style={{ marginBottom: 30 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111" }}>Nội dung bài học</h3>
                    <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 8, lineHeight: 1.6, color: "#555", whiteSpace: "pre-wrap" }}>
                      {lessonDetails.content}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {lessonDetails?.resources && lessonDetails.resources.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#111" }}>Tài liệu bài học</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {lessonDetails.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "12px 16px",
                            background: "#f1b24a",
                            color: "#111",
                            textDecoration: "none",
                            borderRadius: 6,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "#e89c2d")}
                          onMouseLeave={(e) => (e.target.style.background = "#f1b24a")}
                        >
                          📥 {resource.name || "Tải xuống tài liệu"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: "flex", gap: 12, marginTop: 40, paddingTop: 20, borderTop: "1px solid #eee" }}>
                  <button
                    onClick={() => {
                      const currentIdx = lessons.findIndex((l) => l._id === selectedLesson);
                      if (currentIdx > 0) {
                        setSelectedLesson(lessons[currentIdx - 1]._id);
                      }
                    }}
                    disabled={lessons.findIndex((l) => l._id === selectedLesson) === 0}
                    style={{
                      padding: "10px 20px",
                      background: "#f0f0f0",
                      border: "none",
                      borderRadius: 6,
                      cursor: lessons.findIndex((l) => l._id === selectedLesson) === 0 ? "default" : "pointer",
                      fontWeight: 600,
                      opacity: lessons.findIndex((l) => l._id === selectedLesson) === 0 ? 0.5 : 1,
                    }}
                  >
                    ← Bài trước
                  </button>
                  <button
                    onClick={() => navigate(`/lessons/${selectedLesson}/quiz`)}
                    style={{
                      padding: "10px 20px",
                      background: "#6c5ce7",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    📝 Làm bài quiz
                  </button>
                  <button
                    onClick={() => {
                      const currentIdx = lessons.findIndex((l) => l._id === selectedLesson);
                      if (currentIdx < lessons.length - 1) {
                        setSelectedLesson(lessons[currentIdx + 1]._id);
                      }
                    }}
                    disabled={lessons.findIndex((l) => l._id === selectedLesson) === lessons.length - 1}
                    style={{
                      padding: "10px 20px",
                      background: "#f1b24a",
                      border: "none",
                      borderRadius: 6,
                      cursor: lessons.findIndex((l) => l._id === selectedLesson) === lessons.length - 1 ? "default" : "pointer",
                      fontWeight: 600,
                      opacity: lessons.findIndex((l) => l._id === selectedLesson) === lessons.length - 1 ? 0.5 : 1,
                    }}
                  >
                    Bài tiếp →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
