import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Plus, Trash2, Edit2, Loader2, Save, X, Download, Search, FolderOpen, Calendar } from "lucide-react";

export default function Categories() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["admin-categories", { q, page }],
    queryFn: () => adminApi.listCategories({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  // Debug log
  console.log("Categories data:", data);
  console.log("Items:", items);
  console.log("Is fetching:", isFetching);
  console.log("Is error:", isError);
  if (error) console.log("Error:", error);

  const createMut = useMutation({
    mutationFn: () => adminApi.createCategory(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () => adminApi.updateCategory(editingId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const bulkDeleteMut = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((id) => adminApi.deleteCategory(id))
      );
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
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

  const exportToCSV = () => {
    if (items.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }
    const headers = ["Tên danh mục", "Mô tả"];
    const rows = items.map((c) => [c.name, c.description || ""]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `categories_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, description: cat.description || "" });
    setEditingId(cat._id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingId) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  };

  return (
    <div className="admin-categories-page">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <FolderOpen className="header-icon" />
            <div className="icon-glow" />
          </div>
          <div>
            <h1 className="page-title">Quản lý danh mục</h1>
            <p className="page-subtitle">Tạo và quản lý danh mục khóa học</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="stat-badge">
            <span className="stat-value">{data?.total || 0}</span>
            <span className="stat-label">Danh mục</span>
          </div>
          <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="add-btn">
            <Plus size={20} />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="form-modal-overlay" onClick={resetForm}>
          <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-backdrop">
              <div className="gradient-orb" />
            </div>
            <div className="form-modal-content">
              <div className="form-modal-header">
                <div className="header-content">
                  <div className="header-icon">
                    {editingId ? <Edit2 size={24} /> : <Plus size={24} />}
                    <div className="icon-ring" />
                  </div>
                  <div className="header-text">
                    <h2>{editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}</h2>
                    <p>Điền thông tin danh mục bên dưới</p>
                  </div>
                </div>
                <button className="form-modal-close" onClick={resetForm}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="form-body">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📝</span>
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="VD: Lập trình web, Thiết kế đồ họa..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📄</span>
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="form-textarea"
                    placeholder="Mô tả ngắn về danh mục này..."
                  />
                </div>

                <div className="form-footer">
                  <button type="button" onClick={resetForm} className="footer-btn secondary">
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createMut.isLoading || updateMut.isLoading}
                    className="footer-btn primary"
                  >
                    {createMut.isLoading || updateMut.isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {editingId ? "Cập nhật" : "Tạo mới"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-controls">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm danh mục..."
              className="search-input"
            />
          </div>
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
            ✓ Đã chọn <strong>{selected.size}</strong> danh mục
          </span>
          <div className="bulk-buttons">
            <button
              onClick={() => {
                if (confirm("Bạn chắc chắn muốn xóa những danh mục này?")) {
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
      <div className="categories-table-wrapper">
        <table className="categories-table">
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
              <th className="th-left">Tên danh mục</th>
              <th className="th-left">Mô tả</th>
              <th className="th-center">Ngày tạo</th>
              <th className="th-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <div className="empty-message-box">
                    <span className="empty-icon">📁</span>
                    <span>Không có danh mục nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((cat) => (
                <tr key={cat._id} className={`table-row ${selected.has(cat._id) ? "selected" : ""}`}>
                  <td className="cell-checkbox">
                    <input
                      type="checkbox"
                      checked={selected.has(cat._id)}
                      onChange={() => handleSelectItem(cat._id)}
                      className="checkbox-input"
                    />
                  </td>

                  <td className="cell-name">
                    <div className="name-wrapper">
                      <div className="name-icon">📁</div>
                      <div className="name-content">
                        <div className="name-text">{cat.name}</div>
                        <div className="name-meta">ID: #{cat._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>

                  <td className="cell-description">
                    <div className="description-text">
                      {cat.description || "—"}
                    </div>
                  </td>

                  <td className="cell-date">
                    <div className="date-wrapper">
                      <Calendar size={14} />
                      <span className="date-text">
                        {new Date(cat.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </td>

                  <td className="cell-actions">
                    <div className="actions-wrapper">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="action-btn edit"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Bạn chắc chắn muốn xóa danh mục này?")) {
                            deleteMut.mutate(cat._id);
                          }
                        }}
                        disabled={deleteMut.isLoading}
                        className="action-btn delete"
                        title="Xóa"
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

      <style>{`
        .admin-categories-page {
          padding: 24px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
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

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
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

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
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

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }

        /* Form Modal */
        .form-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .form-modal-container {
          position: relative;
          width: 500px;
          max-width: 95vw;
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-modal-backdrop {
          position: absolute;
          inset: -100px;
          background: linear-gradient(135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(37, 99, 235, 0.1) 100%);
          border-radius: 24px;
          filter: blur(40px);
        }

        .gradient-orb {
          position: absolute;
          top: 20%;
          left: 60%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle,
            rgba(59, 130, 246, 0.3) 0%,
            transparent 70%);
          border-radius: 50%;
          animation: pulse 4s ease-in-out infinite;
        }

        .form-modal-content {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.2);
          overflow: hidden;
        }

        .form-modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg,
            rgba(240, 249, 255, 0.5) 0%,
            rgba(224, 242, 254, 0.3) 100%);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-icon {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 14px;
          color: white;
        }

        .icon-ring {
          position: absolute;
          inset: -6px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 18px;
          animation: pulse 2s ease-in-out infinite;
        }

        .header-text h2 {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .form-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .form-modal-close:hover {
          background: rgba(240, 249, 255, 0.9);
          transform: scale(1.05);
        }

        .form-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .label-icon {
          font-size: 16px;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0f2fe;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          background: linear-gradient(135deg,
            rgba(249, 250, 251, 0.9) 0%,
            rgba(243, 244, 246, 0.9) 100%);
          border-top: 1px solid rgba(59, 130, 246, 0.2);
          justify-content: flex-end;
        }

        .footer-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-btn.secondary {
          background: white;
          border: 2px solid #e5e7eb;
          color: #64748b;
        }

        .footer-btn.secondary:hover {
          background: #f9fafb;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        .footer-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .footer-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .footer-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Filter Bar */
        .filter-bar {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.1);
          margin-bottom: 20px;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
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

        .action-btn.export {
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
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .action-btn.export:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        /* Bulk Actions */
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

        /* Table */
        .categories-table-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.1);
          overflow: hidden;
        }

        .categories-table {
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

        .empty-cell {
          padding: 40px 20px;
          text-align: center;
        }

        .empty-message-box {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #6b7280;
          border: 2px dashed #d1d5db;
        }

        .empty-icon {
          font-size: 24px;
        }

        .cell-checkbox {
          width: 50px;
          text-align: center;
        }

        .cell-name {
          min-width: 250px;
        }

        .name-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .name-icon {
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

        .name-content {
          flex: 1;
          min-width: 0;
        }

        .name-text {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
        }

        .name-meta {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .cell-description {
          min-width: 300px;
        }

        .description-text {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cell-date {
          min-width: 120px;
        }

        .date-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          color: #64748b;
        }

        .date-text {
          font-size: 13px;
          font-weight: 500;
        }

        .cell-actions {
          min-width: 120px;
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

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .action-btn.edit {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        }

        .action-btn.edit:hover {
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }

        .action-btn.delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
        }

        .action-btn.delete:hover {
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
        }

        .action-btn svg {
          width: 18px;
          height: 18px;
          stroke-width: 2.5;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          position: relative;
          z-index: 1;
        }

        /* Pagination */
        .pagination-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
        }

        .pagination-info {
          font-size: 14px;
          color: #64748b;
        }

        .pagination-buttons {
          display: flex;
          gap: 8px;
        }

        .pagination-btn {
          padding: 10px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f0f9ff;
          border-color: #3b82f6;
          color: #1e40af;
         -2px);
  }

        .pagination-btn {
          opacity: 0.4;
         ;
 }       t-allowedcursor: no 

        @media (max-width: 768px) {
          .admin-categories-page {
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

          .categories-table-wrapper {
            overflow-x: auto;
          }

          .categories-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}
