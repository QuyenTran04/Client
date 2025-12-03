import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getCourseById, enrollCourse } from "../services/course";
import { useAuth } from "../context/AuthContext";
import { getYouTubeEmbedUrl } from "../lib/utils";
import AIChat from "../components/AIChat";
import CourseReview from "../components/CourseReview";
import { getRatingLabel } from "../lib/rating";
import "../css/courses.css";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Hàm để làm mới dữ liệu khóa học (khi có đánh giá mới)
  const refreshCourseData = async () => {
    try {
      const data = await getCourseById(id);
      setC(data);
    } catch (error) {
      console.error("Failed to refresh course data:", error);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCourseById(id);
        if (!alive) return;
        setC(data);
        setSelectedLesson(null); // đổi khóa học thì reset lesson context
        
        // Check if payment was successful
        if (searchParams.get("payment") === "success") {
          alert("Thanh toán thành công! Bạn đã được đăng ký khóa học.");
          // Remove query param from URL
          navigate(`/courses/${id}`, { replace: true });
        }
      } catch (e) {
        if (!alive) return;
        setError("Không tải được thông tin khóa học.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, searchParams, navigate]);

  const handleViewLessons = () => {
    if (!user) return navigate("/login");
    navigate(`/courses/${id}/lessons`);
  };

  const onEnroll = async () => {
    if (!user) {
      navigate("/login?redirect=/courses/" + id);
      return;
    }

    // Nếu khóa học có giá, chuyển đến trang thanh toán
    if (c?.price && c.price > 0) {
      navigate(`/payment?courseId=${id}`);
      return;
    }

    // Nếu khóa học miễn phí, đăng ký trực tiếp
    try {
      setEnrolling(true);
      await enrollCourse(id);
      alert("Đăng ký khóa học thành công!");
      navigate(`/courses/${id}/lessons`);
    } catch (e) {
      alert(e?.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setEnrolling(false);
    }
  };



  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ animation: "pulse 2s infinite", height: 300, background: "#eee", borderRadius: 12, marginBottom: 20 }} />
        <div style={{ animation: "pulse 2s infinite", height: 100, background: "#eee", borderRadius: 12 }} />
      </div>
    );
  }

  if (!c) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ padding: 20, background: "#fee", border: "1px solid #fcc", borderRadius: 12, color: "#c33" }}>
          {error || "Không tìm thấy khóa học."}
        </div>
      </div>
    );
  }

  const imgSrc = c.imageUrl || "/assets/cover-1.png";

  const embedUrl = getYouTubeEmbedUrl(c?.introVideoUrl || c?.trailerUrl || c?.videoUrl);
  const courseRating = getRatingLabel(c.avgRating || 0);

  return (
    <div className="container course-detail">
      {/* Hero / Header */}
      <div className="cd-hero">
        <div
          className="cd-hero-bg"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.6)), url(${imgSrc})`,
          }}
        />
        <div className="cd-hero-inner">
          <div className="cd-hero-badges">
            <span className="badge">{c.category?.name || "Khóa học"}</span>
            {c.level && <span className="badge outline">{c.level}</span>}
          </div>
          <h1 style={{ margin: "16px 0", fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 }}>{c.title}</h1>
          <p style={{ fontSize: 16, marginBottom: 20, opacity: 0.95, lineHeight: 1.5 }}>{c.description}</p>
          <div style={{ display: "flex", gap: 20, fontSize: 14, marginBottom: 24, opacity: 0.9 }}>
            <span>👨‍🏫 {c.instructor?.name || "Giảng viên"}</span>
            {c.lessons?.length && <span>📚 {c.lessons.length} bài học</span>}
            {c.duration && <span>⏱️ {c.duration} giờ</span>}
            {c.avgRating && <span>⭐ {c.avgRating}/5</span>}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={c.price ? onEnroll : handleViewLessons}
              disabled={enrolling}
              style={{
                padding: "12px 28px",
                background: "#f1b24a",
                color: "#111",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                opacity: enrolling ? 0.7 : 1,
              }}
            >
              {enrolling ? "Đang đăng ký..." : (c.price ? `Đăng ký • ${c.price.toLocaleString()}₫` : "Bắt đầu học")}
            </button>
            <button
              onClick={handleViewLessons}
              style={{
                padding: "12px 28px",
                background: "transparent",
                color: "#fff",
                border: "2px solid #fff",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📚 Xem bài học
            </button>
            {embedUrl && (
              <button
                onClick={() => {}}
                style={{
                  padding: "12px 28px",
                  background: "transparent",
                  color: "#fff",
                  border: "2px solid #fff",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ▶ Xem trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 40px", display: "grid", gridTemplateColumns: "1fr 350px", gap: 30 }}>
        {/* Left Column - Content */}
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e0e0e0", marginBottom: 30, background: "#fff", borderRadius: "8px 8px 0 0", overflow: "hidden" }}>
            {["overview", "curriculum", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "16px",
                  border: "none",
                  background: activeTab === tab ? "#fff" : "transparent",
                  borderBottom: activeTab === tab ? "3px solid #f1b24a" : "none",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? "#111" : "#666",
                  transition: "all 0.2s ease",
                }}
              >
                {tab === "overview" && "Tổng quan"}
                {tab === "curriculum" && "Nội dung"}
                {tab === "reviews" && "Đánh giá"}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div style={{ background: "#fff", padding: 24, borderRadius: 12, marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Giới thiệu</h2>
                <p style={{ lineHeight: 1.6, color: "#444", marginBottom: 20 }}>{c.longDescription || c.description}</p>

                {c.outcomes?.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Bạn sẽ học được</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {c.outcomes.map((o, i) => (
                        <div key={i} style={{ display: "flex", gap: 8 }}>
                          <span style={{ color: "#4caf50", fontWeight: 700 }}>✓</span>
                          <span style={{ color: "#555", fontSize: 14 }}>{o}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {c.requirements?.length > 0 && (
                <div style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Yêu cầu</h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {c.requirements.map((r, i) => (
                      <li key={i} style={{ padding: "8px 0", color: "#555", fontSize: 14 }}>
                        • {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === "curriculum" && (
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
              {c.lessons?.length ? (
                <div>
                  {c.lessons.map((lesson, idx) => (
                    <div
                      key={lesson._id}
                      onClick={() => setSelectedLesson(selectedLesson === lesson._id ? null : lesson._id)}
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        background: selectedLesson === lesson._id ? "#f5f5f5" : "#fff",
                        transition: "all 0.2s ease",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#f1b24a",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: "#111" }}>{lesson.title}</div>
                          {lesson.description && (
                            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{lesson.description}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {lesson.duration && (
                          <span style={{ fontSize: 13, color: "#666" }}>⏱️ {lesson.duration} phút</span>
                        )}
                        <span style={{ fontSize: 18, color: "#999" }}>{selectedLesson === lesson._id ? "▼" : "▶"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: "center", color: "#999" }}>Chưa có bài học nào</div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <CourseReview
              courseId={id}
              onReviewUpdate={refreshCourseData}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <div>
          {/* Video Preview */}
          {embedUrl && (
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", marginBottom: 24, position: "sticky", top: 20 }}>
              <div style={{ aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
                <iframe
                  src={embedUrl}
                  title="Course Preview"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={c.price ? onEnroll : handleViewLessons}
                  disabled={enrolling}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#f1b24a",
                    color: "#111",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: enrolling ? 0.7 : 1,
                  }}
                >
                  {enrolling ? "Đang đăng ký..." : (c.price ? `Đăng ký • ${c.price.toLocaleString()}₫` : "Bắt đầu học")}
                </button>
                <button
                  onClick={handleViewLessons}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "transparent",
                    color: "#f1b24a",
                    border: "1px solid #f1b24a",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  📚 Xem bài học
                </button>
              </div>
            </div>
          )}

          {/* Course Info */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#111" }}>Thông tin khóa học</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              {(c.avgRating > 0 || c.totalReviews > 0) && (
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #eee" }}>
                  <span style={{ color: "#666" }}>⭐ Đánh giá</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, color: "#111" }}>
                    <span style={{ color: "#f1b24a", fontSize: 16 }}>
                      {"★".repeat(Math.ceil(c.avgRating / 2))}
                      {"☆".repeat(5 - Math.ceil(c.avgRating / 2))}
                    </span>
                    <span>{(c.avgRating || 0).toFixed(1)}/10</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: courseRating.bg,
                        color: courseRating.text,
                        border: `1px solid ${courseRating.border}`,
                      }}
                    >
                      {courseRating.label}
                    </span>
                    {c.totalReviews > 0 && (
                      <span style={{ color: "#666", fontSize: 12 }}>({c.totalReviews})</span>
                    )}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#666" }}>⏱️ Tổng thời lượng</span>
                <span style={{ fontWeight: 500, color: "#111" }}>{c.duration || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#666" }}>📚 Số bài học</span>
                <span style={{ fontWeight: 500, color: "#111" }}>{c.lessons?.length || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#666" }}>📊 Mức độ</span>
                <span style={{ fontWeight: 500, color: "#111" }}>{c.level || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>🗓️ Cập nhật</span>
                <span style={{ fontWeight: 500, color: "#111" }}>
                  {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("vi-VN") : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#111" }}>Giảng viên</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <div
                className="avatar"
                style={{ backgroundImage: `url(${c.instructor?.avatar || "/assets/ava-1.jpg"})` }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#111", marginBottom: 4 }}>{c.instructor?.name || "Giảng viên"}</div>
                {c.instructor?.bio && (
                  <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.4 }}>{c.instructor.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Share */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#111" }}>Chia sẻ</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "8px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: "#111",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#e0e0e0")}
                onMouseLeave={(e) => (e.target.style.background = "#f0f0f0")}
              >
                📘 Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(c.title)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "8px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: "#111",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#e0e0e0")}
                onMouseLeave={(e) => (e.target.style.background = "#f0f0f0")}
              >
                𝕏 Twitter
              </a>
            </div>
          </div>
        </div>
      </div>

      <AIChat layout="drawer" courseId={id} page="course" title="Gia sư khóa học" />
    </div>
  );


}
