import React, { useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Smartphone,
  QrCode,
  Shield,
  Zap,
  Gift,
  CheckCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Diamond,
  Crown
} from 'lucide-react';
import './TopUp.css';
import walletService from '../services/walletService';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

const amountOptions = [
  { value: 10000, label: '10.000đ', bonus: 0, popular: false },
  { value: 20000, label: '20.000đ', bonus: 0, popular: false },
  { value: 50000, label: '50.000đ', bonus: 5000, popular: true },
  { value: 100000, label: '100.000đ', bonus: 15000, popular: false },
  { value: 200000, label: '200.000đ', bonus: 35000, popular: false },
  { value: 500000, label: '500.000đ', bonus: 100000, popular: false }
];

const paymentMethods = [
  { id: 'momo', name: 'MoMo', icon: Smartphone, color: '#dc2626' },
  { id: 'card', name: 'Thẻ ngân hàng', icon: CreditCard, color: '#3b82f6' },
  { id: 'qr', name: 'QR Code', icon: QrCode, color: '#10b981' }
];

const TopUp = () => {
  const { user, loading: authLoading } = useAuth();
  const { balance: walletBalance, loading, refreshWallet } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!user && !authLoading) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này.');
    } else {
      setError('');
    }
  }, [user, authLoading]);

  const handleTopUp = async () => {
    const amount = selectedAmount || parseInt(customAmount || '0', 10);
    if (!amount || amount < 10000) {
      setError('Vui lòng chọn mệnh giá tối thiểu 10.000đ');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      const response = await walletService.createMomoTopUp(amount);
      setPaymentData(response);

      if (response.payUrl || response.deeplink) {
        const paymentUrl = response.payUrl || response.deeplink;
        window.open(paymentUrl, '_blank');
        setShowSuccess(true);

        setTimeout(() => {
          refreshWallet();
          setShowSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Top-up error:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading || authLoading) {
    return (
      <div className="topup-container">
        <div className="loading-spinner">
          <Loader2 className="spinner" />
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="topup-container">
        <div className="auth-required">
          <div className="auth-icon">
            <Wallet className="icon" />
          </div>
          <h2>Yêu cầu đăng nhập</h2>
          <p>Vui lòng đăng nhập để sử dụng tính năng nạp xu</p>
          <button
            className="login-btn"
            onClick={() => window.location.href = '/login'}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="topup-container">
      <div className="topup-content">
        <div className="topup-header">
          <div className="topup-icon">
            <Wallet className="header-icon" />
          </div>
          <h1 className="topup-title">Nạp Xu</h1>
          <p className="topup-subtitle">
            <Sparkles className="inline-icon" size={16} />
            Nạp xu để mở khóa các tính năng cao cấp
            <Diamond className="inline-icon" size={16} />
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError('')} className="close-btn">×</button>
          </div>
        )}

        <div className="balance-card">
          <div className="balance-header">
            <div className="balance-info">
              <p className="balance-label">Số dư hiện tại</p>
              <div className="balance-amount">
                <span className="balance-number">{walletBalance.toLocaleString()}</span>
                <span className="balance-unit">xu</span>
              </div>
              <p className="balance-rate">1 xu = 1 đồng</p>
            </div>
            <div className="balance-gift">
              <Gift className="gift-icon" />
            </div>
          </div>
        </div>

        {paymentData && (
          <div className="payment-info">
            <h3>Thông tin thanh toán</h3>
            <div className="payment-details">
              <p><strong>Mã đơn hàng:</strong> {paymentData.orderId}</p>
              <p><strong>Số xu nhận được:</strong> {paymentData.coins?.toLocaleString() || 0} xu</p>
              <p><strong>Số tiền:</strong> {formatCurrency(paymentData.amount)}</p>
              <button
                className="payment-link-btn"
                onClick={() => window.open(paymentData.payUrl || paymentData.deeplink, '_blank')}
              >
                <ExternalLink className="icon" />
                Mở trang thanh toán
              </button>
            </div>
          </div>
        )}

        <div className="amount-section">
          <h2 className="section-title">
            <TrendingUp className="title-icon" />
            Chọn mệnh giá
          </h2>

          <div className="amount-grid">
            {amountOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedAmount(option.value);
                  setCustomAmount('');
                  setError('');
                }}
                className={`amount-button ${selectedAmount === option.value ? 'selected' : ''}`}
              >
                {option.popular && (
                  <span className="popular-badge">Nhiều người chọn</span>
                )}
                <div className="amount-content">
                  <p className="amount-label">{option.label}</p>
                  <p className="amount-xu">{option.value.toLocaleString()} xu</p>
                  {option.bonus > 0 && (
                    <p className="amount-bonus">+{option.bonus.toLocaleString()} xu</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="custom-amount">
            <input
              type="number"
              placeholder="Nhập số tiền tuỳ chỉnh (tối thiểu 10.000đ)"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
                setError('');
              }}
              min="10000"
              step="1000"
              className="custom-input"
            />
            {customAmount && !Number.isNaN(parseInt(customAmount, 10)) && (
              <span className="custom-display">
                {parseInt(customAmount, 10).toLocaleString()} xu
              </span>
            )}
          </div>
        </div>

        <div className="payment-section">
          <h2 className="section-title">
            <CreditCard className="title-icon" />
            Phương thức thanh toán
          </h2>

          <div className="payment-grid">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`payment-button ${selectedPayment === method.id ? 'selected' : ''}`}
                disabled={method.id !== 'momo'}
              >
                <div className="payment-content">
                  <div
                    className="payment-icon"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    <method.icon
                      className="icon"
                      style={{ color: method.color }}
                    />
                  </div>
                  <span className="payment-name">{method.name}</span>
                  {method.id !== 'momo' && (
                    <span className="coming-soon">Sắp có</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="features-section">
          <h2 className="features-title">
            <Crown className="crown-icon" />
            Tại sao chọn chúng tôi?
          </h2>
          <div className="features-grid">
            {[
              { icon: Shield, text: 'Bảo mật tuyệt đối', color: '#0ec6b2', desc: 'Mã hóa SSL 256-bit' },
              { icon: Zap, text: 'Nạp liền tay', color: '#f59e0b', desc: 'Hoàn tất trong 30 giây' },
              { icon: Gift, text: 'Nhiều ưu đãi', color: '#6366f1', desc: 'Khuyến mãi mỗi ngày' },
              { icon: Diamond, text: 'Đa dạng lựa chọn', color: '#22d3ee', desc: 'Phù hợp mọi nhu cầu' }
            ].map((feature, index) => (
              <div key={index} className="feature-item" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="feature-icon-wrapper" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon className="feature-icon" style={{ color: feature.color }} />
                </div>
                <div className="feature-content">
                  <span className="feature-text">{feature.text}</span>
                  <span className="feature-desc">{feature.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleTopUp}
          disabled={isProcessing || (!selectedAmount && !customAmount)}
          className={`topup-button ${isProcessing || (!selectedAmount && !customAmount) ? 'disabled' : ''}`}
        >
          {isProcessing ? (
            <div className="button-loading">
              <Loader2 className="loading-icon" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            'Nạp Xu Ngay'
          )}
        </button>

        {showSuccess && (
          <div className="success-message">
            <CheckCircle className="success-icon" />
            <div>
              <strong>Đã tạo yêu cầu thanh toán!</strong>
              <p>Vui lòng hoàn tất thanh toán trên trang MoMo</p>
            </div>
          </div>
        )}

        <div className="instructions">
          <h3 className="instructions-title">
            <Zap className="instructions-icon" />
            Hướng dẫn nạp tiền
          </h3>
          <div className="instructions-steps">
            {[
              { step: 1, text: 'Chọn mệnh giá muốn nạp', icon: '↗' },
              { step: 2, text: 'Nhấn "Nạp Xu Ngay"', icon: '✓' },
              { step: 3, text: 'Hoàn tất thanh toán trên MoMo', icon: '⚡' },
              { step: 4, text: 'Xu được cộng trực tiếp vào ví', icon: '➜' }
            ].map((item, index) => (
              <div key={index} className="instruction-item" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="step-number">{item.step}</div>
                <div className="step-content">
                  <span className="step-icon">{item.icon}</span>
                  <span className="step-text">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUp;
