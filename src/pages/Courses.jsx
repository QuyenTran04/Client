import { useCallback, useEffect, useMemo, useState } from "react";
import { getCourses } from "../services/course";
import { getCategories } from "../services/category";
import CourseGrid from "../components/CourseGrid";
import "../css/courses.css"; 

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
    price: "all", // all | free | paid
  });

  // 🔁 Lấy dữ liệu khóa học & danh mục
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

  // 💰 Lọc khóa học theo giá (client-side nếu backend chưa hỗ trợ)
  const visible = useMemo(() => {
    if (filters.price === "all") return items;
    if (filters.price === "free")
      return items.filter((c) => !c.price || Number(c.price) === 0);
    return items.filter((c) => Number(c.price) > 0);
  }, [items, filters.price]);

  // 🧭 Phân trang
  const nextPage = () =>
    setFilters((f) => ({ ...f, page: f.page + 1 }));
  const prevPage = () =>
    setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }));

  return (
    <div className="container mx-auto px-6 py-10">
      {/* 🔹 Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">🎓 Danh sách khóa học</h1>
        <p className="text-gray-600 mt-2">
          Khám phá các khóa học nổi bật và cập nhật mới nhất.
        </p>
        {!loading && (
          <div className="mt-3 text-sm text-gray-500">
            Hiển thị {visible.length} / {total} khóa học
          </div>
        )}
      </header>

      {/* 🔍 Bộ lọc */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-between bg-gray-50 p-4 rounded-xl shadow-sm mb-8">
        <input
          type="text"
          placeholder="🔎 Tìm khóa học..."
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-blue-500 outline-none"
          value={filters.q}
          onChange={(e) =>
            setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))
          }
        />

        <select
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          value={filters.category}
          onChange={(e) =>
            setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))
          }
        >
          <option value="">Tất cả danh mục</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          value={filters.price}
          onChange={(e) =>
            setFilters((f) => ({ ...f, price: e.target.value, page: 1 }))
          }
        >
          <option value="all">Tất cả mức giá</option>
          <option value="free">Miễn phí</option>
          <option value="paid">Trả phí</option>
        </select>

        <select
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          value={filters.sort}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))
          }
        >
          <option value="-createdAt">Mới nhất</option>
          <option value="title">Tên (A → Z)</option>
          <option value="price">Giá (thấp → cao)</option>
          <option value="-price">Giá (cao → thấp)</option>
        </select>

        <button
          className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100 text-sm"
          onClick={() =>
            setFilters({ q: "", category: "", sort: "-createdAt", page: 1, limit: 12, price: "all" })
          }
        >
          Đặt lại
        </button>
      </div>

      {/* 📘 Lưới khóa học */}
      <CourseGrid items={visible} loading={loading} />

      {/* 🧭 Phân trang */}
      {!loading && total > 0 && (
        <div className="flex justify-center items-center mt-10 gap-4">
          <button
            onClick={prevPage}
            disabled={filters.page <= 1}
            className={`px-4 py-2 rounded-lg text-white font-medium transition
              ${
                filters.page <= 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            ← Trang trước
          </button>

          <span className="font-semibold text-gray-700">
            Trang {filters.page}
          </span>

          <button
            onClick={nextPage}
            disabled={visible.length < filters.limit}
            className={`px-4 py-2 rounded-lg text-white font-medium transition
              ${
                visible.length < filters.limit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  );
}
