// src/pages/Home.jsx
import "../css/home.css";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* HERO */}
      <header className="hero">
        <div className="container hero-wrap">
          <div className="hero-text">
            <p className="tag">E-learn</p>
            <h1>Bắt đầu học cùng chúng tôi ngay bây giờ</h1>
            <p className="sub">
              Khám phá những khóa học được tuyển chọn kỹ lưỡng để giúp bạn phát
              triển kỹ năng và sự nghiệp.
              {user
                ? ` Chào mừng trở lại, ${user.name}!`
                : " Tham gia miễn phí ngay hôm nay."}
            </p>
            <a href="#courses" className="btn primary">
              Bắt đầu học
            </a>
          </div>
          <div className="hero-ill">
            <img src="../assets/hero-1.png" alt="Học trực tuyến" />
          </div>
        </div>
      </header>

      {/* SECTION: Ảnh + Text */}
      <section className="section">
        <div className="container two-col">
          <div className="media">
            <img src="/assets/section-1.jpg" alt="Nền tảng học trực tuyến" />
          </div>
          <div className="content">
            <h2>
              Chào mừng bạn đến
              <br />
              trung tâm học trực tuyến
            </h2>
            <ul className="checklist">
              <li>Bắt đầu học từ chính trải nghiệm của bạn</li>
              <li>Nâng cấp kỹ năng cùng chuyên gia</li>
              <li>Chọn khóa học yêu thích của bạn</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION: Text + Ảnh + form */}
      <section className="section">
        <div className="container two-col reverse">
          <div className="content">
            <h2>
              Bắt đầu học bằng cách tạo
              <br />
              tài khoản miễn phí
            </h2>
            <p className="sub">
              Tạo hồ sơ học viên để theo dõi tiến độ, lưu khóa học và nhận chứng
              chỉ.
            </p>
            <div className="cta-row">
              <input className="ipt" placeholder="Họ và tên của bạn" />
              <input className="ipt" placeholder="Email của bạn" />
              <button className="btn accent">Đăng ký nhận tin</button>
            </div>
          </div>
          <div className="media">
            <img src="/assets/section-2.jpg" alt="Đăng ký tài khoản" />
          </div>
        </div>
      </section>

      {/* SECTION: Cộng đồng */}
      <section className="section">
        <div className="container community">
          <div className="content">
            <h2>
              Cùng phát triển với
              <br />
              cộng đồng của chúng tôi
            </h2>
            <p className="sub">
              Học nhanh hơn với cộng đồng hỗ trợ và đội ngũ mentor nhiệt tình.
            </p>
            <a href="#join" className="btn primary">
              Tham gia cộng đồng
            </a>
          </div>
          <div className="media stack">
            <img
              src="/assets/community-main.jpg"
              alt="Cộng đồng học tập"
              className="main"
            />
            <img src="/assets/ava-1.jpg" alt="" className="ava a1" />
            <img src="/assets/ava-2.jpg" alt="" className="ava a2" />
            <img src="/assets/ava-3.jpg" alt="" className="ava a3" />
            <img src="/assets/ava-4.jpg" alt="" className="ava a4" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container fwrap">
          <div className="brand">
            <img src="/logo.svg" alt="Elearn" />
            <span>Elearn</span>
          </div>
          <div className="fcols">
            <div>
              <h4>Theo dõi chúng tôi</h4>
              <div className="socials">
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">Twitter</a>
                <a href="#">YouTube</a>
              </div>
            </div>
            <div>
              <h4>Liên kết hữu ích</h4>
              <a href="#">Giới thiệu</a>
              <a href="#">Khóa học</a>
              <a href="#">Blog</a>
            </div>
            <div>
              <h4>Liên hệ</h4>
              <p>0123 456 789</p>
              <p>support@elearn.com</p>
            </div>
          </div>
        </div>
        <div className="copy">
          © {new Date().getFullYear()} Elearn — Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
