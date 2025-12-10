import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";
import { 
  Loader2, Star, Search, Eye, EyeOff, Trash2, 
  MessageSquare, Calendar, TrendingUp
} from "lucide-react";
import "./Reviews.css";

export default function Reviews() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [hidden, setHidden] = useState("");
  const [courseId, setCourseId] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin-reviews", { q, hidden, courseId, page }],
    queryFn: () => adminApi.listReviews({ q, hidden, courseId, page, limit: 10 }),
    keepPreviousData: true,
  });

  // Lấy danh sách khóa học để filter
  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: () => adminApi.listCourses({ limit: 1000 }),
  });

  const hideMut = useMutation({
    mutationFn: (id) => adminApi.hideReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      alert("Đã ẩn đánh giá thành công");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Ẩn đánh giá thất bại");
    },
  });

  const unhideMut = useMutation({
    mutationFn: (id) => adminApi.unhideReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      alert("Đã hiện đánh giá thành công");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Hiện đánh giá thất bại");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      alert("Đã xóa đánh giá thành công");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Xóa đánh giá thất bại");
    },
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(items.map((r) => r._id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={i < fullStars ? "star-filled" : "star-empty"}
          fill={i < fullStars ? "currentColor" : "none"}
        />
      );
    }
    return stars;
  };

  const bulkHideMut = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => adminApi.hideReview(id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      setSelected(new Set());
      alert("Đã ẩn các đánh giá đã chọn");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Ẩn đánh giá thất bại");
    },
  });

  const bulkUnhideMut = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => adminApi.unhideReview(id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      setSelected(new Set());
      alert("Đã hiện các đánh giá đã chọn");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Hiện đánh giá thất bại");
    },
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const stats = data?.stats || { totalReviews: 0, hiddenReviews: 0, avgRating: 0 };
  const courses = coursesData?.items || [];

  return (
    <div className="admin-reviews-page">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <MessageSquare className="header-icon" />
            <div className="icon-glow" />
          </div>
          <div>
            <h1 className="page-title">Quản lý đánh giá</h1>
            <p className="page-subtitle">Xem và quản lý tất cả đánh giá của khóa học</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <MessageSquare size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalReviews}</span>
              <span className="stat-label">Tổng đánh giá</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon hidden">
              <EyeOff size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.hiddenReviews}</span>
              <span className="stat-label">Đã ẩn</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rating">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.avgRating.toFixed(1)}/10</span>
              <span className="stat-label">Điểm TB</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-controls">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm theo nội dung đánh giá..."
              className="search-input"
            />
          </div>
          <select
            value={courseId}
            onChange={(e) => { setCourseId(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">📚 Tất cả khóa học</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            value={hidden}
            onChange={(e) => { setHidden(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">📋 Tất cả trạng thái</option>
            <option value="false">👁️ Đang hiển thị</option>
            <option value="true">🚫 Đã ẩn</option>
          </select>
          {isFetching && (
            <span className="loading-indicator">
              <Loader2 className="animate-spin" size={16} />
              Đang tải...
            </span>
          )}
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selected.size > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-count">
            ✓ Đã chọn <strong>{selected.size}</strong> đánh giá
          </span>
          <div className="bulk-buttons">
            <button
              onClick={() => {
                if (confirm(`Bạn chắc chắn muốn ẩn ${selected.size} đánh giá này?`)) {
                  bulkHideMut.mutate(Array.from(selected));
                }
              }}
              disabled={bulkHideMut.isLoading}
              className="bulk-btn hide"
            >
              {bulkHideMut.isLoading ? <Loader2 className="animate-spin" size={14} /> : <EyeOff size={14} />}
              Ẩn đã chọn
            </button>
            <button
              onClick={() => {
                if (confirm(`Bạn chắc chắn muốn hiện ${selected.size} đánh giá này?`)) {
                  bulkUnhideMut.mutate(Array.from(selected));
                }
              }}
              disabled={bulkUnhideMut.isLoading}
              className="bulk-btn show"
            >
              {bulkUnhideMut.isLoading ? <Loader2 className="animate-spin" size={14} /> : <Eye size={14} />}
              Hiện đã chọn
            </button>
            <button
              onClick={() => {
                if (confirm(`Bạn chắc chắn muốn xóa ${selected.size} đánh giá này?`)) {
                  Promise.all(Array.from(selected).map(id => deleteMut.mutateAsync(id)))
                    .then(() => setSelected(new Set()));
                }
              }}
              disabled={deleteMut.isLoading}
              className="bulk-btn delete"
            >
              {deleteMut.isLoading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
              Xóa đã chọn
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="reviews-table-wrapper">
        <table className="reviews-table">
          <thead className="table-header">
            <tr>
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="checkbox-input"
                />
              </th>
              <th className="th-left">Học viên</th>
              <th className="th-left">Khóa học</th>
              <th className="th-center">Đánh giá</th>
              <th className="th-left">Nội dung</th>
              <th className="th-center">Ngày tạo</th>
              <th className="th-center">Trạng thái</th>
              <th className="th-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-cell">
                  <div className="empty-message-box">
                    <span className="empty-icon">💬</span>
                    <span>Không có đánh giá nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((review) => (
                <tr key={review._id} className={`table-row ${selected.has(review._id) ? "selected" : ""} ${review.hidden ? "hidden-review" : ""}`}>
                  <td className="cell-checkbox">
                    <input
                      type="checkbox"
                      checked={selected.has(review._id)}
                      onChange={() => handleSelectItem(review._id)}
                      className="checkbox-input"
                    />
                  </td>

                  <td className="cell-student">
                    <div className="student-wrapper">
                      <div className="student-avatar">
                        {review.student?.avatar ? (
                          <img src={review.student.avatar} alt={review.student.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(review.student?.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="student-info">
                        <div className="student-name">{review.student?.name || "N/A"}</div>
                        <div className="student-email">{review.student?.email || ""}</div>
                      </div>
                    </div>
                  </td>

                  <td className="cell-course">
                    <div className="course-wrapper">
                      {review.course?.thumbnail && (
                        <img src={review.course.thumbnail} alt={review.course.title} className="course-thumbnail" />
                      )}
                      <div className="course-info">
                        <div className="course-title">{review.course?.title || "N/A"}</div>
                        <div className="course-meta">ID: #{review.course?._id?.slice(-6)}</div>
                      </div>
                    </div>
                  </td>

                  <td className="cell-rating">
                    <div className="rating-wrapper">
                      <div className="rating-stars">
                        {getRatingStars(review.rating)}
                      </div>
                      <div className="rating-score">{review.rating}/10</div>
                    </div>
                  </td>

                  <td className="cell-comment">
                    <div className="comment-text" title={review.comment}>
                      {review.comment || <span className="no-comment">Không có bình luận</span>}
                    </div>
                  </td>

                  <td className="cell-date">
                    <div className="date-wrapper">
                      <Calendar size={14} />
                      <span className="date-text">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </td>

                  <td className="cell-status">
                    <div className={`status-badge ${review.hidden ? 'hidden-status' : 'visible-status'}`}>
                      {review.hidden ? (
                        <>
                          <EyeOff size={14} />
                          <span>Đã ẩn</span>
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          <span>Hiển thị</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="cell-actions">
                    <div className="actions-wrapper">
                      {review.hidden ? (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn chắc chắn muốn hiện lại đánh giá này?`)) {
                              unhideMut.mutate(review._id);
                            }
                          }}
                          disabled={unhideMut.isLoading}
                          className="action-btn show"
                          title="Hiện đánh giá"
                        >
                          <Eye size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn chắc chắn muốn ẩn đánh giá này?`)) {
                              hideMut.mutate(review._id);
                            }
                          }}
                          disabled={hideMut.isLoading}
                          className="action-btn hide"
                          title="Ẩn đánh giá"
                        >
                          <EyeOff size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Bạn chắc chắn muốn xóa đánh giá này?`)) {
                            deleteMut.mutate(review._id);
                          }
                        }}
                        disabled={deleteMut.isLoading}
                        className="action-btn delete"
                        title="Xóa đánh giá"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination-wrapper">
        <span className="pagination-info">
          Trang <b>{page}</b> / {totalPages}
        </span>
        <div className="pagination-buttons">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="pagination-btn"
          >
            ← Trước
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="pagination-btn"
          >
            Sau →
          </button>
        </div>
      </div>

      {isError && (
        <div className="error-message">
          ⚠️ Không thể tải dữ liệu đánh giá. Vui lòng thử lại.
        </div>
      )}
    </div>
  );
}
