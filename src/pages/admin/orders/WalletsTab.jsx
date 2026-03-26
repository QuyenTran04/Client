import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../services/admin";
import { Loader2, Search, Wallet, Coins, History, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import Pagination from "../../../components/admin/Pagination";
import TransactionHistoryModal from "../../../components/admin/TransactionHistoryModal";

export default function WalletsTab({ q, setQ, page, setPage }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditModal, setCreditModal] = useState({ open: false, user: null });
  const [creditForm, setCreditForm] = useState({ coins: "", reason: "" });
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const queryClient = useQueryClient();

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  const { data, isFetching } = useQuery({
    queryKey: ["admin-wallets", { q, page }],
    queryFn: () => adminApi.listWallets({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const stats = data?.stats || {};

  const creditMutation = useMutation({
    mutationFn: (payload) => adminApi.creditUserWallet(payload),
    onSuccess: () => {
      showNotification("success", "Cộng xu thành công!");
      queryClient.invalidateQueries(["admin-wallets"]);
      setCreditModal({ open: false, user: null });
      setCreditForm({ coins: "", reason: "" });
    },
    onError: (err) => {
      showNotification("error", err.response?.data?.message || "Lỗi khi cộng xu");
    },
  });

  const handleCreditSubmit = (e) => {
    e.preventDefault();
    if (!creditForm.coins || Number(creditForm.coins) <= 0) {
      showNotification("error", "Vui lòng nhập số xu hợp lệ");
      return;
    }
    creditMutation.mutate({
      userId: creditModal.user._id,
      coins: Number(creditForm.coins),
      reason: creditForm.reason || "Admin cộng xu",
    });
  };

  const openCreditModal = (user) => {
    setCreditModal({ open: true, user });
    setCreditForm({ coins: "", reason: "" });
  };

  return (
    <div className="tab-content">
      {/* NOTIFICATION */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon wallet">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tổng ví</div>
            <div className="stat-value">{stats.totalWallets?.toLocaleString() || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon coins">
            <Coins size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tổng xu trong hệ thống</div>
            <div className="stat-value">{stats.totalBalance?.toLocaleString() || 0} xu</div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tên hoặc email..."
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

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Số dư xu</th>
              <th>Tổng nạp</th>
              <th>Tổng chi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <div className="empty-message">
                    <Wallet size={48} className="empty-icon" />
                    <span>Chưa có ví nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((wallet) => (
                <tr key={wallet._id}>
                  <td>
                    <div className="user-cell">
                      {wallet.user?.avatar ? (
                        <img src={wallet.user.avatar} alt={wallet.user.name} className="user-avatar" />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {(wallet.user?.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="user-name">{wallet.user?.name || "Ẩn danh"}</div>
                        <div className="user-email">{wallet.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="balance-amount">
                      <Coins size={16} />
                      {wallet.balance?.toLocaleString() || 0} xu
                    </span>
                  </td>
                  <td>
                    <span className="amount-positive">
                      +{wallet.totalTopup?.toLocaleString() || 0} xu
                    </span>
                  </td>
                  <td>
                    <span className="amount-negative">
                      -{wallet.totalSpent?.toLocaleString() || 0} xu
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openCreditModal(wallet.user)}
                        className="action-btn credit"
                        title="Cộng xu cho người dùng"
                      >
                        <Plus size={16} />
                        Cộng xu
                      </button>
                      <button
                        onClick={() => setSelectedUser(wallet.user)}
                        className="action-btn history"
                        title="Xem lịch sử giao dịch"
                      >
                        <History size={16} />
                        Lịch sử
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
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* TRANSACTION HISTORY MODAL */}
      {selectedUser && (
        <TransactionHistoryModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* CREDIT MODAL */}
      {creditModal.open && (
        <div className="modal-overlay" onClick={() => setCreditModal({ open: false, user: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cộng xu cho người dùng</h3>
              <button className="modal-close" onClick={() => setCreditModal({ open: false, user: null })}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-info-box">
                {creditModal.user?.avatar ? (
                  <img src={creditModal.user.avatar} alt={creditModal.user.name} className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">
                    {(creditModal.user?.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="user-name">{creditModal.user?.name || "Ẩn danh"}</div>
                  <div className="user-email">{creditModal.user?.email}</div>
                </div>
              </div>
              <form onSubmit={handleCreditSubmit}>
                <div className="form-group">
                  <label>Số xu cần cộng <span className="required">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={creditForm.coins}
                    onChange={(e) => setCreditForm({ ...creditForm, coins: e.target.value })}
                    placeholder="Nhập số xu..."
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Lý do</label>
                  <textarea
                    value={creditForm.reason}
                    onChange={(e) => setCreditForm({ ...creditForm, reason: e.target.value })}
                    placeholder="Nhập lý do cộng xu (không bắt buộc)..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setCreditModal({ open: false, user: null })}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={creditMutation.isPending}
                  >
                    {creditMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Cộng xu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          z-index: 1100;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .notification.success {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          border: 1px solid #10b981;
        }

        .notification.error {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          border: 1px solid #ef4444;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: white;
        }

        .stat-icon.wallet {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .stat-icon.coins {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .balance-amount {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 20px;
          font-weight: 700;
          color: #92400e;
          font-size: 14px;
        }

        .amount-positive {
          color: #3b82f6;
          font-weight: 600;
        }

        .amount-negative {
          color: #ef4444;
          font-weight: 600;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.history {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
        }

        .action-btn.history:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn.credit {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
        }

        .action-btn.credit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .modal-close {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          color: #64748b;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .modal-body {
          padding: 24px;
        }

        .user-info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .required {
          color: #ef4444;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.2s;
          background: #f9fafb;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-cancel,
        .btn-submit {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-submit {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
