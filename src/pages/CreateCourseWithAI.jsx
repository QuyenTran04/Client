import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CreateCourseWithAI() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: form, 2: review, 3: creating
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");

  const [formData, setFormData] = useState({
    prompt: "",
    targetAudience: "",
    level: "Beginner",
    language: "vi",
  });

  const [draft, setDraft] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGenerateDraft = async (e) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      setError("Vui lòng nhập chủ đề khóa học");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/ai/courses/draft", formData);
      setDraft(response.data);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi tạo bản nháp");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    const instructorId = user?._id || user?.id;
    if (!instructorId) {
      setError("Vui lA�ng �`��ng nh��-p lA�i �`��� t���o khA3a h��?c.");
      return;
    }
    setLoading(true);
    setError("");
    setStep(3);

    try {
      const response = await api.post("/ai/courses", {
        draft,
        instructorId,
      });
      setTimeout(() => {
        navigate(`/courses/${response.data.courseId}`);
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi tạo khóa học");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, animation: "fadeInDown 0.5s ease-out" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 8 }}>
            🤖 Tạo Khóa Học với AI
          </h1>
          <p style={{ fontSize: 16, color: "#666" }}>
            Nhập thông tin, AI sẽ tự động tạo khóa học hoàn chỉnh cho bạn
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", gap: 20, marginBottom: 40, justifyContent: "center" }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: s <= step ? "linear-gradient(135deg, #FFB366 0%, #FFA726 100%)" : "#e0e0e0",
                  color: s <= step ? "#fff" : "#999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {s}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: s <= step ? "#FF9800" : "#999" }}>
                {s === 1 ? "Thông tin" : s === 2 ? "Xem lại" : "Tạo"}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Form */}
        {step === 1 && (
          <div style={{ 
            background: "#fff", 
            borderRadius: 16, 
            padding: 40, 
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            position: "relative",
            opacity: loading ? 0.7 : 1,
            pointerEvents: loading ? "none" : "auto"
          }}>
            <form onSubmit={handleGenerateDraft} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Chủ đề */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#111" }}>
                  📚 Chủ đề Khóa Học *
                </label>
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  placeholder="VD: Lập trình Python cơ bản cho người mới bắt đầu"
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "2px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: 80,
                  }}
                />
              </div>

              {/* Đối tượng học */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#111" }}>
                  👥 Đối Tượng Học
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="VD: Sinh viên, người đổi ngành, người mới tốt nghiệp"
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "2px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Cấp độ */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#111" }}>
                  📊 Cấp Độ
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "2px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <option value="Beginner">Người mới bắt đầu</option>
                  <option value="Intermediate">Trung cấp</option>
                  <option value="Advanced">Nâng cao</option>
                </select>
              </div>

              {/* Số bài học */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#111" }}>
                  📖 Lộ Trình Bài Học
                </label>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                  AI sẽ tự quyết định số lượng bài cần thiết để bao phủ kiến thức (khoảng 6-15 bài). Bạn chỉ cần mô tả mục tiêu và đối tượng học viên.
                </div>
              </div>

              {/* Câu hỏi */}
              {/* Quiz + Docs Info */}
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, background: "#f9fafc", padding: 16, borderRadius: 12 }}>
                ✅ AI sẽ tự động sinh tài liệu chi tiết và bộ câu hỏi cho từng bài (số câu hỏi phù hợp (không cố định)) để bao phủ đầy đủ kiến thức. Bạn chỉ cần mô tả mục tiêu và nội dung khóa học thật rõ.
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: 12,
                  background: "#ffebee",
                  border: "1px solid #f44336",
                  borderRadius: 8,
                  color: "#c62828",
                  fontSize: 14,
                }}>
                  ❌ {error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    flex: 1,
                    padding: 14,
                    background: "#f0f0f0",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: 14,
                    background: loading ? "#ccc" : "linear-gradient(135deg, #FFB366 0%, #FFA726 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: loading ? "default" : "pointer",
                    fontSize: 14,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "⏳ Đang tạo bản nháp..." : "✨ Tạo Bản Nháp"}
                </button>
              </div>
            </form>
            {/* Loading Overlay */}
            {loading && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                zIndex: 10
              }}>
                <div style={{
                  width: 50,
                  height: 50,
                  border: "4px solid #e0e0e0",
                  borderTop: "4px solid #FFB366",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#FF9800" }}>
                  Đang phân tích chủ đề...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && draft && (
          <div style={{ 
            background: "#fff", 
            borderRadius: 16, 
            padding: 40, 
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            position: "relative",
            opacity: loading ? 0.7 : 1,
            pointerEvents: loading ? "none" : "auto"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: "#111" }}>Xem lại Khóa Học</h2>

            <div style={{ marginBottom: 30, paddingBottom: 20, borderBottom: "2px solid #e0e0e0" }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 4 }}>📚 {draft.title}</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{draft.description}</p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{
                  padding: "6px 12px",
                  background: "#f0f0f0",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#333"
                }}>
                  📂 {draft.categoryName}
                </span>
                <span style={{
                  padding: "6px 12px",
                  background: "#f0f0f0",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#333"
                }}>
                  📖 {draft.lessons?.length || 0} bài học
                </span>
                {draft.quizzes?.length > 0 && (
                  <span style={{
                    padding: "6px 12px",
                    background: "#f0f0f0",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#333"
                  }}>
                    ❓ {draft.quizzes.length} bộ câu hỏi
                  </span>
                )}
              </div>
            </div>

            {/* Lessons Preview */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#111" }}>Danh sách bài học:</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {draft.lessons?.slice(0, 5).map((lesson, idx) => (
                  <div key={idx} style={{
                    padding: 12,
                    background: "#f9f9f9",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: 13,
                  }}>
                    <strong>{idx + 1}. {lesson.title}</strong>
                  </div>
                ))}
              </div>
              {draft.lessons?.length > 5 && (
                <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                  ... và {draft.lessons.length - 5} bài học khác
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: 12,
                background: "#ffebee",
                border: "1px solid #f44336",
                borderRadius: 8,
                color: "#c62828",
                fontSize: 14,
                marginBottom: 20,
              }}>
                ❌ {error}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: 14,
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={handleCreateCourse}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: 14,
                  background: loading ? "#ccc" : "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  fontSize: 14,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "⏳ Đang tạo khóa học..." : "✨ Tạo Khóa Học"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Creating */}
        {step === 3 && (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 60,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: 60,
              marginBottom: 20,
              animation: "pulse 1.5s infinite"
            }}>
              ✨
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, color: "#111" }}>
              Đang tạo khóa học...
            </h2>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 30 }}>
              Vui lòng chờ trong khi AI tạo bài học, tài liệu và câu hỏi cho bạn
            </p>

            {/* Progress Bar */}
            <div style={{ marginBottom: 30, background: "#f0f0f0", borderRadius: 8, height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                background: "linear-gradient(90deg, #FFB366 0%, #FFA726 100%)",
                animation: "slideRight 2s infinite",
                borderRadius: 8
              }} />
            </div>

            {/* Loading Steps */}
            <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 12 }}>
              {["🤖 Phân tích chủ đề", "📚 Tạo bài học", "📄 Sinh tài liệu", "❓ Tạo câu hỏi", "💾 Lưu khóa học"].map((step, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: "#f9f9f9",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#666"
                }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    background: "#FFB366",
                    borderRadius: "50%",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    animation: `fadeInScale ${0.5 + idx * 0.3}s ease-out forwards`,
                    opacity: 0
                  }}>
                    ✓
                  </span>
                  {step}
                </div>
              ))}
            </div>

            {/* Spinner */}
            <div style={{
              width: 60,
              height: 60,
              margin: "0 auto",
              border: "4px solid #e0e0e0",
              borderTop: "4px solid #FF9800",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideRight {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
