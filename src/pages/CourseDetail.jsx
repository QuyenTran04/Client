import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, enrollCourse } from "../services/course";
import { useAuth } from "../context/AuthContext";
import "../css/courses.css";
import AIChat from "../components/AIChat";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // 👇 Bài học được chọn để làm ngữ cảnh cho AI
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCourseById(id);
        if (!alive) return;
        setC(data);
        setSelectedLessonId(null); // đổi khóa học thì reset lesson context
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

  if (loading) {
    return (
      <div className="container">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!c) {
    return (
      <div className="container">
        <p className="err">{error || "Không tìm thấy khóa học."}</p>
      </div>
    );
  }

  const imgSrc = c.imageUrl || "/assets/placeholder-course.jpg";

  return (
    <div className="container course-detail">
      <div className="cd-top">
        <img
          className="cd-thumb"
          src={imgSrc}
          onError={(e) => {
            e.currentTarget.src = "/assets/placeholder-course.jpg";
          }}
          alt={c.title}
        />
        <div className="cd-meta">
          <h1>{c.title}</h1>
          <p className="muted">{c.description}</p>

          <div className="cd-row">
            <span>
              <b>Danh mục:</b> {c.category?.name || "—"}
            </span>
            <span>
              <b>Giảng viên:</b> {c.instructor?.name || "—"}
            </span>
            <span>
              <b>Giá:</b>{" "}
              {c.price ? c.price.toLocaleString() + "₫" : "Miễn phí"}
            </span>
          </div>

          <div className="cd-actions">
            <button
              className="btn primary"
              onClick={onEnroll}
              disabled={enrolling}
            >
              {enrolling ? "Đang đăng ký..." : "Đăng ký học"}
            </button>
          </div>
        </div>
      </div>

      <div className="cd-section">
        <h2>Nội dung khóa học</h2>
        {c.lessons?.length ? (
          <ul className="lesson-list">
            {c.lessons.map((ls) => {
              const active = selectedLessonId === ls._id;
              return (
                <li key={ls._id} className={active ? "active" : ""}>
                  <span className="ls-title">{ls.title}</span>
                  {ls.duration && (
                    <span className="ls-time">{ls.duration} phút</span>
                  )}
                  {/* Nút chọn bài này làm ngữ cảnh hỏi AI */}
                  <button
                    className="btn ghost sm"
                    onClick={() => setSelectedLessonId(ls._id)}
                    title="Đặt ngữ cảnh cho AI"
                    style={{ marginLeft: 8 }}
                  >
                    {active ? "Đang đặt cho AI" : "Hỏi AI về bài này"}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">Chưa có nội dung hiển thị.</p>
        )}
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

      {/* 🔽 Ngăn kéo chat AI bên phải (mở bằng tay nắm "CHAT") */}
      <AIChat
        layout="drawer"
        title="Gia sư AI"
        courseId={id} // gắn ngữ cảnh khóa học
        lessonId={selectedLessonId} // gắn ngữ cảnh bài học (nếu đã chọn)
        page="course-detail"
        language="vi"
      />
    </div>
  );
}
