import axios from "axios";
import api from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Lấy danh sách đánh giá của một khóa học
 */
export const getCourseReviews = async (courseId, page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/reviews/course/${courseId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("[getCourseReviews] Error:", error);
    throw error.response?.data || { message: "Lỗi khi tải đánh giá" };
  }
};

/**
 * Kiểm tra điều kiện đánh giá khóa học
 */
export const checkReviewEligibility = async (courseId) => {
  try {
    const response = await api.get(
      `/reviews/check-eligibility/${courseId}`
    );
    return response.data;
  } catch (error) {
    console.error("[checkReviewEligibility] Error:", error);
    throw error.response?.data || { message: "Lỗi khi kiểm tra điều kiện đánh giá" };
  }
};

/**
 * Tạo đánh giá mới cho khóa học
 */
export const createReview = async (courseId, reviewData) => {
  try {
    const response = await api.post(
      `/reviews/course/${courseId}`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error("[createReview] Error:", error);
    throw error.response?.data || { message: "Lỗi khi tạo đánh giá" };
  }
};

/**
 * Cập nhật đánh giá
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(
      `/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error("[updateReview] Error:", error);
    throw error.response?.data || { message: "Lỗi khi cập nhật đánh giá" };
  }
};

/**
 * Xóa đánh giá
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("[deleteReview] Error:", error);
    throw error.response?.data || { message: "Lỗi khi xóa đánh giá" };
  }
};

/**
 * Lấy đánh giá của người dùng hiện tại cho một khóa học
 */
export const getUserReview = async (courseId) => {
  try {
    const response = await api.get(`/reviews/user/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("[getUserReview] Error:", error);
    throw error.response?.data || { message: "Lỗi khi tải đánh giá của bạn" };
  }
};