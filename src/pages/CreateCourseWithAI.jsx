import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STEP_FLOW = [
  { id: 1, title: "Nhap thong tin", caption: "Mo ta chu de & muc tieu" },
  { id: 2, title: "Xem ban nhap", caption: "AI tao xuong song bai hoc" },
  { id: 3, title: "Khoi tao khoa hoc", caption: "Tai lieu & quiz duoc sinh" },
];

const SIDE_CARDS = [
  {
    title: "AI Research",
    description: "He thong doc prompt, trich thong tin va xay dung muc tieu ro rang.",
  },
  {
    title: "Lesson Builder",
    description: "AI de xuat 6-20 bai, sap xep theo muc do kem goi y tai lieu.",
  },
  {
    title: "Quiz & Docs",
    description: "Moi bai duoc tao tai lieu markdown va bo cau hoi tu noi dung.",
  },
];

const DELIVERABLES = [
  {
    title: "Lo trinh day du",
    detail: "Cau truc khoa hoc 6-20 bai, phu hop doi tuong ban chon.",
  },
  {
    title: "Tai lieu chi tiet",
    detail: "Moi bai co muc tieu, tom tat va goi y tai lieu bo sung.",
  },
  {
    title: "Quiz kiem tra",
    detail: "Quiz duoc sinh tu noi dung bai giup hoc vien on tap ngay.",
  },
];

const CREATION_STEPS = [
  "Phan tich chu de va doi tuong",
  "Tao danh sach bai hoc",
  "Sinh tai lieu tu dong",
  "Tao quiz phu hop",
  "Luu khoa hoc vao he thong",
];

const LEVEL_OPTIONS = [
  { value: "Beginner", label: "Nguoi moi bat dau" },
  { value: "Intermediate", label: "Trung cap" },
  { value: "Advanced", label: "Nang cao" },
];

const LANGUAGE_OPTIONS = [
  { value: "vi", label: "Tieng Viet" },
  { value: "en", label: "English" },
];

