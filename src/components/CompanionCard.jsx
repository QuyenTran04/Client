import { removeBookmark, addBookmark } from "../lib/actions/companion.actions";
import { Link } from "react-router-dom";

const TheCompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}) => {
  const duongDan = window.location.pathname;

  // Hàm xử lý lưu / bỏ lưu bài học
  const xuLyDanhDau = async () => {
    if (bookmarked) {
      await removeBookmark(id, duongDan);
    } else {
      await addBookmark(id, duongDan);
    }
  };

  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      {/* Phần trên: hiển thị môn học và nút lưu */}
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <button className="companion-bookmark" onClick={xuLyDanhDau}>
          <img
            src={bookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
            alt="danh dấu"
            width={12.5}
            height={15}
            loading="lazy"
          />
        </button>
      </div>

      {/* Tiêu đề và mô tả bài học */}
      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>

      {/* Thời lượng bài học */}
      <div className="flex items-center gap-2">
        <img src="/icons/clock.svg" alt="thời lượng" width={13.5} height={13.5} loading="lazy" />
        <p className="text-sm">{duration} phút</p>
      </div>

      {/* Nút mở bài học */}
      <Link to={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">Bắt đầu bài học</button>
      </Link>
    </article>
  );
};

export default TheCompanionCard;
