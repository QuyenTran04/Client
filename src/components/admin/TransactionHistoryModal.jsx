import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { X, Loader2, Coins, TrendingUp, TrendingDown } from "lucide-react";

export default function TransactionHistoryModal({ user, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-transactions", user._id],
    queryFn: () => adminApi.getUserTransactions(user._id),
    enabled: !!user._id,
  });

  const transactions = data?.items || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Lịch sử giao dịch</h2>
            <p className="modal-subtitle">
              {user.name} ({user.email})
            </p>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={32} />
              <span>Đang tải...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <Coins size={48} />
              <span>Chưa có giao dịch nào</span>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((tx) => {
                const isPositive = tx.type === "credit" || tx.type === "refund";
                return (
                  <div key={tx._id} className="transaction-item">
                    <div className="tx-icon-wrapper">
                      {isPositive ? (
                        <div className="tx-icon positive">
                          <TrendingUp size={20} />
                        </div>
                      ) : (
                        <div className="tx-icon negative">
                          <TrendingDown size={20} />
                        </div>
                      )}
                    </div>
                    <div className="tx-info">
                      <div className="tx-description">{tx.reason || "Giao dịch"}</div>
                      <div className="tx-date">
                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className={`tx-amount ${isPositive ? "positive" : "negative"}`}>
                      {isPositive ? "+" : "-"}{tx.amount?.toLocaleString()} xu
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .modal-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .close-btn {
          padding: 8px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #334155;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          color: #9ca3af;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .transaction-item:hover {
          background: #f0f9ff;
          border-color: #3b82f6;
        }

        .tx-icon-wrapper {
          flex-shrink: 0;
        }

        .tx-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: white;
        }

        .tx-icon.positive {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .tx-icon.negative {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .tx-info {
          flex: 1;
          min-width: 0;
        }

        .tx-description {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .tx-date {
          font-size: 12px;
          color: #64748b;
        }

        .tx-amount {
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
        }

        .tx-amount.positive {
          color: #3b82f6;
        }

        .tx-amount.negative {
          color: #ef4444;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
