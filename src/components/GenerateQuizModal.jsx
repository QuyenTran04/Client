import { useState } from "react";
import api from "../services/api";

export default function GenerateQuizModal({ lessonId, onClose, onSuccess }) {
  const [questionCount, setQuestionCount] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

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
    <div className="quiz-modal-overlay" onClick={onClose}>
      <div
        className="quiz-modal-container"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="quiz-modal-backdrop">
          <div className="gradient-orb" />
          <div className="floating-elements">
            <div className="floating-element" style={{ "--delay": "0s" }}>❓</div>
            <div className="floating-element" style={{ "--delay": "1s" }}>📝</div>
            <div className="floating-element" style={{ "--delay": "2s" }}>✓</div>
            <div className="floating-element" style={{ "--delay": "3s" }}>🧠</div>
          </div>
        </div>

        <div className="quiz-modal-content">
          <div className="quiz-modal-header">
            <div className="header-content">
              <div className="header-icon">
                <span className="icon-sparkle">✨</span>
                <div className="icon-ring" />
              </div>
              <div className="header-text">
                <h2>Tạo bộ câu hỏi thông minh</h2>
                <p>AI sẽ tạo quiz chất lượng cao dựa trên nội dung bài học</p>
              </div>
            </div>
            <button className="quiz-modal-close" onClick={onClose}>
              <span className="close-icon">×</span>
            </button>
          </div>

          <div className="quiz-modal-body">
            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
              </div>
            )}

            <div className="quiz-config-section">
              <div className="section-header">
                
              </div>

              
              <div className="custom-selector">
                <div className="selector-header">
                  <span className="selector-label">Tùy chỉnh:</span>
                  <span className="selector-value">{questionCount} câu hỏi</span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    disabled={loading}
                    className="quiz-slider"
                  />
                  <div className="slider-track">
                    <div
                      className="slider-fill"
                      style={{ width: `${((questionCount - 1) / 49) * 100}%` }}
                    />
                  </div>
                  <div className="slider-thumb" style={{ left: `${((questionCount - 1) / 49) * 100}%` }}>
                    <div className="thumb-value">{questionCount}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="quiz-info-card">
              <div className="info-icon">💡</div>
              <div className="info-content">
                <h4>Quiz sẽ được tạo với:</h4>
                <ul>
                  <li>❓ Các câu hỏi trắc nghiệm đa dạng</li>
                  <li>🎯 Phù hợp với cấp độ bài học</li>
                  <li>📝 Kiểm tra kiến thức quan trọng</li>
                  <li>✓ Tự động chấm điểm ngay lập tức</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="quiz-modal-footer">
            <button
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              <span className="btn-icon">←</span>
              Hủy bỏ
            </button>
            <button
              className={`generate-btn ${isHovered ? "hovered" : ""}`}
              onClick={handleGenerate}
              disabled={loading || questionCount < 1 || questionCount > 50}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Đang tạo quiz...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Tạo {questionCount} câu hỏi
                </>
              )}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(5deg); }
            75% { transform: translateY(5px) rotate(-5deg); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }

          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
          }

          @keyframes slideIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .quiz-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
          }

          .quiz-modal-container {
            position: relative;
            width: 380px;
            max-width: 90vw;
            max-height: 85vh;
            overflow-y: auto;
            overflow-x: hidden;
            animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .quiz-modal-container::-webkit-scrollbar {
            width: 6px;
          }

          .quiz-modal-container::-webkit-scrollbar-track {
            background: rgba(34, 197, 94, 0.1);
            border-radius: 3px;
          }

          .quiz-modal-container::-webkit-scrollbar-thumb {
            background: rgba(34, 197, 94, 0.3);
            border-radius: 3px;
          }

          .quiz-modal-container::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 197, 94, 0.5);
          }

          .quiz-modal-backdrop {
            position: absolute;
            inset: -100px;
            background: linear-gradient(135deg,
              rgba(139, 92, 246, 0.1) 0%,
              rgba(59, 130, 246, 0.1) 50%,
              rgba(147, 51, 234, 0.1) 100%);
            border-radius: 24px;
            filter: blur(40px);
            animation: pulse 3s ease-in-out infinite;
          }

          .gradient-orb {
            position: absolute;
            top: 20%;
            left: 60%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle,
              rgba(139, 92, 246, 0.3) 0%,
              transparent 70%);
            border-radius: 50%;
            animation: pulse 4s ease-in-out infinite;
          }

          .floating-elements {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }

          .floating-element {
            position: absolute;
            font-size: 24px;
            animation: float 3s ease-in-out infinite;
            animation-delay: var(--delay);
          }

          .floating-element:nth-child(1) { top: 10%; left: 80%; }
          .floating-element:nth-child(2) { top: 70%; left: 15%; }
          .floating-element:nth-child(3) { top: 30%; left: 85%; }
          .floating-element:nth-child(4) { top: 80%; left: 70%; }

          .quiz-modal-content {
            position: relative;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 20px;
            box-shadow:
              0 20px 40px -12px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(34, 197, 94, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(34, 197, 94, 0.1);
            overflow: hidden;
            backdrop-filter: blur(10px);
          }

          .quiz-modal-header {
            padding: 16px 20px 12px;
            background: linear-gradient(135deg,
              rgba(34, 197, 94, 0.05) 0%,
              rgba(16, 185, 129, 0.02) 100%);
            border-bottom: 1px solid rgba(34, 197, 94, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .header-content {
            display: flex;
            gap: 16px;
            flex: 1;
          }

          .header-icon {
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border-radius: 12px;
            color: white;
            font-size: 20px;
            animation: pulse 2s ease-in-out infinite;
          }

          .icon-sparkle {
            animation: sparkle 2s ease-in-out infinite;
          }

          .icon-ring {
            position: absolute;
            inset: -6px;
            border: 2px solid rgba(34, 197, 94, 0.3);
            border-radius: 16px;
            animation: pulse 2s ease-in-out infinite;
          }

          .header-text h2 {
            margin: 0 0 6px;
            font-size: 20px;
            font-weight: 700;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .header-text p {
            margin: 0;
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;
          }

          .quiz-modal-close {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: rgba(249, 250, 251, 0.9);
            border: 1px solid rgba(229, 231, 235, 0.5);
            color: #6b7280;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .quiz-modal-close:hover {
            background: rgba(226, 232, 240, 0.9);
            color: #334155;
            transform: scale(1.05);
          }

          .close-icon {
            font-size: 20px;
            font-weight: 300;
          }

          .quiz-modal-body {
            padding: 16px 20px;
          }

          .quiz-config-section {
            margin-bottom: 16px;
          }

          .section-header {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            align-items: flex-start;
          }

          .section-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #dcfce7, #bbf7d0);
            color: #166534;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
          }

          .section-header h3 {
            margin: 0 0 4px;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }

          .section-header p {
            margin: 0;
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
          }

  
          .custom-selector {
            background: #f9fafb;
            border-radius: 10px;
            padding: 12px;
            border: 1px solid #e5e7eb;
          }

          .selector-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .selector-label {
            font-size: 13px;
            font-weight: 600;
            color: #475569;
          }

          .selector-value {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .slider-container {
            position: relative;
            height: 40px;
            margin: 8px 0;
          }

          .quiz-slider {
            position: absolute;
            width: 100%;
            height: 6px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            outline: none;
            opacity: 0;
            cursor: pointer;
            z-index: 2;
          }

          .slider-track {
            position: absolute;
            width: 100%;
            height: 6px;
            top: 50%;
            transform: translateY(-50%);
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
          }

          .slider-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            border-radius: 3px;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .slider-thumb {
            position: absolute;
            width: 24px;
            height: 24px;
            top: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border-radius: 12px;
            box-shadow:
              0 2px 8px rgba(34, 197, 94, 0.3),
              0 0 0 2px rgba(34, 197, 94, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
          }

          .slider-thumb:hover {
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow:
              0 3px 10px rgba(34, 197, 94, 0.4),
              0 0 0 3px rgba(34, 197, 94, 0.25);
          }

          .thumb-value {
            color: white;
            font-size: 10px;
            font-weight: 700;
          }

          .quiz-info-card {
            display: flex;
            gap: 10px;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 10px;
            padding: 12px;
            border: 1px solid rgba(34, 197, 94, 0.2);
            animation: slideIn 0.5s ease-out 0.2s both;
          }

          .info-icon {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
          }

          .info-content h4 {
            margin: 0 0 6px;
            font-size: 13px;
            font-weight: 600;
            color: #166534;
          }

          .info-content ul {
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .info-content li {
            font-size: 11px;
            color: #15803d;
            background: rgba(255, 255, 255, 0.7);
            padding: 3px 6px;
            border-radius: 6px;
            white-space: nowrap;
          }

          .quiz-modal-footer {
            display: flex;
            gap: 10px;
            padding: 16px 20px;
            background: linear-gradient(135deg,
              rgba(249, 250, 251, 0.9) 0%,
              rgba(243, 244, 246, 0.9) 100%);
            border-top: 1px solid rgba(229, 231, 235, 0.5);
          }

          .cancel-btn, .generate-btn {
            flex: 1;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            position: relative;
            overflow: hidden;
          }

          .btn-icon {
            font-size: 14px;
            z-index: 1;
          }

          .cancel-btn {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            color: #64748b;
          }

          .cancel-btn:hover:not(:disabled) {
            background: #f8fafc;
            border-color: #cbd5e1;
            transform: translateY(-2px);
          }

          .generate-btn {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border: none;
            color: white;
            box-shadow: 0 3px 10px rgba(34, 197, 94, 0.25);
          }

          .generate-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg,
              rgba(34, 197, 94, 0.1) 0%,
              rgba(16, 185, 129, 0.1) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .generate-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
          }

          .generate-btn.hovered::before {
            opacity: 1;
          }

          .generate-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
          }

          .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .error-message {
            display: flex;
            gap: 12px;
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            border: 1px solid #f87171;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
            animation: slideIn 0.3s ease-out;
          }

          .error-icon {
            font-size: 20px;
            color: #dc2626;
          }

          .error-message p {
            margin: 0;
            font-size: 14px;
            color: #991b1b;
            flex: 1;
          }

          @media (max-width: 640px) {
            .quiz-modal-container {
              width: 95vw;
              margin: 20px;
            }

  
            .header-content {
              flex-direction: column;
              text-align: center;
            }

            .section-header {
              flex-direction: column;
              text-align: center;
            }

            .quiz-modal-header {
              padding: 24px;
            }

            .quiz-modal-body {
              padding: 20px;
            }

            .quiz-modal-footer {
              padding: 20px;
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
