import CourseCard from "./CourseCard";

export default function CourseGrid({ items = [], loading }) {
  if (loading) {
    return (
      <div className="grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card skeleton">
            <div className="thumb" />
            <div className="card-body">
              <div className="sk-line" />
              <div className="sk-line short" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!items.length)
    return (
      <div className="empty-state">
        <div className="empty-ico">📚</div>
        <div className="empty-title">Không có khóa học phù hợp</div>
        <div className="empty-sub">Thử đổi bộ lọc hoặc tìm kiếm khác nhé.</div>
      </div>
    );

  return (
    <div className="grid">
      {items.map((c) => (
        <CourseCard key={c._id} c={c} />
      ))}
    </div>
  );
}
