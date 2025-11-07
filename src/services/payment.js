import api from "./api";

/**
 * Xử lý thanh toán khóa học
 * @param {Object} paymentData - Thông tin thanh toán
 * @param {string} paymentData.courseId - ID khóa học
 * @param {number} paymentData.amount - Số tiền
 * @param {string} paymentData.paymentMethod - Phương thức thanh toán
 * @param {string} paymentData.cardNumber - Số thẻ
 * @param {string} paymentData.cardName - Tên chủ thẻ
 * @param {string} paymentData.expiryDate - Ngày hết hạn
 * @param {string} paymentData.cvv - CVV
 * @param {string} paymentData.email - Email
 * @param {string} paymentData.phone - Số điện thoại
 */
export const processPayment = async (paymentData) => {
  const { data } = await api.post("/payments/process", paymentData);
  return data;
};

/**
 * Lấy lịch sử thanh toán của user
 */
export const getPaymentHistory = async () => {
  const { data } = await api.get("/payments/history");
  return data;
};

