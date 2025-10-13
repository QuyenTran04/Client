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

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catList] = await Promise.all([getCategories()]);
    setCats(catList);
    const data = await getCourses(filters);
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lọc giá ở client (nếu BE chưa hỗ trợ)
  const visible = useMemo(() => {
    if (filters.price === "all") return items;
    if (filters.price === "free")
      return items.filter((c) => !c.price || Number(c.price) === 0);
    return items.filter((c) => Number(c.price) > 0);
  }, [items, filters.price]);

  return (
    <div className="container course-page">
      <div className="head">
        <h1>Khóa học</h1>
        <p className="muted">Khám phá các khóa học phổ biến và mới nhất.</p>
      </div>

      <div className="filters">
        <input
          className="ipt"
          placeholder="Tìm khóa học..."
          value={filters.q}
          onChange={(e) =>
            setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))
          }
        />

        <select
          className="sel"
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
          className="sel"
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
          className="sel"
          value={filters.sort}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))
          }
        >
          <option value="-createdAt">Mới nhất</option>
          <option value="title">Tên A → Z</option>
          <option value="price">Giá thấp → cao</option>
          <option value="-price">Giá cao → thấp</option>
        </select>
      </div>

      <CourseGrid items={visible} loading={loading} />

      <div className="pager">
        <button
          disabled={filters.page <= 1}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
        >
          ← Trước
        </button>
        <span>Trang {filters.page}</span>
        <button
          disabled={visible.length < filters.limit}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
