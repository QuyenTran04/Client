import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/practice.css";

export default function PracticeCompleted() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    if (location.state) {
      setResults(location.state.results || []);
      setTotalScore(location.state.totalScore || 0);
      setTotalQuestions(location.state.totalQuestions || 0);
      setLesson(location.state.lesson || null);
    } else {
      // Nếu không có state, quay về trang lessons
      navigate("/lessons", { replace: true });
    }
  }, [location.state, navigate]);

  const handleRetake = () => {
    if (lesson) {
      navigate(`/practice/${lesson._id}`);
    } else {
      navigate("/lessons");
    }
  };

  const handleBackToLessons = () => {
    navigate("/lessons");
  };

  const calculatePercentage = () => {
    if (totalQuestions === 0) return 0;
    const maxPossibleScore = totalQuestions * 10; // Mỗi câu tối đa 10 điểm
    return Math.round((totalScore / maxPossibleScore) * 100);
  };

  const getGrade = () => {
    const percentage = calculatePercentage();
    if (percentage >= 90) return { text: "Xuất sắc", color: "success" };
    if (percentage >= 80) return { text: "Tốt", color: "primary" };
    if (percentage >= 70) return { text: "Khá", color: "warning" };
    if (percentage >= 60) return { text: "Trung bình", color: "warning" };
    return { text: "Cần cải thiện", color: "error" };
  };

  if (!results) {
    return (
      <div className="practice-loading">
        <div className="spinner" />
        <p>Đang tải kết quả...</p>
      </div>
    );
  }

  const grade = getGrade();
  const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions).toFixed(1) : 0;

  return (
    <div className="practice-page">
      <div className="practice-completed-container">
        <div className="practice-card completion-card">
          <div className="completion-header">
            <div className="completion-icon">
              🎉
            </div>
            <h1>Hoàn thành bài luyện tập!</h1>
            <p className="completion-subtitle">
              Bài học: {lesson?.title || "Luyện tập"}
            </p>
          </div>

          <div className="score-summary">
            <div className="main-score">
              <div className={`score-circle grade-${grade.color}`}>
                <span className="score-number">{calculatePercentage()}%</span>
              </div>
              <div className="score-info">
                <h2 className={`grade-text grade-${grade.color}`}>{grade.text}</h2>
                <p>Điểm trung bình: {averageScore}/10</p>
                <p>Tổng điểm: {totalScore}/{totalQuestions * 10}</p>
              </div>
            </div>
          </div>

          <div className="results-grid">
            <div className="result-stats">
              <div className="stat-card">
                <h3>{totalQuestions}</h3>
                <p>Tổng câu hỏi</p>
              </div>
              <div className="stat-card">
                <h3>{results.filter(r => r.isCorrect).length}</h3>
                <p>Đáp đúng</p>
              </div>
              <div className="stat-card">
                <h3>{results.filter(r => !r.isCorrect).length}</h3>
                <p>Đáp sai</p>
              </div>
              <div className="stat-card">
                <h3>{Math.round((results.filter(r => r.isCorrect).length / totalQuestions) * 100)}%</h3>
                <p>Độ chính xác</p>
              </div>
            </div>
          </div>

          <div className="question-review">
            <h3>Xem lại câu trả lời</h3>
            <div className="review-list">
              {results.map((result, index) => (
                <div key={index} className={`review-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-header">
                    <span className="question-number">Câu {result.questionIndex + 1}</span>
                    <span className={`score-badge ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.score}/10
                    </span>
                  </div>
                  <div className="review-content">
                    <div className="question-text">
                      {result.question}
                    </div>
                    <div className="user-answer">
                      <strong>Đáp án của bạn:</strong> {result.userAnswer}
                    </div>
                    {result.feedback && (
                      <div className="feedback-summary">
                        <strong>Nhận xét:</strong> {result.feedback.feedback?.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="completion-actions">
            <button className="btn outline" onClick={handleBackToLessons}>
              ← Quay lại bài học
            </button>
            <button className="btn primary" onClick={handleRetake}>
              🔄 Làm lại bài tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}