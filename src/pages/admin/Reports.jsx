import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Loader2, TrendingUp, Download } from "lucide-react";
import api from "../../services/api";

const COLORS = ["#4f46e5", "#f97316", "#06b6d4", "#10b981", "#f43f5e"];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, isFetching } = useQuery({
    queryKey: ["admin-reports", { period, year }],
    queryFn: () =>
      api
        .get("/admin/reports/revenue/monthly", { params: { year } })
        .then((r) => r.data)
        .catch(() => ({ data: [] })),
  });

  const { data: courseRevenueData } = useQuery({
    queryKey: ["admin-reports-courses"],
    queryFn: () =>
      api
        .get("/admin/reports/revenue/by-course")
        .then((r) => r.data)
        .catch(() => ({})),
  });

  const { data: instructorRevenueData } = useQuery({
    queryKey: ["admin-reports-instructors"],
    queryFn: () =>
      api
        .get("/admin/reports/revenue/by-instructor")
        .then((r) => r.data)
        .catch(() => ({})),
  });

  const revenueData = data?.data || [];
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + (item.orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const courseChartData = (courseRevenueData || []).slice(0, 10).map((item) => ({
    name: item.title?.substring(0, 20) || "Khóa học",
    revenue: item.revenue || 0,
  }));

  const instructorChartData = (instructorRevenueData || [])
    .slice(0, 10)
    .map((item) => ({
      name: item.name?.substring(0, 15) || "Giảng viên",
      value: item.revenue || 0,
    }));

  const downloadReport = () => {
    const csvContent = [
      ["Báo cáo doanh thu", year],
      [""],
      ["Tháng", "Doanh thu", "Đơn hàng"],
      ...revenueData.map((item) => [
        `Tháng ${item.month}`,
        item.revenue,
        item.orders,
      ]),
      ["", "", ""],
      ["Tổng cộng", totalRevenue, totalOrders],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_${year}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={28} />
            Báo cáo & Phân tích
          </h1>
          <p className="text-gray-500 mt-2">Phân tích doanh thu và hiệu suất kinh doanh</p>
        </div>
        <button
          onClick={downloadReport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
        >
          <Download size={18} />
          Tải báo cáo
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center border border-gray-100">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {[2025, 2024, 2023, 2022].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {currencyFormatter.format(totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Tổng đơn hàng</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {totalOrders.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Giá trị đơn trung bình</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {currencyFormatter.format(avgOrderValue)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Trạng thái</p>
          <p className="text-2xl font-bold text-green-600 mt-2">✓ Hoạt động</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
          {isFetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => currencyFormatter.format(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#4f46e5" name="Doanh thu" />
                <Bar dataKey="orders" fill="#f97316" name="Đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo giảng viên</h3>
          {instructorChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={instructorChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${(value / 1e6).toFixed(1)}M`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {instructorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => currencyFormatter.format(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Top 10 Khóa học có doanh thu cao</h3>
        {courseChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={courseChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={200} />
              <Tooltip
                formatter={(value) => currencyFormatter.format(value)}
              />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
        )}
      </div>
    </div>
  );
}
