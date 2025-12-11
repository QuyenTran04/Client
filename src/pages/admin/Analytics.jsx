import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { BarChart3, Loader2 } from "lucide-react";

export default function Analytics() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.get("/admin/analytics/overview").then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          Phân tích & Báo cáo
        </h1>
        <p className="text-gray-500 mt-1">
          Thống kê chi tiết về doanh thu, học viên và khóa học
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {currencyFormatter.format(overview?.revenue?.total || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Tháng này: {currencyFormatter.format(overview?.revenue?.monthly || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600">Tổng đăng ký</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {overview?.enrollments?.total || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Tháng này: {overview?.enrollments?.monthly || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600">Giá khóa học TB</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {currencyFormatter.format(overview?.averages?.coursePrice || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600">Tỷ lệ hoàn thành TB</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {Math.round(overview?.averages?.completionRate || 0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
