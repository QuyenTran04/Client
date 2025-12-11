import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import SkillAssessment from "../components/SkillAssessment";
import "../css/CreateCourseWithAI.css";

const STEP_FLOW = [
  { id: 1, title: "Nhập thông tin", caption: "Mô tả chủ đề & mục tiêu" },
  { id: 2, title: "Đánh giá trình độ", caption: "AI khảo sát để hiểu rõ năng lực" },
  { id: 3, title: "Xem bản nháp", caption: "AI tạo lộ trình phù hợp" },
  { id: 4, title: "Khởi tạo khóa học", caption: "Tài liệu & quiz được sinh" },
];


const DELIVERABLES = [
  {
    title: "Lộ trình đầy đủ",
    detail: "Cấu trúc khóa học 6-20 bài, phù hợp đối tượng bạn chọn.",
  },
  {
    title: "Tài liệu chi tiết",
    detail: "Mỗi bài có mục tiêu, tóm tắt và gợi ý tài liệu bổ sung.",
  },
  {
    title: "Quiz kiểm tra",
    detail: "Quiz được sinh từ nội dung bài giúp học viên ôn tập ngay.",
  },
];

const CREATION_STEPS = [
  "Phân tích chủ đề và kết quả khảo sát",
  "Đánh giá trình độ thực tế",
  "Tạo danh sách bài học phù hợp",
  "Sinh tài liệu tự động",
  "Tạo quiz phù hợp",
  "Lưu khóa học vào hệ thống",
];

