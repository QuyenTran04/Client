import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  UserPlus,
  BookOpen,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

const statusClassMap = {
  paid: "status status--success",
  pending: "status status--warning",
  failed: "status status--danger",
};

function formatDate(value) {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "--";
  }
}

function MetricCard({ icon, label, value, helper, delta }) {
  const trend = delta?.value ?? 0;
  const deltaClass =
    trend === 0 ? "is-neutral" : trend > 0 ? "is-up" : "is-down";

  return (
    <article className="metric-card">
      <div className="metric-card__head">
        <div className="metric-card__icon">{icon}</div>
        {delta && (
          <span className={`metric-card__delta ${deltaClass}`}>
            <ArrowUpRight size={14} />
            {delta.label}
          </span>
        )}
      </div>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
      {helper && <p className="metric-card__helper">{helper}</p>}
    </article>
  );
}

function EmptyState({ message }) {
  return <p className="empty-state">{message}</p>;
}

function Avatar({ src, name = "", size = "md" }) {
  const className = `avatar-thumb ${size === "sm" ? "avatar-thumb--sm" : ""}`;
  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={className}
        loading="lazy"
      />
    );
  }
  return (
    <span className={`${className} avatar-thumb--fallback`}>
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/reports/revenue/monthly"),
      ]);

      setOverview(overviewRes.data);
      const rows = (revenueRes.data?.data || []).map((row) => ({
        name: `T${row.month}`,
        revenue: row.revenue,
      }));
      setRevenueSeries(rows);
      setError("");
    } catch (err) {
      console.error("Overview fetch error", err);
      setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const weeklyEnrollment = useMemo(() => {
    if (!overview?.enrollmentTrend?.length) {
      return { total: 0, delta: 0, series: [] };
    }
    const series = overview.enrollmentTrend.map((item) => ({
      label: item.label,
      count: item.count,
    }));
    const total = series.reduce((sum, item) => sum + item.count, 0);
    const first = series[0].count;
    const last = series[series.length - 1].count;
    return {
      total,
      delta: last - first,
      series,
    };
  }, [overview]);

  const pendingCount = overview?.pendingCourses?.length || 0;

  const heroBadges = useMemo(
    () => [
      {
        id: "courses",
        label: "Khoá học đã xuất bản",
        value: overview?.courses?.published || 0,
      },
      {
        id: "instructors",
        label: "Giảng viên",
        value: overview?.users?.instructors || 0,
      },
      {
        id: "students",
        label: "Học viên",
        value: overview?.users?.students || 0,
      },
    ],
    [overview]
  );

  const heroPulse = useMemo(
    () => [
      {
        label: "Đơn thanh toán",
        value: overview?.revenueThisMonth?.orders || 0,
      },
      {
        label: "Khoá chờ duyệt",
        value: pendingCount,
      },
      {
        label: "Học viên mới",
        value: overview?.newStudents?.length || 0,
      },
    ],
    [overview, pendingCount]
  );

  const quickStats = useMemo(() => {
    const publishedCourses = overview?.courses?.published || 0;
    const totalUsers = overview?.users?.total || 0;

    return [
      {
        id: "revenue",
        label: "Doanh thu tháng này",
        value: currencyFormatter.format(overview?.revenueThisMonth?.revenue || 0),
        helper: `${overview?.revenueThisMonth?.orders || 0} đơn thanh toán`,
        icon: <DollarSign size={20} />,
      },
      {
        id: "students",
        label: "Người học trên nền tảng",
        value: numberFormatter.format(overview?.users?.students || 0),
        helper: `${numberFormatter.format(totalUsers)} tài khoản`,
        icon: <UserPlus size={20} />,
      },
      {
        id: "enrollments",
        label: "Đăng ký mới (7 ngày)",
        value: numberFormatter.format(weeklyEnrollment.total),
        helper: "So với đầu tuần",
        icon: <GraduationCap size={20} />,
        delta: {
          value: weeklyEnrollment.delta,
          label:
            weeklyEnrollment.delta === 0
              ? "Không đổi"
              : `${weeklyEnrollment.delta > 0 ? "+" : ""}${
                  weeklyEnrollment.delta
                } lượt`,
        },
      },
      {
        id: "courses",
        label: "Khoá học đã xuất bản",
        value: numberFormatter.format(publishedCourses),
        helper:
          pendingCount > 0
            ? `${pendingCount} khoá đang chờ phê duyệt`
            : "Không có khoá học chờ",
        icon: <BookOpen size={20} />,
      },
    ];
  }, [overview, pendingCount, weeklyEnrollment]);

  const recentOrders = overview?.recentOrders || [];
  const pendingCourses = overview?.pendingCourses || [];
  const topCourses = overview?.topCourses || [];
  const topInstructors = overview?.topInstructors || [];
  const newStudents = overview?.newStudents || [];
  const hasRevenueChart = revenueSeries.length > 0;
  const hasEnrollmentChart = weeklyEnrollment.series.length > 0;

  if (loading && !overview) {
    return (
      <div className="dashboard-loading">
        <span className="dashboard-loading__spinner" />
        <p>�?ang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (!loading && error && !overview) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={20} />
        <p>{error}</p>
        <button type="button" onClick={loadDashboard}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      {error && overview && (
        <div className="dashboard-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" onClick={loadDashboard}>
            Tải lại
          </button>
        </div>
      )}

      <section className="dashboard-hero">
        <div className="dashboard-hero__main">
          <p className="eyebrow">Bảng điều khiển</p>
          <h1>Trung tâm quản trị AlphaLearn</h1>
          <p className="subtitle">
            Giám sát doanh thu, học viên và nội dung chỉ trong một màn hình.
            Tất cả dữ liệu được đồng bộ theo thời gian thực.
          </p>
          <div className="hero-badges">
            {heroBadges.map((badge) => (
              <span key={badge.id} className="hero-badge">
                <strong>{numberFormatter.format(badge.value)}</strong>
                <small>{badge.label}</small>
              </span>
            ))}
          </div>
          <div className="hero-actions">
            <Link className="btn btn--primary" to="/admin/courses">
              Tạo khoá học
            </Link>
            <Link className="btn btn--ghost" to="/admin/reports">
              Xem báo cáo chi tiết
            </Link>
          </div>
        </div>

        <div className="dashboard-hero__side">
          <div className="side-card">
            <p className="side-card__label">Tình trạng hệ thống</p>
            <p className="side-card__value">
              {numberFormatter.format(overview?.enrollments?.active || 0)}
            </p>
            <p className="side-card__helper">Học viên đang tham gia bài học</p>
            <ul className="side-pulse">
              {heroPulse.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{numberFormatter.format(item.value)}</strong>
                </li>
              ))}
            </ul>
            <Link className="side-card__link" to="/admin/orders">
              Mở nhật ký hoạt động
            </Link>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        {quickStats.map((stat) => (
          <MetricCard
            key={stat.id}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            helper={stat.helper}
            delta={stat.delta}
          />
        ))}
      </section>

      <section className="chart-grid">
        <article className="dash-card chart-card">
          <div className="card-head">
            <div>
              <h3>Doanh thu theo tháng</h3>
              <p>12 tháng gần nhất</p>
            </div>
            <span className="pill pill--success">
              <TrendingUp size={14} />
              Realtime
            </span>
          </div>
          <div className="chart-wrapper">
            {hasRevenueChart ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueSeries} margin={{ left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tickFormatter={(value) =>
                      currencyFormatter.format(value).replace("₫", "")
                    }
                  />
                  <Tooltip
                    formatter={(value) => currencyFormatter.format(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Chưa có dữ liệu doanh thu." />
            )}
          </div>
        </article>

        <article className="dash-card chart-card">
          <div className="card-head">
            <div>
              <h3>Đăng ký trong 7 ngày</h3>
              <p>Theo từng ngày trong tuần</p>
            </div>
            <span className="pill pill--neutral">
              <ShieldCheck size={14} />
              Theo dõi tự động
            </span>
          </div>
          <div className="chart-wrapper">
            {hasEnrollmentChart ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyEnrollment.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Chưa có lượt đăng ký mới." />
            )}
          </div>
        </article>
      </section>

      <section className="split-grid">
        <article className="dash-card list-card">
          <div className="card-head">
            <div>
              <h3>�?ơn gần đây</h3>
              <p>Theo dõi học viên và trạng thái thanh toán</p>
            </div>
            <Link to="/admin/orders" className="text-link">
              Quản lý �?ơn
            </Link>
          </div>
          {recentOrders.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Học viên</th>
                    <th>Khoá học</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                    <th className="text-right">Giá trị</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="table-user">
                          <Avatar
                            src={order.student?.avatar}
                            name={order.student?.name}
                            size="sm"
                          />
                          <div>
                            <p>{order.student?.name || "Không rõ"}</p>
                            <small>{order.student?.email || "—"}</small>
                          </div>
                        </div>
                      </td>
                  <td>
                    <p>{order.course?.title || "Khoá học"}</p>
                    <small>
                      Giá niêm yết{" "}
                      {currencyFormatter.format(order.course?.price || 0)}
                    </small>
                  </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <span
                          className={
                            statusClassMap[order.status] || "status status--neutral"
                          }
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="text-right">
                        {currencyFormatter.format(order.amount || order.course?.price || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Chưa có giao dịch nào gần đây." />
          )}
        </article>

        <article className="dash-card list-card">
          <div className="card-head">
            <div>
              <h3>Khoá học chờ duyệt</h3>
              <p>�?ảm bảo nội dung đạt chuẩn trước khi công bố</p>
            </div>
            <Link to="/admin/courses" className="text-link">
              Xem tất cả
            </Link>
          </div>
          {pendingCourses.length ? (
            <ul className="timeline">
              {pendingCourses.map((course) => (
                <li key={course._id}>
                  <div>
                    <p className="timeline__title">{course.title}</p>
                    <small>
                      {course.category?.name || "Chưa có danh mục"} •{" "}
                      {course.instructor?.name || "Chưa có giảng viên"}
                    </small>
                  </div>
                  <span>{formatDate(course.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="Không có khoá học nào chờ phê duyệt." />
          )}
        </article>
      </section>

      <section className="insights-grid">
        <article className="dash-card list-card">
          <div className="card-head">
            <div>
              <h3>Khoá học nổi bật</h3>
              <p>Được xếp hạng theo doanh thu</p>
            </div>
            <Clock size={16} className="text-muted" />
          </div>
          {topCourses.length ? (
            <ul className="course-list">
              {topCourses.map((course) => (
                <li key={course._id}>
                  <div>
                    <p className="course-list__title">{course.title}</p>
                    <small>
                      {course.categoryName || "KhA3a học"} •{" "}
                      {course.instructorName || "�?n danh"}
                    </small>
                  </div>
                  <div className="course-list__meta">
                    <strong>{currencyFormatter.format(course.revenue || 0)}</strong>
                    <small>{course.orders || 0} �?ơn</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="Chưa có dữ liệu khoá học nổi bật." />
          )}
        </article>

        <article className="dash-card list-card">
          <div className="card-head">
            <div>
              <h3>Giảng viên xuất sắc</h3>
              <p>Dựa trên doanh thu khoá học</p>
            </div>
            <ShieldCheck size={16} className="text-muted" />
          </div>
          {topInstructors.length ? (
            <ul className="person-list">
              {topInstructors.map((instructor) => (
                <li key={instructor._id}>
                  <div className="person">
                    <Avatar
                      src={instructor.avatar}
                      name={instructor.name}
                    />
                    <div>
                      <p>{instructor.name}</p>
                      <small>{instructor.email}</small>
                    </div>
                  </div>
                  <div className="person__meta">
                    <strong>
                      {currencyFormatter.format(instructor.revenue || 0)}
                    </strong>
                    <small>{instructor.orders || 0} �?ơn</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="Chưa có dữ liệu giảng viên." />
          )}
        </article>

        <article className="dash-card list-card">
          <div className="card-head">
            <div>
              <h3>Học viên mới</h3>
              <p>Theo dõi đăng ký gần nhất</p>
            </div>
            <UserPlus size={16} className="text-muted" />
          </div>
          {newStudents.length ? (
            <ul className="person-list">
              {newStudents.map((student) => (
                <li key={student._id}>
                  <div className="person">
                    <Avatar
                      src={student.avatar}
                      name={student.name}
                    />
                    <div>
                      <p>{student.name}</p>
                      <small>{student.email}</small>
                    </div>
                  </div>
                  <div className="person__meta">
                    <strong>{formatDate(student.createdAt)}</strong>
                    <small>Ngày tham gia</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="Chưa có học viên mới." />
          )}
        </article>
      </section>
    </div>
  );
}
