import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonById } from "../services/lesson";
import { getCourseById } from "../services/course";
import { getPracticeByLesson, createPractice, submitPracticeAnswer } from "../services/practice";
import { useAuth } from "../context/AuthContext";
import "../css/practice.css";

export default function Practice() {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingPractice, setCreatingPractice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
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

        if (lessonData.course?._id || lessonData.courseId) {
          const courseId = lessonData.course?._id || lessonData.courseId;
          const courseData = await getCourseById(courseId);
          setCourse(courseData);
        }

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
        setError(err?.response?.data?.message || "Khong tai duoc du lieu");
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
        title: `Luyen tap: ${lessonData?.title || "Bai hoc"}`,
        lessonContent: lessonData?.content || lessonData?.description || `Bai hoc ve ${lessonData?.title || ""}`,
        courseId: lessonData?.course?._id || lessonData?.courseId,
        difficulty: "medium",
        questionType: "open_ended",
      });

      setPractice(practiceData);
    } catch (err) {
      setError(err?.response?.data?.message || "Khong tao duoc bai luyen tap");
      console.error("Error creating practice:", err);
    } finally {
      setCreatingPractice(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !practice) {
      alert("Vui long nhap cau tra loi!");
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
      setError(err?.response?.data?.message || "Khong nop duoc cau tra loi");
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const showHint = () => {
    const hintText = practice?.hints?.[0] || "Doc ky noi dung bai hoc va tim tu khoa chinh.";
    setActiveHint(hintText);
  };

  if (loading) {
    return (
      <div className="practice-loading">
        <div className="spinner" />
        <p>Dang tai bai luyen tap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-loading">
        <div className="error-card">
          <h3>Loi</h3>
          <p>{error}</p>
        </div>
        <button className="btn primary" onClick={() => navigate(-1)}>
          Quay lai
        </button>
      </div>
    );
  }

  if (creatingPractice) {
    return (
      <div className="practice-loading">
        <div className="spinner" />
        <div className="text-center">
          <h3>AI dang tao bai luyen tap...</h3>
          <p>Dang phan tich noi dung bai hoc va tao cau hoi phu hop</p>
        </div>
      </div>
    );
  }

  const accuracy = feedback?.score ? Math.min(100, Math.max(0, Math.round((feedback.score / 10) * 100))) : null;

  return (
    <div className="practice-page">
      <header className="practice-header">
        <div>
          <p className="eyebrow">Practice</p>
          <h1>{practice?.title || "Bai luyen tap"}</h1>
          <p className="muted">{lesson?.title} - {course?.title}</p>
        </div>
        <div className="practice-stats">
          <div className="stat-chip dark">
            <span>Do kho</span>
            <strong>{practice?.difficulty || "Medium"}</strong>
          </div>
          <div className="stat-chip dark">
            <span>Loai</span>
            <strong>{practice?.questionType === "open_ended" ? "Tu luan" : "Trac nghiem"}</strong>
          </div>
          <div className="stat-chip dark">
            <span>Trang thai</span>
            <strong>{feedback ? "Da cham" : "Chua nop"}</strong>
          </div>
        </div>
      </header>

      <div className="practice-grid">
        <section className="practice-card prompt-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Cau hoi</p>
              <h2>{practice?.question ? "Thuc hanh voi bai hoc" : "Dang tai cau hoi..."}</h2>
            </div>
            {activeHint && <div className="hint-pill">Goi y: {activeHint}</div>}
          </div>

          <div className="prompt-body">
            {practice?.question ? (
              <>
                <div className="context">
                  <h4>Van ban/Ngá»¯ cáº£nh</h4>
                  <p className="context-text">{practice?.lessonContent || lesson?.content || lesson?.description}</p>
                </div>
                <div className="question">
                  <h4>Yeu cau</h4>
                  <p className="question-text">{practice.question}</p>
                </div>
              </>
            ) : (
              <div className="skeleton-block">Dang tai cau hoi...</div>
            )}
          </div>

          <div className="input-area">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhap cau tra loi cua ban..."
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
                  {submitting ? "Dang nop..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="practice-card feedback-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Feedback</p>
              <h3>AI danh gia</h3>
            </div>
            <div className="pill success">{accuracy !== null ? `${accuracy}% Accuracy` : "Chua co diem"}</div>
          </div>

          {feedback ? (
            <div className="feedback-body">
              <div className="score-box">
                <span>Score</span>
                <strong>{feedback.score}/10</strong>
              </div>
              <div className="feedback-text">
                <h4>Nhan xet</h4>
                <p>{feedback.feedback}</p>
              </div>
              {feedback.suggestions && (
                <div className="suggestions">
                  <h4>Goi y cai thien</h4>
                  <p>{feedback.suggestions}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="feedback-empty">
              <p>Nop cau tra loi de nhan feedback.</p>
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




