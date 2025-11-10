import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Clock, User, Filter } from "lucide-react";
import api from "../../services/api";

const actionBadge = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  publish: "bg-green-100 text-green-700",
  unpublish: "bg-orange-100 text-orange-700",
  login: "bg-indigo-100 text-indigo-700",
};

export default function ActivityLogs() {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(7);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-activity-logs", { action, page, days }],
    queryFn: () =>
      api
        .get("/admin/activity-logs", {
          params: { action, page, limit: 20, days },
        })
        .then((r) => r.data)
        .catch(() => ({ items: [], pages: 1 })),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  const getActionLabel = (act) => {
    const labels = {
      create: "Tạo mới",
      update: "Cập nhật",
      delete: "Xóa",
      publish: "Xuất bản",
      unpublish: "Hủy xuất bản",
      login: "Đăng nhập",
    };
    return labels[act] || act;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Clock size={28} />
          Nhật ký hoạt động
        </h1>
        <p className="text-gray-500 mt-2">Theo dõi tất cả hoạt động admin</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 items-center border border-gray-100">
        <Filter size={18} className="text-gray-400" />
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Tất cả hành động</option>
          <option value="create">Tạo mới</option>
          <option value="update">Cập nhật</option>
          <option value="delete">Xóa</option>
          <option value="publish">Xuất bản</option>
          <option value="unpublish">Hủy xuất bản</option>
          <option value="login">Đăng nhập</option>
        </select>

        <select
          value={days}
          onChange={(e) => {
            setDays(Number(e.target.value));
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value={1}>Hôm nay</option>
          <option value={7}>7 ngày qua</option>
          <option value={30}>30 ngày qua</option>
          <option value={90}>90 ngày qua</option>
        </select>

        {isFetching && <Loader2 className="animate-spin text-gray-400 ml-auto" size={18} />}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
            <p className="text-gray-500">Không có hoạt động nào</p>
          </div>
        ) : (
          items.map((log) => (
            <div
              key={log._id}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <User size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {log.adminName || "Admin"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {log.email || "System"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    actionBadge[log.action] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getActionLabel(log.action)}
                </span>
              </div>

              <div className="ml-13 mb-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{log.resourceType}</span>:{" "}
                  {log.description || "Không có mô tả"}
                </p>
                {log.changes && (
                  <p className="text-xs text-gray-500 mt-1">
                    {typeof log.changes === "string"
                      ? log.changes
                      : JSON.stringify(log.changes).substring(0, 100)}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400">
                {new Date(log.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          ))
        )}
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
