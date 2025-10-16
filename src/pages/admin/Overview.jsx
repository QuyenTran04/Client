import React, { useEffect, useState } from "react";
import api from "../../services/api"; // axios instance của bạn
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Users, ShoppingBag, DollarSign, Clock } from "lucide-react";

function StatCard({ title, value, icon, trendText, trendType = "up" }) {
  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">{title}</span>
        <div className="icon-pill">{icon}</div>
      </div>
      <div className="card-value">{value}</div>
      <div className={`card-trend ${trendType === "down" ? "down" : "up"}`}>
        {trendText}
      </div>
    </div>
  );
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [ov, setOv] = useState(null);
  const [rev, setRev] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/reports/revenue/monthly"),
        ]);
        setOv(a.data);
        const rows = (b.data?.data || []).map((d) => ({
          name: `T${d.month}`,
          revenue: d.revenue,
        }));
        setRev(rows);
      } catch (e) {
        console.error("Overview fetch error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="skeleton">Đang tải dashboard…</div>;
  if (!ov) return <div className="error">Không thể tải dữ liệu</div>;

  const cards = [
    {
      title: "Total User",
      value: (ov.users?.total || 0).toLocaleString("vi-VN"),
      icon: <Users size={22} className="indigo" />,
      trendText: "↑ 8.5% Up from yesterday",
      trendType: "up",
    },
    {
      title: "Total Order",
      value: (ov.revenueThisMonth?.orders || 0).toLocaleString("vi-VN"),
      icon: <ShoppingBag size={22} className="amber" />,
      trendText: "↑ 1.3% Up from past week",
      trendType: "up",
    },
    {
      title: "Total Sales",
      value: "$" + (ov.revenueThisMonth?.revenue || 0).toLocaleString("en-US"),
      icon: <DollarSign size={22} className="green" />,
      trendText: "↓ 4.3% Down from yesterday",
      trendType: "down",
    },
    {
      title: "Total Pending",
      value: (ov.courses?.published || 0).toLocaleString("vi-VN"),
      icon: <Clock size={22} className="orange" />,
      trendText: "↑ 1.8% Up from yesterday",
      trendType: "up",
    },
  ];

  return (
    <div className="dash">
      <h1 className="dash-title">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid4">
        {cards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* Sales Details */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Sales Details</div>
          <select className="select">
            <option>October</option>
          </select>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={rev}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(v) => "$" + Number(v).toLocaleString("en-US")}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fill="url(#revFill)"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
