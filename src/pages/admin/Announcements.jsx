import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../services/api";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Megaphone } from "lucide-react";

const typeColors = {
  info: "bg-blue-100 text-blue-700 border-blue-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  success: "bg-green-100 text-green-700 border-green-200",
  error: "bg-red-100 text-red-700 border-red-200",
  maintenance: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function Announcements() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-announcements", { page }],
    queryFn: () => api.get("/admin/announcements", { params: { page, limit: 10 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/announcements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/admin/announcements/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-indigo-600" />
            Quản lý thông báo
          </h1>
          <p className="text-gray-500 mt-1">
            Tạo và quản lý thông báo cho học viên và giảng viên
          </p>
        </div>
      </div>

      {isFetching && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Đang tải...
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">Tiêu đề</th>
              <th className="p-3 text-center font-semibold">Loại</th>
              <th className="p-3 text-center font-semibold">Trạng thái</th>
              <th className="p-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Chưa có thông báo nào
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium text-gray-800">{item.title}</p>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${typeColors[item.type]}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {item.isActive ? "Hiển thị" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => toggleMut.mutate(item._id)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        {item.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Xóa thông báo?")) {
                            deleteMut.mutate(item._id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
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
