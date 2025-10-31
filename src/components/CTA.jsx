import React from "react";
import { Link } from "react-router-dom";

const Cta = () => {
  return (
    <section className="cta-section text-center flex flex-col items-center gap-4 py-10">
      {/* Dòng giới thiệu */}
      <div className="cta-badge bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-semibold">
        Bắt đầu học theo cách của bạn.
      </div>

      {/* Tiêu đề */}
      <h2 className="text-3xl font-bold">
        Xây dựng và cá nhân hóa người bạn học của riêng bạn
      </h2>

      {/* Mô tả */}
      <p className="text-gray-600 max-w-xl">
        Chọn tên, môn học, giọng nói và tính cách — và bắt đầu học thông qua các
        cuộc trò chuyện tự nhiên, vui vẻ.
      </p>

      {/* Hình ảnh minh họa */}
      <img src="/assets/react.svg" alt="cta" width={362} height={232} />

      {/* Nút hành động */}
      <Link
        to="/companions/new"
        className="btn primary flex items-center gap-2"
      >
        <img src="/vite.svg" alt="Thêm" width={12} height={12} />
        <p>Tạo bạn học mới</p>
      </Link>
    </section>
  );
};

export default Cta;
