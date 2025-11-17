import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getYouTubeEmbedUrl } from "../lib/utils";
import "../css/course-card-danger.css";

const DEFAULT_COVER = "/assets/cover-1.png";

export default function CourseCard({ c = {}, onDeleted = () => {} }) {
  const [showPreview, setShowPreview] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(c?.introVideoUrl);

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa khóa học "${c.title}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/courses/${c._id}`);
      onDeleted(c._id);
    } catch (err) {
      alert(err?.response?.data?.message || "Xóa khóa học thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const cover = c.imageUrl || DEFAULT_COVER;
  const title = c.title || "Khóa học chưa đặt tên";
  const description = c.description || "Khóa học này chưa có mô tả";
  const isFree = !c.price || Number(c.price) === 0;
  const priceLabel = isFree
    ? "Miễn phí"
    : `${Number(c.price).toLocaleString("vi-VN")}đ`;
  const lessonCount =
    c.lessons?.length ?? c.totalLessons ?? c.lessonCount ?? 0;
  const updatedAt = c.updatedAt || c.createdAt;
  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("vi-VN")
    : null;
  const instructorName = c.instructor?.name;

  return (
    <>
      <article className="course-card-v2">
        <div className="course-card-media">
          <img src={cover} alt={title} loading="lazy" />
          <div className="course-card-badges">
            {c.category?.name && (
              <span className="course-card-badge">{c.category.name}</span>
            )}
            <span className={`course-card-price${isFree ? " is-free" : ""}`}>
              {priceLabel}
            </span>
          </div>
        </div>

        <div className="course-card-body">
          <div className="course-card-chip-row">
            <span
              className={`course-card-chip${
                c.published === false ? " is-warning" : ""
              }`}
            >
              {c.published === false ? "Bản nháp" : "Sẵn sàng"}
            </span>
            <span className="course-card-chip is-muted">
              {isFree ? "Không thu phí" : "Có học phí"}
            </span>
          </div>

          <h3 className="course-card-title" title={title}>
            {title}
          </h3>
          <p className="course-card-desc">{description}</p>

          <div className="course-card-meta">
            <span>{lessonCount || 0} bài học</span>
            {formattedDate && <span>Cập nhật {formattedDate}</span>}
            {instructorName && <span>GV {instructorName}</span>}
          </div>

          <div className="course-card-actions">
            <Link to={`/courses/${c._id}`} className="course-card-btn primary">
              Xem chi tiết
            </Link>
            {embedUrl && (
              <button
                type="button"
                className="course-card-btn ghost"
                onClick={() => setShowPreview(true)}
              >
                Xem trước
              </button>
            )}
            <button
              type="button"
              className="course-card-btn danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </article>

      {showPreview && embedUrl && (
        <div className="course-preview-modal" role="dialog" aria-modal="true">
          <div
            className="course-preview-backdrop"
            onClick={() => setShowPreview(false)}
          />
          <div className="course-preview-dialog">
            <div className="course-preview-head">
              <h4>Xem trước: {title}</h4>
              <button
                type="button"
                className="course-preview-close"
                onClick={() => setShowPreview(false)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="course-preview-body">
              <div className="course-preview-frame">
                <iframe
                  src={embedUrl}
                  title="Course Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

