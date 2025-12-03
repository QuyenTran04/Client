import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Loader2, RefreshCcw, DollarSign } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const statusBadge = {
  paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  failed: "bg-rose-100 text-rose-700 border border-rose-200",
};

export default function Orders() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-orders", { status, page }],
    queryFn: () => adminApi.listOrders({ status, page, limit: 10 }),
    keepPreviousData: true,
  });

  const refundMut = useMutation({
    mutationFn: (id) => adminApi.refundOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">💳 Quản lý đơn hàng</h1>
        <p className="text-gray-500 mt-1">
          Xem tất cả các giao dịch và xử lý hoàn tiền
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 items-center border border-gray-100">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="pending">Chờ xử lý</option>
          <option value="failed">Thất bại</option>
        </select>
        {isFetching && <Loader2 className="animate-spin text-gray-400" size={18} />}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="p-3 text-left font-semibold">Học viên</th>
                <th className="p-3 text-left font-semibold">Khóa học</th>
                <th className="p-3 text-right font-semibold">Số tiền</th>
                <th className="p-3 text-center font-semibold">Trạng thái</th>
                <th className="p-3 text-center font-semibold">Ngày</th>
                <th className="p-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                items.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium text-gray-800">
                        {order.student?.name || "Ẩn danh"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.student?.email}
                      </p>
                    </td>
                    <td className="p-3 text-gray-700">
                      {order.course?.title || "Khóa học"}
                    </td>
                    <td className="p-3 text-right font-semibold text-indigo-600">
                      {currencyFormatter.format(order.amount || order.course?.price || 0)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          statusBadge[order.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.status === "paid"
                          ? "Đã thanh toán"
                          : order.status === "pending"
                          ? "Chờ xử lý"
                          : "Thất bại"}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3 text-right">
                      {order.status === "paid" && (
                        <button
                          onClick={() => refundMut.mutate(order._id)}
                          disabled={refundMut.isLoading}
                          className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg inline-flex items-center gap-1 text-xs font-medium disabled:opacity-50"
                        >
                          {refundMut.isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RefreshCcw size={14} />
                          )}
                          Hoàn tiền
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Trang <b>{page}</b> / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            ← Trước
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}
