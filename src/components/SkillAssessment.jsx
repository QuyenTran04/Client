import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Function to generate universal questions that apply to ALL types of courses
function generateDynamicQuestions(topic) {
  const universalQuestions = [
    {
      id: "current_level",
      type: "scale",
      question: `Trình độ hiện tại của bạn về "${topic}" là gì?`,
      scale: [
        { value: 0, label: "Hoàn toàn mới bắt đầu, chưa từng tiếp xúc" },
        { value: 1, label: "Biến biết sơ qua, nghe nói qua" },
        { value: 2, label: "Hiểu các khái niệm cơ bản" },
        { value: 3, label: "Có kiến thức nền tảng tốt" },
        { value: 4, label: "Khá thành thạo, có kinh nghiệm thực tế" },
        { value: 5, label: "Chuyên gia, có thể hướng dẫn người khác" }
      ]
    },
    {
      id: "practical_experience",
      type: "multiple",
      question: `Bạn đã áp dụng kiến thức về "${topic}" vào thực tế như thế nào?`,
      options: [
        { value: 0, label: "Chưa có kinh nghiệm thực tế nào" },
        { value: 1, label: "Đã thử nghiệm vài lần cho mục đích cá nhân" },
        { value: 2, label: "Đã áp dụng trong các dự án nhỏ/quá trình học tập" },
        { value: 3, label: "Đã có kinh nghiệm làm việc chuyên nghiệp liên quan" },
        { value: 4, label: "Đã làm việc chuyên sâu nhiều năm trong lĩnh vực này" }
      ]
    },
    {
      id: "learning_goals",
      type: "text",
      question: `Mục tiêu cụ thể của bạn khi học khóa học "${topic}" là gì?`,
      placeholder: "Ví dụ: Để chuyển ngành, thăng tiến trong công việc hiện tại, làm dự án cá nhân, mở rộng kiến thức, lấy chứng chỉ..."
    }
  ];

  return universalQuestions;
}

function detectTopicCategory(topic) {
  // Since we're using universal questions now, always return 'universal'
  // This allows the analysis to work the same way for all topics
  return 'universal';
}

export default function SkillAssessment({ topic, onComplete, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  // Generate dynamic questions based on topic
  const questions = useMemo(() => generateDynamicQuestions(topic), [topic]);
  const category = detectTopicCategory(topic);

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const hasAnswerForCurrent = () => {
    const value = answers[currentQ.id];
    if (currentQ.type === "text") {
      return typeof value === "string" ? value.trim().length > 0 : false;
    }
    return Object.prototype.hasOwnProperty.call(answers, currentQ.id);
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = () => {
    if (!hasAnswerForCurrent()) {
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack?.();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const assessmentData = {
      category,
      answers,
      topic,
      completedAt: new Date().toISOString()
    };

    // Add a longer delay to show loading effect while AI processes
    setTimeout(() => {
      onComplete(assessmentData);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="skill-assessment">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h3>AI đang phân tích trình độ của bạn...</h3>
            <p>Hệ thống đang tạo lộ trình học tập phù hợp nhất cho "{topic}"</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div className="assessment-header">
        <h2>Đánh giá trình độ cá nhân hóa</h2>
        <p>Khảo sát 3 câu hỏi quan trọng để hiểu rõ trình độ và mục tiêu học tập của bạn với "{topic}"</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">
          Câu hỏi {currentQuestion + 1}/{questions.length} - {Math.round(progress)}% hoàn thành
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="question-container"
        >
          <h3 className="question-text">{currentQ.question}</h3>

          {currentQ.type === 'scale' && (
            <div className="scale-options">
              {currentQ.scale.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`scale-option ${
                    answers[currentQ.id] === option.value ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  <span className="scale-value">{option.value}</span>
                  <span className="scale-label">{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {currentQ.type === 'multiple' && (
            <div className="multiple-options">
              {currentQ.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`multiple-option ${
                    answers[currentQ.id] === option.value ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {currentQ.type === 'text' && (
            <textarea
              className="text-answer"
              placeholder={currentQ.placeholder || "Nhập câu trả lời của bạn..."}
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              rows={4}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="assessment-actions">
        <button
          type="button"
          className="btn-back"
          onClick={handlePrevious}
          disabled={loading}
        >
          {currentQuestion === 0 ? 'Quay lại' : 'Câu trước'}
        </button>

        <button
          type="button"
          className="btn-next"
          onClick={handleNext}
          disabled={
            loading ||
            !hasAnswerForCurrent()
          }
        >
          {loading ? 'Đang xử lý...' : isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}
        </button>
      </div>

      <style jsx>{`
        .skill-assessment {
          max-width: 600px;
          margin: 0 auto;
          padding: 32px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }

        .assessment-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .assessment-header h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 24px;
          font-weight: 700;
        }

        .assessment-header p {
          margin: 0 0 20px;
          color: #64748b;
          font-size: 14px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #5b7cfd, #5de0ff);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .question-container {
          min-height: 300px;
          margin-bottom: 40px;
        }

        .question-text {
          margin: 0 0 32px;
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.4;
        }

        .scale-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .scale-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          text-align: left;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .scale-option:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .scale-option.selected {
          border-color: #5b7cfd;
          background: rgba(91, 124, 253, 0.1);
        }

        .scale-value {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 8px;
          font-weight: 600;
          color: #64748b;
          flex-shrink: 0;
        }

        .scale-option.selected .scale-value {
          background: #5b7cfd;
          color: white;
        }

        .scale-label {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
        }

        .multiple-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .multiple-option {
          padding: 16px 20px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          text-align: left;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .multiple-option:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .multiple-option.selected {
          border-color: #5b7cfd;
          background: rgba(91, 124, 253, 0.1);
          color: #5b7cfd;
        }

        .text-answer {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .text-answer:focus {
          border-color: #5b7cfd;
          box-shadow: 0 0 0 3px rgba(91, 124, 253, 0.15);
        }

        .assessment-actions {
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }

        .btn-back,
        .btn-next {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-back {
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-back:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .btn-next {
          background: linear-gradient(135deg, #5b7cfd, #5de0ff);
          color: white;
          flex: 1;
          max-width: 200px;
        }

        .btn-next:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(91, 124, 253, 0.3);
        }

        .btn-back:disabled,
        .btn-next:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          border-radius: 20px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f1f5f9;
          border-top: 4px solid #5b7cfd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }

        .loading-text {
          text-align: center;
          max-width: 400px;
        }

        .loading-text h3 {
          margin: 0 0 12px;
          color: #0f172a;
          font-size: 20px;
          font-weight: 600;
        }

        .loading-text p {
          margin: 0 0 20px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        .loading-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5b7cfd;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .loading-dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.3s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        @media (max-width: 640px) {
          .skill-assessment {
            padding: 24px 20px;
          }

          .scale-option {
            padding: 12px 16px;
          }

          .assessment-actions {
            flex-direction: column;
          }

          .btn-next {
            max-width: none;
          }

          .loading-overlay {
            border-radius: 0;
          }

          .loading-text {
            padding: 0 20px;
          }

          .loading-text h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
