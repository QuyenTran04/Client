import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchInput = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy query hiện tại từ URL (nếu có)
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("topic") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(location.search);

      if (searchQuery) {
        // Thêm hoặc cập nhật từ khóa tìm kiếm vào URL
        params.set("topic", searchQuery);
      } else {
        // Nếu trống, xóa khỏi URL
        params.delete("topic");
      }

      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, location, navigate]);

  return (
    <div className="relative border border-gray-400 rounded-lg flex items-center gap-2 px-3 py-2 h-fit">
      <img src="/vite.svg" alt="Tìm kiếm" width={15} height={15} />
      <input
        placeholder="Tìm kiếm khóa học hoặc chủ đề..."
        className="outline-none w-full bg-transparent text-sm"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
