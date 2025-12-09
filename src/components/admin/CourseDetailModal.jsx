import React, { useState } from 'react';
import { X, Edit, BookOpen, Users, DollarSign, Calendar, Eye, Star } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CourseDetailModal = ({ course, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!course) return null;

  const stats = [
    {
      label: 'Học viên',
      value: course.enrollmentCount || 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Bài học',
      value: course.lessonCount || 0,
      icon: BookOpen,
      color: 'text-green-600 bg-green-50'
    },
    {
      label: 'Đánh giá',
      value: course.averageRating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      label: 'Doanh thu',
      value: `${(course.revenue || 0).toLocaleString('vi-VN')}₫`,
      icon: DollarSign,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết khóa học</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Course Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start gap-4">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {format(new Date(course.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  course.published
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {course.published ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
            </div>
            <button
              onClick={() => onEdit(course)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit size={16} />
              Chỉnh sửa
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            {['overview', 'content', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'overview' && 'Tổng quan'}
                {tab === 'content' && 'Nội dung'}
                {tab === 'analytics' && 'Phân tích'}
                {tab === 'settings' && 'Cài đặt'}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
                        <stat.icon size={20} />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Thông tin cơ bản</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã khóa học:</span>
                        <span className="font-medium">#{course._id.slice(-6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giảng viên:</span>
                        <span className="font-medium">{course.instructor?.name || 'Chưa có'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Danh mục:</span>
                        <span className="font-medium">{course.category?.name || 'Chưa có'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá:</span>
                        <span className="font-medium text-blue-600">
                          {(course.price || 0).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Thời lượng & Cấp độ</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời lượng:</span>
                        <span className="font-medium">{course.duration || 'Chưa có'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cấp độ:</span>
                        <span className="font-medium">{course.level || 'Chưa có'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngôn ngữ:</span>
                        <span className="font-medium">{course.language || 'Tiếng Việt'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cập nhật lần cuối:</span>
                        <span className="font-medium">
                          {format(new Date(course.updatedAt), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Danh sách bài học</h4>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 font-medium">{index + 1}.</span>
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">{lesson.duration || 'Chưa có'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có bài học nào</p>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-700">Phân tích chi tiết</h4>
                <div className="text-gray-600">
                  <p>Chức năng phân tích chi tiết đang được phát triển...</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-700">Cài đặt khóa học</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Cho phép đánh giá</span>
                    <input
                      type="checkbox"
                      checked={course.allowRating}
                      className="toggle"
                      disabled
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Hiển thị công khai</span>
                    <input
                      type="checkbox"
                      checked={course.published}
                      className="toggle"
                      disabled
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Certificate hoàn thành</span>
                    <input
                      type="checkbox"
                      checked={course.hasCertificate}
                      className="toggle"
                      disabled
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                In thông tin
              </button>
              <button
                onClick={() => onEdit(course)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit size={16} />
                Chỉnh sửa khóa học
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;