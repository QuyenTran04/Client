import api from "./api";

class WalletService {
  // Lấy thông tin ví
  async getWallet() {
    try {
      const response = await api.get('/wallet/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }

  // Tạo yêu cầu nạp tiền qua MoMo
  async createMomoTopUp(amount) {
    try {
      const response = await api.post('/wallet/topup/momo', { amount });
      return response.data;
    } catch (error) {
      console.error('Error creating MoMo top-up:', error);
      throw error;
    }
  }

  // Lấy lịch sử giao dịch
  async getTransactions(limit = 20) {
    try {
      const response = await api.get(`/wallet/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái nạp tiền
  async checkTopUpStatus(topUpId) {
    try {
      // Backend không có API check status, nhưng có thể implement nếu cần
      // Hiện tại chỉ có thể kiểm tra qua transactions
      const response = await this.getTransactions(1);
      return response;
    } catch (error) {
      console.error('Error checking top-up status:', error);
      throw error;
    }
  }
}

export default new WalletService();