import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../services/course";
import { getLessonsByCourse } from "../services/lesson";
import { useAuth } from "../context/AuthContext";
import { getYouTubeEmbedUrl } from "../lib/utils";
import AIChat from "../components/AIChat";
import DocumentViewer from "../components/DocumentViewer";
import "../css/courses.css";

export default function Lessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonDetails, setLessonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState("content");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(id),
          getLessonsByCourse(id),
        ]);

        if (!alive) return;
        setCourse(courseData);
        setLessons(lessonsData.items || []);

        if (lessonsData.items && lessonsData.items.length > 0) {
          setSelectedLesson(lessonsData.items[0]._id);
        }
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Khong tai duoc du lieu!");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, user, navigate]);

  useEffect(() => {
    if (!selectedLesson) return;

    setDetailLoading(true);
    const selected = lessons.find((l) => l._id === selectedLesson);
    if (selected) {
      setLessonDetails(selected);
    }
    setDetailLoading(false);
  }, [selectedLesson, lessons]);

  if (loading) {
    return (
      <div className="lessons-loading">
        <div className="lesson-skeleton title" />
        <div className="lesson-skeleton body" />
        <div className="lesson-skeleton body" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="lessons-loading lessons-error">
        <button className="lessons-back" onClick={() => navigate(-1)}>
          Quay lai
        </button>
        <div className="lesson-card lesson-card--empty">
          {error || "Khong tim thay khoa hoc."}
        </div>
      </div>
    );
  }

  const embedUrl = lessonDetails?.videoUrl ? getYouTubeEmbedUrl(lessonDetails.videoUrl) : null;
  const currentLessonIndex = lessons.findIndex((l) => l._id === selectedLesson);
  const totalLessons = lessons.length;

  return (
    <div className="lessons-shell">
      <header className="lessons-hero">
        <div className="lessons-hero__inner">
          <div className="lessons-hero__top">
            <button className="lessons-back" onClick={() => navigate(-1)}>
              Quay lai
            </button>
            {(course.category?.name || course.level) && (
              <div className="lessons-hero__tags">
                {course.category?.name && <span>{course.category.name}</span>}
                {course.level && <span>Cap {course.level}</span>}
              </div>
            )}
          </div>
          <h1>{course.title}</h1>
          {course.description && <p className="lessons-hero__desc">{course.description}</p>}
          <div className="lessons-hero__stats">
            <div className="stat-chip">
              <span>Bai hoc</span>
              <strong>{totalLessons || 0}</strong>
            </div>
            {course.duration && (
              <div className="stat-chip">
                <span>Tong thoi luong</span>
                <strong>{course.duration} gio</strong>
              </div>
            )}
            {course.avgRating && (
              <div className="stat-chip">
                <span>Danh gia</span>
                <strong>{course.avgRating}/5</strong>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="lessons-grid">
        <aside className="lessons-sidebar">
          <div className="lessons-card course-info-card">
            <div className="course-info-card__head">
              <div>
                <p>Giang vien</p>
                <h3>{course.instructor?.name || "Giang vien"}</h3>
              </div>
              <div
                className="course-info-card__avatar"
                style={{ backgroundImage: `url(${course.instructor?.avatar || "/assets/ava-1.jpg"})` }}
              />
            </div>
            {course.instructor?.bio && <p className="course-info-card__bio">{course.instructor.bio}</p>}
            <ul className="course-meta-list">
              {course.level && (
                <li>
                  <span>Cap do</span>
                  <strong>{course.level}</strong>
                </li>
              )}
              {course.duration && (
                <li>
                  <span>Thoi luong</span>
                  <strong>{course.duration} gio</strong>
                </li>
              )}
              <li>
                <span>So bai hoc</span>
                <strong>{totalLessons}</strong>
              </li>
              {course.avgRating && (
                <li>
                  <span>Danh gia</span>
                  <strong>{course.avgRating}/5</strong>
                </li>
              )}
            </ul>
          </div>

          <div className="lessons-card lessons-list-card">
            <div className="lessons-card__title">
              <div>
                <p>Tong quan chuong trinh</p>
                <h3>Danh sach bai hoc</h3>
              </div>
              <span className="pill">{totalLessons} bai</span>
            </div>
            <div className="lessons-list">
              {lessons.length ? (
                lessons.map((lesson, idx) => {
                  const isActive = selectedLesson === lesson._id;
                  return (
                    <button
                      key={lesson._id}
                      type="button"
                      className={`lesson-row ${isActive ? "is-active" : ""}`}
                      onClick={() => setSelectedLesson(lesson._id)}
                    >
                      <div className="lesson-row__index">{idx + 1}</div>
                      <div className="lesson-row__content">
                        <div className="lesson-row__title">{lesson.title}</div>
                        <div className="lesson-row__meta">
                          {lesson.duration && <span>{lesson.duration} phut</span>}
                          {lesson.resources?.length > 0 && <span>{lesson.resources.length} tai lieu</span>}
                        </div>
                      </div>
                      <span className="lesson-row__chevron">&rsaquo;</span>
                    </button>
                  );
                })
              ) : (
                <div className="lessons-empty">Chua co bai hoc nao</div>
              )}
            </div>
          </div>
        </aside>

        <section className="lessons-main">
          {detailLoading ? (
            <div className="lesson-card lesson-card--empty">
              <div className="lesson-skeleton title" />
              <div className="lesson-skeleton body" />
              <div className="lesson-skeleton body" />
            </div>
          ) : !selectedLesson ? (
            <div className="lesson-card lesson-card--empty">
              <p>Chon mot bai hoc de bat dau</p>
            </div>
          ) : (
            <div className="lesson-card">
              {embedUrl && (
                <div className="lesson-video-wrapper">
                  <div className="lesson-video-player">
                    <iframe
                      src={embedUrl}
                      title={lessonDetails?.title || "Lesson"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div className="lesson-tabs">
                <button
                  type="button"
                  className={`lesson-tab ${selectedTab === "content" ? "is-active" : ""}`}
                  onClick={() => setSelectedTab("content")}
                >
                  Noi dung bai hoc
                </button>
                <button
                  type="button"
                  className={`lesson-tab ${selectedTab === "document" ? "is-active" : ""}`}
                  onClick={() => setSelectedTab("document")}
                >
                  Tai lieu hoc tap
                </button>
              </div>

              {selectedTab === "content" ? (
                <div className="lesson-body">
                  <div className="lesson-title-block">
                    <div>
                      <p className="lesson-subtitle">
                        Bai {currentLessonIndex + 1} / {totalLessons}
                      </p>
                      <h2>{lessonDetails?.title || "Bai hoc"}</h2>
                    </div>
                    <div className="lesson-meta-chips">
                      {lessonDetails?.duration && <span>Thoi luong: {lessonDetails.duration} phut</span>}
                      {lessonDetails?.createdAt && (
                        <span>Ngay: {new Date(lessonDetails.createdAt).toLocaleDateString("vi-VN")}</span>
                      )}
                      {lessonDetails?.resources?.length > 0 && <span>Tai lieu: {lessonDetails.resources.length}</span>}
                    </div>
                  </div>

                  {lessonDetails?.description && (
                    <section className="lesson-section">
                      <h3>Mo ta</h3>
                      <p>{lessonDetails.description}</p>
                    </section>
                  )}

                  {lessonDetails?.content && (
                    <section className="lesson-section">
                      <h3>Noi dung chi tiet</h3>
                      <div className="lesson-rich-text">{lessonDetails.content}</div>
                    </section>
                  )}

                  {lessonDetails?.resources?.length > 0 && (
                    <section className="lesson-section">
                      <h3>Tai lieu dinh kem</h3>
                      <div className="lesson-resources">
                        {lessonDetails.resources.map((resource, idx) => (
                          <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="resource-chip">
                            Tai lieu: {resource.name || "Tai xuong tai lieu"}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="lesson-actions">
                    <button
                      type="button"
                      className="lesson-action ghost"
                      disabled={currentLessonIndex <= 0}
                      onClick={() => {
                        if (currentLessonIndex > 0) {
                          setSelectedLesson(lessons[currentLessonIndex - 1]._id);
                        }
                      }}
                    >
                      Bai truoc
                    </button>
                    <button
                      type="button"
                      className="lesson-action primary"
                      onClick={() => navigate(`/lessons/${selectedLesson}/quiz`)}
                    >
                      Lam bai quiz
                    </button>
                    <button
                      type="button"
                      className="lesson-action ghost"
                      disabled={currentLessonIndex >= lessons.length - 1}
                      onClick={() => {
                        if (currentLessonIndex < lessons.length - 1) {
                          setSelectedLesson(lessons[currentLessonIndex + 1]._id);
                        }
                      }}
                    >
                      Bai tiep theo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lesson-document">
                  <DocumentViewer lessonId={selectedLesson} lessonTitle={lessonDetails?.title} />
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <AIChat layout="drawer" courseId={id} lessonId={selectedLesson} page="lesson" title="Ho tro bai hoc" />
    </div>
  );
}
