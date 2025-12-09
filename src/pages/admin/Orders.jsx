import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import TopupTab from "./orders/TopupTab";
import WalletsTab from "./orders/WalletsTab";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("topup");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setQ("");
    setPage(1);
  };

  return (
    <div className="admin-orders-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <CreditCard className="header-icon" />
            <div className="icon-glow" />
          </div>
          <div>
            <h1 className="page-title">Quản lý đơn hàng</h1>
            <p className="page-subtitle">Theo dõi giao dịch nạp tiền và ví xu của người dùng</p>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "topup" ? "active" : ""}`}
          onClick={() => handleTabChange("topup")}
        >
          <CreditCard size={18} />
          <span>Giao dịch nạp tiền</span>
        </button>
        <button
          className={`tab-button ${activeTab === "wallets" ? "active" : ""}`}
          onClick={() => handleTabChange("wallets")}
        >
          <Wallet size={18} />
          <span>Ví xu người dùng</span>
        </button>
      </div>

      {activeTab === "topup" && (
        <TopupTab q={q} setQ={setQ} page={page} setPage={setPage} />
      )}
      {activeTab === "wallets" && (
        <WalletsTab q={q} setQ={setQ} page={page} setPage={setPage} />
      )}

      <style>{`
        .admin-orders-page {
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

        .tabs-container {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .tab-content {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
          font-weight: 600;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
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

        .table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table thead {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .data-table th {
          padding: 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-table td {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .data-table tbody tr {
          transition: all 0.2s ease;
        }

        .data-table tbody tr:hover {
          background: #f0f9ff;
        }

        .empty-cell {
          padding: 60px 20px;
          text-align: center;
        }

        .empty-message {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #9ca3af;
        }

        .empty-icon {
          color: #d1d5db;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }

        .user-name {
          font-weight: 600;
          color: #1e293b;
        }

        .user-email {
          font-size: 12px;
          color: #64748b;
        }

        .amount-vnd {
          font-weight: 700;
          color: #3b82f6;
          font-size: 15px;
        }

        .amount-coins {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 20px;
          font-weight: 600;
          color: #92400e;
          font-size: 13px;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.success {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
        }

        .status-badge.pending {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
        }

        .status-badge.failed {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
        }

        .date-cell {
          color: #64748b;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
