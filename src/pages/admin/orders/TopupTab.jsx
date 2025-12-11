import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../services/admin";
import { Loader2, Search, CreditCard, Coins } from "lucide-react";
import Pagination from "../../../components/admin/Pagination";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function TopupTab({ q, setQ, page, setPage }) {
  const [status, setStatus] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["admin-topup", { q, page, status }],
    queryFn: () => adminApi.listTopupTransactions({ q, page, status, limit: 10 }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="tab-content">
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
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="status-select"
          >
            <option value="">📊 Tất cả trạng thái</option>
            <option value="paid">✅ Thành công</option>
            <option value="pending">⏳ Đang xử lý</option>
            <option value="failed">❌ Thất bại</option>
          </select>
          {isFetching && (
            <span className="loading-indicator">
              <Loader2 className="animate-spin" size={16} />
              Đang tải...
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Số tiền</th>
              <th>Số xu nhận</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <div className="empty-message">
                    <CreditCard size={48} className="empty-icon" />
                    <span>Chưa có giao dịch nạp tiền nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((tx) => (
                <tr key={tx._id}>
                  <td>
                    <div className="user-cell">
                      {tx.user?.avatar ? (
                        <img src={tx.user.avatar} alt={tx.user.name} className="user-avatar" />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {(tx.user?.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="user-name">{tx.user?.name || "Ẩn danh"}</div>
                        <div className="user-email">{tx.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="amount-vnd">
                      {currencyFormatter.format(tx.amount || 0)}
                    </span>
                  </td>
                  <td>
                    <span className="amount-coins">
                      <Coins size={14} />
                      {tx.coins?.toLocaleString()} xu
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${tx.status || "pending"}`}>
                      {tx.status === "paid" ? "Thành công" : 
                       tx.status === "failed" ? "Thất bại" : "Đang xử lý"}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(tx.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