export default function CreateCourseWithAI() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const promptRef = useRef(null);

  const [formData, setFormData] = useState({
    prompt: "",
    targetAudience: "",
  });

  const [assessmentData, setAssessmentData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [creationStatus, setCreationStatus] = useState("preparing");
  const [expandedLesson, setExpandedLesson] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("[handleInputChange] name:", name, "value:", value);
    setFormData((prev) => {
      console.log("[handleInputChange] prev:", prev);
      const newFormData = { ...prev, [name]: value };
      console.log("[handleInputChange] newFormData:", newFormData);
      return newFormData;
    });
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleGenerateDraft = async () => {
    if (!formData.prompt.trim()) {
      setError("Vui lòng nhập chủ đề khóa học rõ ràng.");
      return;
    }

    if (!assessmentData) {
      setError("Vui lòng hoàn thành khảo sát trình độ.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestData = {
        ...formData,
        assessment: assessmentData
      };
      const response = await api.post("/ai/courses/draft", requestData);
      setDraft(response.data);
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tạo bản nháp, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (assessment) => {
    setAssessmentData(assessment);
    setLoading(true);
    setError("");

    try {
      const requestData = {
        ...formData,
        assessment: assessment
      };

      console.log("[handleAssessmentComplete] Sending request with assessment:", assessment);
      const response = await api.post("/ai/courses/draft", requestData);

      console.log("[handleAssessmentComplete] Received response:", response.data);
      setDraft(response.data);

      // Add a small delay for better UX transition
      setTimeout(() => {
        setStep(3);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("[handleAssessmentComplete] Error:", err);
      setError(err?.response?.data?.message || "Không thể tạo bản nháp, vui lòng thử lại.");
      setStep(2); // Quay lại assessment nếu lỗi
      setLoading(false);
    }
  };

  const handleBackToBasicInfo = () => {
    setStep(1);
  };

  const proceedToAssessment = () => {
    // Get actual textarea value
    const actualPrompt = promptRef.current ? promptRef.current.value.trim() : '';
    console.log("[proceedToAssessment] formData:", formData);
    console.log("[proceedToAssessment] actualPrompt from ref:", actualPrompt);

    setError(""); // Clear any existing errors first

    if (!actualPrompt) {
      console.log("[proceedToAssessment] Error: Empty prompt");
      setError("Vui lòng nhập chủ đề khóa học rõ ràng.");
      return;
    }

    // Update formData with actual value before proceeding
    setFormData(prev => ({ ...prev, prompt: actualPrompt }));

    console.log("[proceedToAssessment] Moving to step 2");
    setStep(2);
  };

  const handleCreateCourse = async () => {
    const instructorId = user?._id || user?.id;
    if (!instructorId) {
      setError("Vui lòng đăng nhập để tạo khóa học.");
      return;
    }
    setLoading(true);
    setError("");
    setStep(4);
    setCreationStatus("preparing");
    setLessonProgress({});

    try {
      const token = localStorage.getItem("token");
      setStep(4);
      setCreationStatus("preparing");
      
      // 🚀 Step 1: Tạo course + bài 1
      console.log("[CreateCourse] 🚀 POST /courses/start...");
      const startResponse = await api.post("/ai/courses/start", {
        draft,
        instructorId,
      });

      const courseId = startResponse.data.courseId;
      const firstLessonReady = startResponse.data.firstLessonReady;
      const totalLessons = startResponse.data.totalLessons;

      console.log("[CreateCourse] ✅ Course tạo xong:", { 
        courseId, 
        firstLessonReady, 
        totalLessons,
        message: startResponse.data.message 
      });

      // 🎯 Bài 1 đã ready
      setLessonProgress((prev) => ({
        ...prev,
        0: { ready: firstLessonReady, title: draft.lessons[0]?.title || "Bài 1" },
      }));

      // 🎯 Nếu bài 1 sẵn sàng, redirect ngay (stream sẽ chạy background)
      if (firstLessonReady) {
        console.log("[CreateCourse] ✅✅✅ Bài 1 READY! Redirecting to course...");
        setCreationStatus("completed");
        setLoading(false);
        
        // Redirect immediately
        navigate(`/courses/${courseId}`, { replace: true });
        
        // Stream vẫn chạy background để tạo bài 2, 3...
        // Nếu không có > 1 bài thì return ở đây
        if (totalLessons <= 1) {
          console.log("[CreateCourse] Only 1 lesson, no stream needed");
          return;
        }
      } else {
        console.warn("[CreateCourse] ⚠️ firstLessonReady = false, waiting for stream...");
        setCreationStatus("creating_lessons");
      }

      // 🔄 Step 2: Stream bài 2 trở đi (nếu có) - chạy background
      if (totalLessons > 1) {
        const streamUrl = `/api/ai/courses/${courseId}/stream?token=${token ? token.substring(0, 20) + "..." : "none"}&_t=${Date.now()}`;
        console.log("[CreateCourse] 🔄 GET EventSource:", streamUrl);
        
        let streamConnected = false;
        let connectionTimeout;

        const eventSource = new EventSource(
          `/api/ai/courses/${courseId}/stream?token=${token}&_t=${Date.now()}`
        );

        console.log("[CreateCourse] EventSource created:", eventSource.readyState === 0 ? "CONNECTING" : "?");

        // Timeout nếu không nhận được stream_connected sau 30s
        connectionTimeout = setTimeout(() => {
          if (!streamConnected) {
            console.error("[CreateCourse] ⏱️ Stream connection timeout");
            setError("Kết nối stream timeout (30s). Vui lòng thử lại.");
            setCreationStatus("error");
            eventSource.close();
            setLoading(false);
          }
        }, 30000);

        eventSource.addEventListener("open", () => {
          console.log("[CreateCourse] EventSource connected (open event)");
        });

        eventSource.addEventListener("stream_connected", (event) => {
          try {
            streamConnected = true;
            clearTimeout(connectionTimeout);
            const data = JSON.parse(event.data);
            console.log("[Stream] ✅ Connected (background):", data);
          } catch (err) {
            console.error("[Stream] Error parsing stream_connected:", err);
          }
        });

        eventSource.addEventListener("lesson_ready", (event) => {
          try {
            const data = JSON.parse(event.data);
            setLessonProgress((prev) => ({
              ...prev,
              [data.lessonIndex]: { ready: true, title: data.title },
            }));
            console.log(`[Stream] ✅ Bài ${data.lessonIndex + 1} ready:`, data.title);
          } catch (err) {
            console.error("[Stream] Error parsing lesson_ready:", err);
          }
        });

        eventSource.addEventListener("lesson_error", (event) => {
          try {
            const data = JSON.parse(event.data);
            setLessonProgress((prev) => ({
              ...prev,
              [data.lessonIndex]: { ready: false, error: true, title: data.message },
            }));
            console.error(`[Stream] ⚠️ Bài ${data.lessonIndex} error:`, data.message);
          } catch (err) {
            console.error("[Stream] Error parsing lesson_error:", err);
          }
        });

        eventSource.addEventListener("all_lessons_completed", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("[Stream] ✅ Tất cả bài hoàn tất (background):", data);
            clearTimeout(connectionTimeout);
            eventSource.close();
          } catch (err) {
            console.error("[Stream] Error parsing all_lessons_completed:", err);
          }
        });

        eventSource.addEventListener("error", (event) => {
          try {
            const data = JSON.parse(event.data);
            setError(data.message || "Lỗi từ server");
            console.error("[Stream] Event error:", data);
          } catch {
            setError("Có lỗi xảy ra khi xử lý stream");
            console.error("[Stream] Event error (raw):", event);
          }
          clearTimeout(connectionTimeout);
          eventSource.close();
          setCreationStatus("error");
          setLoading(false);
        });

        eventSource.onerror = (err) => {
          console.error("[Stream] ⚠️ Connection error:", err);
          if (!streamConnected) {
            setError("Không thể kết nối stream. Vui lòng kiểm tra server.");
          } else {
            setError("Kết nối stream bị ngắt");
          }
          clearTimeout(connectionTimeout);
          eventSource.close();
          setCreationStatus("error");
          setLoading(false);
        };
      } else {
        // Chỉ có 1 bài duy nhất
        setCreationStatus("completed");
        setLoading(false);

        setTimeout(() => {
          navigate(`/courses/${courseId}`);
        }, 2000);
      }
    } catch (err) {
      console.error("[CreateCourse] Error:", err);
      setError(err?.response?.data?.message || "Không thể tạo khóa học, vui lòng thử lại.");
      setCreationStatus("error");
      setStep(2);
      setLoading(false);
    }
  };

  const lessonPreview = draft?.lessons?.slice(0, 5) || [];
  const totalLessons = draft?.lessons?.length || 0;
  const readyLessons = Object.values(lessonProgress).filter((p) => p.ready).length;

  console.log("[CreateCourseWithAI] Render step:", step, "loading:", loading);

  return (
    <div className="ai-builder">
      <div className="ai-builder__hero">
        <div className="ai-hero__content">
          <div className="ai-hero__badge">
            <span>✨</span> AI Course Studio
          </div>
          <h1 className="ai-hero__title">Tạo khóa học với AI</h1>
          <p className="ai-hero__subtitle">
            Mô tả chủ đề, AI sẽ tạo lộ trình học tập, tài liệu và quiz tự động.
          </p>
        </div>
        <div className="ai-hero__stats">
          <div className="ai-hero__stat">
            <span className="ai-hero__stat-value">6-20</span>
            <span className="ai-hero__stat-label">Bài học</span>
          </div>
          <div className="ai-hero__stat">
            <span className="ai-hero__stat-value">100%</span>
            <span className="ai-hero__stat-label">Tự động</span>
          </div>
          <div className="ai-hero__stat">
            <span className="ai-hero__stat-value">~5'</span>
            <span className="ai-hero__stat-label">Hoàn tất</span>
          </div>
        </div>
      </div>

      <div className="ai-stepper">
        {STEP_FLOW.map((item) => (
          <div key={item.id} className={`ai-step ${item.id === step ? "ai-step--active" : ""}`}>
            <div className="ai-step__dot">{item.id}</div>
            <div>
              <p className="ai-step__title">{item.title}</p>
              <p className="ai-step__caption">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="ai-layout-single">
          {loading ? (
            <div className="ai-card">
              <div className="ai-loading">
                <div className="ai-loading__spinner" />
                <p>AI đang phân tích yêu cầu của bạn...</p>
              </div>
            </div>
          ) : (
            <form className="ai-card ai-form">
            <div className="ai-form__group">
              <label htmlFor="prompt" className="ai-field__label">
                Chủ đề khóa học
                <span>Mô tả chi tiết kết quả bạn mong đợi</span>
              </label>
              <textarea
                id="prompt"
                name="prompt"
                ref={promptRef}
                className="ai-input ai-input--textarea"
                rows={6}
                placeholder="Ví dụ: Lập trình React.js từ cơ bản đến nâng cao • Thiết kế UI/UX cho web app • Phân tích dữ liệu với Excel • Tiếng Anh giao tiếp công việc • Marketing digital cho người mới bắt đầu"
                value={formData.prompt}
                onChange={handleInputChange}
              />
            </div>

            <div className="ai-form__group">
              <label htmlFor="targetAudience" className="ai-field__label">
                Đối tượng học viên
                <span>Nêu rõ cấp độ, ngành nghề hoặc mục tiêu công việc</span>
              </label>
              <input
                id="targetAudience"
                name="targetAudience"
                className="ai-input"
                placeholder="Ví dụ: Sinh viên năm 2 CNTT, người chuyển trái ngành"
                value={formData.targetAudience}
                onChange={handleInputChange}
              />
            </div>

            
            <div className="ai-deliverables">
              {DELIVERABLES.map((item) => (
                <div key={item.title}>
                  <p className="ai-deliverables__title">{item.title}</p>
                  <p className="ai-deliverables__detail">{item.detail}</p>
                </div>
              ))}
            </div>

            {error && <div className="ai-alert ai-alert--error">{error}</div>}

            <div className="ai-form__actions">
              <button type="button" className="ai-btn ai-btn--ghost" onClick={() => navigate(-1)}>
                Thoát
              </button>
              <button
                type="button"
                className="ai-btn ai-btn--primary"
                disabled={loading || !formData.prompt.trim() || !promptRef.current?.value.trim()}
                onClick={() => {
                  console.log("Button clicked - formData:", formData);
                  proceedToAssessment();
                }}
              >
                {loading ? "Đang xử lý..." : "Tiếp tục →"}
              </button>
            </div>
          </form>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="ai-layout-single">
          {loading ? (
            <div className="ai-card ai-analyzing-card">
              <div className="ai-analyzing">
                <div className="ai-analyzing__visual">
                  <div className="ai-analyzing__brain">
                    <svg viewBox="0 0 100 100" className="ai-analyzing__brain-svg">
                      <circle className="ai-analyzing__circle ai-analyzing__circle--1" cx="50" cy="50" r="45" />
                      <circle className="ai-analyzing__circle ai-analyzing__circle--2" cx="50" cy="50" r="35" />
                      <circle className="ai-analyzing__circle ai-analyzing__circle--3" cx="50" cy="50" r="25" />
                    </svg>
                    <div className="ai-analyzing__icon">🧠</div>
                  </div>
                  <div className="ai-analyzing__particles">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className="ai-analyzing__particle" style={{ '--i': i }} />
                    ))}
                  </div>
                </div>
                
                <div className="ai-analyzing__content">
                  <h3 className="ai-analyzing__title">AI đang phân tích kết quả khảo sát</h3>
                  <p className="ai-analyzing__subtitle">Đang tạo lộ trình học tập phù hợp nhất cho bạn</p>
                  
                  <div className="ai-analyzing__progress">
                    <div className="ai-analyzing__progress-bar">
                      <div className="ai-analyzing__progress-fill" />
                    </div>
                  </div>
                  
                  <div className="ai-analyzing__steps">
                    <div className="ai-analyzing__step ai-analyzing__step--active">
                      <span className="ai-analyzing__step-icon">✓</span>
                      <span>Phân tích câu trả lời</span>
                    </div>
                    <div className="ai-analyzing__step ai-analyzing__step--processing">
                      <span className="ai-analyzing__step-icon ai-analyzing__step-icon--loading" />
                      <span>Đánh giá trình độ</span>
                    </div>
                    <div className="ai-analyzing__step">
                      <span className="ai-analyzing__step-icon">○</span>
                      <span>Tạo lộ trình cá nhân hóa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SkillAssessment
              topic={formData.prompt}
              onComplete={handleAssessmentComplete}
              onBack={handleBackToBasicInfo}
            />
          )}
        </div>
      )}

      {step === 3 && draft && (
        <div className="ai-review">
          <div className="ai-review__header">
            <div>
              <p className="ai-eyebrow">Bản nháp sẵn sàng</p>
              <h2>{draft.title}</h2>
              <p className="ai-review__desc">{draft.description}</p>
            </div>
            <div className="ai-review__tags">
              <span>{draft.categoryName}</span>
              <span>{draft.lessons?.length || 0} bài học</span>
              {draft.quizzes?.length ? <span>{draft.quizzes.length} bộ quiz</span> : null}
            </div>
          </div>

          <div className="ai-review__content">
            {/* Tổng quan bên trái */}
            <div className="ai-review__sidebar">
              <div className="ai-card ai-card--info">
                <h3>📊 Thông tin khóa học</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Cấp độ</span>
                    <span className="info-value">{
                      draft.assessedLevel === "Expert" ? "Chuyên gia" :
                      draft.assessedLevel === "Advanced" ? "Nâng cao" :
                      draft.assessedLevel === "Upper Intermediate" ? "Trung cấp khá" :
                      draft.assessedLevel === "Lower Intermediate" ? "Trung cấp cơ bản" :
                      draft.assessedLevel === "Upper Beginner" ? "Sơ cấp nâng cao" :
                      draft.assessedLevel === "Complete Beginner" ? "Hoàn toàn mới bắt đầu" :
                      "Đang đánh giá..."
                    }</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngôn ngữ</span>
                    <span className="info-value">{draft.language || "Tiếng Việt"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Đối tượng</span>
                    <span className="info-value">{draft.targetAudience || formData.targetAudience || "Chưa xác định"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tổng bài học</span>
                    <span className="info-value">{draft.lessons?.length || 0} bài</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách bài học bên phải */}
            <div className="ai-review__main">
              <div className="ai-card ai-card--lessons">
                <div className="lessons-header">
                  <h3>📚 Danh sách bài học</h3>
                  <span className="lessons-count">{draft.lessons?.length || 0} bài học</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0', 
                  maxHeight: '600px', 
                  overflowY: 'auto', 
                  paddingRight: '8px' 
                }}>
                  {draft.lessons?.map((lesson, idx) => {
                    const isExpanded = expandedLesson === idx;
                    const lessonContent = lesson.content || lesson.description || lesson.summary || null;
                    return (
                      <div 
                        key={`lesson-${idx}`} 
                        style={{
                          background: '#ffffff',
                          borderRadius: '10px',
                          border: isExpanded ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          marginBottom: '10px',
                          boxShadow: isExpanded ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {/* Header - Click để mở/đóng */}
                        <div 
                          onClick={() => setExpandedLesson(isExpanded ? null : idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            cursor: 'pointer',
                            background: isExpanded ? '#eff6ff' : '#ffffff',
                            borderRadius: isExpanded ? '8px 8px 0 0' : '10px'
                          }}
                        >
                          {/* Số thứ tự */}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '16px'
                          }}>
                            {idx + 1}
                          </div>
                          
                          {/* Tiêu đề */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              margin: 0,
                              fontWeight: '600',
                              fontSize: '15px',
                              color: '#111827',
                              lineHeight: '1.4',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {lesson.title || `Bài ${idx + 1}`}
                            </div>
                            <div style={{
                              marginTop: '4px',
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>
                              {isExpanded ? '▲ Nhấn để thu gọn' : '▼ Nhấn để xem chi tiết'}
                            </div>
                          </div>
                          
                          {/* Icon mũi tên */}
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isExpanded ? '#3b82f6' : '#f3f4f6',
                            color: isExpanded ? '#ffffff' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              style={{ 
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                                transition: 'transform 0.2s ease' 
                              }}
                            >
                              <path 
                                d="M6 9L12 15L18 9" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Nội dung mở rộng */}
                        {isExpanded && (
                          <div style={{ 
                            padding: '16px', 
                            borderTop: '1px solid #e5e7eb',
                            background: '#fafafa'
                          }}>
                            <div style={{
                              padding: '14px',
                              background: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{
                                marginBottom: '10px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                📝 Nội dung bài học
                              </div>
                              <div style={{
                                color: '#374151',
                                lineHeight: '1.7',
                                fontSize: '14px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}>
                                {lessonContent ? (
                                  lessonContent
                                ) : (
                                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                    Nội dung chi tiết sẽ được tạo tự động khi khóa học được khởi tạo.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="ai-alert ai-alert--error">{error}</div>}

          <div className="ai-review__actions">
            <button type="button" className="ai-btn ai-btn--ghost" disabled={loading} onClick={() => setStep(2)}>
              ← Làm lại khảo sát
            </button>
            <button type="button" className="ai-btn ai-btn--ghost" disabled={loading} onClick={() => setStep(1)}>
              ✏️ Chỉnh sửa thông tin
            </button>
            <button type="button" className="ai-btn ai-btn--success" disabled={loading} onClick={handleCreateCourse}>
              {loading ? "Đang tạo khóa học..." : "✨ Tạo khóa học ngay"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="ai-creating-wrapper">
          <div className="ai-creating-card">
            {/* Header với visual */}
            <div className="ai-creating__header">
              <div className="ai-creating__visual">
                <div className="ai-creating__rocket">
                  <svg viewBox="0 0 120 120" className="ai-creating__rocket-svg">
                    <defs>
                      <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <circle className="ai-creating__orbit ai-creating__orbit--1" cx="60" cy="60" r="50" />
                    <circle className="ai-creating__orbit ai-creating__orbit--2" cx="60" cy="60" r="40" />
                    <circle className="ai-creating__orbit ai-creating__orbit--3" cx="60" cy="60" r="30" />
                  </svg>
                  <div className="ai-creating__icon">🚀</div>
                </div>
                <div className="ai-creating__sparks">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="ai-creating__spark" style={{ '--i': i }} />
                  ))}
                </div>
              </div>
              
              <div className="ai-creating__title-section">
                <h2 className="ai-creating__title">AI đang tạo khóa học</h2>
                <p className="ai-creating__subtitle">
                  Hệ thống đang sinh tài liệu, quiz và nội dung cho từng bài học
                </p>
              </div>
            </div>

            {/* Preparing State */}
            {creationStatus === "preparing" && (
              <div className="ai-creating__preparing">
                <div className="ai-creating__preparing-visual">
                  <div className="ai-creating__gear-container">
                    <div className="ai-creating__gear ai-creating__gear--1">⚙️</div>
                    <div className="ai-creating__gear ai-creating__gear--2">⚙️</div>
                  </div>
                </div>
                <p className="ai-creating__preparing-text">Đang khởi tạo hệ thống...</p>
                <div className="ai-creating__preparing-bar">
                  <div className="ai-creating__preparing-fill" />
                </div>
              </div>
            )}

            {/* Creating Lessons State */}
            {(creationStatus === "creating_lessons" || creationStatus === "completed") && (
              <div className="ai-creating__progress-section">
                {/* Progress Overview */}
                <div className="ai-creating__progress-header">
                  <div className="ai-creating__progress-info">
                    <span className="ai-creating__progress-label">Tiến độ tạo bài học</span>
                    <span className="ai-creating__progress-count">{readyLessons} / {totalLessons}</span>
                  </div>
                  <div className="ai-creating__progress-bar">
                    <div 
                      className="ai-creating__progress-fill"
                      style={{ width: `${totalLessons > 0 ? (readyLessons / totalLessons) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Lessons List */}
                <div className="ai-creating__lessons-list">
                  {draft?.lessons?.map((lesson, idx) => {
                    const progress = lessonProgress[idx];
                    const isReady = progress?.ready;
                    const isError = progress?.error;
                    const isPending = !isReady && !isError;
                    const isProcessing = isPending && idx === readyLessons;

                    return (
                      <div
                        key={`lesson-${idx}`}
                        className={`ai-creating__lesson-item ${isReady ? 'ai-creating__lesson-item--ready' : ''} ${isError ? 'ai-creating__lesson-item--error' : ''} ${isProcessing ? 'ai-creating__lesson-item--processing' : ''}`}
                      >
                        <div className={`ai-creating__lesson-icon ${isProcessing ? 'ai-creating__lesson-icon--spin' : ''}`}>
                          {isReady ? '✓' : isError ? '✕' : isProcessing ? '◐' : '○'}
                        </div>
                        <div className="ai-creating__lesson-info">
                          <span className="ai-creating__lesson-title">Bài {idx + 1}: {lesson.title}</span>
                          <span className="ai-creating__lesson-status">
                            {isReady ? 'Hoàn thành' : isError ? 'Lỗi' : isProcessing ? 'Đang tạo...' : 'Chờ xử lý'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* First Lesson Ready Notice */}
                {lessonProgress[0]?.ready && creationStatus !== "completed" && (
                  <div className="ai-creating__notice ai-creating__notice--success">
                    <span className="ai-creating__notice-icon">🎉</span>
                    <span>Bài 1 đã sẵn sàng! Bạn có thể vào khóa học ngay.</span>
                  </div>
                )}

                {/* Loading indicator */}
                {creationStatus !== "completed" && (
                  <div className="ai-creating__loading-indicator">
                    <div className="ai-creating__loading-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completed State */}
            {creationStatus === "completed" && (
              <div className="ai-creating__completed">
                <div className="ai-creating__completed-icon">🎊</div>
                <h3 className="ai-creating__completed-title">Hoàn tất!</h3>
                <p className="ai-creating__completed-text">Khóa học đã được tạo thành công. Đang chuyển hướng...</p>
              </div>
            )}

            {/* Error State */}
            {creationStatus === "error" && error && (
              <div className="ai-creating__notice ai-creating__notice--error">
                <span className="ai-creating__notice-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .ai-builder {
          min-height: 100vh;
          background: #f8fafc;
          padding: 24px 16px 60px;
        }
        .ai-builder__hero {
          max-width: 900px;
          margin: 0 auto 20px;
          padding: 20px 28px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
          color: #fff;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.12);
        }
        .ai-hero__content {
          flex: 1;
          min-width: 260px;
        }
        .ai-hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          background: rgba(59, 130, 246, 0.25);
          border-radius: 16px;
          font-size: 10px;
          font-weight: 600;
          color: #93c5fd;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .ai-hero__title {
          font-size: 22px;
          margin: 0 0 6px;
          font-weight: 700;
          color: #ffffff;
        }
        .ai-hero__subtitle {
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.65);
          margin: 0;
        }
        .ai-hero__stats {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ai-hero__stat {
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          text-align: center;
          min-width: 65px;
        }
        .ai-hero__stat-value {
          font-size: 16px;
          font-weight: 700;
          display: block;
          color: #60a5fa;
          margin-bottom: 2px;
        }
        .ai-hero__stat-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.55);
        }
        .ai-stepper {
          max-width: 900px;
          margin: 0 auto 20px;
          background: #fff;
          border-radius: 10px;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
          border: 1px solid #e5e7eb;
          position: relative;
        }
        .ai-stepper::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50px;
          right: 50px;
          height: 2px;
          background: #e5e7eb;
          transform: translateY(-50%);
          z-index: 0;
        }
        .ai-step {
          display: flex;
          gap: 8px;
          align-items: center;
          flex: 1;
          opacity: 0.4;
          transition: all 0.25s ease;
          position: relative;
          z-index: 1;
        }
        .ai-step--active {
          opacity: 1;
        }
        .ai-step--active .ai-step__dot {
          background: linear-gradient(135deg, #3b82f6, #0ea5e9);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
        }
        .ai-step__dot {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          background: #cbd5e1;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .ai-step__title {
          margin: 0;
          font-weight: 600;
          font-size: 12px;
          color: #1f2937;
        }
        .ai-step__caption {
          margin: 2px 0 0;
          font-size: 10px;
          color: #6b7280;
          line-height: 1.3;
          display: none;
        }
        .ai-layout {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
          gap: 20px;
        }
        .ai-layout-single {
          max-width: 700px;
          margin: 0 auto;
        }
        .ai-card {
          background: #fff;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
          border: 1p: 0 20px 60px rgba(15, 23, 42, 0.08);
          position: relative;
          border: 1px solid rgba(59, 130, 246, 0.08);
        }
        .ai-card--subtle {
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          border: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .ai-form__group {
          margin-bottom: 28px;
        }
        .ai-field__label {
          display: block;
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
          margin-bottom: 10px;
        }
        .ai-field__label span {
          display: block;
          font-weight: 400;
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .ai-input {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #f8fafc;
          font-family: inherit;
        }
        .ai-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .ai-input--textarea {
          resize: vertical;
          min-height: 140px;
          line-height: 1.6;
        }
        .ai-deliverables {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          padding: 24px;
          border: 1px dashed #bfdbfe;
          border-radius: 16px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          margin-bottom: 24px;
        }
        .ai-deliverables > div {
          padding: 16px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.15);
          transition: all 0.3s ease;
        }
        .ai-deliverables > div:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
        }
        .ai-deliverables__title {
          margin: 0 0 6px;
          font-weight: 700;
          font-size: 14px;
          color: #1e40af;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-deliverables__title::before {
          content: '✓';
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 700;
        }
        .ai-deliverables__detail {
          margin: 0;
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
        }
        .ai-form__actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }
        .ai-field__label {
          font-weight: 600;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          font-size: 14px;
          gap: 4px;
        }
        .ai-field__label span {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 400;
        }
        .ai-input {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
          transition: border 0.2s ease, box-shadow 0.2s ease;
          background: #fff;
        }
        .ai-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .ai-input--textarea {
          resize: none;
          min-height: 150px;
        }
        .ai-form__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .ai-deliverables {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          padding: 16px;
          border: 1px dashed #bfdbfe;
          border-radius: 16px;
          background: #f0f9ff;
          margin-bottom: 20px;
        }
        .ai-deliverables__title {
          margin: 0 0 4px;
          font-weight: 600;
        }
        .ai-deliverables__detail {
          margin: 0;
          font-size: 13px;
          color: #475569;
        }
        .ai-form__actions {
          display: flex;
          gap: 14px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }
        .ai-btn {
          border: none;
          border-radius: 14px;
          padding: 16px 28px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .ai-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .ai-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        .ai-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ai-btn--ghost {
          background: #f1f5f9;
          color: #0f172a;
          border: 2px solid #e2e8f0;
        }
        .ai-btn--ghost:hover:not(:disabled) {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }
        .ai-btn--primary {
          background: linear-gradient(135deg, #3b82f6, #06b6d4) !important;
          color: #fff !important;
          flex: 1;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        .ai-btn--success {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: #fff !important;
          min-width: 200px;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }
        .ai-btn--primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #3b82f6, #06b6d4) !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
        }
        .ai-btn--success:hover:not(:disabled) {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
        }
        .ai-sidebar__text {
          color: #475569;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .ai-sidebar__cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-sidebar__cards h4 {
          margin: 0 0 6px;
        }
        .ai-sidebar__cards p {
          margin: 0;
          color: #475569;
          font-size: 14px;
        }
        .ai-sidebar__note {
          margin-top: 24px;
          padding: 16px;
          border-radius: 16px;
          background: #0f172a;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }
        .ai-alert {
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 14px;
          margin-top: 8px;
        }
        .ai-alert--error {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        .ai-loading {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
          padding: 40px;
        }
        .ai-loading > p {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          animation: fade-in-out 2s ease-in-out infinite;
        }
        .ai-loading__spinner {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 5px solid transparent;
          border-top-color: #3b82f6;
          border-right-color: #06b6d4;
          border-bottom-color: #3b82f6;
          animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          position: relative;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
        }

        .ai-loading__spinner::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: #06b6d4;
          border-left-color: #3b82f6;
          transform: translate(-50%, -50%);
          animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
        }

        .ai-loading__spinner::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          transform: translate(-50%, -50%);
          animation: pulse-center 1.5s ease-in-out infinite;
        }

        @keyframes pulse-center {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        .ai-loading__subtext {
          font-size: 14px;
          color: #64748b;
          margin-top: 0.75rem;
          margin-bottom: 1.5rem;
          font-weight: 500;
          animation: fade-in-out 2s ease-in-out infinite;
        }

        @keyframes fade-in-out {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .ai-loading__dots {
          display: flex;
          gap: 10px;
          justify-content: center;
          align-items: center;
        }

        .ai-loading__dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          animation: bounce-dot 1.4s ease-in-out infinite;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .ai-loading__dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .ai-loading__dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .ai-loading__dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: scale(0.6) translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2) translateY(-12px);
            opacity: 1;
          }
        }
        .ai-review {
          max-width: 1100px;
          margin: 0 auto;
          background: #fff;
          border-radius: 28px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.08);
        }
        .ai-review__header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 32px;
          margin-bottom: 32px;
        }
        .ai-review__header h2 {
          font-size: 32px;
          font-weight: 800;
          margin: 8px 0 12px;
          background: linear-gradient(135deg, #0f172a 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ai-review__desc {
          max-width: 560px;
          color: #475569;
          line-height: 1.6;
        }
        .ai-review__tags {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .ai-review__tags span {
          padding: 8px 16px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          color: #1e40af;
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ai-review__tags span::before {
          content: '•';
          color: #3b82f6;
          font-size: 16px;
        }
        .ai-review__content {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }

        .ai-review__sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ai-review__main {
          min-width: 0;
        }

        .ai-card--info {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid rgba(59, 130, 246, 0.2);
          padding: 28px;
        }

        .ai-card--info h3 {
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 20px;
          color: #0f172a;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .ai-card--lessons {
          background: #fff;
          border: 2px solid rgba(59, 130, 246, 0.1);
          padding: 32px;
        }

        .ai-review__lessons {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 600px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .ai-review__lessons::-webkit-scrollbar {
          width: 6px;
        }

        .ai-review__lessons::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .ai-review__lessons::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 10px;
        }

        .lesson-item {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .lesson-item--expanded {
          border-color: #3b82f6;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
        }

        .lesson-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .lesson-item:hover::before,
        .lesson-item--expanded::before {
          opacity: 1;
        }

        .lesson-header {
          display: flex;
          gap: 16px;
          padding: 20px;
          cursor: pointer;
          align-items: center;
          transition: all 0.3s ease;
        }

        .lesson-header:hover {
          background: rgba(59, 130, 246, 0.05);
        }

        .lesson-number {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .lesson-info {
          flex: 1;
          min-width: 0;
        }

        .lesson-title {
          margin: 0 0 4px;
          font-weight: 700;
          font-size: 16px;
          color: #0f172a;
          line-height: 1.4;
        }

        .lesson-preview {
          margin: 0;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .lesson-toggle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .lesson-item--expanded .lesson-toggle {
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: white;
        }

        .lesson-body {
          padding: 0 20px 20px 20px;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lesson-content-wrapper {
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .lesson-content-wrapper h4 {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .lesson-content-text {
          color: #0f172a;
          line-height: 1.7;
          font-size: 14px;
          white-space: pre-wrap;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .lesson-content-text::-webkit-scrollbar {
          width: 4px;
        }

        .lesson-content-text::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
        }

        .lesson-content-text::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 10px;
        }
        .ai-review__list {
          margin: 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #475569;
        }
        .ai-review__actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .ai-creating {
          max-width: 800px;
          margin: 0 auto;
          padding: 64px;
          text-align: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 32px;
          color: #fff;
          box-shadow: 0 30px 90px rgba(5, 8, 22, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.2);
          position: relative;
          overflow: hidden;
        }
        .ai-creating::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }
        .ai-creating h2 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }
        .ai-creating > p {
          position: relative;
          z-index: 1;
        }
        .ai-creating__orb {
          width: 120px;
          height: 120px;
          margin: 0 auto 32px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.4), rgba(59, 130, 246, 0.1));
          border: 2px solid rgba(56, 189, 248, 0.4);
          animation: pulse-orb 3s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }
        @keyframes pulse-orb {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 20px rgba(56, 189, 248, 0);
          }
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .ai-progress {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.15);
          overflow: hidden;
          margin: 24px 0;
        }
        .ai-progress__bar {
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          animation: progress 2.2s ease-in-out infinite;
        }
        .ai-timeline {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin: 24px 0;
        }
        .ai-timeline__item {
          padding: 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.08);
        }
        .ai-timeline__item span {
          display: inline-flex;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          margin-bottom: 8px;
        }
        .ai-loading__spinner--large {
          margin: 32px auto 0;
          width: 72px;
          height: 72px;
          border-width: 6px;
        }
        .ai-loading__spinner--large::before {
          width: 52px;
          height: 52px;
          border-width: 5px;
        }
        .ai-loading__spinner--large::after {
          width: 32px;
          height: 32px;
        }
        @media (max-width: 960px) {
          .ai-layout {
            grid-template-columns: 1fr;
          }
          .ai-builder__hero {
            flex-direction: column;
          }
          .ai-stepper {
            flex-direction: column;
          }
          .ai-review__actions {
            flex-direction: column;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(120%); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .ai-builder__hero {
            padding: 18px 24px;
          }
          .ai-hero__title {
            font-size: 20px;
          }
          .ai-stepper {
            padding: 10px 16px;
          }
          .ai-review {
            padding: 28px;
          }
          .ai-review__content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .ai-review__sidebar {
            order: 2;
          }
          .ai-review__main {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .ai-builder {
            padding: 16px 12px 50px;
          }
          .ai-builder__hero {
            padding: 16px 20px;
            flex-direction: column;
            gap: 16px;
          }
          .ai-hero__title {
            font-size: 18px;
          }
          .ai-hero__subtitle {
            font-size: 12px;
          }
          .ai-hero__stats {
            width: 100%;
            justify-content: space-between;
            gap: 8px;
          }
          .ai-hero__stat {
            flex: 1;
            min-width: 0;
            padding: 10px 12px;
          }
          .ai-hero__stat-value {
            font-size: 14px;
          }
          .ai-stepper {
            flex-direction: column;
            padding: 12px 16px;
            gap: 8px;
          }
          .ai-stepper::before {
            display: none;
          }
          .ai-step {
            opacity: 1;
          }
          .ai-step__dot {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          .ai-card {
            padding: 28px 20px;
          }
          .ai-review {
            padding: 28px 20px;
          }
          .ai-review__header h2 {
            font-size: 24px;
          }
          .ai-review__actions {
            flex-direction: column;
          }
          .ai-review__actions .ai-btn {
            width: 100%;
          }
          .ai-form__actions {
            flex-direction: column;
          }
          .ai-form__actions .ai-btn {
            width: 100%;
          }
          .ai-deliverables {
            grid-template-columns: 1fr;
            padding: 20px;
          }
          .ai-creating {
            padding: 40px 24px;
          }
          .ai-creating h2 {
            font-size: 22px;
          }
        }

        @media (max-width: 480px) {
          .ai-builder__hero h1 {
            font-size: 24px;
          }
          .ai-hero__stats > div {
            padding: 12px;
          }
          .ai-hero__value {
            font-size: 20px;
          }
          .ai-hero__label {
            font-size: 11px;
          }
          .ai-step__title {
            font-size: 13px;
          }
          .ai-step__caption {
            font-size: 11px;
          }
        }

        /* Lesson Card Styles - Inline Override */
        .ai-card--lessons .lesson-card {
          margin-bottom: 12px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .ai-card--lessons .lesson-card__header {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          cursor: pointer;
          align-items: center;
          background: transparent;
        }
        .ai-card--lessons .lesson-card__number {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          flex-shrink: 0;
        }
        .ai-card--lessons .lesson-card__info {
          flex: 1;
          min-width: 0;
        }
        .ai-card--lessons .lesson-card__title {
          margin: 0 0 6px;
          font-weight: 700;
          font-size: 16px;
          color: #1e293b;
          line-height: 1.5;
        }
        .ai-card--lessons .lesson-card__hint {
          margin: 0;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }
        .ai-card--lessons .lesson-card__icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ai-card--lessons .lesson-card--expanded .lesson-card__icon {
          background: #3b82f6;
          color: white;
        }
        .ai-card--lessons .lesson-card__content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
          opacity: 0;
        }
        .ai-card--lessons .lesson-card__content--visible {
          max-height: 800px;
          opacity: 1;
        }
        .ai-card--lessons .lesson-card__content-inner {
          padding: 0 20px 20px 20px;
        }
        .ai-card--lessons .content-section {
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .ai-card--lessons .content-section__title {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .ai-card--lessons .content-section__text {
          color: #0f172a;
          line-height: 1.8;
          font-size: 15px;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}
