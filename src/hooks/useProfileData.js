import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseApi } from '../services/course';
import walletService from '../services/walletService';

/**
 * Custom hook to manage profile data
 * Handles courses, payment methods, and usage history
 */
export const useProfileData = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get readable description
  const getTransactionDescription = (reason, metadata) => {
    const descriptions = {
      'charge_aiCourse': 'Tạo khóa học bằng AI',
      'charge_aiQuiz': 'Tạo bài trắc nghiệm bằng AI',
      'charge_aiPractice': 'Tạo bài luyện tập bằng AI',
    };
    
    let desc = descriptions[reason] || reason || 'Sử dụng dịch vụ';
    
    // Add metadata info if available
    if (metadata?.courseTitle) {
      desc += `: ${metadata.courseTitle}`;
    } else if (metadata?.lessonId) {
      desc += ` (Bài học)`;
    }
    
    return desc;
  };

  // Fetch user's created courses
  const fetchMyCourses = useCallback(async () => {
    try {
      const response = await courseApi.getMyCourses();
      console.log('Raw response from courses API:', response);

      // Backend returns: { total, items: courses }
      const courses = response?.items || response?.data || response || [];
      const coursesArray = Array.isArray(courses) ? courses : [];

      setMyCourses(coursesArray);
      console.log('My courses loaded:', coursesArray.length, 'courses');
    } catch (err) {
      console.error('Error fetching my courses:', err);
      setMyCourses([]);
    }
  }, []);

  // Fetch payment methods (mock implementation - needs backend API)
  const fetchPaymentMethods = useCallback(async () => {
    try {
      // TODO: Implement actual API call when backend supports payment methods
      const methods = [];
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setPaymentMethods([]);
    }
  }, []);

  // Fetch usage history from wallet transactions
  const fetchUsageData = useCallback(async () => {
    try {
      const response = await walletService.getTransactions(50);
      console.log('Raw response from transactions API:', response);

      // Backend returns: { items, count }
      const transactions = response?.items || response?.data || response || [];
      const transactionsArray = Array.isArray(transactions) ? transactions : [];

      console.log('Transactions loaded:', transactionsArray.length, 'transactions');
      console.log('Transaction details:', transactionsArray.map(tx => ({ 
        type: tx.type, 
        reason: tx.reason, 
        amount: tx.amount 
      })));

      // Transform transactions into usage data format
      // type: "credit" (nạp tiền), "debit" (sử dụng), "refund" (hoàn tiền)
      // reason: "charge_aiCourse", "charge_aiQuiz", "charge_aiPractice", "topup_momo", etc.
      const usage = transactionsArray
        .filter(tx => {
          // Include debit transactions (xu spending) - these are the "usage" transactions
          return tx.type === 'debit';
        })
        .map(tx => {
          // Extract action type from reason (e.g., "charge_aiCourse" -> "aiCourse")
          const actionType = tx.reason?.replace('charge_', '') || 'general';
          
          return {
            id: tx._id,
            type: actionType,
            description: getTransactionDescription(tx.reason, tx.metadata),
            amount: Math.abs(tx.amount || 0),
            date: tx.createdAt,
            status: 'completed'
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setUsageData(usage);
      console.log('Usage data transformed:', usage.length, 'usage items');
      
      // Debug: Log all transactions if no usage found
      if (usage.length === 0 && transactionsArray.length > 0) {
        console.log('No debit transactions found. All transactions:', transactionsArray);
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setUsageData([]);
    }
  }, []);

  // Fetch all profile data
  const fetchProfileData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchMyCourses(),
        fetchPaymentMethods(),
        fetchUsageData()
      ]);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Không thể tải dữ liệu profile');
    } finally {
      setLoading(false);
    }
  }, [user, fetchMyCourses, fetchPaymentMethods, fetchUsageData]);

  // Refresh specific data
  const refreshCourses = useCallback(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const refreshPaymentMethods = useCallback(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const refreshUsageData = useCallback(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  // Calculated statistics
  const stats = {
    totalCourses: Array.isArray(myCourses) ? myCourses.length : 0,
    totalStudents: Array.isArray(myCourses)
      ? myCourses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)
      : 0,
    averageRating: Array.isArray(myCourses) && myCourses.length > 0
      ? (myCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / myCourses.length).toFixed(1)
      : '0.0',
    totalUsedCoins: Array.isArray(usageData)
      ? usageData.reduce((sum, item) => sum + (item.amount || 0), 0)
      : 0
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

  return {
    // Data
    myCourses,
    paymentMethods,
    usageData,
    loading,
    error,

    // Statistics
    stats,

    // Actions
    fetchProfileData,
    refreshCourses,
    refreshPaymentMethods,
    refreshUsageData
  };
};
