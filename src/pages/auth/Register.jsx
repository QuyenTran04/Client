import { useState, useEffect, useRef, useCallback } from "react";
import { registerApi, verifyOtpApi, resendOtpApi, googleApi } from "../../services/auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STUDIO_STEPS = [
  "Nhập bản mô tả & mục tiêu khóa học",
  "Chọn đối tượng, cấp độ và giọng nội dung",
  "AI dựng đề cương, tài liệu và quiz tự động",
  "Xuất bản khóa học ngay trên AlphaLearn",
];

export default function Register() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, refreshMe } = useAuth();
  const [step, setStep] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const googleBtnRef = useRef(null);
  const otpRefs = useRef([]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const redirectByRole = useCallback((user) => {
    const role = (user?.role || "").toLowerCase();
    const redirect = searchParams.get("redirect");
    if (redirect) { nav(redirect, { replace: true }); return; }
    nav(role === "admin" ? "/admin/overview" : "/", { replace: true });
  }, [nav, searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      if (data.requireOtp) { setStep("otp"); setCountdown(60); }
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng ký thất bại");
    } finally { setLoading(false); }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) { setError("Vui lòng nhập đủ 6 số"); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await verifyOtpApi({ email: form.email, otp: otpCode });
      setUser(data.user);
      await refreshMe();
      redirectByRole(data.user);
    } catch (err) {
      const msg = err?.response?.data?.attemptsLeft !== undefined
        ? `Mã OTP không đúng. Còn ${err.response.data.attemptsLeft} lần thử.`
        : err?.response?.data?.message || "Xác thực thất bại";
      setError(msg);
    } finally { setLoading(false); }
  };

  const onResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await resendOtpApi({ email: form.email });
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err?.response?.data?.message || "Gửi lại OTP thất bại");
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    if (pastedData.length > 0) otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    const initializeGoogleButton = () => {
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
            setError(err?.response?.data?.message || "Google đăng ký thất bại");
          } finally { setLoading(false); }
        },
        auto_select: false,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signup_with",
        width: "100%",
        logo_alignment: "left",
      });
    };
    const timer = setTimeout(initializeGoogleButton, 100);
    return () => clearTimeout(timer);
  }, [setUser, refreshMe, redirectByRole]);

  // Render OTP form
  const renderOtpForm = () => (
    <section className="ai-auth__panel ai-auth__panel--form">
      <div className="ai-auth__header">
        <div>
          <p className="ai-auth__eyebrow">Xác thực email</p>
          <h2>Nhập mã OTP</h2>
          <p className="ai-auth__lead small">
            Chúng tôi đã gửi mã xác thực 6 số đến <strong>{form.email}</strong>
          </p>
        </div>
        <button className="ai-auth__ghost-link" onClick={() => setStep("register")}>
          ← Quay lại
        </button>
      </div>

      {error && <div className="ai-auth__error">{error}</div>}

      <form onSubmit={onVerifyOtp} className="ai-auth__form">
        <div className="otp-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              className="otp-input"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button className="ai-auth__submit" disabled={loading} type="submit">
          {loading ? "Đang xác thực..." : "Xác nhận"}
        </button>
      </form>

      <div className="resend-section">
        <p>
          Không nhận được mã?{" "}
          {countdown > 0 ? (
            <span className="countdown">Gửi lại sau {countdown}s</span>
          ) : (
            <button className="resend-btn" onClick={onResendOtp} disabled={loading}>
              Gửi lại mã
            </button>
          )}
        </p>
      </div>
    </section>
  );

  // Render Register form
  const renderRegisterForm = () => (
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
        <label className="ai-auth__label" htmlFor="name">Họ và tên</label>
        <div className="ai-auth__control">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M5.5 19.5c1.2-4 6.5-4 6.5-4s5.3 0 6.5 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
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

        <label className="ai-auth__label" htmlFor="register-email">Email công việc</label>
        <div className="ai-auth__control">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16a1 1 0 0 1 1 1.1v9.8A1 1 0 0 1 20 18H4a1 1 0 0 1-1-1.1V7.1A1 1 0 0 1 4 6Zm0 .5 8 5 8-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

        <label className="ai-auth__label" htmlFor="register-password">Mật khẩu</label>
        <div className="ai-auth__control">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10V7.5A5 5 0 0 1 17 7v3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="15" r="1.4" fill="currentColor" />
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

        <button className="ai-auth__submit" type="submit" disabled={loading}>
          {loading ? "Đang gửi mã xác thực..." : "Tiếp tục"}
        </button>
      </form>

      <div className="ai-auth__divider">
        <span>hoặc tiếp tục với</span>
      </div>

      <div className="ai-auth__oauth" ref={googleBtnRef} />

      <p className="ai-auth__footer">
        Đã có tài khoản?{" "}
        <Link className="ai-auth__link" to="/login">
          Đăng nhập
        </Link>
      </p>
    </section>
  );

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
                Thiết lập hồ sơ và để AI đồng hành trong quá trình xây dựng khóa học. 
                Hãy chia sẻ các phương pháp giảng dạy, mục tiêu cùng cộng đồng 4.8k nhà sáng tạo nội dung giáo dục.
              </p>
            </div>

            <div className="ai-auth__brand-card">
              <div>
                <p className="ai-auth__tag">Pipeline</p>
                <h3>Studio blueprint</h3>
              </div>
              <ul className="ai-auth__timeline">
                {STUDIO_STEPS.map((s, idx) => (
                  <li key={s}>
                    <span>{idx + 1}</span>
                    <p>{s}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ai-auth__tag-grid">
              <span>Lesson builder</span>
              <span>Quiz generator</span>
              <span>Document studio</span>
              <span>Analytics</span>
            </div>
          </section>

          {step === "register" ? renderRegisterForm() : renderOtpForm()}
        </div>
      </div>
    </div>
  );
}
