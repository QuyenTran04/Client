import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineClose, AiOutlineFilePdf, AiOutlineFileImage, AiOutlineFileText, AiOutlinePlus, AiOutlineLoading } from 'react-icons/ai';
import { FiUpload, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { createQuizFromUpload } from '../services/quiz';

const CreateQuizModal = ({ isOpen, onClose, lessonId = null, courseId = null, onQuizCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxQuestions: 10,
    difficulty: 'medium',
    timeLimit: 30, // minutes
    language: 'vi',
    isStandalone: !courseId && !lessonId
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState({
    extractedQuestions: 0,
    processedQuestions: 0
  });

  const fileInputRef = useRef(null);

  const supportedFormats = [
    { extension: 'pdf', icon: AiOutlineFilePdf, color: 'text-red-500' },
    { extension: 'doc', icon: AiOutlineFileText, color: 'text-blue-500' },
    { extension: 'docx', icon: AiOutlineFileText, color: 'text-blue-500' },
    { extension: 'jpg', icon: AiOutlineFileImage, color: 'text-green-500' },
    { extension: 'jpeg', icon: AiOutlineFileImage, color: 'text-green-500' },
    { extension: 'png', icon: AiOutlineFileImage, color: 'text-green-500' },
    { extension: 'txt', icon: FiFileText, color: 'text-gray-500' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 10MB');
        return;
      }

      // Validate file format
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isSupported = supportedFormats.some(format => format.extension === fileExtension);

      if (!isSupported) {
        setError('Định dạng file không được hỗ trợ. Vui lòng chọn file PDF, DOC, DOCX, JPG, PNG hoặc TXT');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài trắc nghiệm');
      return;
    }

    if (!selectedFile) {
      setError('Vui lòng chọn file chứa câu trắc nghiệm');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const progressInterval = simulateProgress();

      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);

      // Chỉ gửi course/lesson nếu có (cho quiz độc lập không gửi)
      if (lessonId) formDataToSend.append('lesson', lessonId);
      if (courseId) formDataToSend.append('course', courseId);

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('maxQuestions', formData.maxQuestions);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('timeLimit', formData.timeLimit);
      formDataToSend.append('language', formData.language);

      setAiProcessing(true);

      const response = await createQuizFromUpload(formDataToSend);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update preview with actual data
      setPreview({
        extractedQuestions: response.data.extractedQuestions || 0,
        processedQuestions: response.data.processedQuestions || 0
      });

      // Call success callback
      if (onQuizCreated) {
        onQuizCreated(response.data);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setAiProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    // Reset all states
    setFormData({
      title: '',
      description: '',
      maxQuestions: 10,
      difficulty: 'medium',
      timeLimit: 30,
      language: 'vi'
    });
    setSelectedFile(null);
    setError('');
    setUploadProgress(0);
    setAiProcessing(false);
    setPreview({
      extractedQuestions: 0,
      processedQuestions: 0
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onClose();
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    const format = supportedFormats.find(f => f.extension === extension);
    return format ? format.icon : FiFileText;
  };

  const getFileColor = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    const format = supportedFormats.find(f => f.extension === extension);
    return format ? format.color : 'text-gray-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Tạo bài trắc nghiệm từ file
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AiOutlineClose className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài trắc nghiệm *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isUploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Nhập tiêu đề bài trắc nghiệm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isUploading}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                placeholder="Mô tả về nội dung bài trắc nghiệm"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số câu hỏi tối đa
              </label>
              <select
                name="maxQuestions"
                value={formData.maxQuestions}
                onChange={handleInputChange}
                disabled={isUploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                disabled={isUploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian làm bài (phút)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleInputChange}
                min="5"
                max="180"
                disabled={isUploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tải lên file trắc nghiệm</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                className="hidden"
              />

              {!selectedFile ? (
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Kéo và thả file vào đây hoặc
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Chọn file
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Hỗ trợ: PDF, DOC, DOCX, JPG, PNG, TXT (tối đa 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {React.createElement(getFileIcon(selectedFile.name), {
                        className: `w-8 h-8 ${getFileColor(selectedFile.name)}`
                      })}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={isUploading}
                      className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AiOutlineClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {supportedFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <span
                    key={format.extension}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${format.color}`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {format.extension.toUpperCase()}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {aiProcessing ? 'AI đang xử lý...' : 'Đang tải lên file...'}
                </span>
                <span className="text-gray-900 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {aiProcessing && (
                <p className="text-xs text-gray-500">
                  AI đang trích xuất câu hỏi và tìm đáp án từ file của bạn...
                </p>
              )}
            </div>
          )}

          {/* Success Preview */}
          {uploadProgress === 100 && !error && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Đã tạo thành công!
              </h4>
              <div className="text-xs text-green-700 space-y-1">
                <p>• Đã trích xuất: {preview.extractedQuestions} câu hỏi</p>
                <p>• Đã xử lý: {preview.processedQuestions} câu hỏi</p>
                <p>• AI đã tự động điền đáp án cho các câu hỏi thiếu</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !formData.title.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <AiOutlineLoading className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <AiOutlinePlus className="w-4 h-4" />
                  <span>Tạo bài trắc nghiệm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;