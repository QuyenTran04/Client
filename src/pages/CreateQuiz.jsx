import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createQuizFromUpload } from "../services/quiz";
import {
  AiOutlineFileAdd,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineRead,
  AiOutlineClose,
  AiOutlineFilePdf,
  AiOutlineFileImage,
  AiOutlineFileText,
  AiOutlinePlus,
  AiOutlineLoading,
} from "react-icons/ai";
import { FiUpload, FiFileText, FiAlertCircle } from "react-icons/fi";
import "../css/ai-builder.css";

const QUIZ_FLOW = [
  { id: 1, title: "Upload file", caption: "Tai lieu chua cau hoi" },
  { id: 2, title: "Cau hinh", caption: "Thiet lap thong tin bai quiz" },
  { id: 3, title: "AI xu ly", caption: "Trich xuat & sinh cau hoi" },
  { id: 4, title: "Hoan thanh", caption: "Quiz san sang su dung" },
];

const HERO_STATS = [
  { value: "1-20", label: "Cau hoi toi da" },
  { value: "100%", label: "AI xu ly" },
  { value: "~1 phut", label: "Thoi gian trung binh" },
];

const AI_FEATURES = [
  {
    title: "OCR Extraction",
    description: "AI doc va trich xuat noi dung tu PDF, Word, anh.",
    icon: <AiOutlineRead />,
  },
  {
    title: "Smart Question Detection",
    description: "AI nhan dien dinh dang cau hoi & lua chon.",
    icon: <AiOutlineCheckCircle />,
  },
  {
    title: "Auto Answer Fill",
    description: "AI de xuat dap an neu file chua co.",
    icon: <AiOutlineClockCircle />,
  },
];

const DELIVERABLES = [
  {
    title: "1-20 cau hoi",
    detail: "AI tach toi da 20 cau hoi tu tai lieu cua ban.",
  },
  {
    title: "Dap an goi y",
    detail: "AI dien dap an neu file chua san.",
  },
  {
    title: "Nhieu dinh dang",
    detail: "Ho tro PDF, DOC, DOCX, JPG, PNG, TXT.",
  },
];

