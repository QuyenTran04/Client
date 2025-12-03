import { useState } from "react";
import api from "../services/api";

export default function GenerateQuizModal({ lessonId, onClose, onSuccess }) {
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(`[GenerateQuizModal] Generating ${questionCount} quizzes for lesson ${lessonId}`);

      const response = await api.post("/quizzes/generate", {
        lessonId,
        questionCount,
      });

      console.log("[GenerateQuizModal] ✅ Success:", response.data);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Không thể tạo bộ câu hỏi. Vui lòng thử lại";
      console.error("[GenerateQuizModal] Error:", {
        status: err.response?.status,
        message: errorMsg,
        data: err.response?.data,
        fullError: err
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo bộ câu hỏi</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="questionCount">Số câu hỏi:</label>
            <div className="question-count-selector">
              <input
                id="questionCount"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                disabled={loading}
              />
              <div className="count-info">
                <p>Chọn từ 1-20 câu hỏi</p>
                <div className="slider">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    disabled={loading}
                  />
                  <div className="range-labels">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || questionCount < 1 || questionCount > 20}
          >
            {loading ? "Đang tạo..." : `Tạo ${questionCount} câu hỏi`}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          max-width: 420px;
          width: 90%;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          color: #0f172a;
        }

        .modal-body {
          padding: 24px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .alert-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .alert p {
          margin: 0;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: #0f172a;
          font-size: 14px;
        }

        .question-count-selector {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-count-selector input[type="number"] {
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }

        .count-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .count-info p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }

        .slider {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .slider input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
        }

        .slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #5b7cfd;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(91, 124, 253, 0.4);
        }

        .slider input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #5b7cfd;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(91, 124, 253, 0.4);
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-ghost {
          background: #f1f5f9;
          color: #0f172a;
          border: 1px solid #e2e8f0;
        }

        .btn-ghost:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .btn-primary {
          background: #5b7cfd;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #4c68eb;
        }
      `}</style>
    </div>
  );
}
