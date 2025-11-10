import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/admin";
import { Loader2, Trash2, Eye, EyeOff } from "lucide-react";

export default function Reviews() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-reviews", { q, page }],
    queryFn: () => adminApi.listReviews({ q, page, limit: 10 }),
    keepPreviousData: true,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const hideMut = useMutation({
    mutationFn: (id) => adminApi.hideReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  const isHidden = (comment) => comment === "[hidden by admin]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">⭐ Quản lý đánh giá</h1>
        <p className="text-gray-500 mt-1">
          Xem, ẩn hoặc xóa đánh giá từ học viên
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 items-center border border-gray-100">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="🔍 Tìm đánh giá..."
          className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {isFetching && <Loader2 className="animate-spin text-gray-400" size={18} />}
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
            <p className="text-gray-500">Không có đánh giá nào</p>
          </div>
        ) : (
          items.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-800">
                      {review.student?.name || "Ẩn danh"}
                    </p>
                    <span className="text-sm text-amber-600 font-semibold">
                      {"⭐".repeat(review.rating || 5)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Khóa: {review.course?.title || "Chưa xác định"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                {isHidden(review.comment) && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    Ẩn bởi admin
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-lg mb-4 ${
                  isHidden(review.comment)
                    ? "bg-gray-50 text-gray-500 italic"
                    : "bg-blue-50 text-gray-800"
                }`}
              >
                <p>{review.comment}</p>
              </div>

              <div className="flex gap-2 justify-end">
                {!isHidden(review.comment) ? (
                  <button
                    onClick={() => hideMut.mutate(review._id)}
                    disabled={hideMut.isLoading}
                    className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg inline-flex items-center gap-1 text-sm font-medium disabled:opacity-50"
                  >
                    {hideMut.isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <EyeOff size={16} />
                    )}
                    Ẩn
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    Đã ẩn
                  </span>
                )}
                <button
                  onClick={() => deleteMut.mutate(review._id)}
                  disabled={deleteMut.isLoading}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg inline-flex items-center gap-1 text-sm font-medium disabled:opacity-50"
                >
                  {deleteMut.isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Xóa
                </button>
              </div>
            </div>
          ))
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
