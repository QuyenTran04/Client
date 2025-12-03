import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import SkillAssessment from "../components/SkillAssessment";

const STEP_FLOW = [
  { id: 1, title: "Nhập thông tin", caption: "Mô tả chủ đề & mục tiêu" },
  { id: 2, title: "Đánh giá trình độ", caption: "AI khảo sát để hiểu rõ năng lực" },
  { id: 3, title: "Xem bản nháp", caption: "AI tạo lộ trình phù hợp" },
  { id: 4, title: "Khởi tạo khóa học", caption: "Tài liệu & quiz được sinh" },
];

const SIDE_CARDS = [
  {
    title: "AI Research",
    description: "Hệ thống đọc prompt, trích thông tin và xây dựng mục tiêu rõ ràng.",
  },
  {
    title: "Lesson Builder",
    description: "AI đề xuất 6-20 bài, sắp xếp theo mức độ kèm gợi ý tài liệu.",
  },
  {
    title: "Quiz & Docs",
    description: "Mỗi bài được tạo tài liệu markdown và bộ câu hỏi từ nội dung.",
  },
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
        <div>
          <p className="ai-eyebrow">AI Course Studio</p>
          <h1>Tạo khóa học trong vài phút</h1>
          <p className="ai-hero__subtitle">
            Điền chủ đề, phần còn lại để AI xử lý: lộ trình bài học, tài liệu, quiz và mức độ phù hợp.
          </p>
        </div>
        <div className="ai-hero__stats">
          <div>
            <span className="ai-hero__value">6 - 20</span>
            <span className="ai-hero__label">Bài học đề xuất</span>
          </div>
          <div>
            <span className="ai-hero__value">100%</span>
            <span className="ai-hero__label">Tài liệu & quiz tự động</span>
          </div>
          <div>
            <span className="ai-hero__value">~5 phut</span>
            <span className="ai-hero__label">Thời gian hoàn tất</span>
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
        <div className="ai-layout">
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
          <aside className="ai-card ai-sidebar">
            <p className="ai-eyebrow">AI Toolkit</p>
            <h3>Bạn sẽ nhận dữ liệu gì?</h3>
            <p className="ai-sidebar__text">
              AI xu ly yeu cau cua ban de tao ke hoach hoc tap hoan chinh. Hay mo ta cu the ve muc tieu, rang buoc,
              tai nguyen co san neu co.
            </p>
            <div className="ai-sidebar__cards">
              {SIDE_CARDS.map((card) => (
                <div key={card.title}>
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
            <div className="ai-sidebar__note">
              <p>
                Sau khi bạn nhận bản nháp, có thể điều chỉnh nội dung trước khi tạo khóa học chính thức. Mỗi lần sinh
                lại sẽ dựa trên prompt hiện tại.
              </p>
            </div>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className="ai-layout">
          {loading ? (
            <div className="ai-card">
              <div className="ai-loading">
                <div className="ai-loading__spinner" />
                <p>AI đang phân tích kết quả khảo sát...</p>
                <p className="ai-loading__subtext">Đang tạo lộ trình học tập phù hợp nhất cho bạn</p>
                <div className="ai-loading__dots">
                  <span></span>
                  <span></span>
                  <span></span>
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

          <aside className="ai-card ai-sidebar">
            <p className="ai-eyebrow">AI Assessment</p>
            <h3>Tại sao cần khảo sát?</h3>
            <p className="ai-sidebar__text">
              AI sẽ phân tích câu trả lời của bạn để xác định chính xác trình độ hiện tại, từ đó tạo ra lộ trình học tập phù hợp nhất.
            </p>
            <div className="ai-sidebar__cards">
              <div>
                <h4>Khảo sát thông minh</h4>
                <p>Câu hỏi được tạo riêng dựa trên chủ đề bạn nhập, đảm bảo đánh giá chính xác nhất</p>
              </div>
              <div>
                <h4>Đánh giá chính xác</h4>
                <p>AI phân tích câu trả lời chi tiết để xác định trình độ thực tế, không cần tự đánh giá</p>
              </div>
              <div>
                <h4>Nội dung cá nhân hóa</h4>
                <p>Khóa học được điều chỉnh theo năng lực và mục tiêu cụ thể của bạn</p>
              </div>
              <div>
                <h4>Tối ưu hóa lộ trình</h4>
                <p>Tránh nội dung quá dễ hoặc quá khó, tập trung vào kiến thức thực sự cần thiết</p>
              </div>
            </div>
            <div className="ai-sidebar__note">
              <p>
                Khảo sát chỉ mất 2-3 phút với các câu hỏi liên quan trực tiếp đến khóa học bạn muốn tạo. Câu trả lời trung thực sẽ giúp AI tạo ra khóa học hoàn hảo cho bạn!
              </p>
            </div>
          </aside>
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

          <div className="ai-review__grid">
            <div className="ai-card ai-card--subtle">
              <h3>Tổng quan mục tiêu</h3>
              <p>Cấp độ: {
                draft.assessedLevel === "Expert" ? "Chuyên gia" :
                draft.assessedLevel === "Advanced" ? "Nâng cao" :
                draft.assessedLevel === "Upper Intermediate" ? "Trung cấp khá" :
                draft.assessedLevel === "Lower Intermediate" ? "Trung cấp cơ bản" :
                draft.assessedLevel === "Upper Beginner" ? "Sơ cấp nâng cao" :
                draft.assessedLevel === "Complete Beginner" ? "Hoàn toàn mới bắt đầu" :
                "Đang đánh giá..."
              }</p>
              <p>Ngôn ngữ: {draft.language || "Tiếng Việt"}</p>
              <p>Đối tượng: {draft.targetAudience || formData.targetAudience || "Chưa xác định"}</p>
              {draft.assessmentInsights && (
                <div className="assessment-insights">
                  <div className="assessment-insights__content">
                    {draft.assessmentInsights}
                  </div>
                </div>
              )}
            </div>

            <div className="ai-card ai-card--subtle">
              <h3>Danh sach bài học</h3>
              <ul className="ai-review__lessons">
                {lessonPreview.map((lesson, idx) => (
                  <li key={lesson.title + idx}>
                    <span>{idx + 1}.</span>
                    <div>
                      <p className="ai-review__lesson-title">{lesson.title}</p>
                      <p className="ai-review__lesson-desc">
                        {(lesson.content || "").slice(0, 120)}
                        {lesson.content?.length > 120 ? "..." : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {draft.lessons?.length > 5 && (
                <p className="ai-review__more">
                  + {draft.lessons.length - 5} bài học khác sẽ được tạo trong hệ thống
                </p>
              )}
            </div>

            <div className="ai-card ai-card--subtle">
              <h3>AI sẽ làm gì tiếp?</h3>
              <ol className="ai-review__list">
                {CREATION_STEPS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>

          {error && <div className="ai-alert ai-alert--error">{error}</div>}

          <div className="ai-review__actions">
            <button type="button" className="ai-btn ai-btn--ghost" disabled={loading} onClick={() => setStep(2)}>
              Làm lại khảo sát
            </button>
            <button type="button" className="ai-btn ai-btn--ghost" disabled={loading} onClick={() => setStep(1)}>
              Chỉnh sửa thông tin
            </button>
            <button type="button" className="ai-btn ai-btn--success" disabled={loading} onClick={handleCreateCourse}>
              {loading ? "Đang tạo khóa học..." : "Tạo khóa học"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="ai-creating">
          <div className="ai-creating__orb" />
          <h2>AI đang tạo khóa học của bạn</h2>
          <p>
            Hệ thống đang sinh tài liệu, quiz và gắn nội dung vào từng bài học. Bài 1 sẽ được hiển thị trước, các bài còn lại sẽ được tạo tự động.
          </p>

          {creationStatus === "preparing" && (
            <>
              <p style={{ marginTop: "20px", fontSize: "14px", color: "#94a3b8" }}>Đang chuẩn bị...</p>
              <div className="ai-loading__spinner ai-loading__spinner--large" />
            </>
          )}

          {(creationStatus === "creating_lessons" || creationStatus === "completed") && (
            <div className="ai-lessons-progress">
              <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>
                  Tiến độ tạo bài học: {readyLessons} / {totalLessons}
                </p>
                <div className="ai-progress">
                  <div
                    className="ai-progress__bar"
                    style={{
                      width: `${totalLessons > 0 ? (readyLessons / totalLessons) * 100 : 0}%`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              <div style={{ maxHeight: "350px", overflowY: "auto", marginBottom: "24px", paddingRight: "8px" }}>
                {draft?.lessons?.map((lesson, idx) => {
                  const progress = lessonProgress[idx];
                  const isReady = progress?.ready;
                  const isError = progress?.error;
                  const isPending = !isReady && !isError;

                  return (
                    <div
                      key={`lesson-${idx}`}
                      style={{
                        padding: "12px 16px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        background: isReady
                          ? "rgba(16, 185, 129, 0.1)"
                          : isError
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(148, 163, 184, 0.1)",
                        border: `1px solid ${
                          isReady
                            ? "#10b981"
                            : isError
                            ? "#ef4444"
                            : "#cbd5e1"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#fff",
                          background: isReady
                            ? "#10b981"
                            : isError
                            ? "#ef4444"
                            : "#cbd5e1",
                          flexShrink: 0,
                        }}
                      >
                        {isReady ? "✓" : isError ? "✕" : idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#0f172a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Bài {idx + 1}: {lesson.title}
                        </p>
                        {isReady && (
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#10b981" }}>
                            Sẵn sàng
                          </p>
                        )}
                        {isPending && (
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                            Đang tạo...
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {lessonProgress[0]?.ready && creationStatus !== "completed" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid #10b981",
                    marginBottom: "24px",
                  }}
                >
                  <p style={{ margin: "0", fontSize: "14px", color: "#10b981", fontWeight: "500" }}>
                    ✓ Bài 1 đã sẵn sàng! Bạn có thể vào khóa học ngay bây giờ.
                  </p>
                </div>
              )}

              {creationStatus !== "completed" && <div className="ai-loading__spinner ai-loading__spinner--large" />}
            </div>
          )}

          {creationStatus === "completed" && (
            <div
              style={{
                padding: "24px",
                borderRadius: "16px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "2px solid #10b981",
                marginTop: "24px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#10b981", margin: "0 0 8px" }}>
                ✓ Hoàn tất!
              </p>
              <p style={{ fontSize: "14px", color: "#059669", margin: "0" }}>
                Khóa học đã được tạo thành công. Đang chuyển hướng...
              </p>
            </div>
          )}

          {creationStatus === "error" && error && (
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #ef4444",
                marginTop: "24px",
              }}
            >
              <p style={{ margin: "0", fontSize: "14px", color: "#ef4444" }}>{error}</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .ai-builder {
          min-height: 100vh;
          background: radial-gradient(circle at top, #f3f4ff 0%, #ecf7ff 40%, #f9fbff 100%);
          padding: 56px 16px 80px;
        }
        .ai-builder__hero {
          max-width: 960px;
          margin: 0 auto 32px;
          padding: 32px;
          border-radius: 28px;
          background: linear-gradient(120deg, #101935, #1f3160 60%, #354e9f);
          color: #fff;
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          justify-content: space-between;
        }
        .ai-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #9cc6ff;
        }
        .ai-builder__hero h1 {
          font-size: 36px;
          margin: 0 0 12px;
        }
        .ai-hero__subtitle {
          max-width: 520px;
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
        }
        .ai-hero__stats {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .ai-hero__value {
          font-size: 28px;
          font-weight: 700;
          display: block;
        }
        .ai-hero__label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
        }
        .ai-stepper {
          max-width: 960px;
          margin: 0 auto 32px;
          background: #fff;
          border-radius: 16px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }
        .ai-step {
          display: flex;
          gap: 12px;
          align-items: center;
          flex: 1;
          opacity: 0.4;
        }
        .ai-step--active {
          opacity: 1;
        }
        .ai-step__dot {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #5b7cfd, #5de0ff);
        }
        .ai-step__title {
          margin: 0;
          font-weight: 700;
        }
        .ai-step__caption {
          margin: 4px 0 0;
          font-size: 13px;
          color: #64748b;
        }
        .ai-layout {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
          gap: 24px;
        }
        .ai-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
          position: relative;
        }
        .ai-card--subtle {
          box-shadow: none;
          border: 1px solid #e2e8f0;
        }
        .ai-form__group {
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
          border-color: #5b7cfd;
          box-shadow: 0 0 0 3px rgba(91, 124, 253, 0.15);
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
          border: 1px dashed #dbeafe;
          border-radius: 16px;
          background: #f8fbff;
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
          gap: 12px;
          margin-top: 12px;
        }
        .ai-btn {
          border: none;
          border-radius: 12px;
          padding: 14px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .ai-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .ai-btn--ghost {
          background: #f1f5f9;
          color: #0f172a;
        }
        .ai-btn--primary {
          background: linear-gradient(135deg, #5b7cfd, #5de0ff);
          color: #fff;
          flex: 1;
        }
        .ai-btn--success {
          background: linear-gradient(135deg, #34d399, #059669);
          color: #fff;
          min-width: 180px;
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
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-align: center;
        }
        .ai-loading__spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid #e2e8f0;
          border-top-color: #5b7cfd;
          animation: spin 1s linear infinite;
        }

        .ai-loading__subtext {
          font-size: 13px;
          color: #64748b;
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .ai-loading__dots {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .ai-loading__dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5b7cfd;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .ai-loading__dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .ai-loading__dots span:nth-child(2) {
          animation-delay: 0.3s;
        }

        .ai-loading__dots span:nth-child(3) {
          animation-delay: 0.6s;
        }
        .ai-review {
          max-width: 960px;
          margin: 0 auto;
          background: #fff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
        }
        .ai-review__header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 24px;
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
        }
        .ai-review__tags span {
          padding: 6px 12px;
          background: #f1f5f9;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
        }
        .ai-review__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .ai-review__lessons {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ai-review__lessons li {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: #f8fafc;
        }
        .ai-review__lesson-title {
          margin: 0 0 4px;
          font-weight: 600;
        }
        .ai-review__lesson-desc {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }
        .ai-review__more {
          font-size: 12px;
          color: #475569;
          margin-top: 12px;
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

        .assessment-insights {
          margin-top: 12px;
          padding: 16px;
          background: rgba(91, 124, 253, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(91, 124, 253, 0.2);
        }

        .assessment-insights__content {
          font-size: 13px;
          color: #1e40af;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .assessment-insights__content strong {
          color: #1d4ed8;
          font-weight: 600;
        }
        .ai-creating {
          max-width: 720px;
          margin: 0 auto;
          padding: 60px;
          text-align: center;
          background: #050816;
          border-radius: 28px;
          color: #fff;
          box-shadow: 0 30px 90px rgba(5, 8, 22, 0.8);
        }
        .ai-creating__orb {
          width: 96px;
          height: 96px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(93, 224, 255, 0.35), rgba(91, 124, 253, 0.1));
          border: 1px solid rgba(93, 224, 255, 0.3);
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
          background: linear-gradient(90deg, #5b7cfd, #5de0ff);
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
          margin: 24px auto 0;
          width: 64px;
          height: 64px;
          border-width: 5px;
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
      `}</style>
    </div>
  );
}
