import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";

export default function Users() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Người dùng</h1>

      <div className="bg-white p-3 rounded-lg shadow-sm flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm tên/email…"
          className="border px-3 py-2 rounded-lg w-60"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Tất cả vai trò</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
        {isFetching && <span className="text-sm text-gray-500">đang tải…</span>}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Kích hoạt</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-center">
                  <select
                    defaultValue={u.role}
                    onChange={(e) =>
                      mutate.mutate({
                        id: u._id,
                        payload: { role: e.target.value },
                      })
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="student">student</option>
                    <option value="instructor">instructor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    defaultChecked={u.isActive}
                    onChange={(e) =>
                      mutate.mutate({
                        id: u._id,
                        payload: { isActive: e.target.checked },
                      })
                    }
                  />
                </td>
                <td className="p-3 text-right">
                  {/* chỗ để thêm nút xem chi tiết / reset mật khẩu… */}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 items-center">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          Trang {page}/{totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
