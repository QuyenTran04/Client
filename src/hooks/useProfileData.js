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
      // const methods = await paymentService.getPaymentMethods();

      // For now, return empty array or mock data if needed
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

      // Transform transactions into usage data format
      console.log('Transaction types:', transactionsArray.map(tx => ({ type: tx.type, reason: tx.reason, amount: tx.amount })));

      const usage = transactionsArray
        .filter(tx => {
          // Include all transactions that show xu spending
          const isUsageTx = tx.type?.startsWith('charge_') ||
                           tx.type === 'charge' ||
                           tx.type?.includes('ai') ||
                           (tx.amount && tx.amount < 0); // Negative amount = spending
          return isUsageTx;
        })
        .map(tx => ({
          id: tx._id,
          type: tx.type.replace('charge_', '').replace('charge', '') || 'general',
          description: tx.reason || `Giao dịch ${tx.type}`,
          amount: Math.abs(tx.amount || 0),
          date: tx.createdAt,
          status: 'completed' // Assume completed if transaction exists
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setUsageData(usage);
      console.log('Usage data transformed:', usage.length, 'usage items');
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