import { useEffect, useRef, useState } from "react";
import { loginApi, googleApi } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { setUser, refreshMe } = useAuth(); // nhớ lấy refreshMe từ context
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const redirectByRole = (user) => {
    const role = (user?.role || "").toLowerCase();
    // console.error(role); // chỉ debug nếu cần
    if (role === "admin") nav("/admin/overview", { replace: true });
    else nav("/", { replace: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      setUser(data.user);
      await refreshMe(); // đồng bộ phiên từ cookie
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
          setError(err?.response?.data?.message || "Đăng nhập Google thất bại");
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 260,
    });
  }, [nav, setUser, refreshMe]);

  return (
    <div className="auth-canvas">
      <div className="auth-card-2col">
        <div className="auth-visual">
          <img
            alt="Balloon"
            src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200&auto=format&fit=crop"
          />
        </div>

        <div className="auth-form-side">
          <h2 className="auth-title">Welcome back 👋</h2>
          <p className="auth-subtitle">Đăng nhập để tiếp tục</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label className="label">Email</label>
              <input
                className="input"
                name="email"
                type="email"
                placeholder="Enter your Email here"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="label">Password</label>
              <input
                className="input"
                name="password"
                type="password"
                placeholder="Enter your Password here"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>

            <button className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <p className="auth-meta" style={{ marginTop: 10 }}>
            Chưa có tài khoản? <Link to="/register">Create Account</Link>
          </p>

          <div className="divider">— OR —</div>

          <div className="oauth-row">
            <div ref={googleBtnRef} />
            {/* Nếu muốn thêm GitHub thật sự, bạn sẽ cần OAuth flow riêng */}
          </div>
        </div>
      </div>
    </div>
  );
}
