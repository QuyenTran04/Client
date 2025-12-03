import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle, Edit3, Trash2, Sparkles } from "lucide-react";
import {
  getCourseReviews,
  checkReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
  getUserReview,
} from "../services/review";
import { getRatingLabel, getRatingOptions } from "../lib/rating";

export default function CourseReview({ courseId, onReviewUpdate }) {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  // Form state
  const [rating, setRating] = useState(7);
  const [comment, setComment] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
    checkEligibility();
    loadUserReview();
  }, [courseId]);

  const loadReviews = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getCourseReviews(courseId, page, 5);
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.total || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const data = await checkReviewEligibility(courseId);
      setEligibility(data);
    } catch (error) {
      console.error("Failed to check eligibility:", error);
    }
  };

  const loadUserReview = async () => {
    try {
      const data = await getUserReview(courseId);
      setUserReview(data.review);
    } catch (error) {
      setUserReview(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 10) {
      alert("Vui lòng chọn điểm đánh giá từ 1 đến 10");
      return;
    }

    try {
      setSubmitting(true);

      if (editingReview && userReview) {
        const result = await updateReview(userReview._id, { rating, comment });
        setUserReview(result.review);
        setReviews((prev) => prev.map((r) => (r._id === result.review._id ? result.review : r)));
      } else {
        const result = await createReview(courseId, { rating, comment });
        setUserReview(result.review);
        setReviews((prev) => [result.review, ...prev]);
        await checkEligibility();
      }

      setRating(7);
      setComment("");
      setShowReviewForm(false);
      setEditingReview(false);

      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      alert(error.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || "");
      setEditingReview(true);
      setShowReviewForm(true);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !window.confirm("Bạn chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      await deleteReview(userReview._id);
      setUserReview(null);
      setReviews((prev) => prev.filter((r) => r._id !== userReview._id));
      await checkEligibility();

      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      alert(error.message || "Lỗi khi xóa đánh giá");
    }
  };

  const RatingSelector = ({ value, onChange, interactive = false }) => {
    const ratingInfo = getRatingLabel(value);
    const chipStyle = {
      background: ratingInfo.bg,
      color: ratingInfo.text,
      borderColor: ratingInfo.border,
    };

    if (interactive) {
      return (
        <div className="rating-selector">
          <div className="rating-slider">
            <div className="slider-top">
              <span className="slider-label">Kéo thanh để chọn 1 - 10</span>
              <div className="rating-chip" style={chipStyle}>
                <Star size={16} />
                <span>{ratingInfo.label}</span>
                <span className="muted">({value}/10)</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={value}
              onChange={(e) => onChange && onChange(Number(e.target.value))}
              className="review-slider"
              aria-label="Chọn điểm đánh giá"
            />
            <div className="slider-scale">
              {[1, 3, 5, 7, 9, 10].map((mark) => {
                const markInfo = getRatingLabel(mark);
                return (
                  <div
                    key={mark}
                    className={`slider-mark ${mark === value ? "is-active" : ""}`}
                    style={mark === value ? { background: markInfo.bg, borderColor: markInfo.border } : undefined}
                  >
                    <span className="mark-number">{mark}</span>
                    <span className="mark-label">{markInfo.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rating-chip" style={chipStyle}>
            <Star size={16} />
            <span>{ratingInfo.label}</span>
            <span className="muted">({value}/10)</span>
          </div>
        </div>
      );
    }

    return (
      <div className="rating-chip" style={chipStyle}>
        <Star size={16} />
        <span>{value}/10</span>
        <span className="muted">{ratingInfo.label}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderAvatar = (student) => {
    if (student?.avatar) {
      return (
        <div
          className="review-avatar"
          style={{ backgroundImage: `url(${student.avatar})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      );
    }
    return <div className="review-avatar">{student?.name?.charAt(0)?.toUpperCase() || "?"}</div>;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="review-list-card">
        <div className="review-empty">
          <Sparkles size={28} />
          <p style={{ margin: "8px 0 0" }}>Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-wrap">
      {eligibility && (
        <div className="review-form-card">
          <div className="review-form-head">
            <div>
              <div className="review-eyebrow">Đánh giá</div>
              <h3 className="review-title">Góc nhận xét</h3>
              <p className="review-sub">Chia sẻ ngắn gọn cảm nhận của bạn.</p>
            </div>
            <span className="review-pill">Thang 10 điểm</span>
          </div>

          {!eligibility.hasCompletedActivity ? (
            <div className="review-note info">
              <div className="note-icon">
                <MessageSquare size={18} />
              </div>
              <div>
                <strong>Hoàn thành nội dung trước khi đánh giá</strong>
                <p className="review-sub">
                  Bạn cần hoàn thành ít nhất một bài luyện tập hoặc quiz của khóa học này để mở khóa đánh giá.
                </p>
              </div>
            </div>
          ) : eligibility.alreadyReviewed ? (
            <div className="review-owned">
              <div className="review-note success">
                <div className="note-icon">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <strong>Bạn đã đánh giá khóa học này</strong>
                  <p className="review-sub">Có thể chỉnh sửa hoặc xóa nếu muốn thay đổi nhận xét.</p>
                </div>
                <div className="review-actions">
                  <button onClick={handleEditReview} className="btn-ghost">
                    <Edit3 size={16} /> Chỉnh sửa
                  </button>
                  <button onClick={handleDeleteReview} className="btn-ghost danger">
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>

              {userReview && (
                <div className="review-card">
                  <div className="review-card-head">
                    <div className="review-author">
                      {renderAvatar(userReview.student)}
                      <div>
                        <p className="name">{userReview.student?.name || "Người dùng"}</p>
                        <p className="meta">{formatDate(userReview.createdAt)}</p>
                      </div>
                    </div>
                    <RatingSelector value={userReview.rating} />
                  </div>
                  {userReview.comment && (
                    <div className="review-comment">
                      <p style={{ margin: 0 }}>{userReview.comment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              {!showReviewForm && (
                <button onClick={() => setShowReviewForm(true)} className="btn-sun">
                  <Sparkles size={16} /> Viết đánh giá
                </button>
              )}

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="review-form">
                  <div className="review-field">
                    <label>
                      Điểm đánh giá <span style={{ color: "#b42318" }}>*</span>
                    </label>
                    <RatingSelector value={rating} onChange={setRating} interactive />
                  </div>

                    <div className="review-field">
                      <label>Nhận xét chi tiết</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ cảm nhận: nội dung hay, cách dạy, bài tập..."
                        className="review-textarea"
                        rows={5}
                      />
                    </div>

                  <div className="review-actions">
                    <button type="submit" disabled={submitting} className="btn-sun">
                      {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-ghost">
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      <div className="review-list-card">
        <div className="review-list-head">
          <div>
            <div className="review-eyebrow">Cảm nhận từ học viên</div>
            <h3 className="review-title" style={{ margin: 0 }}>Đánh giá khóa học</h3>
          </div>
          {reviews.length > 0 && <span className="review-count">{reviews.length}</span>}
        </div>

        {reviews.length === 0 ? (
          <div className="review-empty">
            <MessageSquare size={32} />
            <p style={{ margin: "10px 0 4px", fontWeight: 600, color: "#0f172a" }}>Chưa có đánh giá nào</p>
            <p className="review-sub" style={{ margin: 0 }}>Hãy là người đầu tiên chia sẻ cảm nhận của bạn.</p>
          </div>
        ) : (
          <>
            <div className="review-card-stack">
              {reviews.map((review) => {
                const info = getRatingLabel(review.rating);
                const chipStyle = { background: info.bg, color: info.text, borderColor: info.border };

                return (
                  <div key={review._id} className="review-card">
                    <div className="review-card-head">
                      <div className="review-author">
                        {renderAvatar(review.student)}
                        <div>
                          <p className="name">{review.student?.name || "Người dùng ẩn danh"}</p>
                          <p className="meta">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="rating-chip" style={chipStyle}>
                        <Star size={16} />
                        <span>{review.rating}/10</span>
                        <span className="muted">{info.label}</span>
                      </div>
                    </div>

                    {review.comment && (
                      <div className="review-comment">
                        <p style={{ margin: 0 }}>{review.comment}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pager-soft">
                <button onClick={() => loadReviews(currentPage - 1)} disabled={currentPage <= 1}>
                  ← Trang trước
                </button>
                <span className="page-text">
                  Trang {currentPage} / {totalPages}
                </span>
                <button onClick={() => loadReviews(currentPage + 1)} disabled={currentPage >= totalPages}>
                  Trang sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
