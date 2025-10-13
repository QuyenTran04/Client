import { Link } from "react-router-dom";

export default function CourseCard({ c }) {
  return (
    <div className="card">
      <div
        className="thumb"
        style={{
          backgroundImage: `url(${c.imageUrl || "/placeholder-course.jpg"})`,
        }}
      />
      <div className="card-body">
        <h3 className="title" title={c.title}>
          {c.title}
        </h3>
        <p className="desc">{c.description}</p>
        <div className="meta">
          <span className="price">
            {c.price ? c.price.toLocaleString() + "₫" : "Miễn phí"}
          </span>
          <span className="dot">•</span>
          <span className="instructor">
            {c.instructor?.name || "Instructor"}
          </span>
        </div>
        <div className="actions">
          <Link className="btn" to={`/courses/${c._id}`}>
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
