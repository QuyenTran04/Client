import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  GraduationCap,
  BookOpen,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const statusBadge = {
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border border-amber-100",
  failed: "bg-rose-50 text-rose-700 border border-rose-100",
};

function StatCard({
  title,
  value,
  icon,
  helper,
  trendValue = 0,
  trendLabel,
}) {
  const isNegative = Number(trendValue) < 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{helper}</p>
      {trendLabel && (
        <div
          className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
            isNegative ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50"
          }`}
        >
          <ArrowUpRight
            size={12}
            className={isNegative ? "transform rotate-90" : ""}
          />
          {trendLabel}
        </div>
      )}
    </div>
  );
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [overviewRes, revenueRes] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/reports/revenue/monthly"),
        ]);
        setOverview(overviewRes.data);

        const rows = (revenueRes.data?.data || []).map((d) => ({
          name: `T${d.month}`,
          revenue: d.revenue,
        }));
        setRevenueSeries(rows);
        setError("");
      } catch (err) {
        console.error("Overview fetch error", err);
        setError("Không thể tải dữ liệu từ máy chủ.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const enrollmentTrend = useMemo(() => {
    if (!overview?.enrollmentTrend) return [];
    return overview.enrollmentTrend.map((item) => ({
      name: item.label,
      count: item.count,
    }));
  }, [overview]);

  const enrollmentDelta = useMemo(() => {
    if (!overview?.enrollmentTrend?.length) return 0;
    const first = overview.enrollmentTrend[0]?.count || 0;
    const last =
      overview.enrollmentTrend[overview.enrollmentTrend.length - 1]?.count || 0;
    return last - first;
  }, [overview]);

  const summaryCards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        title: "Tổng khóa học",
        value: overview.courses?.total?.toLocaleString("vi-VN") || "0",
        helper: `${overview.courses?.published || 0} khóa được xuất bản`,
        icon: <BookOpen size={22} />,
        trendValue: 0,
      },
      {
        title: "Doanh thu tháng này",
        value: currencyFormatter.format(overview.revenueThisMonth?.revenue || 0),
        helper: `${overview.revenueThisMonth?.orders || 0} đơn hàng`,
        icon: <DollarSign size={22} />,
        trendValue: 0,
      },
      {
        title: "Người dùng",
        value: overview.users?.total?.toLocaleString("vi-VN") || "0",
        helper: `${overview.users?.instructors || 0} GV · ${
          overview.users?.students || 0
        } HV`,
        icon: <Users size={22} />,
        trendValue: 0,
      },
      {
        title: "Ghi danh hoạt động",
        value: overview.enrollments?.active?.toLocaleString("vi-VN") || "0",
        helper: "Học viên đang theo học",
        icon: <GraduationCap size={22} />,
        trendValue: enrollmentDelta,
        trendLabel: `${enrollmentDelta >= 0 ? "+" : ""}${enrollmentDelta} học viên 7 ngày`,
      },
    ];
  }, [overview, enrollmentDelta]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">
        Đang tải dashboard...
      </div>
    );

  if (error)
    return (
      <div className="text-center p-10 text-red-600 bg-red-50 rounded-xl border border-red-100">
        {error}
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Bảng điều khiển quản trị
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Xin chào, Admin 👋</h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Theo dõi tăng trưởng, phê duyệt khóa học và giám sát doanh thu theo thời
            gian thực.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500"
          >
            <BookOpen size={18} />
            Quản lý khóa học
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold shadow-sm hover:border-gray-300"
          >
            <Users size={18} />
            Danh sách người dùng
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Doanh thu theo tháng
              </h2>
              <p className="text-sm text-gray-500">
                Dữ liệu tổng hợp từ các hóa đơn đã thanh toán
              </p>
            </div>
            <select className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500">
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={revenueSeries}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(v) => currencyFormatter.format(Number(v) || 0)}
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

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Ghi danh 7 ngày gần nhất
              </h2>
              <p className="text-sm text-gray-500">
                Theo dõi lượng học viên mới mỗi ngày
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 text-indigo-600 px-3 py-1 text-sm font-medium">
              {enrollmentDelta >= 0 ? "+" : ""}
              {enrollmentDelta} HV
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Khóa học chờ duyệt
              </h3>
              <p className="text-sm text-gray-500">
                {overview.pendingCourses?.length || 0} yêu cầu gần nhất
              </p>
            </div>
            <Clock className="text-amber-500" size={20} />
          </div>
          <ul className="space-y-4 flex-1">
            {overview.pendingCourses?.length ? (
              overview.pendingCourses.map((course) => (
                <li key={course._id} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">
                      {course.instructor?.name || "Chưa có GV"} ·{" "}
                      {course.category?.name || "Không có danh mục"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Gửi ngày{" "}
                      {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-800">
                      {currencyFormatter.format(course.price || 0)}
                    </span>
                    <span className="block text-xs text-amber-600 mt-1">
                      Chờ phê duyệt
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Không có yêu cầu mới.</p>
            )}
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Đơn hàng mới nhất
              </h3>
              <p className="text-sm text-gray-500">
                Cập nhật real-time từ hệ thống thanh toán
              </p>
            </div>
            <ShoppingBag className="text-indigo-500" size={20} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-500 uppercase text-xs">
                <tr>
                  <th className="text-left py-2">Học viên</th>
                  <th className="text-left py-2">Khóa học</th>
                  <th className="text-right py-2">Số tiền</th>
                  <th className="text-center py-2">Trạng thái</th>
                  <th className="text-right py-2">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.recentOrders?.length ? (
                  overview.recentOrders.map((order) => (
                    <tr key={order._id} className="text-gray-700">
                      <td className="py-2">
                        <p className="font-medium">
                          {order.student?.name || "Ẩn danh"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.paymentMethod?.toUpperCase()}
                        </p>
                      </td>
                      <td className="py-2">{order.course?.title || "Khóa học"}</td>
                      <td className="py-2 text-right font-semibold">
                        {currencyFormatter.format(order.amount || order.course?.price || 0)}
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            statusBadge[order.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Chưa có giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Khóa học doanh thu cao
              </h3>
              <p className="text-sm text-gray-500">
                Top 5 khóa học có doanh thu lớn nhất
              </p>
            </div>
            <BarChart3 className="text-emerald-500" size={20} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-500 uppercase text-xs">
                <tr>
                  <th className="text-left py-2">Khóa học</th>
                  <th className="text-left py-2">Danh mục</th>
                  <th className="text-left py-2">Giảng viên</th>
                  <th className="text-right py-2">Doanh thu</th>
                  <th className="text-right py-2">Đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.topCourses?.length ? (
                  overview.topCourses.map((course) => (
                    <tr key={course._id}>
                      <td className="py-2 font-semibold text-gray-900">
                        {course.title}
                      </td>
                      <td className="py-2 text-gray-500">
                        {course.categoryName || "Chưa có"}
                      </td>
                      <td className="py-2 text-gray-500">
                        {course.instructorName || "Ẩn danh"}
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {currencyFormatter.format(course.revenue || 0)}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {course.orders || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Chưa có dữ liệu doanh thu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Giảng viên nổi bật
              </h3>
              <p className="text-sm text-gray-500">
                Xếp hạng theo doanh thu khóa học
              </p>
            </div>
          </div>
          <ul className="space-y-4">
            {overview.topInstructors?.length ? (
              overview.topInstructors.map((instructor) => (
                <li key={instructor._id} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {instructor.avatar ? (
                      <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      (instructor.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{instructor.name}</p>
                    <p className="text-xs text-gray-500">{instructor.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {currencyFormatter.format(instructor.revenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {instructor.orders || 0} đơn
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Chưa có dữ liệu giảng viên.</p>
            )}
          </ul>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-500 mb-2 font-medium">
              Học viên mới tham gia
            </p>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {overview.newStudents?.length ? (
                overview.newStudents.map((student) => (
                  <div key={student._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(student.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Chưa có học viên mới.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
