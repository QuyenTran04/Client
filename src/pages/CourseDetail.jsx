import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, enrollCourse } from "../services/course";
import { useAuth } from "../context/AuthContext";
import { getYouTubeEmbedUrl } from "../lib/utils";
import "../css/courses.css";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCourseById(id);
        setC(data);
      } catch (e) {
        setError("Không tải được thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onEnroll = async () => {
    if (!user) return (window.location.href = "/login");
    try {
      setEnrolling(true);
      await enrollCourse(id);
      alert("Đăng ký khóa học thành công!");
    } catch (e) {
      alert(e?.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading)
    return (
      <div className="container">
        <div className="skeleton-page">
          <div className="skeleton hero" />
          <div className="skeleton row" />
          <div className="skeleton row" />
          <div className="skeleton card" />
        </div>
      </div>
    );
  if (!c)
    return (
      <div className="container">
        <div className="err card" style={{ padding: 16 }}>
          {error || "Không tìm thấy khóa học."}
        </div>
      </div>
    );

  const embedUrl = getYouTubeEmbedUrl(c?.introVideoUrl || c?.trailerUrl || c?.videoUrl);

  return (
    <div className="container course-detail">
      {/* Hero / Header */}
      <div className="cd-hero">
        <div
          className="cd-hero-bg"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.6)), url(${c.imageUrl || "/assets/placeholder-course.jpg"})`,
          }}
        />
        <div className="cd-hero-inner">
          <div className="cd-hero-badges">
            <span className="badge">{c.category?.name || "Khóa học"}</span>
            {c.level && <span className="badge outline">{c.level}</span>}
          </div>
          <h1 className="cd-hero-title">{c.title}</h1>
          <p className="cd-hero-desc">{c.description}</p>
          <div className="cd-hero-meta">
            <span>👨‍🏫 {c.instructor?.name || "Giảng viên"}</span>
            {c.lessons?.length ? <span>• 📚 {c.lessons.length} bài học</span> : null}
            {c.duration ? <span>• ⏱️ {c.duration} giờ</span> : null}
          </div>
          <div className="cd-hero-cta">
            <button className="btn primary large" onClick={onEnroll} disabled={enrolling}>
              {enrolling
                ? "Đang đăng ký..."
                : c.price
                ? `Đăng ký • ${c.price.toLocaleString()}₫`
                : "Bắt đầu học miễn phí"}
            </button>
            {embedUrl && (
              <button className="btn outline large" onClick={() => setShowPreview(true)}>
                ▶ Xem trailer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="cd-content">
        {/* Left column */}
        <div className="cd-col">
          <div className="cd-card">
            <h2 className="cd-card-title">Giới thiệu khóa học</h2>
            <p className="cd-text">{c.longDescription || c.description}</p>
            {Array.isArray(c.outcomes) && c.outcomes.length > 0 && (
              <div className="cd-list">
                {c.outcomes.map((o, i) => (
                  <div className="cd-list-item" key={i}>✅ {o}</div>
                ))}
              </div>
            )}
          </div>

          <div className="cd-card">
            <h2 className="cd-card-title">Nội dung khóa học</h2>
            {c.lessons?.length ? (
              <ul className="lesson-list fancy">
                {c.lessons.map((ls, idx) => (
                  <li key={ls._id}>
                    <div className="ls-left">
                      <span className="ls-index">{idx + 1}</span>
                      <span className="ls-title">{ls.title}</span>
                    </div>
                    {ls.duration && <span className="ls-time">{ls.duration} phút</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Chưa có nội dung hiển thị.</p>
            )}
          </div>

          {Array.isArray(c.requirements) && c.requirements.length > 0 && (
            <div className="cd-card">
              <h2 className="cd-card-title">Yêu cầu</h2>
              <ul className="cd-bullets">
                {c.requirements.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="cd-col side">
          {embedUrl && (
            <div className="cd-card sticky">
              <div className="video">
                <div className="video-embed">
                  <iframe
                    src={embedUrl}
                    title="Course Preview"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <button className="btn primary w-full" onClick={onEnroll} disabled={enrolling}>
                {enrolling
                  ? "Đang đăng ký..."
                  : c.price
                  ? `Đăng ký • ${c.price.toLocaleString()}₫`
                  : "Bắt đầu học miễn phí"}
              </button>
              <div className="cd-side-meta">
                <div>⏱️ Tổng thời lượng: {c.duration || "—"}</div>
                <div>📚 Số bài học: {c.lessons?.length || 0}</div>
                <div>🗓️ Cập nhật: {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "—"}</div>
                <div>🌐 Ngôn ngữ: {c.language || "Việt Nam"}</div>
              </div>
            </div>
          )}

          <div className="cd-card">
            <h3 className="cd-card-title small">Giảng viên</h3>
            <div className="teacher">
              <div
                className="avatar"
                style={{ backgroundImage: `url(${c.instructor?.avatar || "/assets/avatar.png"})` }}
              />
              <div>
                <div className="name">{c.instructor?.name || "Giảng viên"}</div>
                {c.instructor?.bio && <div className="muted small">{c.instructor.bio}</div>}
              </div>
            </div>
          </div>

          <div className="cd-card">
            <h3 className="cd-card-title small">Chia sẻ khóa học</h3>
            <div className="share-row">
              <a
                className="btn outline w-full"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
              <a
                className="btn outline w-full"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(c.title)}`}
                target="_blank"
                rel="noreferrer"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="cd-section">
        <h2>Đánh giá</h2>
        {c.reviews?.length ? (
          <ul className="review-list">
            {c.reviews.map((rv) => (
              <li key={rv._id}>
                <b>{rv.user?.name || "Người dùng"}</b> – {rv.rating}/5
                <div className="rv-text">{rv.comment}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Chưa có đánh giá.</p>
        )}
      </div>

      {showPreview && embedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPreview(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-semibold">Xem trailer: {c.title}</h4>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-black rounded overflow-hidden">
                <iframe
                  src={embedUrl}
                  title="Course Trailer"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );


}
