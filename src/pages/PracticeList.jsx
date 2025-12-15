import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonById } from "../services/lesson";
import { getPracticeHistory, createPractice, getNextDifficulty } from "../services/practice";
import { useAuth } from "../context/AuthContext";
import "../css/practice.css";

export default function PracticeList() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [difficultyInfo, setDifficultyInfo] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Lấy thông tin bài học
        const lessonResponse = await getLessonById(lessonId);
        console.log("[PracticeList] Lesson loaded:", lessonResponse);
        setLesson(lessonResponse.lesson);

        // Lấy lịch sử bài luyện tập
        try {
          const historyResponse = await getPracticeHistory(user._id || user.id, lessonId);
          console.log("[PracticeList] History loaded:", historyResponse);
          setPracticeHistory(historyResponse.submissions || []);
        } catch (historyErr) {
          console.warn("[PracticeList] No history found:", historyErr);
          setPracticeHistory([]);
        }

        // Lấy thông tin mức độ tiếp theo
        try {
          const difficultyResponse = await getNextDifficulty(lessonId);
          console.log("[PracticeList] Difficulty info loaded:", difficultyResponse);
          setDifficultyInfo(difficultyResponse);
        } catch (diffErr) {
          console.warn("[PracticeList] No difficulty info:", diffErr);
          setDifficultyInfo({
            nextDifficulty: "Trung bình",
            message: "Bài luyện tập đầu tiên sẽ ở mức độ Trung bình",
            totalSubmissions: 0,
            lastScore: null
          });
        }

      } catch (err) {
        console.error("[PracticeList] Error loading data:", err);
        setError(err?.response?.data?.message || "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, user, navigate]);

  // Debug log
  useEffect(() => {
    console.log("[PracticeList] State:", {
      lesson: !!lesson,
      creating,
      loading,
      error,
      difficultyInfo: !!difficultyInfo
    });
  }, [lesson, creating, loading, error, difficultyInfo]);

  const handleCreatePractice = async () => {
    if (!lesson) return;

    try {
      setCreating(true);
      setError("");

      // Tạo bài luyện tập mới - server sẽ tự động xác định mức độ
      const newPractice = await createPractice(lessonId, {
        title: `Luyện tập: ${lesson.title}`,
        lessonContent: lesson.content || lesson.description || "",
        courseId: lesson.course?._id || lesson.courseId,
        questionType: "open_ended",
      });

      // Chuyển đến trang làm bài luyện tập
      navigate(`/practice/${newPractice._id}`);
    } catch (err) {
      console.error("[PracticeList] Error creating practice:", err);
      setError(err?.response?.data?.message || "Không tạo được bài luyện tập");
    } finally {
      setCreating(false);
    }
  };

  const handleViewPractice = (practiceId) => {
    navigate(`/practice/${practiceId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Dễ": return "success";
      case "Trung bình": return "primary";
      case "Khó": return "warning";
      case "Rất Khó": return "error";
      default: return "primary";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "success";
    if (score >= 5) return "warning";
    return "error";
  };

  if (loading) {
    return (
      <div className="practice-loading">
        <div className="spinner" />
        <p>Đang tải danh sách bài luyện tập...</p>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="practice-loading">
        <div className="error-card">
          <h3>Lỗi</h3>
          <p>{error}</p>
        </div>
        <button className="btn primary" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <div className="practice-list-container">
        {/* Header */}
        <div className="practice-list-header">
          <button className="btn ghost" onClick={() => navigate(-1)}>
            ← Quay lại bài học
          </button>
          <div className="header-content">
            <h1>Bài luyện tập</h1>
            <p className="lesson-title">{lesson?.title}</p>
          </div>
        </div>

        {/* Difficulty Info Card */}
        {difficultyInfo && (
          <div className="practice-card difficulty-info-card">
            <div className="card-head">
              <h3>Thông tin mức độ</h3>
              <span className={`pill ${getDifficultyColor(difficultyInfo.nextDifficulty)}`}>
                {difficultyInfo.nextDifficulty}
              </span>
            </div>
            <div className="difficulty-info-body">
              <p className="info-message">{difficultyInfo.message}</p>
              <div className="difficulty-stats">
                <div className="stat-item">
                  <span className="stat-label">Tổng số bài đã làm</span>
                  <span className="stat-value">{difficultyInfo.totalSubmissions}</span>
                </div>
                {difficultyInfo.lastScore !== null && (
                  <div className="stat-item">
                    <span className="stat-label">Điểm bài gần nhất</span>
                    <span className={`stat-value score-${getScoreColor(difficultyInfo.lastScore)}`}>
                      {difficultyInfo.lastScore}/10
                    </span>
                  </div>
                )}
                {difficultyInfo.averageScore > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Điểm trung bình</span>
                    <span className="stat-value">{difficultyInfo.averageScore}/10</span>
                  </div>
                )}
              </div>
              <div className="scoring-rules">
                <h4>Quy tắc điều chỉnh mức độ:</h4>
                <ul>
                  <li>✅ Điểm &gt; 8/10 → Tăng 1 mức độ</li>
                  <li>➡️ Điểm 5-8/10 → Giữ nguyên mức độ</li>
                  <li>⬇️ Điểm &lt; 5/10 → Giảm 1 mức độ</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Create Practice Button */}
        <div className="create-practice-section">
          <button
            className="btn primary create-practice-btn"
            onClick={handleCreatePractice}
            disabled={creating}
            type="button"
          >
            {creating ? (
              <>
                <span className="spinner-small" />
                AI đang tạo bài luyện tập...
              </>
            ) : (
              <>
                ✨ Tạo bài luyện tập mới
                {difficultyInfo && ` (Mức độ: ${difficultyInfo.nextDifficulty})`}
              </>
            )}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Practice History */}
        <div className="practice-card history-card">
          <div className="card-head">
            <h3>Lịch sử bài luyện tập</h3>
            <span className="pill">{practiceHistory.length} bài</span>
          </div>
          
          {practiceHistory.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có bài luyện tập nào</p>
              <p className="empty-hint">Nhấn nút "Tạo bài luyện tập mới" để bắt đầu</p>
            </div>
          ) : (
            <div className="history-list">
              {practiceHistory.map((submission, index) => (
                <div key={submission._id} className="history-item">
                  <div className="history-item-header">
                    <div className="history-item-info">
                      <span className="history-index">#{practiceHistory.length - index}</span>
                      <span className={`difficulty-badge ${getDifficultyColor(submission.practiceId?.difficulty)}`}>
                        {submission.practiceId?.difficulty || "Trung bình"}
                      </span>
                      <span className="history-date">
                        {new Date(submission.submittedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <div className="history-item-score">
                      <span className={`score-badge ${getScoreColor(submission.feedback?.score || 0)}`}>
                        {submission.feedback?.score || 0}/10
                      </span>
                      <span className={`result-badge ${submission.isCorrect ? 'correct' : 'incorrect'}`}>
                        {submission.isCorrect ? '✓ Đúng' : '✗ Sai'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="history-item-content">
                    <div className="history-answer">
                      <strong>Câu trả lời:</strong>
                      <p>{submission.answer.substring(0, 150)}{submission.answer.length > 150 ? '...' : ''}</p>
                    </div>
                    {submission.feedback?.feedback && (
                      <div className="history-feedback">
                        <strong>Nhận xét:</strong>
                        <p>{submission.feedback.feedback.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>

                  <div className="history-item-actions">
                    <button
                      className="btn outline small"
                      onClick={() => handleViewPractice(submission.practiceId._id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
