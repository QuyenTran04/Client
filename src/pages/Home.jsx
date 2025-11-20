// src/pages/Home.jsx
import "../css/home.css";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const subjects = [
    {
      href: "/courses?subject=physics",
      title: "Vật lý",
      description: "Cơ học, điện học, quang học...",
      theme: "bg-blue",
      sticker: "STEM",
      tone: "blue",
      icon: "🔭",
    },
    {
      href: "/courses?subject=chemistry",
      title: "Hóa học",
      description: "Hóa vô cơ, hữu cơ, phân tích...",
      theme: "bg-purple",
      sticker: "LAB",
      tone: "purple",
      icon: "⚗️",
    },
    {
      href: "/courses?subject=biology",
      title: "Sinh học",
      description: "Sinh tế bào, di truyền, tiến hóa...",
      theme: "bg-green",
      sticker: "DNA",
      tone: "green",
      icon: "🧬",
    },
    {
      href: "/courses?subject=history",
      title: "Lịch sử",
      description: "Lịch sử Việt Nam và thế giới",
      theme: "bg-amber",
      sticker: "HIST",
      tone: "amber",
      icon: "🏺",
    },
    {
      href: "/courses?subject=geography",
      title: "Địa lý",
      description: "Tự nhiên, kinh tế, xã hội",
      theme: "bg-cyan",
      sticker: "WORLD",
      tone: "cyan",
      icon: "🌍",
    },
    {
      href: "/courses?subject=informatics",
      title: "Tin học",
      description: "Lập trình, dữ liệu, CNTT",
      theme: "bg-slate",
      sticker: "CODE",
      tone: "slate",
      icon: "💻",
    },
    {
      href: "/courses?subject=english",
      title: "Tiếng Anh",
      description: "Ngữ pháp, giao tiếp, luyện thi",
      theme: "bg-pink",
      sticker: "IELTS",
      tone: "pink",
      icon: "📚",
    },
    {
      href: "/courses",
      title: "Xem tất cả",
      description: "Khám phá thêm nhiều lĩnh vực khác",
      theme: "",
      sticker: "More",
      tone: "dark",
      icon: "✨",
    },
  ];

  const stats = [
    { label: "Học viên đang học", value: "75K+", sub: "trên toàn quốc" },
    { label: "Khóa học chuyên sâu", value: "620+", sub: "đủ mọi lĩnh vực" },
    { label: "Giảng viên chuyên gia", value: "140+", sub: "từ doanh nghiệp" },
    { label: "Điểm hài lòng", value: "4.9/5", sub: "từ 12K+ đánh giá" },
  ];

  const blogPosts = [
    {
      id: 1,
      title: "5 bước xây dựng lộ trình học tập cá nhân hóa",
      excerpt: "Áp dụng mô hình SMART để chọn khóa học phù hợp mục tiêu sự nghiệp.",
      image: "/assets/cover-1.jpg",
      href: "/blog/lo-trinh-ca-nhan",
    },
    {
      id: 2,
      title: "Checklist thi chứng chỉ quốc tế hiệu quả",
      excerpt: "Chuẩn bị kiến thức, thời gian và tài liệu giúp bạn tự tin khi thi.",
      image: "/assets/cover-2.jpg",
      href: "/blog/checklist-chung-chi",
    },
    {
      id: 3,
      title: "Kinh nghiệm học online tập trung trong 30 phút",
      excerpt: "Kết hợp Pomodoro cùng mentor để tối ưu năng suất mỗi ngày.",
      image: "/assets/cover-3.jpg",
      href: "/blog/pomodoro-online",
    },
  ];

  const faqItems = [
    {
      q: "Khóa học có cấp chứng chỉ không?",
      a: "Mỗi khóa đều có chứng chỉ số kèm mã định danh và có thể tải về hồ sơ LinkedIn.",
    },
    {
      q: "Tôi có thể học trên điện thoại chứ?",
      a: "Có. Ứng dụng di động cho phép xem video offline và đồng bộ tiến độ với website.",
    },
    {
      q: "Học phí thanh toán như thế nào?",
      a: "Bạn có thể thanh toán bằng thẻ quốc tế, ví điện tử, chuyển khoản hoặc trả góp 0%.",
    },
    {
      q: "Nếu không hài lòng thì sao?",
      a: "Elearn áp dụng chính sách hoàn tiền trong 7 ngày nếu khóa học không phù hợp.",
    },
  ];

  return (
    <div className="home">
      {/* PROMO BANNER */}
      <section className="promo-banner">
        <div className="container promo-inner">
          <div>
            <p className="badge glow">Giảm giá cuối năm</p>
            <h3>Ưu đãi 40% cho gói học trọn đời • Hết hạn trong 48h</h3>
          </div>
          <button className="btn accent" onClick={() => navigate("/courses?tag=best-deal")}>
            Nhận ưu đãi
          </button>
        </div>
      </section>

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
            <form
              className="hero-search"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/courses?q=${encodeURIComponent(query)}`);
              }}
            >
              <input
                className="ipt"
                placeholder="Tìm khóa học, chủ đề, giảng viên..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn primary" type="submit">
                Tìm kiếm nhanh
              </button>
            </form>
            <div className="cta-row">
              <Link to="/courses" className="btn primary">
                Khám phá khóa học
              </Link>
            </div>
          </div>
          <div className="hero-ill">
            <img src="/assets/hero-1.png" alt="Học trực tuyến" loading="lazy" />
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="section">
        <div className="container stats-highlight">
          {stats.map((item) => (
            <div key={item.label} className="stat-card">
              <span className="value">{item.value}</span>
              <p>{item.label}</p>
              <small>{item.sub}</small>
            </div>
          ))}
        </div>
      </section>

      {/* TRUSTED LOGOS */}
      <section className="section trust-strip">
        <div className="container">
          <p className="muted">Được tin tưởng bởi các doanh nghiệp & trường học</p>
          <div className="logo-row">
            {["FPT Software", "Vietcredit", "MoMo", "VNPay", "HarvardX", "AWS Academy"].map(
              (name, idx) => (
                <span key={idx}>{name}</span>
              )
            )}
          </div>
        </div>
      </section>

      {/* SUBJECTS GRID */}
      <section className="section" id="subjects">
        <div className="container">
          <h2 className="section-title">Môn học</h2>
          <div className="cards four">
            {subjects.map((subject) => (
              <Link key={subject.title} to={subject.href} className={`card subject ${subject.theme}`}>
                <span className={`sticker sticker-${subject.tone}`}>{subject.sticker}</span>
                <span className="subject-icon" aria-hidden="true">
                  {subject.icon}
                </span>
                <div className="card-body">
                  <h3>{subject.title}</h3>
                  <p className="muted">{subject.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="section trust-badges">
        <div className="container">
          <div className="badge-grid">
            <div>
              <h3>Đảm bảo chất lượng</h3>
              <p>Lộ trình được hội đồng chuyên môn kiểm duyệt định kỳ.</p>
            </div>
            <div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Mentor và AI Chatbot đồng hành, giải đáp trong 5 phút.</p>
            </div>
            <div>
              <h3>Bảo mật & chứng chỉ</h3>
              <p>Chứng chỉ có mã QR xác thực, thanh toán chuẩn PCI-DSS.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Ảnh + Text */}
      <section className="section">
        <div className="container two-col">
          <div className="media">
            <img src="/assets/section-1.jpg" alt="Nền tảng học trực tuyến" loading="lazy" />
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
            <div className="stats">
              <div className="stat">
                <div className="num">500+</div>
                <div className="lbl">Khóa học chất lượng</div>
              </div>
              <div className="stat">
                <div className="num">50k+</div>
                <div className="lbl">Học viên tin tưởng</div>
              </div>
              <div className="stat">
                <div className="num">4.8/5</div>
                <div className="lbl">Điểm hài lòng trung bình</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Lý do chọn chúng tôi */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Vì sao chọn Elearn?</h2>
          <div className="cards four">
            <div className="card">
              <div className="card-ico">⚡</div>
              <h3>Học nhanh – hiệu quả</h3>
              <p className="muted">Lộ trình cô đọng, tập trung vào thực hành để bạn lên trình nhanh.</p>
            </div>
            <div className="card">
              <div className="card-ico">👨‍🏫</div>
              <h3>Giảng viên chất lượng</h3>
              <p className="muted">Kinh nghiệm thực chiến, nội dung cập nhật liên tục theo xu hướng.</p>
            </div>
            <div className="card">
              <div className="card-ico">🎯</div>
              <h3>Học đi đôi với làm</h3>
              <p className="muted">Bài tập và dự án thực tế, giúp bạn xây dựng portfolio uy tín.</p>
            </div>
            <div className="card">
              <div className="card-ico">🏆</div>
              <h3>Chứng chỉ hoàn thành</h3>
              <p className="muted">Nhận chứng chỉ số giúp tăng sức mạnh hồ sơ nghề nghiệp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Khóa học nổi bật (teaser) */}
      <section className="section" id="courses">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Khóa học nổi bật</h2>
            <Link to="/courses" className="btn link">Xem tất cả →</Link>
          </div>
          <div className="cards four">
            <div className="card">
              <div className="thumb" style={{ backgroundImage: "url(/assets/cover-1.jpg)" }} />
              <div className="card-body">
                <h3>React từ cơ bản đến nâng cao</h3>
                <p className="muted">Xây dựng ứng dụng SPA hiện đại với React và hệ sinh thái.</p>
              </div>
            </div>
            <div className="card">
              <div className="thumb" style={{ backgroundImage: "url(/assets/cover-2.jpg)" }} />
              <div className="card-body">
                <h3>Thiết kế UI/UX thực chiến</h3>
                <p className="muted">Tư duy thiết kế và quy trình tạo trải nghiệm người dùng xuất sắc.</p>
              </div>
            </div>
            <div className="card">
              <div className="thumb" style={{ backgroundImage: "url(/assets/cover-3.jpg)" }} />
              <div className="card-body">
                <h3>Phân tích dữ liệu với Python</h3>
                <p className="muted">Khai thác dữ liệu và trực quan hóa để ra quyết định thông minh.</p>
              </div>
            </div>
            <div className="card">
              <div className="thumb" style={{ backgroundImage: "url(/assets/cover-4.jpg)" }} />
              <div className="card-body">
                <h3>Marketing số 101</h3>
                <p className="muted">Nắm vững nền tảng Digital Marketing và các kênh trọng yếu.</p>
              </div>
            </div>
          </div>
          {/* FUNCTIONAL CARDS */}
          <div className="cards four mt-6">
            <Link to="/courses" className="card">
              <div className="card-ico">🎓</div>
              <h3>Khóa học</h3>
              <p className="muted">Tìm và học các khóa học phù hợp mục tiêu.</p>
            </Link>
            <Link to="/instructors" className="card">
              <div className="card-ico">🧑‍🏫</div>
              <h3>Giảng viên</h3>
              <p className="muted">Khám phá hồ sơ giảng viên uy tín.</p>
            </Link>
            <Link to="/companions" className="card">
              <div className="card-ico">🤖</div>
              <h3>Bạn học AI</h3>
              <p className="muted">Học cùng AI, hỏi đáp mọi lúc.</p>
            </Link>
            <Link to="/profile" className="card">
              <div className="card-ico">📜</div>
              <h3>Chứng chỉ</h3>
              <p className="muted">Quản lý chứng chỉ sau khi hoàn thành.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Góc kiến thức & Blog</h2>
            <Link to="/blog" className="btn link">
              Đọc thêm →
            </Link>
          </div>
          <div className="cards three blog-grid">
            {blogPosts.map((post) => (
              <article key={post.id} className="card blog-card">
                <div className="thumb" style={{ backgroundImage: `url(${post.image})` }} />
                <div className="card-body">
                  <span className="badge soft">Chia sẻ</span>
                  <h3>{post.title}</h3>
                  <p className="muted">{post.excerpt}</p>
                  <Link to={post.href} className="btn link">
                    Đọc ngay →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Text + Ảnh + form */}
      <section className="section signup-section">
        <div className="container two-col reverse">
          <div className="content signup-card">
            <h2>
              Bắt đầu học bằng cách tạo
              <br />
              tài khoản miễn phí
            </h2>
            <p className="sub">
              Tạo hồ sơ học viên để theo dõi tiến độ, lưu khóa học và nhận chứng
              chỉ.
            </p>
            <div className="signup-form">
              <input className="ipt" placeholder="Họ và tên của bạn" />
              <input className="ipt" placeholder="Email của bạn" />
              <button className="btn accent">Đăng ký nhận tin</button>
            </div>
          </div>
          <div className="media">
            <img src="/assets/section-2.jpg" alt="Đăng ký tài khoản" loading="lazy" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq">
        <div className="container">
          <div className="two-col">
            <div className="content">
              <h2>Câu hỏi thường gặp</h2>
              <p className="sub">
                Giải đáp nhanh những điều bạn quan tâm trước khi đăng ký học tập trên Elearn.
              </p>
            </div>
            <div className="faq-list">
              {faqItems.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section className="section app-download">
        <div className="container two-col">
          <div className="content">
            <h2>Học mọi lúc với ứng dụng Elearn</h2>
            <p className="sub">
              Đồng bộ tiến độ giữa web và mobile, xem bài giảng offline, nhận nhắc nhở cá nhân hóa.
            </p>
            <div className="store-buttons">
              <a className="btn primary" href="#">
                Tải trên App Store
              </a>
              <a className="btn outline" href="#">
                Tải trên Google Play
              </a>
            </div>
          </div>
          <div className="media">
            <img src="/assets/cover-4.jpg" alt="Ứng dụng Elearn" loading="lazy" />
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
            <Link to="/register" className="btn primary">
              Tham gia cộng đồng
            </Link>
          </div>
          <div className="media stack">
            <img
              src="/assets/section-2.jpg"
              alt="Cộng đồng học tập"
              className="main"
              loading="lazy"
            />
            <img src="/assets/ava-1.jpg" alt="Học viên 1" className="ava a1" loading="lazy" />
            <img src="/assets/ava-2.jpg" alt="Học viên 2" className="ava a2" loading="lazy" />
            <img src="/assets/ava-3.jpg" alt="Học viên 3" className="ava a3" loading="lazy" />
            <img src="/assets/ava-4.jpg" alt="Học viên 4" className="ava a4" loading="lazy" />
          </div>
        </div>
      </section>

      {/* SECTION: Cảm nhận học viên */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Cảm nhận học viên</h2>
          <div className="cards three">
            <div className="card quote">
              <p>“Nội dung rất dễ hiểu, bài tập thực tế. Mình đã xin được việc sau 2 tháng.”</p>
              <div className="q-author">— Trần Minh, Frontend Developer</div>
            </div>
            <div className="card quote">
              <p>“Giảng viên hỗ trợ nhanh, lộ trình rõ ràng. Rất đáng tiền!”</p>
              <div className="q-author">— Nguyễn Lan, UI/UX Designer</div>
            </div>
            <div className="card quote">
              <p>“Cộng đồng học tập thân thiện, giúp mình duy trì động lực mỗi ngày.”</p>
              <div className="q-author">— Lê Hoàng, Data Analyst</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Giảng viên tiêu biểu */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Giảng viên tiêu biểu</h2>
          <div className="cards four">
            <div className="card teacher">
              <div className="avatar" style={{ backgroundImage: "url(/assets/ava-1.jpg)" }} />
              <div className="t-body">
                <h3>Nguyễn An</h3>
                <p className="muted">Frontend / React</p>
                <Link to="/instructors/an" className="btn link">Xem hồ sơ →</Link>
              </div>
            </div>
            <div className="card teacher">
              <div className="avatar" style={{ backgroundImage: "url(/assets/ava-2.jpg)" }} />
              <div className="t-body">
                <h3>Trần Bình</h3>
                <p className="muted">UI/UX Design</p>
                <Link to="/instructors/binh" className="btn link">Xem hồ sơ →</Link>
              </div>
            </div>
            <div className="card teacher">
              <div className="avatar" style={{ backgroundImage: "url(/assets/ava-3.jpg)" }} />
              <div className="t-body">
                <h3>Phạm Chi</h3>
                <p className="muted">Data / Python</p>
                <Link to="/instructors/chi" className="btn link">Xem hồ sơ →</Link>
              </div>
            </div>
            <div className="card teacher">
              <div className="avatar" style={{ backgroundImage: "url(/assets/ava-4.jpg)" }} />
              <div className="t-body">
                <h3>Lê Dũng</h3>
                <p className="muted">Marketing</p>
                <Link to="/instructors/dung" className="btn link">Xem hồ sơ →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section newsletter">
        <div className="container">
          <div className="newsletter-card">
            <div>
              <span className="badge soft">Nhận tài liệu miễn phí</span>
              <h3>Đăng ký nhận bản tin học tập mỗi tuần</h3>
              <p className="muted">
                Nhận bộ template lên kế hoạch học tập, gợi ý khóa học và ưu đãi độc quyền qua email.
              </p>
            </div>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input className="ipt" placeholder="Tên của bạn" />
              <input className="ipt" placeholder="Email của bạn" />
              <button className="btn accent">Đăng ký</button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container fwrap">
          <div className="brand">
            <img src="/assets/logo.jpg" alt="Elearn" loading="lazy" />
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

      {/* STICKY CTA */}
      <div className="sticky-cta">
        <p>🎯 Sẵn sàng bắt đầu? Tìm khóa học tiếp theo của bạn ngay bây giờ.</p>
        <button className="btn primary" onClick={() => navigate("/courses")}>
          Bắt đầu học
        </button>
      </div>
    </div>
  );
}
