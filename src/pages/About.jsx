import "../css/about.css";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="container about-hero__grid">
          <div className="about-hero__text">
            <p className="eyebrow">AlphaLearn AI</p>
            <h1>Biến chuyên môn thành học viện số trong vài ngày</h1>
            <p className="lede">
              Studio AI, CRM học viên và hệ thanh toán gói gọn trong một nền tảng. Từ ý tưởng
              đến launch khóa học, mọi bước đều được AI tăng tốc và giữ chuẩn thương hiệu của bạn.
            </p>
            <div className="hero-actions">
              <Link className="btn primary" to="/courses/create-ai">
                Bắt đầu tạo khóa học
              </Link>
              <Link className="btn ghost" to="/courses">
                Xem thư viện khóa học
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <strong>5 phút</strong>
                <span>Tạo outline + landing page</span>
              </div>
              <div>
                <strong>92%</strong>
                <span>tăng tốc soạn nội dung</span>
              </div>
              <div>
                <strong>40+</strong>
                <span>tích hợp thanh toán & CRM</span>
              </div>
            </div>
          </div>
          <div className="about-hero__panel">
            <div className="panel-card">
              <div className="panel-card__title">Workflow AI → Launch</div>
              <ul>
                <li>Nhập chủ đề & chân dung học viên</li>
                <li>Gen outline, slide, quiz, flashcard</li>
                <li>Xuất script + video + tài liệu ngay</li>
                <li>Publish landing + bật thanh toán + chứng chỉ</li>
              </ul>
            </div>
            <div className="panel-card secondary">
              <div className="panel-card__title">Dành cho đội ngũ</div>
              <p>Phân quyền giảng viên, soạn chung, duyệt nội dung một chạm.</p>
              <p>Quan sát hành vi học, cảnh báo bỏ dở, gợi ý cải thiện nhờ AI.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="section container about-grid">
        <div className="about-card">
          <div className="label">Tầm nhìn</div>
          <h3>Trao quyền cho chuyên gia kiến tạo học viện riêng</h3>
          <p>
            AlphaLearn giúp mọi cá nhân và tổ chức biến chuyên môn thành khóa học hấp dẫn
            với chi phí thấp, thời gian triển khai tính bằng phút thay vì tháng.
          </p>
        </div>
        <div className="about-card">
          <div className="label">Khác biệt</div>
          <h3>AI end-to-end: soạn bài, vận hành, tăng trưởng</h3>
          <p>
            Một nền tảng duy nhất để tạo bài giảng, quiz, tài liệu, chứng chỉ, hỗ trợ học viên
            bằng chatbot và thu học phí với dashboard doanh thu theo thời gian thực.
          </p>
        </div>
        <div className="about-card">
          <div className="label">Cam kết</div>
          <h3>Bảo mật & tuân thủ</h3>
          <p>
            Mã hóa dữ liệu, sao lưu đa tầng, quyền riêng tư theo chuẩn khu vực.
            Bạn sở hữu 100% nội dung và danh sách học viên.
          </p>
        </div>
      </section>

      <section className="section container roadmap">
        <div className="roadmap__head">
          <div>
            <p className="label">Lộ trình sản phẩm</p>
            <h2>Tiến hóa cùng bạn</h2>
            <p className="muted">
              Chúng tôi phát triển liên tục dựa trên phản hồi của giảng viên và học viên.
            </p>
          </div>
          <Link className="btn primary" to="/register">
            Tham gia cộng đồng
          </Link>
        </div>
        <div className="timeline">
          <div className="timeline__item">
            <div className="dot" />
            <div>
              <h4>Studio AI 2.0</h4>
              <p>Gen slide, script video, quiz, flashcard và đề cương marketing bằng một prompt.</p>
            </div>
          </div>
          <div className="timeline__item">
            <div className="dot" />
            <div>
              <h4>Adaptive Learning</h4>
              <p>Cá nhân hóa lộ trình theo điểm quiz, thời gian xem, hành vi tương tác.</p>
            </div>
          </div>
          <div className="timeline__item">
            <div className="dot" />
            <div>
              <h4>Marketing Kit</h4>
              <p>Landing, email nuôi dưỡng và funnel bán khóa học tối ưu bởi AI.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section container callout">
        <div className="callout__text">
          <h2>Xuất bản khóa học đầu tiên với AI ngay hôm nay</h2>
          <p>
            Hãy bắt đầu từ bộ template sẵn có, mời cộng sự cùng soạn bài, và để AI đảm nhận
            phần còn lại. AlphaLearn đồng hành ở mọi bước – từ ý tưởng đến doanh thu.
          </p>
        </div>
        <div className="callout__actions">
          <Link className="btn primary" to="/courses/create-ai">
            Tạo khóa học
          </Link>
          <Link className="btn ghost" to="/login">
            Đăng nhập
          </Link>
        </div>
      </section>
    </div>
  );
}

