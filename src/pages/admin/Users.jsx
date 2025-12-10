import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";
import { 
  Loader2, Users as UsersIcon, Search, Download, 
  Lock, Unlock, Eye, Calendar, Mail, CheckCircle2, XCircle, Shield, GraduationCap
} from "lucide-react";

export default function Users() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin-users", { q, role, page }],
    queryFn: () => adminApi.listUsers({ q, role, page, limit: 10 }),
    keepPreviousData: true,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (error) => {
      const message = error.response?.data?.message || "Cập nhật thất bại";
      alert(message);
    },
  });

  const bulkLockMut = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((id) => adminApi.updateUser(id, { isActive: false }))
      );
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setSelected(new Set());
    },
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(items.map((u) => u._id)));
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
    const headers = ["Tên", "Email", "Vai trò", "Trạng thái"];
    const rows = items.map((u) => [u.name, u.email, u.role, u.isActive ? "Hoạt động" : "Bị khóa"]);
    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="admin-users-page">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <UsersIcon className="header-icon" />
            <div className="icon-glow" />
          </div>
          <div>
            <h1 className="page-title">Quản lý người dùng</h1>
            <p className="page-subtitle">Xem và quản lý tất cả người dùng trong hệ thống</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="stat-badge">
            <span className="stat-value">{data?.total || 0}</span>
            <span className="stat-label">Người dùng</span>
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
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="search-input"
            />
          </div>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="role-select"
          >
            <option value="">👥 Tất cả vai trò</option>
            <option value="student">🎓 Học viên</option>
            <option value="admin">🛡️ Quản trị viên</option>
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
            ✓ Đã chọn <strong>{selected.size}</strong> người dùng
          </span>
          <div className="bulk-buttons">
            <button
              onClick={() => {
                if (confirm(`Bạn chắc chắn muốn khóa ${selected.size} tài khoản này?`)) {
                  bulkLockMut.mutate();
                }
              }}
              disabled={bulkLockMut.isLoading}
              className="bulk-btn lock"
            >
              {bulkLockMut.isLoading ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
              Khóa tài khoản
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="users-table-wrapper">
        <table className="users-table">
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
              <th className="th-left">Người dùng</th>
              <th className="th-center">Vai trò</th>
              <th className="th-center">Ngày tạo</th>
              <th className="th-center">Trạng thái</th>
              <th className="th-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-message-box">
                    <span className="empty-icon">👥</span>
                    <span>Không có người dùng nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((user) => (
                <tr key={user._id} className={`table-row ${selected.has(user._id) ? "selected" : ""}`}>
                  <td className="cell-checkbox">
                    <input
                      type="checkbox"
                      checked={selected.has(user._id)}
                      onChange={() => handleSelectItem(user._id)}
                      className="checkbox-input"
                    />
                  </td>

                  <td className="cell-user">
                    <div className="user-wrapper">
                      <div className="user-avatar-container">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="user-avatar-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`user-avatar-placeholder ${user.avatar ? 'hidden' : ''}`}>
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`} 
                             title={user.isOnline ? 'Đang online' : 'Offline'}>
                        </div>
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="cell-role">
                    <div className="role-badge-wrapper">
                      <div className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? (
                          <>
                            <Shield size={14} />
                            <span>Quản trị</span>
                          </>
                        ) : (
                          <>
                            <GraduationCap size={14} />
                            <span>Học viên</span>
                          </>
                        )}
                      </div>
                      <select
                        value={user.role}
                        onChange={(e) => updateMut.mutate({ id: user._id, payload: { role: e.target.value } })}
                        className="role-select-inline"
                        disabled={updateMut.isLoading || user.role === 'admin'}
                        title={user.role === 'admin' ? 'Không thể thay đổi vai trò của quản trị viên' : ''}
                      >
                        <option value="student">Học viên</option>
                        <option value="admin">Quản trị</option>
                      </select>
                    </div>
                  </td>

                  <td className="cell-date">
                    <div className="date-wrapper">
                      <Calendar size={14} />
                      <span className="date-text">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </td>

                  <td className="cell-status">
                    <div className="status-wrapper">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={user.isActive}
                          onChange={(e) => updateMut.mutate({ id: user._id, payload: { isActive: e.target.checked } })}
                          disabled={updateMut.isLoading}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <div className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Hoạt động</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>Bị khóa</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="cell-actions">
                    <div className="actions-wrapper">
                      <button
                        onClick={() => alert(`Xem chi tiết ${user.name}`)}
                        className="action-btn view"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn chắc chắn muốn khóa tài khoản ${user.name}?`)) {
                              updateMut.mutate({ id: user._id, payload: { isActive: false } });
                            }
                          }}
                          disabled={updateMut.isLoading}
                          className="action-btn lock"
                          title="Khóa tài khoản"
                        >
                          <Lock size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateMut.mutate({ id: user._id, payload: { isActive: true } })}
                          disabled={updateMut.isLoading}
                          className="action-btn unlock"
                          title="Mở khóa tài khoản"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
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
          ⚠️ Không thể tải dữ liệu người dùng. Vui lòng thử lại.
        </div>
      )}

      <style>{`
        .admin-users-page {
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

        /* Filter Bar */
        .filter-bar {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          flex: 1;
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

        .role-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .role-select:focus {
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

        .bulk-btn.lock {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .bulk-btn.lock:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .bulk-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Table */
        .users-table-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
          overflow: hidden;
        }

        .users-table {
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

        .cell-user {
          min-width: 280px;
        }

        .user-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar-container {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar-img {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #dbeafe;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
          z-index: 1;
        }

        .user-avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
          border: 2px solid #dbeafe;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .online-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .online-indicator.online {
          background: #10b981;
          animation: pulse-green 2s ease-in-out infinite;
        }

        .online-indicator.offline {
          background: #6b7280;
        }

        @keyframes pulse-green {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
        }

        .user-email {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .cell-role {
          min-width: 140px;
        }

        .role-badge-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .role-badge.student {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          border: 1px solid #3b82f6;
        }

        .role-badge.admin {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
          border: 1px solid #fbbf24;
        }

        .role-select-inline {
          padding: 6px 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-select-inline:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .role-select-inline:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f3f4f6;
          color: #9ca3af;
        }

        .cell-date {
          min-width: 120px;
        }

        .date-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .date-text {
          font-size: 13px;
          color: #64748b;
        }

        .cell-status {
          min-width: 160px;
        }

        .status-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #cbd5e1;
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: 0.3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch input:checked + .toggle-slider {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .toggle-switch input:disabled + .toggle-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.active {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          border: 1px solid #10b981;
        }

        .status-badge.inactive {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          border: 1px solid #ef4444;
        }

        .cell-actions {
          min-width: 120px;
        }

        .actions-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.view {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
        }

        .action-btn.view:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-btn.lock {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
        }

        .action-btn.lock:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .action-btn.unlock {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
        }

        .action-btn.unlock:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Pagination */
        .pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
          margin-top: 20px;
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
          transform: translateY(-2px);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Utility */
        .hidden {
          display: none !important;
        }

        /* Error Message */
        .error-message {
          padding: 16px 20px;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          border: 2px solid #ef4444;
          border-radius: 12px;
          color: #991b1b;
          font-size: 14px;
          font-weight: 600;
          margin-top: 20px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .admin-users-page {
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

          .users-table-wrapper {
            overflow-x: auto;
          }

          .users-table {
            min-width: 1200px;
          }
        }
      `}</style>
    </div>
  );
}
