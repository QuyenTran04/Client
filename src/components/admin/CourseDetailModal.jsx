import React, { useState } from 'react';
import { X, BookOpen, Users, DollarSign, Calendar, Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CourseDetailModal = ({ course, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isHovered, setIsHovered] = useState(false);

  if (!course) return null;

  const stats = [
    { label: 'Học viên', value: course.enrollmentCount || 0, icon: '👥', gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
    { label: 'Bài học', value: course.lessonCount || 0, icon: '📚', gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100' },
    { label: 'Đánh giá', value: course.avgRating?.toFixed(1) || '0.0', icon: '⭐', gradient: 'from-yellow-500 to-yellow-600', bgGradient: 'from-yellow-50 to-yellow-100' },
    { label: 'Giá', value: `${(course.price || 0).toLocaleString('vi-VN')}₫`, icon: '💰', gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' }
  ];

  return (
    <>
      <div className="course-modal-overlay" onClick={onClose}>
        <div className="course-modal-container" onClick={(e) => e.stopPropagation()} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <div className="course-modal-backdrop">
            <div className="gradient-orb" />
            <div className="floating-elements">
              <div className="floating-element" style={{ '--delay': '0s' }}>📚</div>
              <div className="floating-element" style={{ '--delay': '1s' }}>🎓</div>
              <div className="floating-element" style={{ '--delay': '2s' }}>✨</div>
              <div className="floating-element" style={{ '--delay': '3s' }}>💡</div>
            </div>
          </div>

          <div className="course-modal-content">
            <div className="course-modal-header">
              <div className="header-content">
                <div className="header-icon">
                  <BookOpen size={24} />
                  <div className="icon-ring" />
                </div>
                <div className="header-text">
                  <h2>Chi tiết khóa học</h2>
                  <p>Xem thông tin đầy đủ về khóa học</p>
                </div>
              </div>
              <button className="course-modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="course-info-banner">
              <div className="course-thumbnail-wrapper">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.title} className="course-thumbnail" />
                ) : (
                  <div className="course-thumbnail-placeholder">
                    <BookOpen size={48} />
                  </div>
                )}
              </div>
              <div className="course-info-text">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span className="meta-item">
                    <User size={14} />
                    {course.instructor?.name || 'Chưa có'}
                  </span>
                  <span className="meta-item">
                    <Calendar size={14} />
                    {format(new Date(course.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                  <span className={`status-badge ${course.published ? 'published' : 'draft'}`}>
                    {course.published ? '✓ Đã xuất bản' : '○ Bản nháp'}
                  </span>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className={`stat-icon bg-gradient-to-br ${stat.bgGradient}`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className="stat-content">
                    <div className={`stat-value bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="tabs-container">
              {['overview', 'content'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab === 'overview' ? '📊 Tổng quan' : '📝 Nội dung'}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="info-grid">
                  <div className="info-section">
                    <h4 className="section-title">📋 Thông tin cơ bản</h4>
                    <div className="info-list">
                      <div className="info-row">
                        <span className="info-label">Mã khóa học:</span>
                        <span className="info-value">#{course._id.slice(-6)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Người tạo:</span>
                        <div className="info-value-group">
                          <div className="font-medium">{course.instructor?.name || 'Chưa có'}</div>
                          <div className="text-xs text-gray-500">{course.instructor?.email || ''}</div>
                        </div>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Thời gian tạo:</span>
                        <span className="info-value">{format(new Date(course.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Danh mục:</span>
                        <span className="info-value">{course.category?.name || 'Chưa có'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Giá:</span>
                        <span className="info-value text-blue-600 font-semibold">{(course.price || 0).toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h4 className="section-title">⚙️ Cấu hình</h4>
                    <div className="info-list">
                      <div className="info-row">
                        <span className="info-label">Cấp độ:</span>
                        <span className="info-value">{course.level || 'Chưa có'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Ngôn ngữ:</span>
                        <span className="info-value">{course.language || 'Tiếng Việt'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Cập nhật:</span>
                        <span className="info-value">{format(new Date(course.updatedAt), 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="content-section">
                  <h4 className="section-title">📚 Danh sách bài học</h4>
                  {course.lessons && course.lessons.length > 0 ? (
                    <div className="lessons-list">
                      {course.lessons.map((lesson, index) => (
                        <div key={lesson._id} className="lesson-item">
                          <span className="lesson-number">{index + 1}</span>
                          <span className="lesson-title">{lesson.title}</span>
                          <span className="lesson-duration">{lesson.duration || 'Chưa có'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-message">Chưa có bài học nào</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => window.print()} className="footer-btn secondary">
                🖨️ In thông tin
              </button>
              <button onClick={onClose} className="footer-btn primary">
                ✓ Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          75% { transform: translateY(5px) rotate(-5deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        @keyframes slideIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .course-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .course-modal-container {
          position: relative;
          width: 900px;
          max-width: 95vw;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .course-modal-container::-webkit-scrollbar {
          width: 8px;
        }

        .course-modal-container::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 4px;
        }

        .course-modal-container::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 4px;
        }

        .course-modal-container::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }

        .course-modal-backdrop {
          position: absolute;
          inset: -100px;
          background: linear-gradient(135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 51, 234, 0.1) 50%,
            rgba(236, 72, 153, 0.1) 100%);
          border-radius: 24px;
          filter: blur(40px);
          animation: pulse 3s ease-in-out infinite;
        }

        .gradient-orb {
          position: absolute;
          top: 20%;
          left: 60%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle,
            rgba(59, 130, 246, 0.3) 0%,
            transparent 70%);
          border-radius: 50%;
          animation: pulse 4s ease-in-out infinite;
        }

        .floating-elements {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .floating-element {
          position: absolute;
          font-size: 24px;
          animation: float 3s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .floating-element:nth-child(1) { top: 10%; left: 80%; }
        .floating-element:nth-child(2) { top: 70%; left: 15%; }
        .floating-element:nth-child(3) { top: 30%; left: 85%; }
        .floating-element:nth-child(4) { top: 80%; left: 70%; }

        .course-modal-content {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          box-shadow:
            0 20px 40px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(59, 130, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.1);
          overflow: hidden;
        }

        .course-modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg,
            rgba(59, 130, 246, 0.05) 0%,
            rgba(147, 51, 234, 0.02) 100%);
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-content {
          display: flex;
          gap: 16px;
          flex: 1;
        }

        .header-icon {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 14px;
          color: white;
          animation: pulse 2s ease-in-out infinite;
        }

        .icon-ring {
          position: absolute;
          inset: -6px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 18px;
          animation: pulse 2s ease-in-out infinite;
        }

        .header-text h2 {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .course-modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(249, 250, 251, 0.9);
          border: 1px solid rgba(229, 231, 235, 0.5);
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .course-modal-close:hover {
          background: rgba(226, 232, 240, 0.9);
          color: #334155;
          transform: scale(1.05);
        }

        .course-info-banner {
          padding: 24px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
          display: flex;
          gap: 20px;
        }

        .course-thumbnail-wrapper {
          flex-shrink: 0;
        }

        .course-thumbnail {
          width: 160px;
          height: 120px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .course-thumbnail-placeholder {
          width: 160px;
          height: 120px;
          border-radius: 12px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }

        .course-info-text {
          flex: 1;
        }

        .course-title {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .course-description {
          margin: 0 0 12px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.published {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #166534;
        }

        .status-badge.draft {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #6b7280;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 24px;
          background: white;
        }

        .stat-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }

        .tabs-container {
          display: flex;
          gap: 8px;
          padding: 16px 24px 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab-button {
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
          transition: all 0.2s ease;
          position: relative;
        }

        .tab-button:hover {
          background: #f9fafb;
          color: #3b82f6;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
        }

        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
        }

        .tab-content {
          padding: 24px;
          background: white;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .info-section {
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }

        .section-title {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #64748b;
          font-size: 14px;
        }

        .info-value {
          color: #1e293b;
          font-size: 14px;
          font-weight: 500;
          text-align: right;
        }

        .info-value-group {
          text-align: right;
        }

        .content-section {
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }

        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }

        .lesson-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .lesson-item:hover {
          background: #f0f9ff;
          border-color: #3b82f6;
        }

        .lesson-number {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .lesson-title {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .lesson-duration {
          font-size: 13px;
          color: #6b7280;
        }

        .empty-message {
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          padding: 40px 20px;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          background: linear-gradient(135deg,
            rgba(249, 250, 251, 0.9) 0%,
            rgba(243, 244, 246, 0.9) 100%);
          border-top: 1px solid #e5e7eb;
          justify-content: flex-end;
        }

        .footer-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-btn.secondary {
          background: white;
          border: 2px solid #e5e7eb;
          color: #64748b;
        }

        .footer-btn.secondary:hover {
          background: #f9fafb;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        .footer-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .footer-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        @media (max-width: 768px) {
          .course-modal-container {
            width: 95vw;
            margin: 20px;
          }

          .course-info-banner {
            flex-direction: column;
          }

          .course-thumbnail,
          .course-thumbnail-placeholder {
            width: 100%;
            height: 180px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .tabs-container {
            overflow-x: auto;
          }

          .modal-footer {
            flex-direction: column;
          }

          .footer-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default CourseDetailModal;
