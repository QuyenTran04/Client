import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  BookOpen,
  Trash2,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import CourseDetailModal from "../../components/admin/CourseDetailModal";

export default function Courses() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [published, setPublished] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin-courses", { q, published, page }],
    queryFn: () => adminApi.listCourses({ q, published, page, limit: 10 }),
    keepPreviousData: true,
  });

  const publishMut = useMutation({
    mutationFn: (id) => adminApi.publishCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const unpublishMut = useMutation({
    mutationFn: (id) => adminApi.unpublishCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      setSelected(new Set());
    },
  });

  const bulkDeleteMut = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((id) => adminApi.deleteCourse(id))
      );
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      setSelected(new Set());
    },
  });

  const bulkPublishMut = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((id) => adminApi.publishCourse(id))
      );
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      setSelected(new Set());
    },
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(items.map((c) => c._id)));
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

  const handleViewDetail = (course) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  const exportToCSV = () => {
    if (items.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }
    const headers = ["Tiêu đề", "Giảng viên", "Giá", "Trạng thái"];
    const rows = items.map((c) => [
      c.title,
      c.instructor?.name || "—",
      c.price || 0,
      c.published ? "Đã xuất bản" : "Bản nháp",
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `courses_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="admin-courses-page">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <BookOpen className="header-icon" />
            <div className="icon-glow" />
          </div>
          <div>
            <h1 className="page-title">Quản lý khóa học</h1>
            <p className="page-subtitle">Xem và quản lý tất cả khóa học trên hệ thống</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-value">{data?.total || 0}</span>
            <span className="stat-label">Tổng khóa học</span>
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
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="search-input"
            />
          </div>
          <select
            value={published}
            onChange={(e) => setPublished(e.target.value)}
            className="status-select"
          >
            <option value="">📚 Tất cả trạng thái</option>
            <option value="true">✓ Đã xuất bản</option>
            <option value="false">○ Bản nháp</option>
          </select>
          {isFetching && (
            <span className="loading-indicator">
              <Loader2 className="animate-spin" size={16} />
              Đang tải...
            </span>
          )}
        </div>
        <div className="filter-actions">
          <button onClick={exportToCSV} className="action-btn export">
            <Download size={16} />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selected.size > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-count">
            ✓ Đã chọn <strong>{selected.size}</strong> khóa học
          </span>
          <div className="bulk-buttons">
            <button
              onClick={() => bulkPublishMut.mutate()}
              disabled={bulkPublishMut.isLoading}
              className="bulk-btn publish"
            >
              {bulkPublishMut.isLoading ? <Loader2 className="animate-spin" size={14} /> : '✓'}
              Xuất bản
            </button>
            <button
              onClick={() => {
                if (confirm("Bạn chắc chắn muốn xóa những khóa học này?")) {
                  bulkDeleteMut.mutate();
                }
              }}
              disabled={bulkDeleteMut.isLoading}
              className="bulk-btn delete"
            >
              {bulkDeleteMut.isLoading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="courses-table-wrapper">
        <table className="courses-table">
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
              <th className="th-left">Tiêu đề</th>
              <th className="th-center">Người tạo</th>
              <th className="th-center">Thời gian tạo</th>
              <th className="th-center">Giá</th>
              <th className="th-center">Trạng thái</th>
              <th className="th-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isError && (
              <tr>
                <td colSpan={7} className="error-cell">
                  <div className="error-message-box">
                    <span className="error-icon">⚠️</span>
                    <span>Lỗi khi tải dữ liệu. Vui lòng thử lại.</span>
                  </div>
                </td>
              </tr>
            )}
            {!isError && items.length === 0 && !isFetching && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  <div className="empty-message-box">
                    <span className="empty-icon">📚</span>
                    <span>Không có khóa học nào</span>
                  </div>
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr
                key={c._id}
                className={`table-row ${selected.has(c._id) ? "selected" : ""}`}
              >
                <td className="cell-checkbox">
                  <input
                    type="checkbox"
                    checked={selected.has(c._id)}
                    onChange={() => handleSelectItem(c._id)}
                    className="checkbox-input"
                  />
                </td>
                
                <td className="cell-title">
                  <div className="title-wrapper">
                    <div className="title-icon">📖</div>
                    <div className="title-content">
                      <div className="title-text">{c.title}</div>
                      <div className="title-meta">ID: #{c._id.slice(-6)}</div>
                    </div>
                  </div>
                </td>
                
                <td className="cell-creator">
                  <div className="creator-wrapper">
                    <div className="creator-avatar">
                      {c.instructor?.avatar ? (
                        <img src={c.instructor.avatar} alt={c.instructor.name} />
                      ) : (
                        <span className="avatar-placeholder">
                          {(c.instructor?.name || "?").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="creator-info">
                      <div className="creator-name">{c.instructor?.name || "—"}</div>
                      <div className="creator-email">{c.instructor?.email || ""}</div>
                    </div>
                  </div>
                </td>
                
                <td className="cell-date">
                  <div className="date-wrapper">
                    <div className="date-icon">📅</div>
                    <div className="date-content">
                      <div className="date-text">
                        {new Date(c.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </div>
                      <div className="time-text">
                        {new Date(c.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="cell-price">
                  <div className="price-wrapper">
                    <div className="price-icon">💰</div>
                    <div className="price-amount">
                      {c.price?.toLocaleString?.("vi-VN") || 0}₫
                    </div>
                  </div>
                </td>
                
                <td className="cell-status">
                  <span className={`status-badge ${c.published ? "published" : "draft"}`}>
                    <span className="status-icon">
                      {c.published ? "✓" : "○"}
                    </span>
                    <span className="status-text">
                      {c.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                  </span>
                </td>
                
                <td className="cell-actions">
                  <div className="actions-wrapper">
                    <button
                      onClick={() => handleViewDetail(c)}
                      className="action-btn view"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    {c.published ? (
                      <button
                        disabled={unpublishMut.isLoading}
                        onClick={() => unpublishMut.mutate(c._id)}
                        className="action-btn unpublish"
                        title="Hủy xuất bản"
                      >
                        {unpublishMut.isLoading ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                      </button>
                    ) : (
                      <button
                        disabled={publishMut.isLoading}
                        onClick={() => publishMut.mutate(c._id)}
                        className="action-btn publish"
                        title="Xuất bản"
                      >
                        {publishMut.isLoading ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Bạn chắc chắn muốn xóa khóa học này?")) {
                          deleteMut.mutate(c._id);
                        }
                      }}
                      disabled={deleteMut.isLoading}
                      className="action-btn delete"
                      title="Xóa khóa học"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-600">
          Trang <b>{page}</b> / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition"
          >
            ← Trước
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCourse(null);
          }}
        />
      )}

      <style>{`
        .admin-courses-page {
          padding: 24px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #fef3c7 100%);
          min-height: 100vh;
          border-radius: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .header-icon {
          width: 32px;
          height: 32px;
          color: white;
          z-index: 1;
        }

        .icon-glow {
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 18px;
          opacity: 0.3;
          filter: blur(8px);
          animation: pulse 2s ease-in-out infinite;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .header-stats {
          display: flex;
          gap: 12px;
        }

        .stat-badge {
          padding: 12px 20px;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .filter-bar {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
          margin-bottom: 20px;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .status-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .status-select:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .filter-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .action-btn.export {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .action-btn.export:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        .bulk-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          margin-bottom: 20px;
          animation: slideIn 0.3s ease-out;
        }

        .bulk-count {
          font-size: 14px;
          color: #1e40af;
          font-weight: 600;
        }

        .bulk-buttons {
          display: flex;
          gap: 8px;
        }

        .bulk-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .bulk-btn.publish {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .bulk-btn.publish:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .bulk-btn.delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .bulk-btn.delete:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .bulk-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .courses-table-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
          overflow: hidden;
        }

        .courses-table {
          width: 100%;
          font-size: 14px;
        }

        .table-header {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-bottom: 2px solid #3b82f6;
        }

        .table-header th {
          padding: 16px 12px;
          font-weight: 700;
          color: #1e40af;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .th-checkbox {
          width: 40px;
          text-align: center;
        }

        .th-left {
          text-align: left;
        }

        .th-center {
          text-align: center;
        }

        .th-right {
          text-align: right;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .table-body {
          background: white;
        }

        .table-row {
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .table-row:hover {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          transform: scale(1.001);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }

        .table-row.selected {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }

        .table-row td {
          padding: 16px 12px;
          vertical-align: middle;
        }

        /* Error & Empty States */
        .error-cell, .empty-cell {
          padding: 40px 20px;
          text-align: center;
        }

        .error-message-box, .empty-message-box {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .error-message-box {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          border: 2px solid #f87171;
        }

        .empty-message-box {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #6b7280;
          border: 2px dashed #d1d5db;
        }

        .error-icon, .empty-icon {
          font-size: 24px;
        }

        /* Checkbox Cell */
        .cell-checkbox {
          width: 50px;
          text-align: center;
        }

        /* Title Cell */
        .cell-title {
          min-width: 250px;
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .title-content {
          flex: 1;
          min-width: 0;
        }

        .title-text {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .title-meta {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* Creator Cell */
        .cell-creator {
          min-width: 200px;
        }

        .creator-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        }

        .creator-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid #e0f2fe;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .creator-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          font-weight: 700;
          font-size: 14px;
        }

        .creator-info {
          text-align: left;
        }

        .creator-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.3;
        }

        .creator-email {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        /* Date Cell */
        .cell-date {
          min-width: 140px;
        }

        .date-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }

        .date-icon {
          font-size: 18px;
        }

        .date-content {
          text-align: left;
        }

        .date-text {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.3;
        }

        .time-text {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        /* Price Cell */
        .cell-price {
          min-width: 130px;
        }

        .price-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
        }

        .price-icon {
          font-size: 18px;
        }

        .price-amount {
          font-size: 15px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Status Cell */
        .cell-status {
          min-width: 140px;
          text-align: center;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .status-badge.published {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #166534;
          border: 2px solid #22c55e;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
        }

        .status-badge.draft {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #6b7280;
          border: 2px solid #d1d5db;
          box-shadow: 0 2px 8px rgba(107, 114, 128, 0.1);
        }

        .status-icon {
          font-size: 14px;
          font-weight: 700;
        }

        .status-text {
          line-height: 1;
        }

        /* Actions Cell */
        .cell-actions {
          min-width: 180px;
          padding-right: 16px !important;
        }

        .actions-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-end;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 2px solid transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          flex-shrink: 0;
          padding: 0;
          outline: none;
        }

        .action-btn:hover {
          transform: translateY(-3px) scale(1.08);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .action-btn:active {
          transform: translateY(-1px) scale(1.03);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .action-btn.view {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        }

        .action-btn.view:hover {
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .action-btn.publish {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
        }

        .action-btn.publish:hover {
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .action-btn.unpublish {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.5);
        }

        .action-btn.unpublish:hover {
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.6);
          background: linear-gradient(135deg, #ea580c, #c2410c);
        }

        .action-btn.delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
        }

        .action-btn.delete:hover {
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }

        .action-btn svg {
          width: 18px;
          height: 18px;
          stroke-width: 2.5;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          position: relative;
          z-index: 1;
        }

        .action-btn .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .admin-courses-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: 100%;
          }

          .courses-table-wrapper {
            overflow-x: auto;
          }

          .courses-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}
