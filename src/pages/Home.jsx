import { useAuth } from "../context/AuthContext";
export default function Home() {
  const { user, loading } = useAuth();
  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="container">
      <h1>Trang chủ</h1>
      {user ? (
        <p>
          Bạn đang đăng nhập với vai trò <b>{user.role}</b>. Chúc bạn học tốt!
        </p>
      ) : (
        <p>Hãy đăng nhập/đăng ký để bắt đầu học.</p>
      )}
      {/* Bạn có thể render danh sách khóa học ở đây */}
    </div>
  );
}
