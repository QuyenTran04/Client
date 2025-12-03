import React from 'react';
import { Wallet, TrendingUp, Gift, Zap, RefreshCw } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import './WalletCard.css';

const WalletCard = ({ balance, loading }) => {
  const { balance: contextBalance, loading: contextLoading, refreshWallet } = useWallet();

  // Use props if provided, otherwise use context values
  const currentBalance = balance !== undefined ? balance : contextBalance;
  const currentLoading = loading !== undefined ? loading : contextLoading;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <div className="wallet-info">
          <div className="wallet-icon">
            <Wallet className="icon" />
          </div>
          <div className="wallet-details">
            <p className="wallet-label">So du vi</p>
            <div className="wallet-balance-wrapper">
              <p className="wallet-balance">
                {currentLoading ? (
                  <span className="wallet-skeleton"></span>
                ) : (
                  `${formatCurrency(currentBalance)} xu`
                )}
              </p>
              <button
                className="wallet-refresh-btn"
                onClick={refreshWallet}
                title="Làm mới số dư"
              >
                <RefreshCw className="refresh-icon" size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="wallet-badge">
          <Zap className="badge-icon" />
          Hot
        </div>
      </div>

      <div className="wallet-footer">
        <div className="wallet-rate">
          <Gift className="rate-icon" />
          <span>1 xu = 1 dong</span>
        </div>
        <button className="wallet-button" onClick={() => window.location.href = '/topup'}>
          <TrendingUp className="button-icon" />
          Nap them
        </button>
      </div>
    </div>
  );
};

export default WalletCard;