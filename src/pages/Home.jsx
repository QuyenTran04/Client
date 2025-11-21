// src/pages/Home.jsx
import "../css/home.css";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const stats = useMemo(
    () => [
      { value: "120K+", label: "Giờ học đã hoàn thành" },
      { value: "2.5K+", label: "Giảng viên & mentor" },
      { value: "98%", label: "Tỉ lệ hài lòng" },
      { value: "15", label: "Ngành học chủ lực" },
    ],
    []
  );
  const trustBadges = useMemo(
    () => ["Chứng nhận Bộ GD&ĐT", "Bảo mật ISO 27001", "Thanh toán an toàn", "Cam kết hoàn phí"],
    []
  );
  const partnerLogos = useMemo(
    () => ["FPT", "Viettel", "VinUni", "MISA", "SeABank", "Unilever"],
    []
  );
  const blogPosts = useMemo(
    () => [
      {
        title: "5 cách tăng tốc lộ trình học trực tuyến",
        summary: "Phương pháp ghi nhớ chủ động, chia nhỏ mục tiêu và sử dụng AI trợ giúp.",
        tag: "Kỹ năng học",
      },
      {
        title: "Checklist xây dựng portfolio UX nổi bật",
        summary: "Các bước chuẩn bị nghiên cứu, wireframe và case study thuyết phục nhà tuyển dụng.",
        tag: "Thiết kế",
      },
      {
        title: "Học Data Science từ con số 0",
        summary: "Lộ trình 6 tháng với Python, SQL, trực quan hoá và dự án thực tế.",
        tag: "Data",
      },
    ],
    []
  );
  const faqs = useMemo(
    () => [
      {
        q: "Tôi có nhận chứng chỉ sau khi hoàn thành khóa học?",
        a: "Có. Chứng chỉ điện tử được cấp ngay trong hồ sơ cá nhân và có thể chia sẻ lên LinkedIn.",
      },
      {
        q: "Học phí được thanh toán bằng phương thức nào?",
        a: "Bạn có thể thanh toán qua thẻ nội địa, quốc tế, ví điện tử hoặc chuyển khoản.",
      },
      {
        q: "Tôi có thể học trên di động chứ?",
        a: "Ứng dụng iOS/Android hỗ trợ tải bài giảng offline, đồng bộ tiến độ với phiên bản web.",
      },
      {
        q: "Khóa học có bảo hành kiến thức không?",
        a: "Trong 30 ngày đầu, nếu bạn không hài lòng sẽ được hoàn học phí hoặc chuyển đổi khóa.",
      },
    ],
    []
  );
  const categories = useMemo(
    () => [
      {
        title: "Business & Strategy",
        slug: "business",
        description: "Leadership, finance, operations và quản trị sự thay đổi.",
        icon: "💼",
        color: "bg-blue",
      },
      {
        title: "IT & Programming",
        slug: "it-programming",
        description: "Full-stack, DevOps, khoa học dữ liệu và AI.",
        icon: "💻",
        color: "bg-purple",
      },
      {
        title: "Marketing & Growth",
        slug: "marketing",
        description: "Branding, performance marketing và content.",
        icon: "📣",
        color: "bg-amber",
      },
      {
        title: "Languages",
        slug: "languages",
        description: "Tiếng Anh, Nhật, Hàn và luyện thi chứng chỉ.",
        icon: "🗣️",
        color: "bg-green",
      },
      {
        title: "Soft Skills",
        slug: "soft-skills",
        description: "Kỹ năng giao tiếp, thuyết trình và quản lý thời gian.",
        icon: "🤝",
        color: "bg-pink",
      },
      {
        title: "Professional Certifications",
        slug: "certifications",
        description: "PMP, AWS, IELTS, TOEIC và nhiều chứng chỉ quốc tế.",
        icon: "🎓",
        color: "bg-cyan",
      },
    ],
    []
  );
  const featuredCourses = useMemo(
    () => [
      {
        title: "AI Product Builder",
        status: "Mới ra mắt",
        summary: "Tạo prototype AI assistant và triển khai workflow thực tế.",
        cover: "/assets/cover-1.jpg",
        duration: "6 tuần",
      },
      {
        title: "Python Data Accelerator",
        status: "Bán chạy",
        summary: "Phân tích dữ liệu với pandas, SQL và dashboard tương tác.",
        cover: "/assets/cover-3.jpg",
        duration: "8 tuần",
      },
      {
        title: "Marketing Automation Lab",
        status: "Top-rated",
        summary: "Xây dựng funnel đa kênh với HubSpot & Meta Ads.",
        cover: "/assets/cover-4.jpg",
        duration: "5 tuần",
      },
      {
        title: "UX Writing Intensive",
        status: "Được đề xuất",
        summary: "Nâng cấp kỹ năng viết và hệ thống hóa voice & tone.",
        cover: "/assets/cover-2.jpg",
        duration: "4 tuần",
      },
      {
        title: "Full-stack JavaScript",
        status: "Hot",
        summary: "React, Node.js, testing và CI/CD cho đội startup.",
        cover: "/assets/section-1.jpg",
        duration: "10 tuần",
      },
    ],
    []
  );
  const keyFeatures = useMemo(
    () => [
      {
        title: "Theo dõi tiến độ",
        description: "Dashboard trực quan giúp bạn theo sát từng cột mốc học tập.",
        icon: "📊",
      },
      {
        title: "Quiz & đánh giá",
        description: "Hệ thống bài kiểm tra, rubric và phản hồi tự động.",
        icon: "✅",
      },
      {
        title: "Chứng chỉ điện tử",
        description: "Cấp chứng chỉ công nhận hoàn thành, chia sẻ được trên LinkedIn.",
        icon: "📄",
      },
      {
        title: "Học đa nền tảng",
        description: "Đồng bộ web, iOS, Android cùng chế độ học offline.",
        icon: "📱",
      },
      {
        title: "AI Tutor 24/7",
        description: "Trợ lý AI gợi ý tài liệu, giải thích khái niệm và nhắc lịch học.",
        icon: "🤖",
      },
      {
        title: "Gamification",
        description: "Huy hiệu, bảng xếp hạng và streak tạo động lực học mỗi ngày.",
        icon: "🎮",
      },
    ],
    []
  );
  const instructors = useMemo(
    () => [
      {
        name: "Nguyễn An",
        role: "Principal Frontend Engineer",
        bio: "10 năm kinh nghiệm tại VNG và SEA, mentor hơn 2.000 học viên.",
        courses: 12,
        avatar: "/assets/ava-1.jpg",
      },
      {
        name: "Trần Bình",
        role: "Design Lead, Teko",
        bio: "Chuyên gia UI/UX với portfolio đa ngành và nhiều giải thưởng.",
        courses: 9,
        avatar: "/assets/ava-2.jpg",
      },
      {
        name: "Phạm Chi",
        role: "Data Scientist, Be Group",
        bio: "Tập trung vào machine learning, data pipeline và storytelling.",
        courses: 11,
        avatar: "/assets/ava-3.jpg",
      },
      {
        name: "Lê Dũng",
        role: "Head of Growth, TopCV",
        bio: "15 năm marketing digital, huấn luyện đội performance đa quốc gia.",
        courses: 8,
        avatar: "/assets/ava-4.jpg",
      },
    ],
    []
  );
  const testimonials = useMemo(
    () => [
      {
        name: "Trần Minh",
        role: "Frontend Developer",
        quote: "“Hero LMS giúp mình học React có định hướng, bài tập dự án sát thực tế.”",
        rating: 5,
        avatar: "/assets/ava-5.jpg",
      },
      {
        name: "Nguyễn Lan",
        role: "UX Writer",
        quote: "“Cố vấn AI nhắc lịch và giải thích lý thuyết cực nhanh, tiết kiệm 40% thời gian.”",
        rating: 5,
        avatar: "/assets/ava-6.jpg",
      },
      {
        name: "Lê Hoàng",
        role: "Data Analyst",
        quote: "“Theo dõi tiến độ, điểm quiz và chứng chỉ giúp mình tự tin phỏng vấn.”",
        rating: 4.8,
        avatar: "/assets/ava-7.jpg",
      },
    ],
    []
  );
  const benefits = useMemo(
    () => [
      {
        value: "100+",
        label: "Khóa học chuẩn ngành",
        desc: "Liên tục cập nhật với chuyên gia doanh nghiệp.",
      },
      {
        value: "50+",
        label: "Giảng viên & mentor",
        desc: "Có chứng chỉ quốc tế và kinh nghiệm thực chiến.",
      },
      {
        value: "7 ngày",
        label: "Học thử miễn phí",
        desc: "Toàn quyền truy cập thư viện nội dung & AI Tutor.",
      },
      {
        value: "99%",
        label: "Hài lòng doanh nghiệp",
        desc: "Không rủi ro nhờ cam kết hoàn phí rõ ràng.",
      },
    ],
    []
  );
  const featuredRef = useRef(null);

  const handleSearch = () => {
    if (!query.trim()) {
      navigate("/courses");
      return;
    }
    navigate(`/courses?q=${encodeURIComponent(query.trim())}`);
  };
  const scrollFeatured = (direction) => {
    if (!featuredRef.current) return;
    const offset = direction === "next" ? 320 : -320;
    featuredRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="home">
      <div className="promo-banner">
        <div className="container promo-inner">
          <div>
            <p className="promo-eyebrow">Ưu đãi Tết học tập</p>
            <p className="promo-headline">
              Giảm tới <strong>40%</strong> học phí + tặng 3 buổi 1:1 với mentor
            </p>
          </div>
          <button className="btn accent" onClick={() => navigate("/courses")}>
            Nhận ưu đãi ngay
          </button>
        </div>
      </div>

      {/* HERO */}
      <header className="hero">
        <div className="container hero-wrap">
          <div className="hero-text">
            <p className="tag">Hero LMS</p>
            <h1>Nền tảng học tập thông minh cho đội ngũ hiện đại</h1>
            <p className="sub">
              Khám phá thư viện khóa học, mentor và chứng chỉ được thiết kế để giúp bạn phát triển kỹ năng, thăng tiến sự nghiệp.
              {user
                ? ` Chào mừng trở lại, ${user.name}!`
                : " Tham gia miễn phí ngay hôm nay."}
            </p>
            <div className="hero-search">
              <input
                className="ipt grow"
                placeholder="Bạn muốn học gì hôm nay?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button className="btn primary" onClick={handleSearch}>
                Tìm kiếm
              </button>
            </div>
            <p className="search-hint">Tìm kiếm hơn 500 khóa học, tài liệu và mentor trong 1 cú click.</p>
            <div className="cta-row">
              <Link to="/courses" className="btn primary">
                Khám phá khóa học
              </Link>
              {!user && (
                <Link to="/register" className="btn primary">
                  Tạo tài khoản miễn phí
                </Link>
              )}
            </div>
          </div>
          <div className="hero-ill">
            <img src="/assets/cover-1.png" alt="Học trực tuyến" loading="lazy" />
          </div>
        </div>
      </header>

      {/* TRUST STRIP */}
      <section className="section trust-strip">
        <div className="container">
          <div className="trust-strip-inner">
            <div>
              <p className="muted mini-title">Được tin dùng bởi</p>
              <h3>Những tổ chức và doanh nghiệp hàng đầu</h3>
            </div>
            <div className="badge-row">
              {trustBadges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
            <div className="partner-logos">
              {partnerLogos.map((logo) => (
                <div key={logo} className="logo-chip">
                  <span>{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section stats-highlight">
        <div className="container">
          <div className="stats-grid">
            {stats.map((item) => (
              <div className="stat-card" key={item.label}>
                <p className="value">{item.value}</p>
                <p className="label">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSE CATEGORIES */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Danh mục khóa học nổi bật</h2>
            <p className="muted">Chọn lộ trình phù hợp cho cá nhân, đội nhóm hoặc tổ chức của bạn.</p>
          </div>
          <div className="cards four category-grid">
            {categories.map((category) => (
              <Link to={`/courses?category=${category.slug}`} className={`card subject ${category.color}`} key={category.slug}>
                <div className="card-body">
                  <div className="card-ico">{category.icon}</div>
                  <h3>{category.title}</h3>
                  <p className="muted">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="section trust-section">
        <div className="container two-col">
          <div className="content">
            <h2>
              Được các doanh nghiệp và trường học
              <br />
              tin tưởng triển khai đào tạo
            </h2>
            <p className="sub">
              Các chương trình được thiết kế cùng chuyên gia trong ngành, đảm bảo chuẩn đầu ra rõ ràng và
              đo được.
            </p>
            <ul className="checklist compact">
              <li>Tùy chỉnh chương trình theo đội nhóm</li>
              <li>Dashboard thống kê tiến độ theo thời gian thực</li>
              <li>Tích hợp LMS nội bộ hoặc SSO</li>
            </ul>
            <div className="cta-row">
              <button className="btn primary" onClick={() => navigate("/register")}>
                Nhận tư vấn doanh nghiệp
              </button>
              <Link to="/courses" className="btn outline">
                Xem case study
              </Link>
            </div>
          </div>
          <div className="media trust-media">
            <div className="award-card">
              <p className="eyebrow">Chứng nhận</p>
              <h3>Top 10 nền tảng đào tạo số 2024</h3>
              <p>E-learning Summit Việt Nam</p>
            </div>
            <div className="score-card">
              <p>CSAT</p>
              <strong>4.9/5</strong>
              <span>Trung bình từ 12.000+ lượt đánh giá</span>
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

      {/* SECTION: Key features */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Tính năng cốt lõi của Hero LMS</h2>
          <div className="cards four feature-grid">
            {keyFeatures.map((feature) => (
              <div className="card" key={feature.title}>
                <div className="card-ico">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p className="muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Khóa học nổi bật (teaser) */}
      <section className="section" id="courses">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Khóa học nổi bật</h2>
              <p className="muted">Các chương trình mới nhất, bán chạy và được đánh giá cao bởi học viên.</p>
            </div>
            <div className="slider-controls">
              <button className="btn outline mini" onClick={() => scrollFeatured("prev")}>
                ←
              </button>
              <button className="btn outline mini" onClick={() => scrollFeatured("next")}>
                →
              </button>
              <Link to="/courses" className="btn link">
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div
            className="featured-slider"
            ref={featuredRef}
            style={{
              display: "flex",
              gap: "1.5rem",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              paddingBottom: "1rem",
            }}
          >
            {featuredCourses.map((course) => (
              <article className="card course-card" key={course.title} style={{ minWidth: "280px", scrollSnapAlign: "start" }}>
                <div className="thumb" style={{ backgroundImage: `url(${course.cover})` }} />
                <div className="card-body">
                  <span className="badge">{course.status}</span>
                  <h3>{course.title}</h3>
                  <p className="muted">{course.summary}</p>
                  <p className="muted mini-title">Thời lượng: {course.duration}</p>
                </div>
              </article>
            ))}
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

      {/* BLOG / RESOURCES */}
      <section className="section blog-section" id="resources">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Blog & Tài nguyên</h2>
            <Link to="/courses?tab=resources" className="btn link">
              Xem tất cả →
            </Link>
          </div>
          <div className="cards three blog-cards">
            {blogPosts.map((post) => (
              <article className="card blog-card" key={post.title}>
                <span className="blog-tag">{post.tag}</span>
                <h3>{post.title}</h3>
                <p className="muted">{post.summary}</p>
                <Link to="/courses?tab=resources" className="btn link">
                  Đọc thêm
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="container two-col reverse">
          <div className="content">
            <h2>Giải đáp nhanh các thắc mắc</h2>
            <p className="sub">
              Từ chính sách hoàn phí, phương thức thanh toán đến cách nhận chứng chỉ – tất cả đều được trả lời rõ ràng.
            </p>
            <div className="faq-card">
              <Accordion type="single" collapsible>
                {faqs.map((item, index) => (
                  <AccordionItem key={item.q} value={`faq-${index}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
          <div className="media faq-media">
            <img src="/assets/hero-1.png" alt="FAQ" loading="lazy" />
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section className="section app-section">
        <div className="container app-banner">
          <div className="content">
            <p className="tag mini">Mobile App</p>
            <h2>Học mọi lúc với ứng dụng Elearn</h2>
            <p className="sub">
              Theo dõi tiến độ, đồng bộ bài giảng, nhận nhắc nhở học tập và tải nội dung để học offline.
            </p>
            <div className="store-buttons">
              <a className="store-btn ios" href="https://apps.apple.com/" target="_blank" rel="noreferrer">
                <span>Tải trên</span>
                <strong>App Store</strong>
              </a>
              <a className="store-btn android" href="https://play.google.com/store" target="_blank" rel="noreferrer">
                <span>Có mặt tại</span>
                <strong>Google Play</strong>
              </a>
            </div>
          </div>
          <div className="media phone-mock">
            <img src="/assets/cover-2.jpg" alt="Ứng dụng Elearn" loading="lazy" />
          </div>
        </div>
      </section>

      {/* SECTION: Text + Ảnh + form */}
      <section className="section newsletter-section">
        <div className="container two-col reverse">
          <div className="content">
            <h2>
              Nhận tài liệu & ưu đãi mới
              <br />
              mỗi tuần
            </h2>
            <p className="sub">
              35.000+ học viên đang nhận checklist, template và lịch workshop miễn phí từ Elearn.
            </p>
            <div className="newsletter-form">
              <input className="ipt" placeholder="Họ và tên của bạn" />
              <input className="ipt" placeholder="Email của bạn" type="email" />
              <button className="btn accent">Đăng ký nhận tin</button>
            </div>
            <p className="newsletter-note">Bạn có thể huỷ đăng ký bất kỳ lúc nào.</p>
          </div>
          <div className="media">
            <img src="/assets/section-2.jpg" alt="Đăng ký tài khoản" loading="lazy" />
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
          <div className="cards three testimonial-grid">
            {testimonials.map((item) => (
              <div className="card quote" key={item.name}>
                <div className="testimonial-head">
                  <img src={item.avatar} alt={item.name} className="testimonial-avatar" loading="lazy" />
                  <div>
                    <strong>{item.name}</strong>
                    <p className="muted mini-title">{item.role}</p>
                    <div className="stars">
                      {"★".repeat(Math.round(item.rating))}
                      <span className="muted mini-title">{item.rating}/5.0</span>
                    </div>
                  </div>
                </div>
                <p>{item.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Benefits */}
      <section className="section benefits-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Lợi ích cho cá nhân & doanh nghiệp</h2>
            <p className="muted">Tăng tốc phát triển kỹ năng với thư viện nội dung chuẩn hóa và hệ thống thông minh.</p>
          </div>
          <div className="cards four">
            {benefits.map((item) => (
              <div className="card stat-card" key={item.label}>
                <p className="value">{item.value}</p>
                <h3>{item.label}</h3>
                <p className="muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Giảng viên tiêu biểu */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Giảng viên tiêu biểu</h2>
          <div className="cards four">
            {instructors.map((teacher) => (
              <div className="card teacher" key={teacher.name}>
                <div className="avatar" style={{ backgroundImage: `url(${teacher.avatar})` }} />
                <div className="t-body">
                  <h3>{teacher.name}</h3>
                  <p className="muted">{teacher.role}</p>
                  <p className="muted mini-title">{teacher.courses}+ khóa học</p>
                  <p className="muted">{teacher.bio}</p>
                  <Link to="/instructors" className="btn link">
                    Xem hồ sơ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section final-cta">
        <div className="container two-col">
          <div className="content">
            <p className="tag mini">Ready to grow</p>
            <h2>Đăng ký ngay để bắt đầu học miễn phí</h2>
            <p className="sub">
              Trải nghiệm đầy đủ Hero LMS trong 7 ngày, mở khóa 100+ khóa học, mentor cá nhân và AI Tutor đồng hành.
            </p>
            <div className="cta-row">
              <button className="btn primary" onClick={() => navigate("/register")}>
                Đăng ký miễn phí
              </button>
              <Link to="/courses" className="btn outline">
                Xem thư viện khóa học
              </Link>
            </div>
            <p className="muted mini-title">Không cần thẻ tín dụng · Huỷ bất kỳ lúc nào</p>
          </div>
          <div className="media">
            <img src="/assets/hero-2.png" alt="Đăng ký học Hero LMS" loading="lazy" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container fwrap">
          <div className="brand">
            <img src="/assets/logo.jpg" alt="Hero LMS" loading="lazy" />
            <span>Hero LMS</span>
            <p className="muted">Trung tâm học tập trực tuyến giúp bạn phát triển sự nghiệp nhanh hơn.</p>
          </div>
          <div className="fcols">
            <div>
              <h4>Company</h4>
              <Link to="/about">Về chúng tôi</Link>
              <Link to="/blog">Blog & Tin tức</Link>
              <Link to="/newsroom">Newsroom</Link>
            </div>
            <div>
              <h4>Resources</h4>
              <Link to="/courses">Khóa học</Link>
              <Link to="/instructors">Giảng viên</Link>
              <Link to="/courses?tab=resources">Tài nguyên</Link>
            </div>
            <div>
              <h4>Support</h4>
              <a href="mailto:support@elearn.com">support@elearn.com</a>
              <a href="tel:0123456789">0123 456 789</a>
              <Link to="/help-center">Trung tâm hỗ trợ</Link>
            </div>
            <div>
              <h4>Legal</h4>
              <Link to="/terms">Điều khoản</Link>
              <Link to="/privacy">Chính sách bảo mật</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
            <div>
              <h4>Kết nối</h4>
              <div className="socials">
                <a href="#">Facebook</a>
                <a href="#">LinkedIn</a>
                <a href="#">YouTube</a>
              </div>
            </div>
          </div>
        </div>
        <div className="copy">
          <span>© {new Date().getFullYear()} Hero LMS — All rights reserved.</span>
          <span>Trụ sở: 123 Nguyễn Huệ, Q.1, TP.HCM</span>
        </div>
      </footer>

      <div className="sticky-cta">
        <div>
          <strong>Học thử miễn phí 7 ngày</strong>
          <p>Truy cập toàn bộ thư viện khóa học và mentor cá nhân.</p>
        </div>
        <div className="cta-row">
          <button className="btn outline" onClick={() => navigate("/courses")}>
            Khám phá khóa học
          </button>
          <button className="btn primary" onClick={() => navigate("/register")}>
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}