const SUPPORTED_FORMATS = [
  { ext: "PDF", desc: "Tai lieu PDF co noi dung cau hoi" },
  { ext: "DOC/DOCX", desc: "Tai lieu Word dinh dang cau hoi" },
  { ext: "JPG/PNG", desc: "Anh chup hoac scan cau hoi" },
  { ext: "TXT", desc: "File van ban thuong" },
];

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth(); // keep for future personalization
  const [step, setStep] = useState(1);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxQuestions: 10,
    difficulty: 'medium',
    timeLimit: 30, // minutes
    language: 'vi'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);

  const supportedFormats = [
    { extension: 'pdf', icon: AiOutlineFilePdf, color: 'text-red-500' },
    { extension: 'doc', icon: FiFileText, color: 'text-blue-500' },
    { extension: 'docx', icon: FiFileText, color: 'text-blue-500' },
    { extension: 'jpg', icon: AiOutlineFileImage, color: 'text-green-500' },
    { extension: 'jpeg', icon: AiOutlineFileImage, color: 'text-green-500' },
    { extension: 'png', icon: AiOutlineFileImage, color: 'text-green-500' },
    { extension: 'txt', icon: FiFileText, color: 'text-gray-500' }
  ];

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    const format = supportedFormats.find(f => f.extension === extension);
    return format ? format.icon : FiFileText;
  };

  const getFileColor = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    const format = supportedFormats.find(f => f.extension === extension);
    return format ? format.color : 'text-gray-500';
  };

  const scrollToStepper = () => {
    if (typeof document === "undefined") return;
    const element = document.getElementById("quiz-flow");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 10MB');
        return;
      }

      // Validate file format
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isSupported = supportedFormats.some(format => format.extension === fileExtension);

      if (!isSupported) {
        setError('Định dạng file không được hỗ trợ. Vui lòng chọn file PDF, DOC, DOCX, JPG, PNG hoặc TXT');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    // Reset input
    const input = document.getElementById('quiz-file-input');
    if (input) input.value = '';
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài trắc nghiệm');
      return;
    }

    if (!selectedFile) {
      setError('Vui lòng chọn file chứa câu trắc nghiệm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setStep(2);
      const progressInterval = simulateProgress();

      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('maxQuestions', formData.maxQuestions);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('timeLimit', formData.timeLimit);
      formDataToSend.append('language', formData.language);

      setStep(3);
      setAiProcessing(true);

      const response = await createQuizFromUpload(formDataToSend);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Quiz created successfully:', response);
      setCreatedQuizzes(prev => [...prev, response.data]);
      setStep(4);

      setTimeout(() => {
        navigate("/my-courses");
      }, 3000);

    } catch (error) {
      setError(error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Upload error:', error);
      setStep(1);
    } finally {
      setLoading(false);
      setAiProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/my-courses");
    }
  };

  return (
    <div className="ai-builder">
      {/* Hero Section */}
      <div className="ai-builder__hero">
        <div className="ai-builder__hero-content">
          <div className="ai-hero__text">
            <p className="ai-eyebrow">AI Quiz Builder</p>
            <h1>Tao bai trac nghiem thong minh</h1>
            <p className="ai-hero__subtitle">
              Upload tai lieu, AI se trich xuat cau hoi va sinh dap an tu dong.
              Ho tro PDF, Word va ca tai lieu scan.
            </p>

            <div className="ai-hero__actions">
              <button
                type="button"
                className="ai-btn ai-btn--primary"
                onClick={() => document.getElementById('quiz-file-input')?.click()}
              >
                Bat dau ngay
              </button>
              <button
                type="button"
                className="ai-btn ai-btn--ghost"
                onClick={scrollToStepper}
              >
                Quy trinh 4 buoc
              </button>
            </div>

            <div className="ai-hero__stats">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="ai-hero__stat">
                  <span className="ai-hero__value">{stat.value}</span>
                  <span className="ai-hero__label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-hero__panel">
            <div className="ai-panel__header">
              <p className="ai-panel__eyebrow">Quy trinh lam viec</p>
              <h3 className="ai-panel__title">Tu upload file den quiz hoan chinh</h3>
              <p className="ai-panel__subtitle">
                AI doc tai lieu, chon cau hoi va dien dap an. Ban chi can xem va
                xac nhan.
              </p>
            </div>
            <div className="ai-panel__timeline">
              {QUIZ_FLOW.map((item) => (
                <div key={item.id} className="ai-panel__item">
                  <div className="ai-panel__dot">{item.id}</div>
                  <div>
                    <p className="ai-panel__item-title">{item.title}</p>
                    <p className="ai-panel__item-caption">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="ai-panel__divider" />
            <p className="ai-panel__subtitle">Ho tro dinh dang pho bien</p>
            <div className="ai-panel__formats">
              {SUPPORTED_FORMATS.map((format) => (
                <div key={format.ext} className="ai-panel__format">
                  <span>{format.ext}</span>
                  <p>{format.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div id="quiz-flow" className="ai-stepper__wrapper">
        <div className="ai-stepper">
          {QUIZ_FLOW.map((item) => (
            <div
              key={item.id}
              className={`ai-step ${item.id === step ? "ai-step--active" : ""}`}
            >
              <div className="ai-step__indicator">
                <div className="ai-step__dot">{item.id}</div>
                {item.id !== QUIZ_FLOW.length && <span className="ai-step__line" />}
              </div>
              <p className="ai-step__title">{item.title}</p>
              <p className="ai-step__caption">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload File */}
      {step === 1 && (
        <div className="ai-layout">
          <div className="ai-card ai-form">
            <h2 className="ai-form__title">Tạo bài trắc nghiệm từ file</h2>
            <p className="ai-form__subtitle">
              Upload tài liệu chứa câu hỏi trắc nghiệm, AI sẽ tự động trích xuất và xử lý.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="ai-form__group">
                <label htmlFor="title" className="ai-field__label">
                  Tiêu đề bài trắc nghiệm *
                  <span>Nhập tên để dễ dàng nhận biết bài trắc nghiệm</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="ai-input"
                  placeholder="Nhập tiêu đề bài trắc nghiệm"
                  required
                />
              </div>

              <div className="ai-form__group">
                <label htmlFor="description" className="ai-field__label">
                  Mô tả
                  <span>Mô tả về nội dung bài trắc nghiệm</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={loading}
                  rows={3}
                  className="ai-input ai-input--textarea"
                  placeholder="Mô tả về nội dung bài trắc nghiệm"
                />
              </div>

              {/* Settings */}
              <div className="ai-form__grid">
                <div className="ai-form__group">
                  <label className="ai-field__label">Số câu hỏi tối đa</label>
                  <select
                    name="maxQuestions"
                    value={formData.maxQuestions}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="ai-input"
                  >
                    {[...Array(20)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="ai-form__group">
                  <label className="ai-field__label">Độ khó</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="ai-input"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>

                <div className="ai-form__group">
                  <label className="ai-field__label">Thời gian làm bài (phút)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    disabled={loading}
                    min="5"
                    max="180"
                    className="ai-input"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="ai-form__group">
                <label className="ai-field__label">Tải lên file trắc nghiệm *</label>
                <input
                  id="quiz-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={loading}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  style={{ display: 'none' }}
                />

                {!selectedFile ? (
                  <div
                    className="quiz-upload-area"
                    onClick={() => document.getElementById('quiz-file-input')?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="quiz-upload-icon">
                      <FiUpload />
                    </div>
                    <h3>Chọn file trắc nghiệm</h3>
                    <p>Kéo và thả file hoặc click để chọn</p>
                    <div className="quiz-formats">
                      {supportedFormats.map((format) => {
                        const Icon = format.icon;
                        return (
                          <span key={format.extension} className="quiz-format-badge">
                            <Icon className={`inline ${format.color}`} /> {format.extension.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="quiz-file-selected">
                    <div className="quiz-file-info">
                      {React.createElement(getFileIcon(selectedFile.name), {
                        className: `w-8 h-8 ${getFileColor(selectedFile.name)}`
                      })}
                      <div>
                        <p className="quiz-file-name">{selectedFile.name}</p>
                        <p className="quiz-file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={loading}
                      className="ai-btn ai-btn--ghost"
                    >
                      <AiOutlineClose />
                    </button>
                  </div>
                )}
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
                <button type="button" className="ai-btn ai-btn--ghost" onClick={handleBack} disabled={loading}>
                  Thoát
                </button>
                <button
                  type="submit"
                  className="ai-btn ai-btn--primary"
                  disabled={loading || !selectedFile || !formData.title.trim()}
                >
                  {loading ? "Đang xử lý..." : "Tạo bài trắc nghiệm"}
                </button>
              </div>
            </form>
          </div>

          <aside className="ai-card ai-sidebar">
            <h3 className="ai-sidebar__title">AI Features</h3>
            {AI_FEATURES.map((feature) => (
              <div key={feature.title} className="ai-feature">
                <div className="ai-feature__icon">{feature.icon}</div>
                <div>
                  <h4 className="ai-feature__title">{feature.title}</h4>
                  <p className="ai-feature__desc">{feature.description}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="ai-layout">
          <div className="ai-card ai-form">
            <h2 className="ai-form__title">Đang xử lý file...</h2>
            <div className="ai-processing">
              <div className="ai-loading__spinner" />
              <p>AI đang đọc và trích xuất nội dung từ file của bạn...</p>
            </div>
            {uploadProgress > 0 && (
              <div className="ai-progress">
                <div className="ai-progress__bar">
                  <div className="ai-progress__fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="ai-progress__text">
                  <span>Upload progress</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: AI Processing */}
      {step === 3 && (
        <div className="ai-layout">
          <div className="ai-card ai-form">
            <h2 className="ai-form__title">AI đang sinh câu hỏi...</h2>
            <div className="ai-processing">
              <div className="ai-loading__spinner" />
              <p>AI đang phân tích nội dung và sinh câu hỏi trắc nghiệm...</p>
              {aiProcessing && (
                <div className="ai-progress">
                  <div className="ai-progress__bar">
                    <div className="ai-progress__fill" style={{ width: '60%' }} />
                  </div>
                  <div className="ai-progress__text">
                    <span>AI Processing</span>
                    <span>Đang trích xuất câu hỏi...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="ai-layout">
          <div className="ai-card ai-form">
            <div className="ai-success">
              <AiOutlineCheckCircle className="ai-success__icon" />
              <h2 className="ai-success__title">Đã tạo thành công!</h2>
              <p className="ai-success__message">
                Bài trắc nghiệm đã sẵn sàng sử dụng. Bạn sẽ được chuyển về trang quản lý khóa học
                để kích hoạt và chia sẻ.
              </p>
              {createdQuizzes.length > 0 && (
                <div className="ai-success-stats">
                  <span>Đã tạo: {createdQuizzes[createdQuizzes.length - 1]?.data?.processedQuestions || 0} câu hỏi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

