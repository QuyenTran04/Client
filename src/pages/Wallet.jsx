import React, { useState, useEffect, useContext } from 'react';
import { Wallet as WalletIcon, TrendingUp, Plus, History, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import './Wallet.css';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

const Wallet = () => {
  const { user, loading: authLoading } = useAuth();
  const { walletData, transactions, loading, refreshing, refreshWallet, lastUpdated } = useWallet();
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const handleRefresh = async () => {
    setLocalRefreshing(true);
    await refreshWallet();
    setLocalRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup_momo':
      case 'topup_momo_manual':
        return <ArrowUpRight className="icon up" />;
      case 'charge':
      case 'charge_aiCourse':
      case 'charge_aiQuiz':
      case 'charge_aiPractice':
        return <ArrowDownRight className="icon down" />;
      default:
        return <WalletIcon className="icon" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup_momo':
      case 'topup_momo_manual':
        return '#10b981'; // green
      case 'charge':
      case 'charge_aiCourse':
      case 'charge_aiQuiz':
      case 'charge_aiPractice':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getTransactionText = (type) => {
    switch (type) {
      case 'topup_momo':
        return 'Nạp tiền MoMo';
      case 'topup_momo_manual':
        return 'Nạp tiền (Manually)';
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

  if (loading || authLoading) {
    return (
      <div className="wallet-container">
        <div className="loading-spinner">
          <RefreshCw className="spinner" />
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wallet-container">
        <div className="auth-required">
          <div className="auth-icon">
            <WalletIcon className="icon" />
          </div>
          <h2>Yêu cầu đăng nhập</h2>
          <p>Vui lòng đăng nhập để quản lý ví của bạn</p>
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
    <div className="wallet-container">
      <div className="wallet-content">
        {/* Header */}
        <div className="wallet-header">
          <div className="header-left">
            <h1 className="page-title">Ví của tôi</h1>
            <p className="page-subtitle">Quản lý xu và xem lịch sử giao dịch</p>
          </div>
          <div className="header-actions">
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={localRefreshing}
            >
              <RefreshCw className={`icon ${localRefreshing ? 'spinning' : ''}`} />
              Làm mới
            </button>
            <button
              className="topup-btn"
              onClick={() => window.location.href = '/topup'}
            >
              <Plus className="icon" />
              Nạp xu
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="balance-overview">
          <div className="balance-main">
            <div className="balance-header">
              <div className="balance-icon">
                <WalletIcon className="wallet-icon" />
              </div>
              <div className="balance-info">
                <h2>Số dư hiện tại</h2>
                <div className="balance-amount">
                  <span className="balance-number">{walletData?.wallet?.balance?.toLocaleString() || 0}</span>
                  <span className="balance-unit">xu</span>
                </div>
                <p className="balance-rate">1 xu = 1 đồng</p>
                {lastUpdated && (
                  <p className="last-updated">
                    Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
            <div className="balance-actions">
              <button
                className="primary-action"
                onClick={() => window.location.href = '/topup'}
              >
                <Plus className="icon" />
                Nạp xu ngay
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <ArrowUpRight className="icon" />
              </div>
              <div className="stat-info">
                <p className="stat-label">Đã nạp</p>
                <p className="stat-value">
                  {transactions
                    .filter(t => t.type === 'topup_momo' || t.type === 'topup_momo_manual')
                    .reduce((sum, t) => sum + (t.amount || t.coins || 0), 0)
                    .toLocaleString()} xu
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">
                <ArrowDownRight className="icon" />
              </div>
              <div className="stat-info">
                <p className="stat-label">Đã sử dụng</p>
                <p className="stat-value">
                  {transactions
                    .filter(t => t.type === 'charge' || t.type.includes('charge_'))
                    .reduce((sum, t) => sum + (t.amount || t.coins || 0), 0)
                    .toLocaleString()} xu
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <History className="icon" />
              </div>
              <div className="stat-info">
                <p className="stat-label">Tổng giao dịch</p>
                <p className="stat-value">{transactions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="transactions-section">
          <div className="section-header">
            <h2 className="section-title">
              <History className="icon" />
              Lịch sử giao dịch
            </h2>
            <span className="transaction-count">{transactions.length} giao dịch</span>
          </div>

          <div className="transactions-list">
            {transactions.length === 0 ? (
              <div className="empty-state">
                <History className="empty-icon" />
                <h3>Chưa có giao dịch nào</h3>
                <p>Bạn chưa thực hiện giao dịch nào. Nạp xu để bắt đầu sử dụng dịch vụ!</p>
                <button
                  className="empty-action"
                  onClick={() => window.location.href = '/topup'}
                >
                  <Plus className="icon" />
                  Nạp xu đầu tiên
                </button>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div className="transaction-icon" style={{ color: getTransactionColor(transaction.type) }}>
                    {getTransactionIcon(transaction.type)}
                  </div>

                  <div className="transaction-info">
                    <h4 className="transaction-title">{getTransactionText(transaction.type)}</h4>
                    <p className="transaction-description">{transaction.description || transaction.reason || 'Giao dịch'}</p>
                    <div className="transaction-meta">
                      <Calendar className="meta-icon" />
                      <span className="transaction-date">{formatDate(transaction.createdAt)}</span>
                      {transaction.metadata?.orderId && (
                        <span className="transaction-id">Mã: {transaction.metadata.orderId}</span>
                      )}
                    </div>
                  </div>

                  <div className="transaction-amount">
                    <span className="amount" style={{ color: getTransactionColor(transaction.type) }}>
                      {(transaction.type === 'topup_momo' || transaction.type === 'topup_momo_manual') ? '+' : '-'}{transaction.amount?.toLocaleString() || transaction.coins?.toLocaleString() || 0} xu
                    </span>
                    {transaction.metadata?.topUpId && (
                      <button
                        className="view-receipt"
                        onClick={() => window.open(`/topup`, '_blank')}
                      >
                        <ExternalLink className="icon" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="quick-title">Thao tác nhanh</h3>
          <div className="actions-grid">
            <button
              className="action-card primary"
              onClick={() => window.location.href = '/topup'}
            >
              <Plus className="icon" />
              <span>Nạp xu</span>
            </button>

            <button
              className="action-card"
              onClick={() => window.location.href = '/courses'}
            >
              <History className="icon" />
              <span>Khoá học của tôi</span>
            </button>

            <button
              className="action-card"
              onClick={() => window.location.href = '/practice'}
            >
              <TrendingUp className="icon" />
              <span>Luyện tập</span>
            </button>

            <button
              className="action-card"
              onClick={() => window.location.href = '/courses/create-ai'}
            >
              <Plus className="icon" />
              <span>Tạo khóa học AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;