import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../services/admin";
import { Loader2, Search, Wallet, Coins, History, Eye } from "lucide-react";
import Pagination from "../../../components/admin/Pagination";
import TransactionHistoryModal from "../../../components/admin/TransactionHistoryModal";

export default function WalletsTab({ q, setQ, page, setPage }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-wallets", { q, page }],
    queryFn: () => adminApi.listWallets({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const stats = data?.stats || {};

  return (
    <div className="tab-content">
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
                    <button
                      onClick={() => setSelectedUser(wallet.user)}
                      className="action-btn history"
                      title="Xem lịch sử giao dịch"
                    >
                      <History size={16} />
                      Lịch sử
                    </button>
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

      <style>{`
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
      `}</style>
    </div>
  );
}