export default function CreateCourseWithAI() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    prompt: "",
    targetAudience: "",
    level: "Beginner",
    language: "vi",
  });

  const [draft, setDraft] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateDraft = async (e) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      setError("Vui long nhap chu de khoa hoc ro rang.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/ai/courses/draft", formData);
      setDraft(response.data);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "Khong the tao ban nhap, vui long thu lai.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    const instructorId = user?._id || user?.id;
    if (!instructorId) {
      setError("Vui long dang nhap de tao khoa hoc.");
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
      setError(err?.response?.data?.message || "Khong the tao khoa hoc, vui long thu lai.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const lessonPreview = draft?.lessons?.slice(0, 5) || [];

  return (
    <div className="ai-builder">
      <div className="ai-builder__hero">
        <div>
          <p className="ai-eyebrow">AI Course Studio</p>
          <h1>Tao khoa hoc trong vai phut</h1>
          <p className="ai-hero__subtitle">
            Dien chu de, phan con lai de AI xu ly: lo trinh bai hoc, tai lieu, quiz va muc do phu hop.
          </p>
        </div>
        <div className="ai-hero__stats">
          <div>
            <span className="ai-hero__value">6 - 20</span>
            <span className="ai-hero__label">Bai hoc de xuat</span>
          </div>
          <div>
            <span className="ai-hero__value">100%</span>
            <span className="ai-hero__label">Tai lieu & quiz tu dong</span>
          </div>
          <div>
            <span className="ai-hero__value">~5 phut</span>
            <span className="ai-hero__label">Thoi gian hoan tat</span>
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
          <form className="ai-card ai-form" onSubmit={handleGenerateDraft}>
            <div className="ai-form__group">
              <label htmlFor="prompt" className="ai-field__label">
                Chu de khoa hoc
                <span>Mo ta chi tiet ket qua ban mong doi</span>
              </label>
              <textarea
                id="prompt"
                name="prompt"
                className="ai-input ai-input--textarea"
                rows={6}
                placeholder="Vi du: Xay dung khoa hoc Python co bai tap thuc hanh cho nguoi moi"
                value={formData.prompt}
                onChange={handleInputChange}
              />
            </div>

            <div className="ai-form__group">
              <label htmlFor="targetAudience" className="ai-field__label">
                Doi tuong hoc vien
                <span>Neu ro cap do, nganh nghe hoac muc tieu cong viec</span>
              </label>
              <input
                id="targetAudience"
                name="targetAudience"
                className="ai-input"
                placeholder="Vi du: Sinh vien nam 2 CNTT, nguoi chuyen trai nganh"
                value={formData.targetAudience}
                onChange={handleInputChange}
              />
            </div>

            <div className="ai-form__grid">
              <div className="ai-form__group">
                <label className="ai-field__label">Cap do</label>
                <select name="level" value={formData.level} onChange={handleInputChange} className="ai-input">
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ai-form__group">
                <label className="ai-field__label">Ngon ngu dau ra</label>
                <select name="language" value={formData.language} onChange={handleInputChange} className="ai-input">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
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
                Thoat
              </button>
              <button type="submit" className="ai-btn ai-btn--primary" disabled={loading}>
                {loading ? "Dang tao ban nhap..." : "Sinh ban nhap"}
              </button>
            </div>

            {loading && (
              <div className="ai-loading">
                <div className="ai-loading__spinner" />
                <p>AI dang phan tich yeu cau cua ban...</p>
              </div>
            )}
          </form>

          <aside className="ai-card ai-sidebar">
            <p className="ai-eyebrow">AI Toolkit</p>
            <h3>Ban se nhan du lieu gi?</h3>
            <p className="ai-sidebar__text">
              AI xu ly prompt cua ban de tao ke hoach hoc tap hoan chinh. Hay mo ta cu the ve muc tieu, rang buoc,
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
                Sau khi ban nhan ban nhap, co the dieu chinh noi dung truoc khi tao khoa hoc chinh thuc. Moi lan sinh
                lai se dua tren prompt hien tai.
              </p>
            </div>
          </aside>
        </div>
      )}

      {step === 2 && draft && (
        <div className="ai-review">
          <div className="ai-review__header">
            <div>
              <p className="ai-eyebrow">Ban nhap san sang</p>
              <h2>{draft.title}</h2>
              <p className="ai-review__desc">{draft.description}</p>
            </div>
            <div className="ai-review__tags">
              <span>{draft.categoryName}</span>
              <span>{draft.lessons?.length || 0} bai hoc</span>
              {draft.quizzes?.length ? <span>{draft.quizzes.length} bo quiz</span> : null}
            </div>
          </div>

          <div className="ai-review__grid">
            <div className="ai-card ai-card--subtle">
              <h3>Tong quan muc tieu</h3>
              <p>Cap do: {draft.level || formData.level}</p>
              <p>Ngon ngu: {draft.language || formData.language}</p>
              <p>Doi tuong: {draft.targetAudience || formData.targetAudience || "Chua xac dinh"}</p>
            </div>

            <div className="ai-card ai-card--subtle">
              <h3>Danh sach bai hoc</h3>
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
                  + {draft.lessons.length - 5} bai hoc khac se duoc tao trong he thong
                </p>
              )}
            </div>

            <div className="ai-card ai-card--subtle">
              <h3>AI se lam gi tiep?</h3>
              <ol className="ai-review__list">
                {CREATION_STEPS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>

          {error && <div className="ai-alert ai-alert--error">{error}</div>}

          <div className="ai-review__actions">
            <button type="button" className="ai-btn ai-btn--ghost" disabled={loading} onClick={() => setStep(1)}>
              Chinh sua thong tin
            </button>
            <button type="button" className="ai-btn ai-btn--success" disabled={loading} onClick={handleCreateCourse}>
              {loading ? "Dang tao khoa hoc..." : "Tao khoa hoc"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ai-creating">
          <div className="ai-creating__orb" />
          <h2>AI dang tao khoa hoc cua ban</h2>
          <p>
            He thong dang sinh tai lieu, quiz va gan noi dung vao tung bai hoc. Qua trinh nay mat vai phut, vui long
            khong tat trinh duyet.
          </p>
          <div className="ai-progress">
            <div className="ai-progress__bar" />
          </div>
          <div className="ai-timeline">
            {CREATION_STEPS.map((item, idx) => (
              <div key={item} className="ai-timeline__item">
                <span>{idx + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="ai-loading__spinner ai-loading__spinner--large" />
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
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  );
}
