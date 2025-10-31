import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";
import { Loader2 } from "lucide-react";

export default function Users() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin-users", { q, role, page }],
    queryFn: () => adminApi.listUsers({ q, role, page, limit: 10 }),
    keepPreviousData: true,
  });

  const mutate = useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">👥 Quản lý người dùng</h1>
        <p className="text-gray-500 mt-1">
          Xem, chỉnh sửa vai trò và trạng thái hoạt động của người dùng.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Tìm tên hoặc email..."
          className="border border-gray-300 px-3 py-2 rounded-lg w-60 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Tất cả vai trò</option>
          <option value="student">Học viên</option>
          <option value="instructor">Giảng viên</option>
          <option value="admin">Quản trị</option>
        </select>

        {isFetching && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải…
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Tên</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-center font-semibold">Vai trò</th>
              <th className="p-3 text-center font-semibold">Kích hoạt</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr
                key={u._id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 font-medium text-gray-800">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3 text-center">
                  <select
                    defaultValue={u.role}
                    onChange={(e) =>
                      mutate.mutate({
                        id: u._id,
                        payload: { role: e.target.value },
                      })
                    }
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="student">student</option>
                    <option value="instructor">instructor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-3 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={u.isActive}
                      onChange={(e) =>
                        mutate.mutate({
                          id: u._id,
                          payload: { isActive: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-checked:bg-indigo-500 rounded-full relative transition">
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5" />
                    </div>
                  </label>
                </td>
                <td className="p-3 text-right">
                  <button
                    className="text-indigo-600 hover:underline text-sm"
                    onClick={() => alert(`Xem chi tiết ${u.name}`)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
        >
          ← Trước
        </button>
        <span className="text-sm text-gray-600">
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
        >
          Sau →
        </button>
      </div>

      {isError && (
        <div className="text-center text-red-600 text-sm mt-2">
          Không thể tải dữ liệu người dùng.
        </div>
      )}
    </div>
  );
}
