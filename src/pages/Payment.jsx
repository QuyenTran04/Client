import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCourseById } from "../services/course";
import { processPayment } from "../services/payment";
import { useAuth } from "../context/AuthContext";
import "../css/payment.css";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    email: user?.email || "",
    phone: "",
  });

  useEffect(() => {
    if (!user) {
      const redirectUrl = `/payment?courseId=${courseId}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    if (!courseId) {
      navigate("/courses");
      return;
    }

    // Load course info
    (async () => {
      try {
        setLoading(true);
        const data = await getCourseById(courseId);
        setCourse(data);
        setFormData((prev) => ({ ...prev, email: user?.email || prev.email }));
      } catch (e) {
        setError("Không tải được thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData((prev) => ({ ...prev, expiryDate: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course) return;

    // Validation
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 16) {
      setError("Vui lòng nhập số thẻ hợp lệ (16 chữ số)");
      return;
    }
    if (!formData.cardName) {
      setError("Vui lòng nhập tên chủ thẻ");
      return;
    }
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      setError("Vui lòng nhập ngày hết hạn hợp lệ (MM/YY)");
      return;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      setError("Vui lòng nhập CVV hợp lệ");
      return;
    }
    if (!formData.email) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!formData.phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // Process payment
      await processPayment({
        courseId: courseId,
        amount: course.price,
        paymentMethod: "card",
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        cardName: formData.cardName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        email: formData.email,
        phone: formData.phone,
      });

      // Success - redirect to course detail
      navigate(`/courses/${courseId}?payment=success`);
    } catch (err) {
      setError(err?.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container payment-container">
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container payment-container">
        <div className="payment-error">
          <h2>Không tìm thấy khóa học</h2>
          <button className="btn primary" onClick={() => navigate("/courses")}>
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container payment-container">
      <div className="payment-wrapper">
        {/* Left: Course Summary */}
        <div className="payment-summary">
          <h2>Thông tin khóa học</h2>
          <div className="course-summary-card">
            <div
              className="course-image"
              style={{
                backgroundImage: `url(${course.imageUrl || "/assets/cover-1.jpg"})`,
              }}
            />
            <div className="course-info">
              <h3>{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>👨‍🏫 {course.instructor?.name || "Giảng viên"}</span>
                {course.lessons?.length && <span>📚 {course.lessons.length} bài học</span>}
              </div>
              <div className="course-price">
                <span className="price-label">Tổng thanh toán:</span>
                <span className="price-value">{course.price?.toLocaleString()}₫</span>
              </div>
            </div>
          </div>

          <div className="payment-features">
            <h3>Bạn sẽ nhận được:</h3>
            <ul>
              <li>✅ Truy cập trọn đời khóa học</li>
              <li>✅ Tài liệu và bài tập đầy đủ</li>
              <li>✅ Hỗ trợ từ giảng viên</li>
              <li>✅ Chứng chỉ hoàn thành</li>
            </ul>
          </div>
        </div>

        {/* Right: Payment Form */}
        <div className="payment-form-wrapper">
          <h2>Thông tin thanh toán</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="0123456789"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Số thẻ *</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                required
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardName">Tên chủ thẻ *</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                required
                placeholder="NGUYEN VAN A"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Ngày hết hạn *</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleExpiryChange}
                  maxLength="5"
                  required
                  placeholder="MM/YY"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV *</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setFormData((prev) => ({ ...prev, cvv: v }));
                  }}
                  maxLength="3"
                  required
                  placeholder="123"
                />
              </div>
            </div>

            <div className="payment-total">
              <div className="total-row">
                <span>Giá khóa học:</span>
                <span>{course.price?.toLocaleString()}₫</span>
              </div>
              <div className="total-row">
                <span>Phí giao dịch:</span>
                <span>0₫</span>
              </div>
              <div className="total-row final">
                <span>Tổng cộng:</span>
                <span>{course.price?.toLocaleString()}₫</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-payment"
              disabled={processing}
            >
              {processing ? "Đang xử lý..." : `Thanh toán ${course.price?.toLocaleString()}₫`}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              Hủy
            </button>
          </form>

          <div className="payment-security">
            <p>🔒 Thanh toán được bảo mật và mã hóa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

