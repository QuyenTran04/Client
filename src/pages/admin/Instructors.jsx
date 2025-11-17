import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Plus, Trash2, Edit2, Loader2, Save, X, Mail, User } from "lucide-react";

export default function Instructors() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
  });

  const { data, isFetching } = useQuery({
    queryKey: ["admin-instructors", { q, page }],
    queryFn: () => adminApi.listInstructors({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: () => adminApi.createInstructor(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-instructors"] });
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () => {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      return adminApi.updateInstructor(editingId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-instructors"] });
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteInstructor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-instructors"] }),
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", bio: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (inst) => {
    setFormData({
      name: inst.name,
      email: inst.email,
      password: "",
      bio: inst.bio || "",
    });
    setEditingId(inst._id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (!editingId && !formData.password.trim()) return;

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
        <h1 className="text-3xl font-bold text-gray-800">👨‍🏫 Quản lý giảng viên</h1>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
        >
          <Plus size={18} />
          Thêm giảng viên
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Tên đầy đủ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu {editingId ? "(để trống nếu không đổi)" : ""}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiểu sử
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Thông tin về giảng viên"
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
          placeholder="🔍 Tìm giảng viên..."
          className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {isFetching && <Loader2 className="animate-spin text-gray-400" size={18} />}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">Tên</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Tiểu sử</th>
              <th className="p-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Không có giảng viên nào
                </td>
              </tr>
            ) : (
              items.map((inst) => (
                <tr key={inst._id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{inst.name}</td>
                  <td className="p-3 text-gray-600 flex items-center gap-1">
                    <Mail size={14} className="text-gray-400" />
                    {inst.email}
                  </td>
                  <td className="p-3 text-gray-600 truncate max-w-xs">
                    {inst.bio || "—"}
                  </td>
                  <td className="p-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(inst)}
                      className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteMut.mutate(inst._id)}
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
