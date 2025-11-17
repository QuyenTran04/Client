import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Plus, Trash2, Edit2, Loader2, Save, X, Download } from "lucide-react";

export default function Categories() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data, isFetching } = useQuery({
    queryKey: ["admin-categories", { q, page }],
    queryFn: () => adminApi.listCategories({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: () => adminApi.createCategory(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () => adminApi.updateCategory(editingId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const bulkDeleteMut = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((id) => adminApi.deleteCategory(id))
      );
      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
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

  const exportToCSV = () => {
    if (items.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }
    const headers = ["Tên danh mục", "Mô tả"];
    const rows = items.map((c) => [c.name, c.description || ""]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `categories_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, description: cat.description || "" });
    setEditingId(cat._id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingId) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  };

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">📁 Danh mục khóa học</h1>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên danh mục
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="VD: Lập trình web"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Mô tả ngắn về danh mục"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createMut.isLoading || updateMut.isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {createMut.isLoading || updateMut.isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {editingId ? "Cập nhật" : "Tạo"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 items-center border border-gray-100">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="🔍 Tìm danh mục..."
          className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {isFetching && <Loader2 className="animate-spin text-gray-400" size={18} />}
        <button
          onClick={exportToCSV}
          className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg inline-flex items-center gap-1 text-sm"
        >
          <Download size={16} />
          Xuất CSV
        </button>
      </div>

      {selected.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            Đã chọn {selected.size} danh mục
          </span>
          <button
            onClick={() => {
              if (confirm("Bạn chắc chắn muốn xóa những danh mục này?")) {
                bulkDeleteMut.mutate();
              }
            }}
            disabled={bulkDeleteMut.isLoading}
            className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 inline-flex items-center gap-1"
          >
            <Trash2 size={14} />
            Xóa hàng loạt
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3 text-left font-semibold w-10">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-3 text-left font-semibold">Tên danh mục</th>
              <th className="p-3 text-left font-semibold">Mô tả</th>
              <th className="p-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Không có danh mục nào
                </td>
              </tr>
            ) : (
              items.map((cat) => (
                <tr key={cat._id} className={`hover:bg-gray-50 ${selected.has(cat._id) ? "bg-blue-100" : ""}`}>
                  <td className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.has(cat._id)}
                      onChange={() => handleSelectItem(cat._id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="p-3 text-gray-600 truncate">
                    {cat.description || "—"}
                  </td>
                  <td className="p-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteMut.mutate(cat._id)}
                      disabled={deleteMut.isLoading}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
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
