import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizzesForLesson, submitQuiz } from "../services/quiz";
import { useAuth } from "../context/AuthContext";

export default function Quiz() {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [completed, setCompleted] = useState(false);

  const startTimeRef = useRef({});
  const questionStartTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const quizzesData = await getQuizzesForLesson(lessonId);

        if (!alive) return;
        setQuizzes(quizzesData.items || []);

        const initialAnswers = {};
        quizzesData.items?.forEach((quiz) => {
          const qId = quiz._id || quiz.id;
          if (qId) {
            initialAnswers[qId] = [];
            startTimeRef.current[qId] = Date.now();
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Không tải được danh sách câu hỏi!");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [lessonId, user, navigate]);

  const currentQuiz = quizzes[currentIndex];
  const getQuizId = (quiz) => quiz?._id || quiz?.id;

  const handleSelectAnswer = (quizId, optionId) => {
    if (completed || !currentQuiz) return;
    
    if (!quizId) {
      console.error("Quiz ID not found");
      return;
    }
    
    setAnswers((prev) => {
      const currentAnswers = prev[quizId] || [];
      const isMultiple = currentQuiz.type === "multiple-choice" || currentQuiz.type === "multiple_choice";

      if (isMultiple) {
        const isSelected = currentAnswers.includes(optionId);
        return {
          ...prev,
          [quizId]: isSelected
            ? currentAnswers.filter((id) => id !== optionId)
            : [...currentAnswers, optionId],
        };
      } else {
        return {
          ...prev,
          [quizId]: [optionId],
        };
      }
    });
  };

  const handleSubmitQuestion = async () => {
    if (!currentQuiz) return;

    const quizId = getQuizId(currentQuiz);
    if (!quizId) return;
    
    const selected = answers[quizId] || [];

    if (selected.length === 0) {
      alert("Vui lòng chọn ít nhất một đáp án!");
      return;
    }

    console.log("Submitting quiz:", {
      quizId,
      selected,
      options: currentQuiz.options,
      optionIds: currentQuiz.options?.map((o) => ({ id: o._id || o.id, text: o.text })),
    });

    try {
      setSubmitting(true);
      const duration = Math.floor((Date.now() - startTimeRef.current[quizId]) / 1000);
      const result = await submitQuiz(quizId, selected, duration);

      console.log("Quiz result:", {
        quizId,
        selected,
        result,
        isCorrect: result?.isCorrect,
        correctAnswers: result?.submission?.correctAnswers,
      });

      setResults((prev) => ({
        ...prev,
        [quizId]: result,
      }));
    } catch (err) {
      console.error("Submit error:", err);
      alert(err?.response?.data?.message || "Nộp bài thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      setCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpToQuestion = (idx) => {
    setCurrentIndex(idx);
  };

  const answeredCount = Object.values(answers).filter((ans) => ans && ans.length > 0).length;
  const correctCount = Object.values(results).filter((res) => res?.isCorrect).length;
  const score = quizzes.length > 0 ? Math.round((correctCount / quizzes.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px", minHeight: "100vh" }}>
        <div style={{ animation: "pulse 2s infinite", height: 40, background: "#eee", borderRadius: 12, marginBottom: 30 }} />
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 30 }}>
          <div style={{ animation: "pulse 2s infinite", height: 400, background: "#eee", borderRadius: 12 }} />
          <div style={{ animation: "pulse 2s infinite", height: 500, background: "#eee", borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (error || quizzes.length === 0) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px", minHeight: "100vh" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            background: "#f1b24a",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          ← Quay lại
        </button>
        <div style={{ padding: 20, background: "#fee", border: "1px solid #fcc", borderRadius: 12, color: "#c33" }}>
          {error || "Bài học này chưa có câu hỏi nào."}
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ background: "#f8f9fa", minHeight: "100vh", padding: "40px 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 20 }}>Hoàn thành bài quiz!</h1>

            <div style={{ background: "#f1b24a", color: "#fff", padding: 30, borderRadius: 12, marginBottom: 30 }}>
              <div style={{ fontSize: 60, fontWeight: 700, marginBottom: 10 }}>{score}%</div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>
                {correctCount} / {quizzes.length} câu đúng
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 30 }}>
              <div style={{ background: "#f0f0f0", padding: 20, borderRadius: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 4 }}>{answeredCount}</div>
                <div style={{ fontSize: 13, color: "#666" }}>Câu đã trả lời</div>
              </div>
              <div style={{ background: "#f0f0f0", padding: 20, borderRadius: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#4caf50", marginBottom: 4 }}>{correctCount}</div>
                <div style={{ fontSize: 13, color: "#666" }}>Câu đúng</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#f1b24a",
                  color: "#111",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Quay lại
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#f0f0f0",
                  color: "#111",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Làm lại
              </button>
            </div>
          </div>

          {/* Review Answers */}
          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: "#111" }}>Xem lại câu trả lời</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {quizzes.map((quiz, idx) => {
                const qId = getQuizId(quiz);
                const result = results[qId];
                const userAnswers = answers[qId] || [];

                return (
                  <div key={qId} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: result?.isCorrect ? "#4caf50" : "#f44336",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {result?.isCorrect ? "✓" : "✗"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#111", marginBottom: 8 }}>
                          Câu {idx + 1}: {quiz.question}
                        </div>
                        <div style={{ fontSize: 13, color: result?.isCorrect ? "#4caf50" : "#f44336", fontWeight: 500 }}>
                          {result?.isCorrect ? "Đúng" : "Sai"}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginLeft: 44, display: "flex", flexDirection: "column", gap: 8 }}>
                      {quiz.options?.map((opt) => {
                        const optId = opt?._id || opt?.id;
                        const isSelected = userAnswers.includes(optId);
                        const isCorrect = result?.submission?.correctAnswers?.includes(optId);

                        return (
                          <div
                            key={optId}
                            style={{
                              padding: 10,
                              background: isCorrect ? "#f1f8f4" : isSelected ? "#fef0f0" : "#f9f9f9",
                              border: `1px solid ${isCorrect ? "#4caf50" : isSelected ? "#f44336" : "#eee"}`,
                              borderRadius: 6,
                              fontSize: 13,
                              color: "#555",
                            }}
                          >
                            <span style={{ fontWeight: 500, marginRight: 8 }}>
                              {isCorrect ? "✓" : isSelected ? "✗" : "○"}
                            </span>
                            {opt?.text || opt?.label || opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "20px 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: "0 0 4px 0", fontSize: 24, fontWeight: 700 }}>Bài quiz</h1>
            <div style={{ fontSize: 13, color: "#666" }}>
              {currentIndex + 1} / {quizzes.length} câu hỏi
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Đã trả lời</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111" }}>{answeredCount}/{quizzes.length}</div>
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "8px 16px",
                background: "#f0f0f0",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ✕ Thoát
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "30px 20px", display: "grid", gridTemplateColumns: "200px 1fr 280px", gap: 30 }}>
        {/* Left Sidebar - Question Navigation */}
        <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ padding: 16, borderBottom: "1px solid #eee", background: "#f9f9f9" }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111" }}>Danh sách câu hỏi</h3>
            </div>
            <div style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
              {quizzes.map((quiz, idx) => {
                const qId = getQuizId(quiz);
                const isAnswered = (answers[qId] || []).length > 0;
                const isCorrect = results[qId]?.isCorrect;
                const isSelected = currentIndex === idx;

                return (
                  <button
                    key={qId}
                    onClick={() => handleJumpToQuestion(idx)}
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "none",
                      borderBottom: "1px solid #eee",
                      background: isSelected ? "#f1b24a" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.target.style.background = "#f9f9f9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.target.style.background = "#fff";
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: isCorrect ? "#4caf50" : isAnswered ? "#f1b24a" : "#eee",
                        color: isAnswered || isCorrect ? "#fff" : "#999",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {isCorrect ? "✓" : idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? "#fff" : "#666",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                    >
                      Câu {idx + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center - Question Content */}
        <div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 30, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            {/* Question Title */}
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#111", lineHeight: 1.4 }}>
                Câu {currentIndex + 1}: {currentQuiz.question}
              </h2>
              {currentQuiz.type && (
                <div style={{ fontSize: 13, color: "#666", background: "#f0f0f0", display: "inline-block", padding: "4px 12px", borderRadius: 4 }}>
                  {currentQuiz.type === "multiple-choice" ? "Có thể chọn nhiều đáp án" : "Chọn một đáp án"}
                </div>
              )}
            </div>

            {/* Options */}
            <div style={{ marginBottom: 30 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {currentQuiz.options?.map((option, idx) => {
                  const quizId = getQuizId(currentQuiz);
                  // Try to get proper ID, fallback to index
                  const optionId = option?._id || option?.id || idx;
                  const optionText = option?.text || option?.label || option;
                  const isSelected = (answers[quizId] || []).includes(optionId);
                  const isCorrect = results[quizId]?.submission?.correctAnswers?.includes(optionId);
                  const isWrong = isSelected && !isCorrect && results[quizId];
                  const isDisabled = !!results[quizId];

                  return (
                    <button
                      key={`${quizId}-${optionId}`}
                      onClick={() => !isDisabled && handleSelectAnswer(quizId, optionId)}
                      disabled={isDisabled}
                      type="button"
                      style={{
                        padding: 16,
                        background: isCorrect ? "#f1f8f4" : isSelected ? (isWrong ? "#fef0f0" : "#f1b24a") : "#f9f9f9",
                        border: `2px solid ${isCorrect ? "#4caf50" : isSelected ? (isWrong ? "#f44336" : "#f1b24a") : "#eee"}`,
                        borderRadius: 8,
                        cursor: isDisabled ? "default" : "pointer",
                        fontSize: 15,
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected || isCorrect ? "#fff" : "#333",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            background: isCorrect ? "#4caf50" : isSelected ? (isWrong ? "#f44336" : "#fff") : "transparent",
                            border: `2px solid ${isCorrect ? "#4caf50" : isSelected ? (isWrong ? "#f44336" : "#f1b24a") : "#ddd"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: isCorrect || isWrong ? "#fff" : "#f1b24a",
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {isCorrect ? "✓" : isWrong ? "✗" : ""}
                        </div>
                        <span style={{ flex: 1, textAlign: "left" }}>{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, paddingTop: 20, borderTop: "1px solid #eee" }}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentIndex === 0}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: currentIndex === 0 ? "default" : "pointer",
                  opacity: currentIndex === 0 ? 0.5 : 1,
                }}
              >
                ← Câu trước
              </button>

              {!results[getQuizId(currentQuiz)] ? (
                <button
                  onClick={handleSubmitQuestion}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Đang nộp..." : "Nộp câu trả lời"}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: results[getQuizId(currentQuiz)]?.isCorrect ? "#4caf50" : "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {results[getQuizId(currentQuiz)]?.isCorrect ? "✓ Đúng!" : "✗ Sai!"} - Tiếp tục
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Progress */}
        <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 13, fontWeight: 600, color: "#111" }}>Tiến độ làm bài</h3>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, color: "#666" }}>
                <span>Đã trả lời</span>
                <span style={{ fontWeight: 600 }}>{answeredCount}/{quizzes.length}</span>
              </div>
              <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#f1b24a",
                    width: `${(answeredCount / quizzes.length) * 100}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, color: "#666" }}>
                <span>Câu đúng</span>
                <span style={{ fontWeight: 600 }}>{correctCount}</span>
              </div>
              <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#4caf50",
                    width: `${Object.values(results).length > 0 ? (correctCount / Object.values(results).length) * 100 : 0}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ padding: 12, background: "#f9f9f9", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 4 }}>
                {Object.values(results).length}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>Câu đã nộp</div>
            </div>
          </div>

          {/* Quiz Info */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#111" }}>Thông tin bài quiz</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ color: "#666", marginBottom: 4 }}>Tổng câu hỏi</div>
                <div style={{ fontWeight: 600, color: "#111" }}>{quizzes.length} câu</div>
              </div>
              <div>
                <div style={{ color: "#666", marginBottom: 4 }}>Loại bài</div>
                <div style={{ fontWeight: 600, color: "#111" }}>Kiểm tra</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
