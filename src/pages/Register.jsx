import { useState } from "react";
import { registerApi } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="auth-card">
      <h2>Đăng ký</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <label>Họ tên</label>
        <input name="name" value={form.name} onChange={onChange} required />
        <label>Email</label>
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          type="email"
          required
        />
        <label>Mật khẩu</label>
        <input
          name="password"
          value={form.password}
          onChange={onChange}
          type="password"
          minLength={6}
          required
        />
        <label>Vai trò</label>
        <select name="role" value={form.role} onChange={onChange}>
          <option value="student">Học viên</option>
          <option value="instructor">Giảng viên</option>
        </select>
        <button disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
