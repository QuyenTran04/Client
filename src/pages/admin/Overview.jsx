import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Reusable stat card
function StatCard({ title, value, icon, trendText, trendType = "up" }) {
  const TrendIcon = trendType === "down" ? TrendingDown : TrendingUp;
  const trendColor =
    trendType === "down" ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
      <div
        className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${trendColor}`}
      >
        <TrendIcon size={12} />
        {trendText}
      </div>
    </div>
  );
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [ov, setOv] = useState(null);
  const [rev, setRev] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [overviewRes, revenueRes] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/reports/revenue/monthly"),
        ]);

        setOv(overviewRes.data);
        const rows = (revenueRes.data?.data || []).map((d) => ({
          name: `T${d.month}`,
          revenue: d.revenue,
        }));
        setRev(rows);
      } catch (err) {
        console.error("Overview fetch error", err);
        setError("Không thể tải dữ liệu từ máy chủ.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">
        Đang tải dashboard…
      </div>
    );

  if (error)
    return (
      <div className="text-center p-10 text-red-600 bg-red-50 rounded-xl">
        {error}
      </div>
    );

  const cards = [
    {
      title: "Tổng người dùng",
      value: (ov.users?.total || 0).toLocaleString("vi-VN"),
      icon: <Users size={22} />,
      trendText: "Tăng 8.5% hôm qua",
      trendType: "up",
    },
    {
      title: "Tổng đơn hàng",
      value: (ov.revenueThisMonth?.orders || 0).toLocaleString("vi-VN"),
      icon: <ShoppingBag size={22} />,
      trendText: "Tăng 1.3% so với tuần trước",
      trendType: "up",
    },
    {
      title: "Tổng doanh thu",
      value:
        "$" +
        (ov.revenueThisMonth?.revenue || 0).toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }),
      icon: <DollarSign size={22} />,
      trendText: "Giảm 4.3% hôm qua",
      trendType: "down",
    },
    {
      title: "Khóa học đang chờ duyệt",
      value: (ov.courses?.pending || 0).toLocaleString("vi-VN"),
      icon: <Clock size={22} />,
      trendText: "Tăng 1.8% hôm qua",
      trendType: "up",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Tổng quan hoạt động và doanh thu trong tháng.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* SALES CHART */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Doanh thu theo tháng
          </h2>
          <select className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500">
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={rev}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(v) =>
                "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fill="url(#revFill)"
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
