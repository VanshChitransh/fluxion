'use client';

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useCallback } from 'react';

/**
 * Custom hook that wraps Solana wallet adapter
 * Provides easy access to wallet state and functions
 */
export function useWalletConnection() {
  const {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    select,
    connect,
    disconnect,
    signMessage,
    signTransaction,
    signAllTransactions,
  } = useSolanaWallet();

  const walletAddress = publicKey?.toBase58() || null;

  // Simplified connect function
  const connectWallet = useCallback(async () => {
    try {
      if (!wallet) {
        throw new Error('No wallet selected');
      }
      await connect();
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }, [wallet, connect]);

  // Simplified disconnect function
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      throw error;
    }
  }, [disconnect]);

  return {
    wallet,
    publicKey,
    walletAddress,
    connected,
    connecting,
    disconnecting,
    select,
    connectWallet,
    disconnectWallet,
    signMessage,
    signTransaction,
    signAllTransactions,
  };
}

