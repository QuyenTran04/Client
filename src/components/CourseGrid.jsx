import CourseCard from "./CourseCard";

export default function CourseGrid({ items = [], loading = false, onDeleted = () => {} }) {
  if (loading) {
    return (
      <div className="course-list-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="course-card-v2 skeleton-card">
            <div className="skeleton-thumb" />
            <div className="skeleton-body">
              <span className="skeleton-line w-80" />
              <span className="skeleton-line w-60" />
              <span className="skeleton-line w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="course-empty">
        <div className="course-empty__icon">📚</div>
        <h3>Không có khóa học phù hợp</h3>
        <p>Thử đổi bộ lọc hoặc tìm kiếm từ khóa khác để tiếp tục khám phá.</p>
      </div>
    );
  }

  return (
    <div className="course-list-grid">
      {items.map((c) => (
        <CourseCard key={c._id} c={c} onDeleted={onDeleted} />
      ))}
    </div>
  );
}

