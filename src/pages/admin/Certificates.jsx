import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../services/api";
import { Loader2, Award, Trash2, Ban, CheckCircle } from "lucide-react";

export default function Certificates() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-certificates", { page }],
    queryFn: () => api.get("/admin/certificates", { params: { page, limit: 10 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const revokeMut = useMutation({
    mutationFn: ({ id, reason }) => api.put(`/admin/certificates/${id}/revoke`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-certificates"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/certificates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-certificates"] }),
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="w-8 h-8 text-indigo-600" />
          Quản lý chứng chỉ
        </h1>
        <p className="text-gray-500 mt-1">
          Xem và quản lý chứng chỉ đã cấp cho học viên
        </p>
      </div>

      {isFetching && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Đang tải...
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">Mã chứng chỉ</th>
              <th className="p-3 text-left font-semibold">Học viên</th>
              <th className="p-3 text-left font-semibold">Khóa học</th>
              <th className="p-3 text-center font-semibold">Điểm</th>
              <th className="p-3 text-center font-semibold">Ngày cấp</th>
              <th className="p-3 text-center font-semibold">Trạng thái</th>
              <th className="p-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Chưa có chứng chỉ nào
                </td>
              </tr>
            ) : (
              items.map((cert) => (
                <tr key={cert._id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs text-gray-600">
                    {cert.certificateNumber}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-gray-800">
                      {cert.student?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">{cert.student?.email}</p>
                  </td>
                  <td className="p-3 text-gray-700">
                    {cert.course?.title || "N/A"}
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold text-indigo-600">
                      {cert.score || "N/A"}
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-600">
                    {new Date(cert.issueDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 text-center">
                    {cert.isRevoked ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-700">
                        Đã thu hồi
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                        Hợp lệ
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {!cert.isRevoked && (
                        <button
                          onClick={() => {
                            const reason = prompt("Lý do thu hồi:");
                            if (reason) {
                              revokeMut.mutate({ id: cert._id, reason });
                            }
                          }}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Thu hồi"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Xóa chứng chỉ?")) {
                            deleteMut.mutate(cert._id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
