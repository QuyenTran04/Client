import { useState } from "react";
import { registerApi } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STUDIO_STEPS = [
  "Nhập bản mô tả & mục tiêu khóa học",
  "Chọn đối tượng, cấp độ và giọng nội dung",
  "AI dựng đề cương, tài liệu và quiz tự động",
  "Xuất bản khóa học ngay trên AlphaLearn",
];

export default function Register() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      setUser(data.user);
      nav("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-auth">
      <div className="ai-auth__glow ai-auth__glow--one" />
      <div className="ai-auth__glow ai-auth__glow--two" />
      <div className="ai-auth__noise" />
      <div className="ai-auth__shell">
        <div className="ai-auth__grid">
          <section className="ai-auth__panel ai-auth__panel--brand">
            <div>
              <p className="ai-auth__eyebrow">AI Course Studio</p>
              <h1>Bắt đầu hành trình mới</h1>
              <p className="ai-auth__lead">
                Thiết lập hồ sơ và để studio AI đồng hành trong toàn bộ quá
                trình xây dựng khóa học. Hãy chia sẻ phong cách giảng dạy, mục
                tiêu cùng cộng đồng 4.8k nhà sáng tạo nội dung giáo dục.
              </p>
            </div>

            <div className="ai-auth__brand-card">
              <div>
                <p className="ai-auth__tag">Pipeline</p>
                <h3>Studio blueprint</h3>
              </div>
              <ul className="ai-auth__timeline">
                {STUDIO_STEPS.map((step, idx) => (
                  <li key={step}>
                    <span>{idx + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ai-auth__tag-grid">
              <span>Lesson builder</span>
              <span>Quiz generator</span>
              <span>Document studio</span>
              <span>Analytics trực tiếp</span>
            </div>
          </section>

          <section className="ai-auth__panel ai-auth__panel--form">
            <div className="ai-auth__header">
              <div>
                <p className="ai-auth__eyebrow">Thiết lập tài khoản</p>
                <h2>Mở studio của bạn</h2>
                <p className="ai-auth__lead small">
                  Sau khi đăng ký bạn có thể tạo khóa học với AI, quản lý người
                  học và phát hành ngay trên AlphaLearn.
                </p>
              </div>
              <Link className="ai-auth__ghost-link" to="/login">
                Đăng nhập
              </Link>
            </div>

            {error && <div className="ai-auth__error">{error}</div>}

            <form onSubmit={onSubmit} className="ai-auth__form">
              <label className="ai-auth__label" htmlFor="name">
                Họ và tên
              </label>
              <div className="ai-auth__control">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="8"
                    r="3.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M5.5 19.5c1.2-3 4.6-4 6.5-4s5.2 1 6.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="name"
                  className="ai-auth__input"
                  name="name"
                  placeholder="Nhập tên đầy đủ"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </div>

              <label className="ai-auth__label" htmlFor="register-email">
                Email công việc
              </label>
              <div className="ai-auth__control">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 6h16a1 1 0 0 1 1 1.1v9.8A1 1 0 0 1 20 18H4a1 1 0 0 1-1-1.1V7.1A1 1 0 0 1 4 6Zm0 .5 8 5 8-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="register-email"
                  className="ai-auth__input"
                  name="email"
                  type="email"
                  placeholder="ban@alphalearn.com"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <label className="ai-auth__label" htmlFor="register-password">
                Mật khẩu
              </label>
              <div className="ai-auth__control">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M7 10V7.5A5 5 0 0 1 17 7v3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                <input
                  id="register-password"
                  className="ai-auth__input"
                  name="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              <input type="hidden" name="role" value={form.role} />

              <button className="ai-auth__submit" disabled={loading} type="submit">
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </form>

            <p className="ai-auth__footer">
              Đã có tài khoản?{" "}
              <Link to="/login" className="ai-auth__link">
                Đăng nhập ngay
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
