import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Plus, Trash2, Edit2, Loader2, Save, X, Mail, User } from "lucide-react";

export default function Creators() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    bio: "",
  });

  const { data, isFetching } = useQuery({
    queryKey: ["admin-creators", { q, page }],
    queryFn: () => adminApi.listCreators({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: () => adminApi.createUser(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-creators"] });
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () => {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      return adminApi.updateUser(editingId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-creators"] });
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-creators"] }),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
      bio: "",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      bio: user.bio || "",
    });
    setEditingId(user._id);
    setIsFormOpen(true);
  };

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Người dùng tạo nội dung</h1>
          <p className="text-gray-600">Quản lý người dùng có thể tạo khóa học</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm người dùng
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tham gia
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isFetching ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <Loader2 className="inline animate-spin" size={24} />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              items.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        {user.bio && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {user.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail size={14} className="mr-2" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "Student"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteMut.mutate(user._id)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} trên{" "}
            {total} người dùng
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              disabled={page * 10 >= total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Cập nhật người dùng" : "Thêm người dùng mới"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingId ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"}
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiểu sử
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  editingId
                    ? updateMut.mutate()
                    : createMut.mutate()
                }
                disabled={createMut.isLoading || updateMut.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {(createMut.isLoading || updateMut.isLoading) && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {editingId ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}