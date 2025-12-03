import { useCallback, useEffect, useMemo, useState } from "react";
import { getCourses } from "../services/course.js";
import { getCategories } from "../services/category";
import CourseGrid from "../components/CourseGrid";
import "../css/courses.css";

const FILTER_TEMPLATE = Object.freeze({
  q: "",
  category: "",
  sort: "-createdAt",
  page: 1,
  limit: 12,
  price: "all",
});

const priceOptions = [
  { value: "all", label: "Tất cả" },
  { value: "free", label: "Miễn phí" },
  { value: "paid", label: "Trả phí" },
];

const sortOptions = [
  { value: "-createdAt", label: "Mới cập nhật" },
  { value: "title", label: "Tên A → Z" },
  { value: "price", label: "Học phí tăng dần" },
  { value: "-price", label: "Học phí giảm dần" },
];

const createDefaultFilters = () => ({ ...FILTER_TEMPLATE });

export default function Courses() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState(() => createDefaultFilters());

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourses(filters);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Không tải được danh sách khóa học:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getCategories();
        setCats(list);
      } catch (err) {
        console.error("Không tải được danh mục:", err);
      }
    })();
  }, []);

  const visible = useMemo(() => {
    if (filters.price === "all") return items;
    if (filters.price === "free") {
      return items.filter((c) => !c.price || Number(c.price) === 0);
    }
    return items.filter((c) => Number(c.price) > 0);
  }, [items, filters.price]);

  const heroStats = useMemo(
    () => [
      { label: "Khóa học", value: total },
      { label: "Danh mục", value: cats.length },
      { label: "Đang hiển thị", value: visible.length },
    ],
    [total, cats.length, visible.length]
  );

  const activeCategory = cats.find((cat) => cat._id === filters.category);
  const activePriceLabel =
    priceOptions.find((opt) => opt.value === filters.price)?.label ||
    priceOptions[0].label;

  const showingStart = visible.length
    ? (filters.page - 1) * filters.limit + 1
    : 0;
  const showingEnd = visible.length ? showingStart + visible.length - 1 : 0;

  const nextPage = () =>
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  const prevPage = () =>
    setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  const resetFilters = () => setFilters(createDefaultFilters());

  return (
    <div className="course-collection">
      <section className="courses-hero">
        <div className="courses-hero__content">
          <p className="courses-eyebrow">Không ngừng học hỏi</p>
          <h1>Khám phá thư viện khóa học nổi bật</h1>
          <p className="courses-subtitle">
            Bộ sưu tập được tuyển chọn dựa trên nhu cầu của giảng viên và học
            viên hiện đại. Lọc linh hoạt để tìm lớp học phù hợp trong vài giây.
          </p>
          <div className="courses-hero__stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="courses-hero__panel">
          <label className="courses-search">
            <span>Tìm kiếm nhanh</span>
            <input
              type="text"
              value={filters.q}
              placeholder="Nhập tên, chủ đề, giảng viên..."
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  q: e.target.value,
                  page: 1,
                }))
              }
            />
          </label>
          <div className="courses-hero__chips">
            {priceOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`hero-chip${
                  opt.value === filters.price ? " is-active" : ""
                }`}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    price: opt.value,
                    page: 1,
                  }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <small className="courses-hint">
            Đừng quên lưu khóa học yêu thích để quay lại nhanh hơn.
          </small>
        </div>
      </section>

      <div className="courses-shell">
        <aside className="filters-panel">
          <div className="filters-panel__section">
            <p className="filters-panel__label">Danh mục</p>
            <div className="chip-scroll">
              <button
                type="button"
                className={`filter-chip${
                  filters.category === "" ? " is-active" : ""
                }`}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, category: "", page: 1 }))
                }
              >
                Tất cả
              </button>
              {cats.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={`filter-chip${
                    filters.category === cat._id ? " is-active" : ""
                  }`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: cat._id,
                      page: 1,
                    }))
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filters-panel__section">
            <p className="filters-panel__label">Mức giá</p>
            <div className="pill-row">
              {priceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`pill${opt.value === filters.price ? " on" : ""}`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      price: opt.value,
                      page: 1,
                    }))
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters-panel__section">
            <p className="filters-panel__label">Sắp xếp</p>
            <select
              className="select-control"
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }))
              }
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="reset-btn" onClick={resetFilters}>
            Đặt lại bộ lọc
          </button>
        </aside>

        <section className="courses-results">
          <header className="courses-results__head">
            <div>
              <p>Đang hiển thị {visible.length} khóa học</p>
              {visible.length > 0 && (
                <small>
                  Từ {showingStart} đến {showingEnd} &middot; Trang{" "}
                  {filters.page}
                </small>
              )}
              {visible.length === 0 && <small>Không có khóa học phù hợp</small>}
            </div>
            <div className="active-filters">
              {activeCategory && (
                <span className="active-filter-pill">
                  Danh mục: {activeCategory.name}
                </span>
              )}
              {filters.price !== "all" && (
                <span className="active-filter-pill">Giá: {activePriceLabel}</span>
              )}
            </div>
          </header>

          <CourseGrid items={visible} loading={loading} />

          <div className="pagination-soft">
            <button
              type="button"
              onClick={prevPage}
              disabled={filters.page <= 1}
            >
              Trang trước
            </button>
            <span>Trang {filters.page}</span>
            <button
              type="button"
              onClick={nextPage}
              disabled={visible.length < filters.limit}
            >
              Trang sau
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

