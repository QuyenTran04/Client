import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Clock,
  CreditCard,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
  FileText
} from 'lucide-react';
import './Profile.css';
import '../css/course-card-danger.css';
import '../css/courses.css';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useProfileData } from '../hooks/useProfileData';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { walletData, transactions, refreshing, refreshWallet } = useWallet();
  const {
    myCourses,
    paymentMethods,
    usageData,
    loading: profileLoading,
    error: profileError,
    stats,
    refreshCourses,
    refreshPaymentMethods,
    refreshUsageData
  } = useProfileData();

  const [activeTab, setActiveTab] = useState('profile');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [email2FA, setEmail2FA] = useState('');
  const DEFAULT_COVER = "/assets/cover-1.png";

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getUsageIcon = (type) => {
    switch (type) {
      case 'course_creation':
        return <BookOpen className="usage-icon" />;
      case 'ai_generation':
        return <Zap className="usage-icon" />;
      case 'quiz_creation':
        return <FileText className="usage-icon" />;
      default:
        return <Activity className="usage-icon" />;
    }
  };

  const getUsageColor = (type) => {
    switch (type) {
      case 'course_creation':
        return '#00bfa4';
      case 'ai_generation':
        return '#00c6c2';
      case 'quiz_creation':
        return '#009b87';
      default:
        return '#7a8a9f';
    }
  };

  const getUsageTypeText = (type) => {
    switch (type) {
      case 'course_creation':
        return 'Tạo khóa học';
      case 'ai_generation':
        return 'Tạo nội dung AI';
      case 'quiz_creation':
        return 'Tạo bài trắc nghiệm';
      default:
        return 'Giao dịch';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup_momo':
      case 'topup_momo_manual':
        return <ArrowUpRight className="transaction-icon" />;
      case 'charge':
      case 'charge_aiCourse':
      case 'charge_aiQuiz':
      case 'charge_aiPractice':
        return <ArrowDownRight className="transaction-icon" />;
      default:
        return <Activity className="transaction-icon" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup_momo':
      case 'topup_momo_manual':
        return '#00bfa4';
      case 'charge':
      case 'charge_aiCourse':
      case 'charge_aiQuiz':
      case 'charge_aiPractice':
        return '#f59e0b';
      default:
        return '#7a8a9f';
    }
  };

  const getTransactionText = (type) => {
    switch (type) {
      case 'topup_momo':
        return 'Nạp tiền MoMo';
      case 'topup_momo_manual':
        return 'Nạp tiền thủ công';
      case 'charge':
        return 'Sử dụng dịch vụ';
      case 'charge_aiCourse':
        return 'Tạo khóa học AI';
      case 'charge_aiQuiz':
        return 'Tạo quiz AI';
      case 'charge_aiPractice':
        return 'Tạo bài luyện tập AI';
      default:
        return 'Giao dịch';
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-orb">
            <RefreshCw className="loading-icon" />
          </div>
          <p className="loading-text">
            {authLoading ? 'Đang tải thông tin...' : 'Đang tải dữ liệu profile...'}
          </p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile-container">
        <div className="error-container">
          <div className="error-icon">
            <AlertCircle />
          </div>
          <h2>Lỗi tải dữ liệu</h2>
          <p>{profileError}</p>
          <button
            className="auth-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="auth-container">
          <div className="auth-icon">
            <User />
          </div>
          <h2>Yêu cầu đăng nhập</h2>
          <p>Vui lòng đăng nhập để truy cập trang cá nhân</p>
          <button
            className="auth-button"
            onClick={() => window.location.href = '/login'}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Background decoration */}
      <div className="bg-decoration">
        <div className="decoration-circle decoration-1"></div>
        <div className="decoration-circle decoration-2"></div>
        <div className="decoration-circle decoration-3"></div>
      </div>

      
      <div className="profile-content">
        {/* Sidebar Navigation */}
        <div className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="nav-icon" />
            <div className="nav-content">
              <div className="nav-title">Hồ sơ</div>
              <div className="nav-subtitle">Thông tin cá nhân</div>
            </div>
          </div>

          <div
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield className="nav-icon" />
            <div className="nav-content">
              <div className="nav-title">Bảo mật</div>
              <div className="nav-subtitle">Mật khẩu & bảo vệ</div>
            </div>
          </div>

          <div
            className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <CreditCard className="nav-icon" />
            <div className="nav-content">
              <div className="nav-title">Thanh toán</div>
              <div className="nav-subtitle">Ví & phương thức</div>
            </div>
          </div>

          <div
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen className="nav-icon" />
            <div className="nav-content">
              <div className="nav-title">Khóa học đã tạo</div>
              <div className="nav-subtitle">Quản lý khóa học</div>
            </div>
          </div>

          <div
            className={`nav-item ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            <Clock className="nav-icon" />
            <div className="nav-content">
              <div className="nav-title">Lịch sử sử dụng</div>
              <div className="nav-subtitle">Theo dõi chi tiêu</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-main">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              {/* Sub-tabs */}
              <div className="sub-tabs">
                <button
                  className={`sub-tab ${activeSubTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('overview')}
                >
                  Tổng quan
                </button>
                <button
                  className={`sub-tab ${activeSubTab === 'personal' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('personal')}
                >
                  Thông tin cá nhân
                </button>
              </div>

              {/* Overview Sub-tab */}
              {activeSubTab === 'overview' && (
                <div className="overview-content">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <BookOpen />
                      </div>
                      <div className="stat-number">{stats.totalCourses}</div>
                      <div className="stat-text">Khóa học đã tạo</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Users />
                      </div>
                      <div className="stat-number">
                        {stats.totalStudents}
                      </div>
                      <div className="stat-text">Tổng học viên</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Award />
                      </div>
                      <div className="stat-number">
                        {stats.averageRating}
                      </div>
                      <div className="stat-text">Đánh giá trung bình</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Target />
                      </div>
                      <div className="stat-number">
                        {stats.totalUsedCoins}
                      </div>
                      <div className="stat-text">Xu đã dùng</div>
                    </div>
                  </div>

                  <div className="content-card">
                    <div className="card-header">
                      <h3 className="card-title">Hoạt động gần đây</h3>
                      <button
                        className="refresh-btn-sm"
                        onClick={refreshUsageData}
                        title="Làm mới dữ liệu"
                      >
                        <RefreshCw className="refresh-icon" />
                      </button>
                    </div>
                    <div className="recent-activity">
                      {usageData.length === 0 ? (
                        <div className="empty-state">
                          <Activity className="empty-icon" />
                          <h4>Chưa có hoạt động</h4>
                          <p>Bạn chưa thực hiện giao dịch nào gần đây</p>
                        </div>
                      ) : (
                        usageData.slice(0, 3).map((item) => (
                          <div key={item.id} className="activity-item">
                            <div className="activity-icon" style={{ color: getUsageColor(item.type) }}>
                              {getUsageIcon(item.type)}
                            </div>
                            <div className="activity-details">
                              <p className="activity-text">{item.description}</p>
                              <span className="activity-date">{formatDate(item.date)}</span>
                            </div>
                            <div className="activity-amount" style={{ color: getUsageColor(item.type) }}>
                              -{item.amount.toLocaleString()} xu
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Info Sub-tab */}
              {activeSubTab === 'personal' && (
                <div className="personal-content">
                  <div className="content-card">
                    <h3 className="card-title">Thông tin cá nhân</h3>
                    <div className="form-section">
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Họ và tên</label>
                          <input
                            type="text"
                            className="form-input"
                            defaultValue={user.name || ''}
                            placeholder="Nhập họ và tên"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-input"
                            defaultValue={user.email || ''}
                            placeholder="Nhập email"
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Số điện thoại</label>
                          <input
                            type="tel"
                            className="form-input"
                            defaultValue={user.phone || ''}
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Ngày sinh</label>
                          <input
                            type="date"
                            className="form-input"
                            defaultValue={user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''}
                          />
                        </div>
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">Giới thiệu</label>
                        <textarea
                          className="form-input"
                          rows={4}
                          placeholder="Giới thiệu ngắn về bản thân..."
                          defaultValue={user.bio || ''}
                        />
                      </div>
                    </div>
                    <div className="btn-group">
                      <button className="btn-primary">Lưu thay đổi</button>
                      <button className="btn-secondary">Hủy</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="content-card">
                <h3 className="card-title">Bảo mật tài khoản</h3>

                <div className="security-item">
                  <div className="security-info">
                    <h4>Mật khẩu</h4>
                    <p>Đổi mật khẩu đăng nhập của bạn</p>
                  </div>
                  <div className="security-actions">
                    <button
                      className="btn-outline"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      {showPasswordForm ? 'Hủy' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </div>

                {showPasswordForm && (
                  <div className="password-form">
                    <div className="form-group">
                      <label className="form-label">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Mật khẩu mới</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Nhập mật khẩu mới"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu mới</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Nhập lại mật khẩu mới"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="btn-group">
                      <button className="btn-primary">Cập nhật mật khẩu</button>
                    </div>
                  </div>
                )}

                <div className="security-item">
                  <div className="security-info">
                    <h4>Xác thực hai yếu tố (2FA)</h4>
                    <p>Bảo vệ tài khoản với lớp bảo mật bổ sung</p>
                  </div>
                  <div className="security-actions">
                    <span className="security-status pending">
                      <AlertCircle />
                      Chưa kích hoạt
                    </span>
                    <button
                      className="btn-primary"
                      onClick={() => setShow2FAModal(true)}
                    >
                      Kích hoạt 2FA
                    </button>
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>Phiên đăng nhập</h4>
                    <p>Quản lý các thiết bị đang đăng nhập</p>
                  </div>
                  <div className="security-actions">
                    <button className="btn-outline">Quản lý phiên</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="tab-content">
              <div className="content-card">
                <h3 className="card-title">Ví của tôi</h3>
                <div className="balance-display">
                  <div className="balance-amount">
                    {walletData?.balance?.toLocaleString() || '0'} xu
                  </div>
                  <div className="balance-label">Số dư khả dụng</div>
                  <button className="refresh-btn" onClick={refreshWallet}>
                    <RefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
                  </button>
                </div>
                <div className="btn-group">
                  <button className="btn-primary">
                    <Plus />
                    Nạp xu
                  </button>
                  <button className="btn-secondary">
                    <Download />
                    Rút xu
                  </button>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3 className="card-title">Phương thức thanh toán</h3>
                  <button
                    className="refresh-btn-sm"
                    onClick={refreshPaymentMethods}
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className="refresh-icon" />
                  </button>
                </div>
                <div className="payment-methods">
                  {paymentMethods.length === 0 ? (
                    <div className="empty-payments">
                      <CreditCard className="empty-icon" />
                      <h4>Chưa có phương thức thanh toán</h4>
                      <p>Thêm phương thức thanh toán để tiện lợi hơn</p>
                      <button className="add-payment-method">
                        <Plus />
                        Thêm phương thức
                      </button>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method.id} className="payment-method">
                        <div className="method-info">
                          <div className="method-icon">
                            {method.type === 'momo' ? <Smartphone /> : <CreditCard />}
                          </div>
                          <div className="method-details">
                            <h4>{method.name}</h4>
                            <p>**** {method.last4}</p>
                          </div>
                        </div>
                        <div className="method-actions">
                          {method.isDefault && (
                            <span className="default-badge">Mặc định</span>
                          )}
                          <button className="btn-outline btn-sm">Xóa</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="content-card">
                <h3 className="card-title">Lịch sử giao dịch</h3>
                <div className="transactions-table">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div key={transaction._id} className="transaction-item">
                        <div className="transaction-icon" style={{ color: getTransactionColor(transaction.type) }}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="transaction-details">
                          <h4>{getTransactionText(transaction.type)}</h4>
                          <p>{formatDate(transaction.createdAt)}</p>
                        </div>
                        <div className="transaction-amount" style={{
                          color: transaction.type.startsWith('topup') ? '#10b981' : '#f59e0b'
                        }}>
                          {transaction.type.startsWith('topup') ? '+' : '-'}
                          {transaction.amount.toLocaleString()} xu
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <Clock className="empty-icon" />
                      <h4>Chưa có giao dịch</h4>
                      <p>Bạn chưa có giao dịch nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="tab-content">
              <div className="courses-header">
                <h3>Khóa học đã tạo ({myCourses.length})</h3>
                <div className="header-actions">
                  <button
                    className="btn-outline"
                    onClick={refreshCourses}
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className="btn-icon" />
                    Làm mới
                  </button>
                  <button className="btn-primary">
                    <Plus />
                    Tạo khóa học mới
                  </button>
                </div>
              </div>

              <div className="courses-grid">
                {myCourses.length === 0 ? (
                  <div className="empty-courses">
                    <BookOpen className="empty-icon" />
                    <h4>Chưa có khóa học nào</h4>
                    <p>Bạn chưa tạo khóa học nào. Hãy bắt đầu tạo khóa học đầu tiên!</p>
                    <button
                      className="btn-primary"
                      onClick={() => window.location.href = '/courses/create-ai'}
                    >
                      <Plus />
                      Tạo khóa học với AI
                    </button>
                  </div>
                ) : (
                  <div className="course-cards-container">
                    {myCourses.map((course) => (
                      <CourseCard
                        key={course._id}
                        c={course}
                        isProfile={true}
                        onDeleted={() => {
                          // Refresh courses after deletion
                          refreshCourses();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usage History Tab */}
          {activeTab === 'usage' && (
            <div className="tab-content">
              <div className="usage-header">
                <div className="header-left">
                  <h3>Lịch sử sử dụng xu</h3>
                  <button
                    className="refresh-btn-sm"
                    onClick={refreshUsageData}
                    title="Làm mới dữ liệu"
                  >
                    <RefreshCw className="refresh-icon" />
                  </button>
                </div>
                <div className="usage-summary">
                  <div className="usage-stat">
                    <div className="stat-value">
                      {stats.totalUsedCoins.toLocaleString()}
                    </div>
                    <div className="stat-label">Tổng số xu đã dùng</div>
                  </div>
                  <div className="usage-stat">
                    <div className="stat-value">
                      {usageData.filter(item => item.status === 'completed').length}
                    </div>
                    <div className="stat-label">Giao dịch thành công</div>
                  </div>
                  <div className="usage-stat">
                    <div className="stat-value">
                      {usageData.filter(item => item.type === 'course_creation').length}
                    </div>
                    <div className="stat-label">Lần tạo khóa học</div>
                  </div>
                </div>
              </div>

              <div className="usage-chart">
                <div className="chart-header">
                  <h4>Biểu đồ sử dụng</h4>
                  <div className="chart-controls">
                    <button className="chart-control">
                      <Filter className="control-icon" />
                      Lọc
                    </button>
                    <button className="chart-control">
                      <Download className="control-icon" />
                      Tải xuống
                    </button>
                  </div>
                </div>
                <div className="chart-container">
                  <div className="chart-placeholder">
                    <BarChart3 className="chart-icon" />
                    <p>Biểu đồ sử dụng xu theo thời gian</p>
                  </div>
                </div>
              </div>

              <div className="usage-list">
                <div className="list-header">
                  <h4>Chi tiết sử dụng</h4>
                  <div className="list-controls">
                    <div className="search-box">
                      <Search className="search-icon" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm giao dịch..."
                        className="search-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="usage-items">
                  {usageData.length === 0 ? (
                    <div className="empty-state">
                      <Activity className="empty-icon" />
                      <h4>Chưa có dữ liệu sử dụng</h4>
                      <p>Bạn chưa sử dụng xu nào. Sử dụng dịch vụ để xem lịch sử!</p>
                    </div>
                  ) : (
                    usageData.map((item) => (
                      <div key={item.id} className="usage-item">
                        <div
                          className="usage-icon-wrapper"
                          style={{ backgroundColor: `${getUsageColor(item.type)}20` }}
                        >
                          <div
                            className="usage-icon"
                            style={{ color: getUsageColor(item.type) }}
                          >
                            {getUsageIcon(item.type)}
                          </div>
                        </div>
                        <div className="usage-details">
                          <h5>{getUsageTypeText(item.type)}</h5>
                          <p>{item.description}</p>
                          <div className="usage-meta">
                            <span className="usage-date">
                              {formatDate(item.date)}
                            </span>
                            <span className={`usage-status ${item.status}`}>
                              {item.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                            </span>
                          </div>
                        </div>
                        <div className="usage-amount">
                          <span style={{ color: getUsageColor(item.type) }}>
                            -{item.amount.toLocaleString()} xu
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Kích hoạt xác thực hai yếu tố</h3>
              <button
                className="modal-close"
                onClick={() => setShow2FAModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Nhập email để nhận mã xác thực 2FA:</p>
              <input
                type="email"
                className="form-input"
                placeholder="Nhập email của bạn"
                value={email2FA}
                onChange={(e) => setEmail2FA(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShow2FAModal(false)}
              >
                Hủy
              </button>
              <button className="btn-primary">
                Gửi mã xác thực
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
