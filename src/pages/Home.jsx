// src/pages/Home.jsx
import "../css/home.css";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

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
            <div className="cta-row">
              <Link to="/courses" className="btn primary">
                Khám phá khóa học
              </Link>
              {!user && (
                <Link to="/register" className="btn outline">
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

      {/* GLOBAL SEARCH */}
      <section className="section">
        <div className="container">
          <div className="search-wide">
            <input
              className="ipt grow"
              placeholder="Tìm khóa học, bài giảng, tài liệu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/courses?q=${encodeURIComponent(query)}`);
              }}
            />
            <button
              className="btn primary"
              onClick={() => navigate(`/courses?q=${encodeURIComponent(query)}`)}
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* SUBJECTS GRID */}
      <section className="section" id="subjects">
        <div className="container">
          <h2 className="section-title">Môn học</h2>
          <div className="cards four">
            <Link to="/courses?subject=physics" className="card subject bg-blue">
              <div className="card-body">
                <h3>Vật lý</h3>
                <p className="muted">Cơ học, điện học, quang học...</p>
              </div>
            </Link>
            <Link to="/courses?subject=chemistry" className="card subject bg-purple">
              <div className="card-body">
                <h3>Hóa học</h3>
                <p className="muted">Hóa vô cơ, hữu cơ, phân tích...</p>
              </div>
            </Link>
            <Link to="/courses?subject=biology" className="card subject bg-green">
              <div className="card-body">
                <h3>Sinh học</h3>
                <p className="muted">Sinh tế bào, di truyền, tiến hóa...</p>
              </div>
            </Link>
            <Link to="/courses?subject=history" className="card subject bg-amber">
              <div className="card-body">
                <h3>Lịch sử</h3>
                <p className="muted">Lịch sử Việt Nam và thế giới</p>
              </div>
            </Link>
            <Link to="/courses?subject=geography" className="card subject bg-cyan">
              <div className="card-body">
                <h3>Địa lý</h3>
                <p className="muted">Tự nhiên, kinh tế, xã hội</p>
              </div>
            </Link>
            <Link to="/courses?subject=informatics" className="card subject bg-slate">
              <div className="card-body">
                <h3>Tin học</h3>
                <p className="muted">Lập trình, dữ liệu, CNTT</p>
              </div>
            </Link>
            <Link to="/courses?subject=english" className="card subject bg-pink">
              <div className="card-body">
                <h3>Tiếng Anh</h3>
                <p className="muted">Ngữ pháp, giao tiếp, luyện thi</p>
              </div>
            </Link>
            <Link to="/courses" className="card subject">
              <div className="card-body">
                <h3>Xem tất cả</h3>
                <p className="muted">Khám phá thêm nhiều lĩnh vực khác</p>
              </div>
            </Link>
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
    </div>
  );
}
