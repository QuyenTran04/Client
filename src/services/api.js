import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Add response interceptor to handle wallet updates
api.interceptors.response.use(
  (response) => {
    // Check if response contains wallet balance update
    if (response.data?.wallet?.balance !== undefined) {
      // Only dispatch event for non-wallet endpoints to prevent loop
      if (!response.config.url?.includes('/wallet/')) {
        const event = new CustomEvent('wallet_update', {
          detail: {
            type: 'balance_updated',
            data: {
              balance: response.data.wallet.balance
            }
          }
        });
        window.dispatchEvent(event);
      }
    }

    // Check if response indicates a transaction was completed
    const isTransactionEndpoint =
      response.config.url?.includes('/ai/') ||
      response.config.url?.includes('/practice') ||
      response.config.url?.includes('/quiz') ||
      response.data?.transaction ||
      response.data?.chargeResult;

    if (isTransactionEndpoint && response.status >= 200 && response.status < 300) {
      // Dispatch custom event to refresh wallet data
      const event = new CustomEvent('wallet_update', {
        detail: {
          type: 'transaction_completed',
          data: response.data
        }
      });
      window.dispatchEvent(event);
    }

    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    // Handle 403 Forbidden errors (account locked)
    if (error.response?.status === 403) {
      const message = error.response?.data?.message;
      if (message?.includes('khóa') || message?.includes('locked')) {
        // Clear token and redirect to login with error message
        localStorage.removeItem('token');
        alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        window.location.href = '/login';
      }
    }

    // Don't dispatch wallet events for errors
    return Promise.reject(error);
  }
);

export default api;
