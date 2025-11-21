import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getLessonById } from "../services/lesson";
import { getPracticeByLesson, createPractice, submitPracticeAnswer } from "../services/practice";
import { useAuth } from "../context/AuthContext";
import "../css/practice.css";

export default function Practice() {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingPractice, setCreatingPractice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [displayedFeedback, setDisplayedFeedback] = useState("");
  const [displayedSuggestions, setDisplayedSuggestions] = useState("");
  const [activeHint, setActiveHint] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const lessonResponse = await getLessonById(lessonId);
        const lessonData = lessonResponse.lesson;
        setLesson(lessonData);

        try {
          const response = await getPracticeByLesson(lessonId);
          setPractice(response.practice || response);
        } catch (practiceError) {
          if (practiceError.response?.status === 404) {
            await createNewPractice(lessonData);
          } else {
            throw practiceError;
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Không tải được dữ liệu");
        console.error("Error loading practice:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, user, navigate]);

  const createNewPractice = async (lessonData) => {
    try {
      setCreatingPractice(true);
      setError("");

      const practiceData = await createPractice(lessonId, {
        title: `Luyện tập: ${lessonData?.title || "Bài học"}`,
        lessonContent: lessonData?.content || lessonData?.description || `Bài học về ${lessonData?.title || ""}`,
        courseId: lessonData?.course?._id || lessonData?.courseId,
        difficulty: "medium",
        questionType: "open_ended",
      });

      setPractice(practiceData);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tạo được bài luyện tập");
      console.error("Error creating practice:", err);
    } finally {
      setCreatingPractice(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !practice) {
      alert("Vui lòng nhập câu trả lời!");
      return;
    }

    try {
      setSubmitting(true);
      const result = await submitPracticeAnswer(practice._id, {
        answer: userAnswer.trim(),
        question: practice.question,
      });

      setFeedback(result?.feedback || result || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Không nộp được câu trả lời");
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const showHint = () => {
    const hintText = practice?.hints?.[0] || "Đọc kỹ nội dung bài học và tìm từ khóa chính.";
    setActiveHint(hintText);
  };

  // Typewriter effect for feedback
  useEffect(() => {
    if (feedback && feedback.feedback) {
      const fullText = feedback.feedback;
      let currentIndex = 0;
      setDisplayedFeedback("");

      const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedFeedback(prev => prev + fullText[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 15); // Faster typing for better readability with markdown

      return () => clearInterval(interval);
    }
  }, [feedback]);

  // Typewriter effect for suggestions
  useEffect(() => {
    if (feedback && feedback.suggestions) {
      const fullText = feedback.suggestions;
      let currentIndex = 0;
      setDisplayedSuggestions("");

      // Start suggestions after feedback is complete
      const timeout = setTimeout(() => {
        const interval = setInterval(() => {
          if (currentIndex < fullText.length) {
            setDisplayedSuggestions(prev => prev + fullText[currentIndex]);
            currentIndex++;
          } else {
            clearInterval(interval);
          }
        }, 12); // Slightly faster for suggestions

        return () => clearInterval(interval);
      }, feedback.feedback ? feedback.feedback.length * 15 + 500 : 1000);

      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  if (loading) {
    return (
      <div className="practice-loading">
        <div className="spinner" />
        <p>Đang tải bài luyện tập...</p>
      </div>
    );
  }

  if (error) {
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

  if (creatingPractice) {
    return (
      <div className="practice-loading">
        <div className="spinner" />
        <div className="text-center">
          <h3>AI đang tạo bài luyện tập...</h3>
          <p>Đang phân tích nội dung bài học và tạo câu hỏi phù hợp</p>
        </div>
      </div>
    );
  }

  const accuracy = feedback?.score ? Math.min(100, Math.max(0, Math.round((feedback.score / 10) * 100))) : null;

  return (
    <div className="practice-page">
      <div className="practice-grid">
        <section className="practice-card prompt-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Câu hỏi</p>
              <h2>{practice?.question ? "Thực hành với bài học" : "Đang tải câu hỏi..."}</h2>
            </div>
            {activeHint && <div className="hint-pill">Gợi ý: {activeHint}</div>}
          </div>

          <div className="prompt-body">
            {practice?.question ? (
              <>
                <div className="context">
                  <h4>Văn bản/Ngữ cảnh</h4>
                  <p className="context-text">{practice?.lessonContent || lesson?.content || lesson?.description}</p>
                </div>
                <div className="question">
                  <h4>Yêu cầu</h4>
                  <div className="markdown-content question-text">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="question-paragraph">{children}</p>,
                        strong: ({ children }) => <strong>{children}</strong>,
                        em: ({ children }) => <em>{children}</em>,
                        ul: ({ children }) => <ul className="question-list">{children}</ul>,
                        ol: ({ children }) => <ol className="question-list">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        code: ({ children }) => <code>{children}</code>,
                        blockquote: ({ children }) => <blockquote className="question-quote">{children}</blockquote>,
                        h1: ({ children }) => <h4>{children}</h4>,
                        h2: ({ children }) => <h4>{children}</h4>,
                        h3: ({ children }) => <h5>{children}</h5>,
                      }}
                    >
                      {practice.question}
                    </ReactMarkdown>
                  </div>
                </div>
              </>
            ) : (
              <div className="skeleton-block">Đang tải câu hỏi...</div>
            )}
          </div>

          <div className="input-area">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              disabled={submitting}
            />
            <div className="input-actions">
              <button className="btn ghost" onClick={() => navigate(-1)}>
                ← Quit
              </button>
              <div className="actions-right">
                <button className="btn outline" onClick={showHint}>
                  Hint
                </button>
                <button className="btn primary" onClick={handleSubmitAnswer} disabled={submitting || !userAnswer.trim()}>
                  {submitting ? "Đang nộp..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="practice-card feedback-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Feedback</p>
              <h3>AI đánh giá</h3>
            </div>
            <div className="pill success">{accuracy !== null ? `${accuracy}% Accuracy` : "Chưa có điểm"}</div>
          </div>

          {feedback ? (
            <div className="feedback-body">
              <div className="score-box">
                <span>Score</span>
                <strong>{feedback.score}/10</strong>
              </div>
              <div className="feedback-text">
                <h4>Nhận xét</h4>
                <div className="markdown-content">
                  {displayedFeedback && (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p>
                            {children}
                            {feedback && feedback.feedback && displayedFeedback.length < feedback.feedback.length && (
                              <span className="typewriter-cursor"></span>
                            )}
                          </p>
                        ),
                        strong: ({ children }) => <strong>{children}</strong>,
                        em: ({ children }) => <em>{children}</em>,
                        ul: ({ children }) => <ul>{children}</ul>,
                        ol: ({ children }) => <ol>{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        code: ({ children }) => <code>{children}</code>,
                        blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                      }}
                    >
                      {displayedFeedback}
                    </ReactMarkdown>
                  )}
                  {!displayedFeedback && feedback && feedback.feedback && displayedFeedback.length < feedback.feedback.length && (
                    <span className="typewriter-cursor"></span>
                  )}
                </div>
              </div>
              {feedback.suggestions && (
                <div className="suggestions">
                  <h4>Gợi ý cải thiện</h4>
                  <div className="markdown-content">
                    {displayedSuggestions && (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p>
                              {children}
                              {displayedSuggestions.length < feedback.suggestions.length && (
                                <span className="typewriter-cursor"></span>
                              )}
                            </p>
                          ),
                          strong: ({ children }) => <strong>{children}</strong>,
                          em: ({ children }) => <em>{children}</em>,
                          ul: ({ children }) => <ul>{children}</ul>,
                          ol: ({ children }) => <ol>{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          code: ({ children }) => <code>{children}</code>,
                          blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                        }}
                      >
                        {displayedSuggestions}
                      </ReactMarkdown>
                    )}
                    {!displayedSuggestions && displayedSuggestions.length < feedback.suggestions.length && (
                      <span className="typewriter-cursor"></span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="feedback-empty">
              <p>Nộp câu trả lời để nhận feedback.</p>
            </div>
          )}

          <div className="achievements">
            <h4>Today's Achievements</h4>
            <div className="achv-grid">
              <div className="achv">55 Day Streak</div>
              <div className="achv">Bright Mind</div>
              <div className="achv">On Track</div>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}




