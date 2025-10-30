'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { FluxionClient, createFluxionClient, UserProfile, GameType } from '@/lib/solana/program';
import { PublicKey } from '@solana/web3.js';

interface BlockchainContextType {
  // Client & connection
  client: FluxionClient | null;
  connected: boolean;
  
  // Profile state
  profile: UserProfile | null;
  profileExists: boolean;
  profileLoading: boolean;
  
  // Actions
  initializeProfile: (username: string) => Promise<string>;
  updateElo: (eloChange: number, won: boolean, gameType: GameType) => Promise<string>;
  recordGame: (
    gameType: GameType,
    won: boolean,
    eloChange: number,
    symbol: string,
    pnl: number
  ) => Promise<string>;
  refreshProfile: () => Promise<void>;
  
  // Transaction state
  txLoading: boolean;
  txError: string | null;
  lastTxSignature: string | null;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [client, setClient] = useState<FluxionClient | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [lastTxSignature, setLastTxSignature] = useState<string | null>(null);

  // Initialize client when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      try {
        const fluxionClient = createFluxionClient(connection, wallet as any);
        setClient(fluxionClient);
      } catch (error) {
        console.error('Failed to initialize Fluxion client:', error);
      }
    } else {
      setClient(null);
      setProfile(null);
      setProfileExists(false);
    }
  }, [wallet.connected, wallet.publicKey, connection]);

  // Fetch profile when client is ready
  const fetchProfile = useCallback(async () => {
    if (!client || !wallet.publicKey) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const userProfile = await client.getUserProfile(wallet.publicKey);
      setProfile(userProfile);
      setProfileExists(userProfile !== null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setProfileExists(false);
    } finally {
      setProfileLoading(false);
    }
  }, [client, wallet.publicKey]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Initialize profile
  const initializeProfile = async (username: string): Promise<string> => {
    if (!client) throw new Error('Wallet not connected');
    
    setTxLoading(true);
    setTxError(null);
    
    try {
      const signature = await client.initializeUser(username);
      setLastTxSignature(signature);
      
      // Refresh profile after creation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for confirmation
      await fetchProfile();
      
      return signature;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to initialize profile';
      setTxError(errorMsg);
      throw error;
    } finally {
      setTxLoading(false);
    }
  };

  // Update ELO
  const updateElo = async (
    eloChange: number,
    won: boolean,
    gameType: GameType
  ): Promise<string> => {
    if (!client) throw new Error('Wallet not connected');
    
    setTxLoading(true);
    setTxError(null);
    
    try {
      const signature = await client.updateElo(eloChange, won, gameType);
      setLastTxSignature(signature);
      
      // Refresh profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchProfile();
      
      return signature;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to update ELO';
      setTxError(errorMsg);
      throw error;
    } finally {
      setTxLoading(false);
    }
  };

  // Record game result
  const recordGame = async (
    gameType: GameType,
    won: boolean,
    eloChange: number,
    symbol: string,
    pnl: number
  ): Promise<string> => {
    if (!client) throw new Error('Wallet not connected');
    
    setTxLoading(true);
    setTxError(null);
    
    try {
      const signature = await client.recordGameResult(
        gameType,
        won,
        eloChange,
        symbol,
        pnl
      );
      setLastTxSignature(signature);
      return signature;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to record game';
      setTxError(errorMsg);
      throw error;
    } finally {
      setTxLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <BlockchainContext.Provider
      value={{
        client,
        connected: wallet.connected,
        profile,
        profileExists,
        profileLoading,
        initializeProfile,
        updateElo,
        recordGame,
        refreshProfile,
        txLoading,
        txError,
        lastTxSignature,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
}

