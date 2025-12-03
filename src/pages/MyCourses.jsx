import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import CourseGrid from "../components/CourseGrid";
import "../css/courses.css";
import "../css/mycourse-filter.css";

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("-updatedAt");

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

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by status
    if (filterStatus === "published") {
      result = result.filter((c) => c.published === true);
    } else if (filterStatus === "draft") {
      result = result.filter((c) => c.published !== true);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(query) ||
          (c.description || "").toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "-updatedAt") {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      } else if (sortBy === "-createdAt") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

    return result;
  }, [courses, searchQuery, filterStatus, sortBy]);

  const handleCourseDeleted = (courseId) => {
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
  };

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
            onClick={() => navigate("/courses/create-ai")}
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
            <button type="button" onClick={() => navigate("/courses/create-ai")}>
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
              onClick={() => navigate("/courses/create-ai")}
            >
              Tạo khóa học đầu tiên
            </button>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="mycourse-filter-bar">
              <div className="filter-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-controls">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="published">Đã phát hành</option>
                  <option value="draft">Bản nháp</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="-updatedAt">Cập nhật gần đây</option>
                  <option value="-createdAt">Tạo gần đây</option>
                  <option value="title">Tên A-Z</option>
                </select>
              </div>
            </div>

            <div className="mycourse-toolbar">
              <div>
                <strong>{filteredCourses.length}</strong> khóa học
                {searchQuery && ` (tìm: "${searchQuery}")`}
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
            <CourseGrid items={filteredCourses} onDeleted={handleCourseDeleted} />
          </>
        )}
      </section>
    </div>
  );
}

