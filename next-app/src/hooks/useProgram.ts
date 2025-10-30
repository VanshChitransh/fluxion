/**
 * React hook for interacting with Fluxion Solana program
 */

'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { FluxionClient, createFluxionClient, UserProfile, GameType } from '@/lib/solana/program';
import { PublicKey } from '@solana/web3.js';

export function useFluxionProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [client, setClient] = useState<FluxionClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize client when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      try {
        const fluxionClient = createFluxionClient(connection, wallet as any);
        setClient(fluxionClient);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize Fluxion client:', err);
        setError('Failed to connect to Solana program');
      } finally {
        setLoading(false);
      }
    } else {
      setClient(null);
      setLoading(false);
    }
  }, [wallet.connected, wallet.publicKey, connection]);

  /**
   * Initialize user profile on-chain
   */
  const initializeProfile = useCallback(
    async (username: string) => {
      if (!client) throw new Error('Wallet not connected');
      return await client.initializeUser(username);
    },
    [client]
  );

  /**
   * Update ELO after a game
   */
  const updateElo = useCallback(
    async (eloChange: number, won: boolean, gameType: GameType) => {
      if (!client) throw new Error('Wallet not connected');
      return await client.updateElo(eloChange, won, gameType);
    },
    [client]
  );

  /**
   * Record game result
   */
  const recordGame = useCallback(
    async (
      gameType: GameType,
      won: boolean,
      eloChange: number,
      symbol: string,
      pnl: number
    ) => {
      if (!client) throw new Error('Wallet not connected');
      return await client.recordGameResult(gameType, won, eloChange, symbol, pnl);
    },
    [client]
  );

  /**
   * Get user profile
   */
  const getProfile = useCallback(
    async (userPubkey?: PublicKey): Promise<UserProfile | null> => {
      if (!client) return null;
      return await client.getUserProfile(userPubkey);
    },
    [client]
  );

  /**
   * Check if profile exists
   */
  const profileExists = useCallback(
    async (userPubkey?: PublicKey): Promise<boolean> => {
      if (!client) return false;
      return await client.userProfileExists(userPubkey);
    },
    [client]
  );

  return {
    client,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    loading,
    error,
    // Methods
    initializeProfile,
    updateElo,
    recordGame,
    getProfile,
    profileExists,
  };
}

/**
 * Hook to fetch and subscribe to user profile
 */
export function useUserProfile(userPubkey?: PublicKey) {
  const { client } = useFluxionProgram();
  const wallet = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const pubkey = userPubkey || wallet.publicKey || undefined;

  useEffect(() => {
    if (!client || !pubkey) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchProfile = async () => {
      try {
        const data = await client.getUserProfile(pubkey);
        if (mounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    // Optionally set up a subscription here for real-time updates
    // const subscriptionId = connection.onAccountChange(...)

    return () => {
      mounted = false;
      // Clean up subscription
    };
  }, [client, pubkey]);

  return { profile, loading };
}

