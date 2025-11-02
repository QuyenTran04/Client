import { useNavigate } from "react-router-dom";
import "../css/course-suggestions.css";

export default function CourseSuggestionsCard({ items = [] }) {
  const navigate = useNavigate();

  const handleCardClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="course-suggestions-container">
      {items.map((course) => (
        <div
          key={course.id}
          className="course-suggestion-card"
          onClick={() => handleCardClick(course.id)}
        >
          <div className="course-card__image">
            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} />
            ) : (
              <div className="course-card__placeholder">
                <span>📚</span>
              </div>
            )}
          </div>

          <div className="course-card__content">
            <h3 className="course-card__title">{course.title}</h3>

            <p className="course-card__reason">{course.reason}</p>

            <div className="course-card__footer">
              <span className="course-card__price">
                {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}₫`}
              </span>
              <button className="course-card__btn">Xem chi tiết</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
