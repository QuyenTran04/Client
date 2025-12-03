import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Loader2, Eye, Mail } from "lucide-react";

export default function Students() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-students", { q, page }],
    queryFn: () => adminApi.listStudents({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["admin-student-progress", selectedStudent?._id],
    queryFn: () => adminApi.getStudentProgress(selectedStudent._id),
    enabled: !!selectedStudent,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">👥 Quản lý học viên</h1>
        <p className="text-gray-500 mt-1">
          Xem danh sách học viên và tiến độ học tập của họ
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 items-center border border-gray-100">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="🔍 Tìm học viên..."
          className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {isFetching && <Loader2 className="animate-spin text-gray-400" size={18} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="p-3 text-left font-semibold">Tên</th>
                <th className="p-3 text-left font-semibold">Email</th>
                <th className="p-3 text-center font-semibold">Trạng thái</th>
                <th className="p-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Không có học viên nào
                  </td>
                </tr>
              ) : (
                items.map((student) => (
                  <tr
                    key={student._id}
                    className={`hover:bg-gray-50 cursor-pointer transition ${
                      selectedStudent?._id === student._id ? "bg-indigo-50" : ""
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="p-3 font-medium text-gray-800">{student.name}</td>
                    <td className="p-3 text-gray-600 flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" />
                      {student.email}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          student.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {student.isActive ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg inline-flex"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:sticky lg:top-6 h-fit">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Tham gia</p>
                <p className="text-sm font-medium">
                  {new Date(selectedStudent.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Tiến độ học tập
                </h4>
                {progressLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                  </div>
                ) : progressData?.items?.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {progressData.items.map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className="p-2 bg-gray-50 rounded border border-gray-100"
                      >
                        <p className="text-sm font-medium text-gray-700">
                          {enrollment.course?.title || "Khóa học"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {enrollment.completedLessons?.length || 0} bài học hoàn thành
                        </p>
                        {enrollment.status && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 mt-1 inline-block">
                            {enrollment.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Học viên này chưa ghi danh khóa học nào
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
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
