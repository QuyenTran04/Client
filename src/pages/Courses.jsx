import { useCallback, useEffect, useMemo, useState } from "react";
import { getCourses } from "../services/course.js";
import { getCategories } from "../services/category";
import CourseGrid from "../components/CourseGrid";

export default function Courses() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    sort: "-createdAt",
    page: 1,
    limit: 12,
    price: "all",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [catList] = await Promise.all([getCategories()]);
      setCats(catList);
      const data = await getCourses(filters);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Không tải được dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visible = useMemo(() => {
    if (filters.price === "all") return items;
    if (filters.price === "free")
      return items.filter((c) => !c.price || Number(c.price) === 0);
    return items.filter((c) => Number(c.price) > 0);
  }, [items, filters.price]);

  const nextPage = () =>
    setFilters((f) => ({ ...f, page: f.page + 1 }));
  const prevPage = () =>
    setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }));

  return (
    <div style={{ background: "#fff7ed", minHeight: "100vh" }}>
      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "#fff", padding: "60px 20px", marginBottom: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.2 }}>🎓 Danh sách khóa học</h1>
          <p style={{ fontSize: 16, opacity: 0.95, margin: 0, lineHeight: 1.5 }}>
            Khám phá hàng trăm khóa học chất lượng từ các giảng viên hàng đầu
          </p>
          {!loading && (
            <div style={{ marginTop: 12, fontSize: 14, opacity: 0.85 }}>
              Tổng cộng <strong>{total}</strong> khóa học | Hiển thị <strong>{visible.length}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 40px" }}>
        {/* Filter Section */}
        <div style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          marginBottom: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#111" }}>Tìm kiếm</h3>
            <input
              type="text"
              placeholder="🔎 Nhập tên khóa học..."
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#ea580c")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>

          {/* Filters Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#555" }}>Danh mục</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 14,
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="">Tất cả danh mục</option>
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#555" }}>Mức giá</label>
              <select
                value={filters.price}
                onChange={(e) => setFilters((f) => ({ ...f, price: e.target.value, page: 1 }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 14,
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="all">Tất cả</option>
                <option value="free">💰 Miễn phí</option>
                <option value="paid">💳 Trả phí</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#555" }}>Sắp xếp</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 14,
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="-createdAt">📅 Mới nhất</option>
                <option value="title">🔤 Tên (A→Z)</option>
                <option value="price">💵 Giá (thấp→cao)</option>
                <option value="-price">💵 Giá (cao→thấp)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <button
                onClick={() => setFilters({ q: "", category: "", sort: "-createdAt", page: 1, limit: 12, price: "all" })}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: 14,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.target.style.background = "#fff")}
              >
                🔄 Đặt lại
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  overflow: "hidden",
                  animation: "pulse 2s infinite",
                }}
              >
                <div style={{ width: "100%", height: 160, background: "#eee" }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 20, background: "#eee", marginBottom: 12, borderRadius: 4 }} />
                  <div style={{ height: 16, background: "#eee", marginBottom: 8, borderRadius: 4, width: "80%" }} />
                  <div style={{ height: 16, background: "#eee", borderRadius: 4, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Grid */}
        {!loading && visible.length > 0 && <CourseGrid items={visible} loading={false} />}

        {/* Empty State */}
        {!loading && visible.length === 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: "60px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111", marginBottom: 8 }}>Không tìm thấy khóa học</h3>
            <p style={{ color: "#666", marginBottom: 20 }}>Hãy thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
            <button
              onClick={() => setFilters({ q: "", category: "", sort: "-createdAt", page: 1, limit: 12, price: "all" })}
              style={{
                padding: "10px 20px",
                background: "#ea580c",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && visible.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginTop: 40,
          }}>
            <button
              onClick={prevPage}
              disabled={filters.page <= 1}
              style={{
                padding: "10px 20px",
                background: filters.page <= 1 ? "#ddd" : "#ea580c",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: filters.page <= 1 ? "not-allowed" : "pointer",
                fontWeight: 500,
                transition: "all 0.2s ease",
                opacity: filters.page <= 1 ? 0.5 : 1,
              }}
            >
              ← Trang trước
            </button>

            <div style={{
              padding: "8px 16px",
              background: "#f0f0f0",
              borderRadius: 8,
              fontWeight: 600,
              color: "#ea580c",
            }}>
              Trang {filters.page}
            </div>

            <button
              onClick={nextPage}
              disabled={visible.length < filters.limit}
              style={{
                padding: "10px 20px",
                background: visible.length < filters.limit ? "#ddd" : "#ea580c",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: visible.length < filters.limit ? "not-allowed" : "pointer",
                fontWeight: 500,
                transition: "all 0.2s ease",
                opacity: visible.length < filters.limit ? 0.5 : 1,
              }}
            >
              Trang sau →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
