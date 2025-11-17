import { useEffect, useRef, useState, useCallback } from "react";
import { loginApi, googleApi } from "../../services/auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, refreshMe } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const redirectByRole = useCallback(
    (user) => {
      const role = (user?.role || "").toLowerCase();
      const redirect = searchParams.get("redirect");

      if (redirect) {
        nav(redirect, { replace: true });
        return;
      }

      if (role === "admin") {
        nav("/admin/overview", { replace: true });
      } else {
        nav("/", { replace: true });
      }
    },
    [nav, searchParams]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      if (!data?.user?.role) {
        throw new Error("User role is missing");
      }
      setUser(data.user);
      await refreshMe();
      redirectByRole(data.user);
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !clientId || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp) => {
        setError("");
        setLoading(true);
        try {
          const { data } = await googleApi(resp.credential);
          setUser(data.user);
          await refreshMe();
          redirectByRole(data.user);
        } catch (err) {
          setError(err?.response?.data?.message || "Google login thất bại");
        } finally {
          setLoading(false);
        }
      },
      auto_select: false,
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "signin_with",
      width: "100%",
      logo_alignment: "left",
    });
  }, [nav, setUser, refreshMe, redirectByRole]);

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
              <h1>Chào mừng trở lại</h1>
              <p className="ai-auth__lead">
                Khởi động lại hành trình xây dựng khóa học thông minh cùng
                AlphaLearn. Studio đang giữ hộ bạn mọi tiến trình nghiên cứu,
                gợi ý lộ trình và bản nháp bài học mới nhất.
              </p>
            </div>

            <div className="ai-auth__brand-card">
              <div>
                <p className="ai-auth__tag">Đang hoạt động</p>
                <h3>Studio realtime</h3>
              </div>
              <div className="ai-auth__stats">
                <div>
                  <span>480+</span>
                  <small>Khóa AI đang được dựng</small>
                </div>
                <div>
                  <span>92%</span>
                  <small>Hoàn tất đầu ra đúng hẹn</small>
                </div>
              </div>
            </div>

            <div className="ai-auth__tag-grid">
              <span>Realtime tutor</span>
              <span>Canvas tối giản</span>
              <span>Quiz auto</span>
              <span>Xuất bản 1 chạm</span>
            </div>
          </section>

          <section className="ai-auth__panel ai-auth__panel--form">
            <div className="ai-auth__header">
              <div>
                <p className="ai-auth__eyebrow">AlphaLearn Access</p>
                <h2>Đăng nhập tài khoản</h2>
                <p className="ai-auth__lead small">
                  Mở bảng điều khiển AI Course Studio và tiếp tục tối ưu khóa
                  học ngay trong vài giây.
                </p>
              </div>
              <Link className="ai-auth__ghost-link" to="/register">
                Tạo tài khoản
              </Link>
            </div>

            {error && <div className="ai-auth__error">{error}</div>}

            <form onSubmit={onSubmit} className="ai-auth__form">
              <label className="ai-auth__label" htmlFor="email">
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
                  id="email"
                  className="ai-auth__input"
                  name="email"
                  type="email"
                  placeholder="ban@alphalearn.com"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <label className="ai-auth__label" htmlFor="password">
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
                  <circle cx="12" cy="15" r="1.4" fill="currentColor" />
                </svg>
                <input
                  id="password"
                  className="ai-auth__input"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              <button className="ai-auth__submit" disabled={loading} type="submit">
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="ai-auth__divider">
              <span>hoặc tiếp tục với</span>
            </div>

            <div className="ai-auth__oauth" ref={googleBtnRef} />

            <p className="ai-auth__footer">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="ai-auth__link">
                Tạo ngay để thử studio
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
