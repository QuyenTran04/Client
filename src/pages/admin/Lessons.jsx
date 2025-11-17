import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Loader2, Trash2, Edit2, Plus, Save, X } from "lucide-react";

export default function Lessons() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    order: 0,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: () => adminApi.listCourses({ limit: 100 }),
  });

  const { data, isFetching } = useQuery({
    queryKey: ["admin-lessons", { courseId, page }],
    queryFn: () => (courseId ? adminApi.listLessons(courseId, { page, limit: 10 }) : Promise.resolve({ items: [] })),
    enabled: !!courseId,
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: () => adminApi.createLesson({ ...formData, course: courseId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: () => adminApi.updateLesson(editingId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteLesson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-lessons"] }),
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", videoUrl: "", order: 0 });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (lesson) => {
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      order: lesson.order || 0,
    });
    setEditingId(lesson._id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !courseId) return;

    if (editingId) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  };

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const courses = coursesData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">📚 Quản lý bài học</h1>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          disabled={!courseId}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Thêm bài học
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn khóa học
        </label>
        <select
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            setPage(1);
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">-- Chọn khóa học --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {isFormOpen && courseId && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Tiêu đề bài học"
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
                placeholder="Mô tả nội dung bài học"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="0"
                />
              </div>
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

      {courseId && (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold">Thứ tự</th>
                  <th className="p-3 text-left font-semibold">Tiêu đề</th>
                  <th className="p-3 text-left font-semibold">Video</th>
                  <th className="p-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Chưa có bài học nào
                    </td>
                  </tr>
                ) : (
                  items.map((lesson) => (
                    <tr key={lesson._id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-600 font-medium">
                        #{lesson.order || 0}
                      </td>
                      <td className="p-3 font-medium text-gray-800">
                        {lesson.title}
                      </td>
                      <td className="p-3 text-gray-600 truncate">
                        {lesson.videoUrl ? (
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline text-xs"
                          >
                            Xem video
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 text-right flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteMut.mutate(lesson._id)}
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
        </>
      )}
    </div>
  );
}
