import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";

export default function Courses() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [published, setPublished] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-courses", { q, published, page }],
    queryFn: () => adminApi.listCourses({ q, published, page, limit: 10 }),
    keepPreviousData: true,
  });

  const toggleMut = useMutation({
    mutationFn: (id) => adminApi.togglePublishCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Khóa học</h1>

      <div className="bg-white p-3 rounded-lg shadow-sm flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tiêu đề…"
          className="border px-3 py-2 rounded-lg w-60"
        />
        <select
          value={published}
          onChange={(e) => setPublished(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Tất cả</option>
          <option value="true">Đã xuất bản</option>
          <option value="false">Bản nháp</option>
        </select>
        {isFetching && <span className="text-sm text-gray-500">đang tải…</span>}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Tiêu đề</th>
              <th className="p-3">Giảng viên</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-3">{c.title}</td>
                <td className="p-3 text-center">{c.instructor?.name || "—"}</td>
                <td className="p-3 text-center">
                  {c.price?.toLocaleString?.() || 0}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {c.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggleMut.mutate(c._id)}
                    className="px-3 py-1 border rounded"
                  >
                    {c.published ? "Unpublish" : "Publish"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
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
