import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  BookOpen,
} from "lucide-react";

export default function Courses() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [published, setPublished] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching, isError } = useQuery({
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
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-blue-50 to-amber-50 min-h-screen rounded-2xl shadow-inner">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Quản lý khóa học
        </h1>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap gap-3 items-center border border-gray-100">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Tìm theo tiêu đề…"
          className="border border-gray-300 px-3 py-2 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={published}
          onChange={(e) => setPublished(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Tất cả</option>
          <option value="true">Đã xuất bản</option>
          <option value="false">Bản nháp</option>
        </select>
        {isFetching && (
          <span className="text-gray-500 text-sm flex items-center gap-1">
            <Loader2 className="animate-spin w-4 h-4" /> Đang tải...
          </span>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-50 border-b">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700">
                Tiêu đề
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                Giảng viên
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                Giá
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                Trạng thái
              </th>
              <th className="p-3 text-right font-semibold text-gray-700">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isError && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-red-500">
                  ⚠️ Lỗi khi tải dữ liệu. Vui lòng thử lại.
                </td>
              </tr>
            )}
            {!isError && items.length === 0 && !isFetching && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr
                key={c._id}
                className="hover:bg-blue-50/40 transition-colors duration-200"
              >
                <td className="p-3 font-medium text-gray-800">{c.title}</td>
                <td className="p-3 text-center">
                  {c.instructor?.name || "—"}
                </td>
                <td className="p-3 text-center text-blue-700 font-semibold">
                  {c.price?.toLocaleString?.("vi-VN") || 0}₫
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.published
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {c.published ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {c.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    disabled={toggleMut.isLoading}
                    onClick={() => toggleMut.mutate(c._id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 border rounded-lg text-sm font-medium transition-all shadow-sm ${
                      c.published
                        ? "border-gray-300 text-gray-600 hover:bg-gray-100 hover:shadow-md"
                        : "border-blue-500 text-blue-600 hover:bg-blue-50 hover:shadow-md"
                    } ${
                      toggleMut.isLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {toggleMut.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4" />
                    )}
                    {c.published ? "Unpublish" : "Publish"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-600">
          Trang <b>{page}</b> / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition"
          >
            ← Trước
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}
