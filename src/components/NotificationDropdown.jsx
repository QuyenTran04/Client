import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, CheckCircle, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const { notifications, unreadCount, loading, refetch } = useNotifications();
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

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error':
        return <X className="text-red-500" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  // Format time relative to now
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className={`icon-btn ${isOpen ? 'active' : ''}`}
        aria-label={`Thông báo (${unreadCount} chưa đọc)`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notification-header">
            <h3>Thông báo</h3>
            <button
              className="refresh-btn"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <RefreshCw className="spinner" size={20} />
                <span>Đang tải...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={32} className="text-gray-400" />
                <span>Không có thông báo mới</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.description}</p>
                    <span className="notification-time">
                      {formatTime(new Date(notification.createdAt))}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="notification-indicator" />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button className="view-all-btn">Xem tất cả</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;