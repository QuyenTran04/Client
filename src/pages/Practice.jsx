import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import AceEditor from "react-ace";
import { getLessonById } from "../services/lesson";
import { getPracticeByLesson, createPractice, submitPracticeAnswer } from "../services/practice";
import { useAuth } from "../context/AuthContext";
import "../css/practice.css";

// Import Ace Editor themes and modes
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/ext-language_tools";

// Custom hook for typewriter effect
const useTypewriter = (text, speed = 25, delay = 0) => {
  const [displayText, setDisplayText] = useState("");
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const textRef = useRef("");

  useEffect(() => {
    // Clear previous intervals/timeouts
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!text || typeof text !== 'string') {
      setDisplayText("");
      textRef.current = "";
      return;
    }

    // Reset only if text actually changed
    if (textRef.current !== text) {
      setDisplayText("");
      textRef.current = text;
    }

    // Start with delay
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setDisplayText(prev => {
          if (prev.length < text.length) {
            return text.slice(0, prev.length + 1);
          } else {
            clearInterval(intervalRef.current);
            return prev;
          }
        });
      }, speed);
    }, delay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speed, delay]);

  return displayText;
};

// Common sanitizer: gỡ mọi "undefined"/"null" rơi vãi, giữ nguyên nội dung hợp lệ
const cleanText = (value) => {
  const toText = () => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.filter(Boolean).join(" ");
    if (typeof value === "object" && typeof value.text === "string") return value.text;
    return value != null ? String(value) : "";
  };

  let text = toText();

  // Remove trailing "undefined" or "null" artifacts only
  text = text.replace(/\bundefined\b\s*$/gi, "").replace(/\bnull\b\s*$/gi, "");

  return text.trim();
};

