import { useCallback } from 'react';
import { useWallet } from '../context/WalletContext';

/**
 * Custom hook for manual wallet refresh functionality
 * Provides a simple interface to manually trigger wallet balance updates
 */
export const useWalletRefresh = () => {
  const { refreshWallet, updateBalance } = useWallet();

  /**
   * Refresh full wallet data (balance + transactions)
   */
  const refreshFullWallet = useCallback(async () => {
    await refreshWallet();
  }, [refreshWallet]);

  /**
   * Update only the balance value
   * @param {number} newBalance - New balance value
   */
  const setBalance = useCallback((newBalance) => {
    updateBalance(newBalance);
  }, [updateBalance]);

  /**
   * Trigger wallet update event manually (for external integrations)
   * @param {string} type - Event type: 'balance_updated' or 'transaction_completed'
   * @param {object} data - Event data
   */
  const triggerWalletUpdate = useCallback((type, data) => {
    const event = new CustomEvent('wallet_update', {
      detail: { type, data }
    });
    window.dispatchEvent(event);
  }, []);

  return {
    refreshFullWallet,
    setBalance,
    triggerWalletUpdate,
    refreshWallet // Backward compatibility
  };
};

/**
 * Hook để gọi sau khi thực hiện actions trừ xu
 */
export const usePostActionRefresh = () => {
  const { refreshWallet } = useWalletRefresh();

  const refreshAfterAction = useCallback(() => {
    // Delay nhỏ để đảm bảo database đã cập nhật
    setTimeout(() => {
      refreshWallet();
    }, 500);
  }, [refreshWallet]);

  return { refreshAfterAction };
};