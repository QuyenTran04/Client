import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import walletService from '../services/walletService';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const lastCallTime = useRef(0);
  const RATE_LIMIT = 2000; // 2 seconds between calls

  // Load wallet data with rate limiting
  const loadWalletData = async (showLoading = true) => {
    if (!user) return;

    // Rate limiting
    const now = Date.now();
    if (now - lastCallTime.current < RATE_LIMIT) {
      console.log('Wallet API call rate limited');
      return;
    }
    lastCallTime.current = now;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const walletPromise = walletService.getWallet();
      const transactionsPromise = walletService.getTransactions(20);

      const walletResponse = await Promise.race([walletPromise, timeoutPromise]);
      const transactionsResponse = await Promise.race([transactionsPromise, timeoutPromise]);

      setWalletData(walletResponse);
      setTransactions(transactionsResponse.items || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError(err.message || 'Failed to load wallet data');

      // Don't retry immediately on network errors
      if (err.message === 'Request timeout' || err.code === 'ERR_NETWORK') {
        setTimeout(() => {
          lastCallTime.current = 0; // Reset rate limit after delay
        }, 30000); // Wait 30 seconds before allowing retry
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Refresh wallet data
  const refreshWallet = async () => {
    await loadWalletData(false);
  };

  // Update balance after transaction
  const updateBalance = (newBalance) => {
    if (walletData?.wallet) {
      setWalletData(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          balance: newBalance
        }
      }));
      setLastUpdated(new Date());
    }
  };

  // Get current balance
  const getBalance = () => {
    return walletData?.wallet?.balance || 0;
  };

  // Auto refresh wallet data periodically (every 60 seconds to reduce load)
  useEffect(() => {
    if (!user) return;

    // Initial load
    loadWalletData();

    const interval = setInterval(() => {
      loadWalletData(false);
    }, 60000); // Increased to 60 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Listen for custom wallet update events
  useEffect(() => {
    const handleWalletUpdate = (event) => {
      const { type, data } = event.detail;

      if (type === 'balance_updated') {
        updateBalance(data.balance);
        // Don't call loadWalletData here to prevent infinite loop
        // Balance is already updated from event
      } else if (type === 'transaction_completed') {
        // Only refresh if it's not a wallet API call to prevent loop
        if (!data.wallet?.balance) {
          loadWalletData(false);
        }
      }
    };

    window.addEventListener('wallet_update', handleWalletUpdate);
    return () => window.removeEventListener('wallet_update', handleWalletUpdate);
  }, []); // Remove walletData dependency to prevent loop

  const value = {
    walletData,
    transactions,
    loading,
    error,
    lastUpdated,
    balance: getBalance(),
    loadWalletData,
    refreshWallet,
    updateBalance,
    clearError: () => setError(null),
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;