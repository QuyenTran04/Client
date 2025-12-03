import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getYouTubeEmbedUrl } from "../lib/utils";
import { Share, Eye, Trash2, Users } from "lucide-react";
import "../css/course-card-danger.css";

const DEFAULT_COVER = "/assets/cover-1.png";

export default function CourseCard({ c = {}, onDeleted = () => {}, isProfile = false }) {
  const [showPreview, setShowPreview] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
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

  const handleShare = async () => {
    if (c.published) {
      alert("Khóa học này đã được công khai rồi!");
      return;
    }
    setShowShareModal(true);
  };

  const confirmPublish = async () => {
    setPublishing(true);
    try {
      await api.patch(`/courses/${c._id}/publish`);
      alert("Khóa học đã được công khai thành công!");
      setShowShareModal(false);
      // Refresh the course data
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Công khai khóa học thất bại");
    } finally {
      setPublishing(false);
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

  // Profile version - regular card without description
  if (isProfile) {
    return (
      <>
        <article className="course-card-v2 course-card-profile-compact">
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
            {/* Description hidden in Profile version */}

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
              {!c.published && (
                <button
                  type="button"
                  className="course-card-btn share"
                  onClick={handleShare}
                  disabled={publishing}
                >
                  {publishing ? "Đang chia sẻ..." : "Chia sẻ"}
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

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>
                  <Users size={20} />
                  Chia sẻ khóa học
                </h3>
              </div>
              <div className="modal-body">
                <p>Bạn có muốn công khai khóa học <strong>"{title}"</strong> để mọi người có thể học không?</p>
                <div className="modal-warning">
                  <strong>Lưu ý:</strong> Sau khi công khai, bạn sẽ không thể thay đổi trạng thái của khóa học.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowShareModal(false)}
                  disabled={publishing}
                >
                  Hủy
                </button>
                <button
                  className="btn-primary"
                  onClick={confirmPublish}
                  disabled={publishing}
                >
                  {publishing ? "Đang xử lý..." : "Xác nhận chia sẻ"}
                </button>
              </div>
            </div>
          </div>
        )}

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

  // Regular version
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

