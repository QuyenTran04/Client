import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import CourseCard from "../components/CourseCard";

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        console.log("Fetching /courses/my...");
        const response = await api.get("/courses/my");
        console.log("Response:", response.data);
        if (!alive) return;
        setCourses(response.data.items || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        if (!alive) return;
        setError(err?.response?.data?.message || err?.message || "Lỗi tải khóa học");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111", marginBottom: 8 }}>
            📚 Khóa Học Của Tôi
          </h1>
          <p style={{ fontSize: 16, color: "#666" }}>
            Quản lý các khóa học bạn đã tạo
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: "4px solid #e0e0e0",
                borderTop: "4px solid #1890ff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <div style={{ marginTop: 16, fontSize: 14, color: "#666" }}>
              Đang tải khóa học...
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: 20,
            background: "#fee",
            border: "1px solid #fcc",
            borderRadius: 12,
            color: "#c33",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#111" }}>
              Bạn chưa tạo khóa học nào
            </h2>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
              Hãy bắt đầu tạo khóa học của bạn
            </p>
            <button
              onClick={() => navigate("/create-course")}
              style={{
                padding: "12px 24px",
                background: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              ✨ Tạo Khóa Học
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && courses.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24
          }}>
            {courses.map((course) => (
              <CourseCard key={course._id} c={course} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
