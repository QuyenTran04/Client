import { useEffect, useRef, useState } from "react";
import { loginApi, googleApi } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      setUser(data.user);
      nav("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Google One Tap / Button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !clientId) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp) => {
        try {
          const { data } = await googleApi(resp.credential);
          setUser(data.user);
          nav("/");
        } catch (err) {
          setError(err?.response?.data?.message || "Đăng nhập Google thất bại");
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
    });
  }, [nav, setUser]);

  return (
    <div className="auth-card">
      <h2>Đăng nhập</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
        <label>Mật khẩu</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />
        <button disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="divider">hoặc</div>
      <div ref={googleBtnRef} />
    </div>
  );
}