// Ensure AI feedback fields are always clean strings (avoid trailing "undefined")
const normalizeFeedbackResponse = (raw) => {
  if (!raw) return null;

  return {
    ...raw,
    score: typeof raw.score === "number" ? raw.score : Number(raw.score) || 0,
    feedback: cleanText(raw.feedback || raw.response || raw.message),
    suggestions: cleanText(raw.suggestions || raw.improvement || raw.improvements),
  };
};

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
  const [codeAnswer, setCodeAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [activeHint, setActiveHint] = useState("");
  const [useCodeEditor, setUseCodeEditor] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");

  // Sanitize at render-time để gỡ đuôi rác nếu có
  const feedbackText = cleanText(feedback?.feedback || "");
  const suggestionsText = cleanText(feedback?.suggestions || "");

  // Use custom hook for typewriter effects
  const displayedFeedback = useTypewriter(feedbackText, 20, 0);
  const displayedSuggestions = useTypewriter(suggestionsText, 15, 1000);

  // Ưu tiên text đang gõ (typewriter), fallback về bản đầy đủ
  const renderedFeedback = displayedFeedback || feedbackText;
  const renderedSuggestions = displayedSuggestions || suggestionsText;

  // Debug log for feedback - Only log when feedback actually changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && feedback && feedback.score !== undefined) {
      console.log("[Practice Debug] Feedback received:", {
        score: feedback.score,
        hasFeedback: !!feedback.feedback,
        hasSuggestions: !!feedback.suggestions
      });
    }
  }, [feedback?.score, feedback?.feedback, feedback?.suggestions]);

  // State cho hệ thống câu hỏi tuần tự
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionResults, setQuestionResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  // Câu hỏi hiện tại dựa trên chỉ số
  const currentQuestion = practice?.questions?.[currentQuestionIndex];

  // Xác định bài lập trình để bật code editor
  const isProgrammingCourse =
    lesson?.category?.name?.toLowerCase().includes("lập trình") ||
    lesson?.category?.name?.toLowerCase().includes("programming") ||
    lesson?.title?.toLowerCase().includes("code") ||
    currentQuestion?.question?.toLowerCase().includes("code") ||
    currentQuestion?.question?.toLowerCase().includes("viết") ||
    currentQuestion?.question?.toLowerCase().includes("function") ||
    currentQuestion?.question?.toLowerCase().includes("hàm");

  // Auto-detect ngôn ngữ lập trình từ câu hỏi
  useEffect(() => {
    if (currentQuestion?.question) {
      const question = currentQuestion.question.toLowerCase();
      if (question.includes("javascript") || question.includes("js") || question.includes("node")) {
        setCodeLanguage("javascript");
      } else if (question.includes("python")) {
        setCodeLanguage("python");
      } else if (question.includes("java")) {
        setCodeLanguage("java");
      } else if (question.includes("c++") || question.includes("cpp") || question.includes("c++")) {
        setCodeLanguage("c_cpp");
      } else if (question.includes("html")) {
        setCodeLanguage("html");
      } else if (question.includes("css")) {
        setCodeLanguage("css");
      } else if (question.includes("sql")) {
        setCodeLanguage("sql");
      } else if (question.includes("php")) {
        setCodeLanguage("php");
      } else {
        setCodeLanguage("javascript"); // default
      }
    }
  }, [currentQuestion]);

  // Tự động chọn editor code/text
  useEffect(() => {
    setUseCodeEditor(isProgrammingCourse);
  }, [isProgrammingCourse]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

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

  const handleSubmitAnswer = async () => {
    // Validate answer based on input mode
    const answerText = useCodeEditor ? codeAnswer.trim() : userAnswer.trim();
    if (!answerText || !practice) {
      alert(useCodeEditor ? "Vui lòng nhập code của bạn!" : "Vui lòng nhập câu trả lời!");
      return;
    }

    try {
      setSubmitting(true);

      const currentQuestion = practice.questions?.[currentQuestionIndex];
      if (!currentQuestion) return;

      // Prepare answer with additional metadata for code answers
      let answerData = {
        answer: answerText,
        question: currentQuestion.question,
      };

      // Add code-specific metadata
      if (useCodeEditor) {
        answerData = {
          ...answerData,
          answerType: 'code',
          language: codeLanguage,
        };
      }

      const result = await submitPracticeAnswer(practice._id, answerData);

      const feedbackData = normalizeFeedbackResponse(result?.feedback || result || null);
      setFeedback(feedbackData);

      // Lưu kết quả câu hỏi hiện tại
      const questionResult = {
        questionIndex: currentQuestionIndex,
        question: currentQuestion.question,
        userAnswer: answerText,
        answerType: useCodeEditor ? 'code' : 'text',
        codeLanguage: useCodeEditor ? codeLanguage : null,
        feedback: feedbackData,
        score: feedbackData?.score || 0,
        isCorrect: (feedbackData?.score || 0) >= 7,
      };

      setQuestionResults(prev => [...prev, questionResult]);
      setCurrentScore(prev => prev + (feedbackData?.score || 0));
      setShowResult(true);
      setIsAnswered(true);

    } catch (err) {
      setError(err?.response?.data?.message || "Không nộp được câu trả lời");
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (practice.questions?.length - 1)) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer("");
      setCodeAnswer("");
      setFeedback(null);
      setShowResult(false);
      setIsAnswered(false);
    } else {
      // Đã hoàn thành tất cả câu hỏi
      navigate("/practice-completed", {
        state: {
          results: questionResults,
          totalScore: currentScore,
          totalQuestions: practice.questions?.length,
          lesson
        }
      });
    }
  };

  // Hàm quay lại câu hỏi trước (nếu cần)
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const previousResult = questionResults[currentQuestionIndex - 1];
      if (previousResult) {
        setUserAnswer(previousResult.answerType === 'code' ? "" : previousResult.userAnswer);
        setCodeAnswer(previousResult.answerType === 'code' ? previousResult.userAnswer : "");
        setFeedback(previousResult.feedback);
        setShowResult(true);
        setIsAnswered(true);
      } else {
        setUserAnswer("");
        setCodeAnswer("");
        setFeedback(null);
        setShowResult(false);
        setIsAnswered(false);
      }
    }
  };

  const progress = ((currentQuestionIndex + 1) / (practice?.questions?.length || 1)) * 100;

  const showHint = () => {
    const hintText = practice?.hints?.[0] || "Đọc kỹ nội dung bài học và tìm từ khóa chính.";
    setActiveHint(hintText);
  };

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
              <p className="eyebrow">Câu hỏi {currentQuestionIndex + 1}/{practice?.questions?.length || 1}</p>
              <h2>Thực hành với bài học</h2>
            </div>
            {activeHint && <div className="hint-pill">Gợi ý: {activeHint}</div>}
          </div>

          {/* Progress bar */}
          <div className="progress-container">
            <div className="progress-info">
              <span>Tiến độ: {currentQuestionIndex + 1}/{practice?.questions?.length || 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="prompt-body">
            {currentQuestion ? (
              <div className="question">
                <h4>Câu hỏi {currentQuestionIndex + 1}</h4>
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
                    {currentQuestion.question}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="skeleton-block">Đang tải câu hỏi...</div>
            )}
          </div>

          <div className="input-area">
            {/* Hiển thị kết quả nếu đã trả lời */}
            {showResult && feedback && (
              <div className={`answer-result ${feedback.score >= 7 ? 'correct' : 'incorrect'}`}>
                <div className="result-indicator">
                  {feedback.score >= 7 ? (
                    <>
                      <span className="result-icon">✅</span>
                      <span className="result-text">Đúng! Score: {feedback.score}/10</span>
                    </>
                  ) : (
                    <>
                      <span className="result-icon">❌</span>
                      <span className="result-text">Chưa chính xác. Score: {feedback.score}/10</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Answer Input Area - Text or Code Editor */}
            <div className="answer-input-area">
              {/* Toggle buttons for programming courses */}
              {isProgrammingCourse && (
                <div className="answer-toggle">
                  <button
                    className={`toggle-btn ${!useCodeEditor ? 'active' : ''}`}
                    onClick={() => setUseCodeEditor(false)}
                  >
                    📝 Text
                  </button>
                  <button
                    className={`toggle-btn ${useCodeEditor ? 'active' : ''}`}
                    onClick={() => setUseCodeEditor(true)}
                  >
                    💻 Code
                  </button>
                </div>
              )}

              {/* Text Input */}
              {!useCodeEditor ? (
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời của bạn..."
                  disabled={submitting || isAnswered}
                  className="answer-textarea"
                />
              ) : (
                <div className="code-editor-container">
                  <div className="code-editor-header">
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="language-selector"
                      disabled={submitting || isAnswered}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="c_cpp">C/C++</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="sql">SQL</option>
                      <option value="php">PHP</option>
                    </select>
                  </div>
                  <AceEditor
                    mode={codeLanguage}
                    theme="monokai"
                    value={codeAnswer}
                    onChange={(newCode) => setCodeAnswer(newCode)}
                    name="code-answer-editor"
                    editorProps={{ $blockScrolling: true }}
                    setOptions={{
                      enableBasicAutocompletion: true,
                      enableLiveAutocompletion: true,
                      enableSnippets: true,
                      showLineNumbers: true,
                      tabSize: 2,
                      fontSize: 14,
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                    }}
                    width="100%"
                    height="200px"
                    readOnly={submitting || isAnswered}
                  />
                </div>
              )}
            </div>
            <div className="input-actions">
              <button className="btn ghost" onClick={() => navigate(-1)}>
                ← Quit
              </button>
              <div className="actions-right">
                {/* Nút Previous Question */}
                {currentQuestionIndex > 0 && (
                  <button
                    className="btn outline"
                    onClick={handlePreviousQuestion}
                    disabled={submitting}
                  >
                    ← Câu trước
                  </button>
                )}

                <button
                  className="btn outline"
                  onClick={showHint}
                  disabled={submitting}
                >
                  Hint
                </button>

                {/* Nút Submit hoặc Next */}
                {!isAnswered ? (
                  <button
                    className="btn primary"
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !(useCodeEditor ? codeAnswer.trim() : userAnswer.trim())}
                  >
                    {submitting ? "Đang nộp..." : "Nộp bài"}
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={handleNextQuestion}
                    disabled={submitting}
                  >
                    {currentQuestionIndex < (practice?.questions?.length - 1) ?
                      "Câu tiếp theo →" : "Hoàn thành →"
                    }
                  </button>
                )}
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
                  {renderedFeedback && (
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
                      {renderedFeedback}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
              {renderedSuggestions && (
                <div className="suggestions">
                  <h4>Gợi ý cải thiện</h4>
                  <div className="markdown-content">
                    {renderedSuggestions && (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p>
                              {children}
                              {feedback?.suggestions && displayedSuggestions.length < feedback.suggestions.length && (
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
                        {renderedSuggestions}
                      </ReactMarkdown>
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
