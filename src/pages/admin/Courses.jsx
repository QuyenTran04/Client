import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "../../services/admin";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  BookOpen,
  Trash2,
  Download,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import CourseDetailModal from "../../components/admin/CourseDetailModal";
import CourseEditModal from "../../components/admin/CourseEditModal";

export default function Courses() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [published, setPublished] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin-courses", { q, published, page }],
    queryFn: () => adminApi.listCourses({ q, published, page, limit: 10 }),
    keepPreviousData: true,
  });

  const toggleMut = useMutation({
    mutationFn: (id) => adminApi.togglePublishCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      setSelected(new Set());
    },
  });

  const bulkDeleteMut = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((id) => adminApi.deleteCourse(id))
      );
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      setSelected(new Set());
    },
  });

  const bulkPublishMut = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((id) => adminApi.publishCourse(id))
      );
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      setSelected(new Set());
    },
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(items.map((c) => c._id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleViewDetail = (course) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCourse(null);
  };

  const exportToCSV = () => {
    if (items.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }
    const headers = ["Tiêu đề", "Giảng viên", "Giá", "Trạng thái"];
    const rows = items.map((c) => [
      c.title,
      c.instructor?.name || "—",
      c.price || 0,
      c.published ? "Đã xuất bản" : "Bản nháp",
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `courses_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

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
        <button
          onClick={() => {
            setSelectedCourse(null);
            setShowEditModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Tạo khóa học mới
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tiêu đề..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={published}
            onChange={(e) => setPublished(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đã xuất bản</option>
            <option value="false">Bản nháp</option>
          </select>
          {isFetching && (
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Loader2 className="animate-spin w-4 h-4" /> Đang tải...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 text-sm"
          >
            <Filter size={16} />
            Bộ lọc nâng cao
          </button>
          <button
            onClick={exportToCSV}
            className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 text-sm"
          >
            <Download size={16} />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selected.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            Đã chọn {selected.size} khóa học
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => bulkPublishMut.mutate()}
              disabled={bulkPublishMut.isLoading}
              className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
            >
              Xuất bản
            </button>
            <button
              onClick={() => {
                if (confirm("Bạn chắc chắn muốn xóa những khóa học này?")) {
                  bulkDeleteMut.mutate();
                }
              }}
              disabled={bulkDeleteMut.isLoading}
              className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 inline-flex items-center gap-1"
            >
              <Trash2 size={14} />
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-50 border-b">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </th>
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
                Học viên
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
                <td colSpan={6} className="p-4 text-center text-red-500">
                  ⚠️ Lỗi khi tải dữ liệu. Vui lòng thử lại.
                </td>
              </tr>
            )}
            {!isError && items.length === 0 && !isFetching && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr
                key={c._id}
                className={`hover:bg-blue-50/40 transition-colors duration-200 ${
                  selected.has(c._id) ? "bg-blue-100" : ""
                }`}
              >
                <td className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.has(c._id)}
                    onChange={() => handleSelectItem(c._id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="p-3 font-medium text-gray-800">{c.title}</td>
                <td className="p-3 text-center">
                  {c.instructor?.name || "—"}
                </td>
                <td className="p-3 text-center text-blue-700 font-semibold">
                  {c.price?.toLocaleString?.("vi-VN") || 0}₫
                </td>
                <td className="p-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                    {c.enrollmentCount || 0}
                  </span>
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
                    {c.published ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleViewDetail(c)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      disabled={toggleMut.isLoading}
                      onClick={() => toggleMut.mutate(c._id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        c.published
                          ? "text-gray-600 hover:bg-gray-100"
                          : "text-green-600 hover:bg-green-50"
                      } ${
                        toggleMut.isLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      title={c.published ? "Ẩn khóa học" : "Xuất bản"}
                    >
                      {toggleMut.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Bạn chắc chắn muốn xóa khóa học này?")) {
                          deleteMut.mutate(c._id);
                        }
                      }}
                      disabled={deleteMut.isLoading}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa khóa học"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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

      {/* Modals */}
      {showDetailModal && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCourse(null);
          }}
          onEdit={handleEdit}
        />
      )}

      {showEditModal && (
        <CourseEditModal
          course={selectedCourse}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
