import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizzesForLesson, submitQuiz } from "../services/quiz";
import { getLessonById } from "../services/lesson";
import { useAuth } from "../context/AuthContext";
import ExplanationCard from "../components/ExplanationCard";
import AIChat from "../components/AIChat";
import { explainQuiz } from "../services/ai";

export default function Quiz() {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [_lesson, setLesson] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [completed, setCompleted] = useState(false);
  const [explanations, setExplanations] = useState({}); // { quizId: { data, error, loading } }
  const [explanationLoading, setExplanationLoading] = useState(false);

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

        try {
          const lessonData = await getLessonById(lessonId);
          if (!alive) return;
          setLesson(lessonData);
          if (lessonData?.course?._id || lessonData?.courseId) {
            setCourseId(lessonData.course?._id || lessonData.courseId);
          }
        } catch (lessonErr) {
          console.log("Could not load lesson details:", lessonErr);
        }
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

  const handleExplain = async () => {
    if (!currentQuiz) return;
    
    const quizId = getQuizId(currentQuiz);
    if (!quizId) return;

    // Nếu đã có giải thích, không cần fetch lại
    if (explanations[quizId]) {
      return;
    }

    setExplanationLoading(true);

    try {
      const result = await explainQuiz({
        quizId,
        selected: answers[quizId] || [],
        submissionId: results[quizId]?.submission?._id,
      });
      setExplanations(prev => ({
        ...prev,
        [quizId]: { data: result, error: null }
      }));
    } catch (err) {
      console.error("Explanation error:", err);
      const errorMsg = err?.response?.data?.error || err.message || "Có lỗi khi lấy giải thích";
      setExplanations(prev => ({
        ...prev,
        [quizId]: { data: null, error: errorMsg }
      }));
    } finally {
      setExplanationLoading(false);
    }
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
                      {quiz.options?.map((opt, optIdx) => {
                        const qId = getQuizId(quiz);
                        const optId = opt?._id || opt?.id || `${qId}-${optIdx}`;
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
    <div style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh", position: "relative" }}>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .quiz-question-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        .quiz-nav-grid button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .quiz-nav-grid button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
      `}</style>

      {/* Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #FFB366 0%, #FFA726 100%)", 
        color: "#fff",
        padding: "16px 0", 
        position: "sticky", 
        top: 0, 
        zIndex: 100, 
        boxShadow: "0 4px 20px rgba(255, 152, 0, 0.3)" 
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ animation: "fadeInDown 0.5s ease-out" }}>
            <h1 style={{ margin: "0 0 2px 0", fontSize: 22, fontWeight: 700 }}>📝 Bài Quiz</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
              Câu {currentIndex + 1} / {quizzes.length}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, animation: "fadeInDown 0.5s ease-out" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", padding: "9px 13px", borderRadius: 7, backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>Đã trả lời</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{answeredCount}/{quizzes.length}</div>
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "8px 14px",
                background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: 7,
                cursor: "pointer",
                fontWeight: 600,
                color: "#fff",
                transition: "all 0.2s ease",
                fontSize: 12,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.3)";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
                e.target.style.transform = "scale(1)";
              }}
            >
              ✕ Thoát
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 30 }}>
        {/* Center - Question Content */}
        <div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 40, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "slideInLeft 0.4s ease-out" }}>
            {/* Question Title */}
            <div style={{ marginBottom: 28, marginTop: 28 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FF9800", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Câu {currentIndex + 1} / {quizzes.length}
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 0, color: "#111", lineHeight: 1.5 }}>
                    {currentQuiz.question}
                  </h2>
                </div>
                <button
                  onClick={handleExplain}
                  disabled={explanationLoading}
                  style={{
                    padding: "10px 16px",
                    background: explanationLoading ? "#FFD9B3" : "linear-gradient(135deg, #FFB366 0%, #FFA726 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: explanationLoading ? "default" : "pointer",
                    fontSize: 13,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    opacity: explanationLoading ? 0.7 : 1,
                    transition: "all 0.3s ease",
                    boxShadow: explanationLoading ? "none" : "0 4px 15px rgba(255, 152, 0, 0.4)",
                  }}
                  onMouseEnter={(e) => {
                    if (!explanationLoading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(255, 152, 0, 0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!explanationLoading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(255, 152, 0, 0.4)";
                    }
                  }}
                  title="Gửi câu hỏi tới AI để được giải thích"
                >
                  {explanationLoading ? "⏳ Đang tạo..." : "💬 Giải thích"}
                </button>
              </div>
              {currentQuiz.type && (
                <div style={{ 
                  fontSize: 13, 
                  color: "#FF9800", 
                  background: "linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,167,38,0.1) 100%)", 
                  display: "inline-block", 
                  padding: "8px 14px", 
                  borderRadius: 8,
                  border: "1px solid rgba(255,152,0,0.2)",
                  fontWeight: 500
                }}>
                  {currentQuiz.type === "multiple-choice" ? "✓ Có thể chọn nhiều đáp án" : "◆ Chọn một đáp án"}
                </div>
              )}
            </div>

            {/* Options */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {currentQuiz.options?.map((option, idx) => {
                  const quizId = getQuizId(currentQuiz);
                  const optionId = option?._id || option?.id || `${quizId}-${idx}`;
                  const optionText = option?.text || option?.label || option;
                  const isSelected = (answers[quizId] || []).includes(optionId);
                  const isCorrectAnswer = results[quizId]?.submission?.correctAnswers?.includes(optionId);
                  const isWrong = isSelected && !isCorrectAnswer && results[quizId];
                  const isDisabled = !!results[quizId];
                  const isCorrect = isSelected && isCorrectAnswer;
                  const letters = ["A", "B", "C", "D", "E", "F"];

                  return (
                    <button
                      key={`${quizId}-${optionId}`}
                      onClick={() => !isDisabled && handleSelectAnswer(quizId, optionId)}
                      disabled={isDisabled}
                      type="button"
                      style={{
                        padding: "13px 15px",
                        background: isCorrect ? "linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(56,142,60,0.1) 100%)" : isSelected ? (isWrong ? "linear-gradient(135deg, rgba(244,67,54,0.1) 0%, rgba(211,47,47,0.1) 100%)" : "linear-gradient(135deg, #FFB366 0%, #FFA726 100%)") : "#f8f9fa",
                        border: `2px solid ${isCorrect ? "#4caf50" : isSelected ? (isWrong ? "#f44336" : "#FF9800") : "#e0e0e0"}`,
                        borderRadius: 10,
                        cursor: isDisabled ? "default" : "pointer",
                        fontSize: 14,
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected || isCorrect ? (isCorrect ? "#2e7d32" : (isWrong ? "#c62828" : "#fff")) : "#333",
                        textAlign: "left",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled && !isSelected) {
                          e.currentTarget.style.background = "#f0f0f0";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled && !isSelected) {
                          e.currentTarget.style.background = "#f8f9fa";
                          e.currentTarget.style.transform = "translateX(0)";
                        }
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 7,
                          background: isCorrect ? "#4caf50" : isSelected ? (isWrong ? "#f44336" : "#fff") : "#e0e0e0",
                          border: isCorrect || isSelected ? "none" : `2px solid #ccc`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: isCorrect || isWrong ? "#fff" : (isSelected ? "#FF9800" : "#999"),
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {isCorrect ? "✓" : isWrong ? "✗" : letters[idx] || idx + 1}
                      </div>
                      <span style={{ flex: 1, textAlign: "left", lineHeight: 1.4 }}>{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, paddingTop: 20, borderTop: "1px solid #e0e0e0" }}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentIndex === 0}
                style={{
                  flex: 1,
                  padding: "11px 20px",
                  background: currentIndex === 0 ? "#e0e0e0" : "#fff",
                  color: currentIndex === 0 ? "#999" : "#333",
                  border: currentIndex === 0 ? "none" : "2px solid #FF9800",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: currentIndex === 0 ? "default" : "pointer",
                  transition: "all 0.3s ease",
                  fontSize: 13,
                }}
                onMouseEnter={(e) => {
                  if (currentIndex > 0) {
                    e.target.style.background = "#f0f0f0";
                    e.target.style.transform = "translateX(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentIndex > 0) {
                    e.target.style.background = "#fff";
                    e.target.style.transform = "translateX(0)";
                  }
                }}
              >
                ← Câu trước
              </button>

              {!results[getQuizId(currentQuiz)] ? (
                <button
                  onClick={handleSubmitQuestion}
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: "11px 20px",
                    background: submitting ? "linear-gradient(135deg, #ccc 0%, #bbb 100%)" : "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: submitting ? "none" : "0 4px 15px rgba(76, 175, 80, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
                    }
                  }}
                >
                  {submitting ? "⏳ Đang nộp..." : "✓ Nộp câu trả lời"}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  style={{
                    flex: 2,
                    padding: "11px 20px",
                    background: results[getQuizId(currentQuiz)]?.isCorrect 
                      ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)" 
                      : "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: results[getQuizId(currentQuiz)]?.isCorrect 
                      ? "0 4px 15px rgba(76, 175, 80, 0.3)"
                      : "0 4px 15px rgba(244, 67, 54, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = results[getQuizId(currentQuiz)]?.isCorrect 
                      ? "0 6px 20px rgba(76, 175, 80, 0.4)"
                      : "0 6px 20px rgba(244, 67, 54, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = results[getQuizId(currentQuiz)]?.isCorrect 
                      ? "0 4px 15px rgba(76, 175, 80, 0.3)"
                      : "0 4px 15px rgba(244, 67, 54, 0.3)";
                  }}
                >
                  {results[getQuizId(currentQuiz)]?.isCorrect ? "✓ Đúng! Tiếp tục" : "✗ Sai! Tiếp tục"}
                </button>
              )}
            </div>

            {/* Explanation Card */}
            <ExplanationCard 
              explanation={explanations[getQuizId(currentQuiz)]?.data} 
              loading={explanationLoading && !explanations[getQuizId(currentQuiz)]} 
              error={explanations[getQuizId(currentQuiz)]?.error} 
            />

            {/* Question Navigation Grid - Nằm dưới cùng */}
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: "2px solid #e0e0e0" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 13, fontWeight: 700, color: "#111" }}>📋 Danh sách câu hỏi</h3>
              <div className="quiz-nav-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))", gap: 10 }}>
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
                        aspectRatio: "1",
                        padding: 0,
                        border: `2px solid ${isSelected ? "#FF9800" : isCorrect ? "#4caf50" : isAnswered ? "#FFCA28" : "#e0e0e0"}`,
                        background: isSelected 
                          ? "linear-gradient(135deg, #FFB366 0%, #FFA726 100%)" 
                          : isCorrect 
                          ? "linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(56,142,60,0.1) 100%)"
                          : isAnswered 
                          ? "linear-gradient(135deg, rgba(255,202,40,0.1) 0%, rgba(255,193,7,0.1) 100%)"
                          : "#f8f9fa",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 12,
                        color: isSelected ? "#fff" : (isCorrect ? "#4caf50" : (isAnswered ? "#FFCA28" : "#999")),
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      title={`Câu ${idx + 1}${isCorrect ? " (Đúng)" : isAnswered ? " (Đã trả lời)" : " (Chưa trả lời)"}`}
                    >
                      {isCorrect ? "✓" : idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Progress */}
        <div style={{ position: "sticky", top: 120, height: "fit-content", animation: "slideInRight 0.4s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 14, fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
              📊 Tiến độ làm bài
            </h3>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10, color: "#666", fontWeight: 500 }}>
                <span>Đã trả lời</span>
                <span style={{ fontWeight: 700, color: "#667eea" }}>{answeredCount}/{quizzes.length}</span>
              </div>
              <div style={{ width: "100%", height: 10, background: "linear-gradient(90deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(102,126,234,0.15)" }}>
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    width: `${(answeredCount / quizzes.length) * 100}%`,
                    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10, color: "#666", fontWeight: 500 }}>
                <span>Câu đúng</span>
                <span style={{ fontWeight: 700, color: "#4caf50" }}>{correctCount}/{Object.values(results).length || 0}</span>
              </div>
              <div style={{ width: "100%", height: 10, background: "linear-gradient(90deg, rgba(76,175,80,0.1) 0%, rgba(56,142,60,0.1) 100%)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(76,175,80,0.15)" }}>
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #4caf50 0%, #388e3c 100%)",
                    width: `${Object.values(results).length > 0 ? (correctCount / Object.values(results).length) * 100 : 0}%`,
                    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>

            <div style={{ 
              padding: 16, 
              background: "linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)", 
              borderRadius: 12, 
              textAlign: "center",
              border: "1px solid rgba(102,126,234,0.1)"
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>Đã kiểm tra</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#667eea", marginBottom: 4 }}>
                {Object.values(results).length}
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>trong {quizzes.length} câu</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: "#111" }}>ℹ️ Thông tin bài quiz</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#666", fontSize: 13 }}>Tổng câu hỏi</span>
                <span style={{ fontWeight: 700, color: "#667eea", fontSize: 15 }}>{quizzes.length}</span>
              </div>
              <div style={{ height: "1px", background: "rgba(0,0,0,0.05)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#666", fontSize: 13 }}>Loại bài</span>
                <span style={{ fontWeight: 600, color: "#333", fontSize: 13 }}>Kiểm tra</span>
              </div>
              <div style={{ height: "1px", background: "rgba(0,0,0,0.05)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#666", fontSize: 13 }}>Trạng thái</span>
                <span style={{ fontWeight: 600, color: completed ? "#4caf50" : "#f1b24a", fontSize: 13 }}>
                  {completed ? "✓ Hoàn thành" : "🔄 Đang làm"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIChat
        layout="drawer"
        courseId={courseId}
        lessonId={lessonId}
        quizId={getQuizId(currentQuiz)}
        page="quiz"
        title="Hỗ trợ Quiz"
        defaultOpen={true}
      />
    </div>
  );
}
