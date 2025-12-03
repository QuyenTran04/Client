import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const PaymentStatus = ({ status, amount, message, onRetry }) => {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Thanh toán thành công!',
      description: `${amount ? `Bạn đã nạp thành công ${amount.toLocaleString()} xu` : 'Giao dịch đã được xử lý thành công'}`
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'Thanh toán thất bại',
      description: message || 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.'
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'Đang xử lý',
      description: 'Giao dịch của bạn đang được xử lý. Vui lòng đợi trong giây lát.'
    },
    info: {
      icon: AlertCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      title: 'Thông báo',
      description: message || 'Vui lòng hoàn tất thanh toán để tiếp tục.'
    }
  };

  const config = statusConfig[status] || statusConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${config.bgColor} ${config.borderColor} border rounded-xl p-6 max-w-md mx-auto`}
    >
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex-shrink-0"
        >
          <Icon className={`w-6 h-6 ${config.color}`} />
        </motion.div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{config.title}</h3>
          <p className="text-gray-600 text-sm">{config.description}</p>

          {status === 'error' && onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Thử lại
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentStatus;