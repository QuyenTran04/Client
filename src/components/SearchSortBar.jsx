import { useState, useEffect } from "react";

export default function SearchSortBar({ onChange, initial = {} }) {
  const [q, setQ] = useState(initial.q ?? "");
  const [sort, setSort] = useState(initial.sort ?? "-createdAt");

  useEffect(() => {
    const id = setTimeout(() => onChange({ q, sort }), 350); // debounce
    return () => clearTimeout(id);
  }, [q, sort, onChange]);

  return (
    <div className="toolbar">
      <input
        className="input"
        placeholder="Tìm khóa học (ví dụ: React, Node, SQL...)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="select"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="-createdAt">Mới nhất</option>
        <option value="price">Giá thấp → cao</option>
        <option value="-price">Giá cao → thấp</option>
        <option value="title">Tên A → Z</option>
      </select>
    </div>
  );
}
