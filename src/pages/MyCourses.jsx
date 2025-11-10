import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import CourseGrid from "../components/CourseGrid";
import "../css/courses.css";

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const response = await api.get("/courses/my");
        if (!alive) return;
        setCourses(response.data.items || []);
        setError("");
      } catch (err) {
        console.error("Error fetching courses:", err);
        if (!alive) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Lỗi tải khóa học của bạn"
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user, navigate]);

  const publishedCount = useMemo(
    () => courses.filter((course) => course.published).length,
    [courses]
  );
  const draftCount = Math.max(courses.length - publishedCount, 0);

  return (
    <div className="mycourse-wrapper">
      <section className="mycourse-hero">
        <div>
          <p className="courses-eyebrow">Không gian sáng tạo</p>
          <h1>Khóa học của tôi</h1>
          <p>
            Theo dõi tiến độ xuất bản, điều chỉnh nội dung và giới thiệu các lớp
            học tốt nhất tới học viên.
          </p>
        </div>
        <div className="mycourse-hero__stats">
          <div>
            <span>Tổng cộng</span>
            <strong>{courses.length}</strong>
          </div>
          <div>
            <span>Đã phát hành</span>
            <strong>{publishedCount}</strong>
          </div>
          <div>
            <span>Bản nháp</span>
            <strong>{draftCount}</strong>
          </div>
        </div>
        <div className="mycourse-hero__actions">
          <button
            type="button"
            onClick={() => navigate("/create-course")}
            className="hero-callout-btn"
          >
            Tạo khóa học mới
          </button>
        </div>
      </section>

      <section className="mycourse-panel">
        {error && !loading && (
          <div className="state-card error">
            <p>{error}</p>
            <button type="button" onClick={() => navigate("/create-course")}>
              Tạo khóa học
            </button>
          </div>
        )}

        {loading && <CourseGrid loading />}

        {!loading && !error && courses.length === 0 && (
          <div className="state-card">
            <div className="state-emoji">✨</div>
            <h2>Bắt đầu hành trình giảng dạy</h2>
            <p>Tạo khóa học đầu tiên và biến ý tưởng thành trải nghiệm học tập.</p>
            <button
              type="button"
              className="hero-callout-btn"
              onClick={() => navigate("/create-course")}
            >
              Tạo khóa học đầu tiên
            </button>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="mycourse-toolbar">
              <div>
                <strong>{courses.length}</strong> khóa học đang quản lý
              </div>
              <div className="active-filters">
                <span className="active-filter-pill">
                  Đã phát hành: {publishedCount}
                </span>
                <span className="active-filter-pill">
                  Nháp: {draftCount}
                </span>
              </div>
            </div>
            <CourseGrid items={courses} />
          </>
        )}
      </section>
    </div>
  );
}

