import { useState } from "react";
import { registerApi } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
    <div className="auth-canvas">
      <div className="auth-card-2col">
        {/* LEFT IMAGE + BLOBS */}
        <div className="auth-visual">
          <img
            alt="Balloon"
            src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200&auto=format&fit=crop"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="auth-form-side">
          <h2 className="auth-title">Create your Free Account</h2>
          <p className="auth-subtitle">
            Nhanh chóng và miễn phí — bắt đầu ngay!
          </p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label className="label">Full Name</label>
              <input
                className="input"
                name="name"
                placeholder="Enter your Full Name here"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>

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
                minLength={6}
                value={form.password}
                onChange={onChange}
                required
              />
            </div>

            <div style={{ display: "none" }}>
              <select name="role" value={form.role} onChange={onChange}>
                <option value="student">student</option>
                <option value="instructor">instructor</option>
              </select>
            </div>

            <button className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="auth-meta" style={{ marginTop: 10 }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <div className="divider">— OR —</div>

          <div className="oauth-row">
            <button className="oauth-btn" type="button">
              <img
                alt="Google"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              />
              Sign up with Google
            </button>
            <button className="oauth-btn" type="button">
              <img
                alt="GitHub"
                src="https://github.githubassets.com/favicons/favicon.svg"
              />
              Sign up with GitHub
            </button>
          </div>

          <p className="auth-meta" style={{ marginTop: 16 }}>
            Reserved directs to Leo Barreto
          </p>
        </div>
      </div>
    </div>
  );
}
