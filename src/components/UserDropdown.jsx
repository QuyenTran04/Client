import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Wallet, Plus, Settings, LogOut, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import './UserDropdown.css';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const { balance: walletBalance, loading, refreshWallet } = useWallet();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('vi-VN').format(balance);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button
        className="userbox-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={user.name}
      >
        <div className="userbox">
          <div className="avatar">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="user hide-sm">{user.name}</span>
          <ChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {/* User Info Header */}
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="user-details">
                <h4>{user.name}</h4>
                <p>{user.email || user.phone || 'user@example.com'}</p>
              </div>
            </div>
            <div className="wallet-preview">
              <div className="wallet-balance">
                <span className="wallet-label">Số dư ví</span>
                <div className="wallet-amount-wrapper">
                  <span className="wallet-amount">
                    {loading ? (
                      <div className="balance-skeleton"></div>
                    ) : (
                      `${formatBalance(walletBalance)} xu`
                    )}
                  </span>
                  <button
                    className="refresh-wallet-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshWallet();
                    }}
                    title="Làm mới số dư"
                  >
                    <RefreshCw className="refresh-icon" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="dropdown-actions">
            <Link
              to="/profile"
              className="action-item"
              onClick={() => setIsOpen(false)}
            >
              <Wallet className="item-icon" />
              <div className="item-content">
                <span className="item-title">Trang cá nhân</span>
                <span className="item-subtitle">Quản lý ví và thông tin</span>
              </div>
              <ChevronDown className="item-arrow" />
            </Link>

            <button
              className="action-item primary"
              onClick={() => {
                setIsOpen(false);
                navigate('/topup');
              }}
            >
              <Plus className="item-icon" />
              <div className="item-content">
                <span className="item-title">Nạp xu</span>
                <span className="item-subtitle">Thêm xu vào tài khoản</span>
              </div>
              <ChevronDown className="item-arrow" />
            </button>

  
            <Link
              to="/settings"
              className="action-item"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="item-icon" />
              <div className="item-content">
                <span className="item-title">Cài đặt</span>
                <span className="item-subtitle">Tùy chỉnh hệ thống</span>
              </div>
              <ChevronDown className="item-arrow" />
            </Link>
          </div>

          {/* Footer */}
          <div className="dropdown-footer">
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut className="logout-icon" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;