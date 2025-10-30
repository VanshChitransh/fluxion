import { useState } from 'react';
import { auth } from '../lib/firebase';
import { getTierFromElo, getNextTier, getEloToNextTier } from '../lib/utils';

export interface UpdateEloParams {
  userId: string;
  eloChange: number;
  gameType: 'predict' | 'battle';
  won: boolean;
}

export interface UpdateEloResult {
  oldElo: number;
  newElo: number;
  eloChange: number;
  oldTier: string;
  newTier: string;
  tierChanged: boolean;
  tierUp: boolean;
  nftUnlocked?: {
    tierId: number;
    tierName: string;
    imageUrl: string;
    name: string;
  };
}

/**
 * Hook for ELO-related operations
 */
export function useElo() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update user's ELO rating via Next.js API route
   */
  const updateElo = async (params: UpdateEloParams): Promise<UpdateEloResult | null> => {
    setUpdating(true);
    setError(null);

    try {
      // Get current user's ID token
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      // Call Next.js API route
      const response = await fetch('/api/elo/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update ELO');
      }

      return result.data;
    } catch (err: any) {
      console.error('Error updating ELO:', err);
      setError(err.message || 'Failed to update ELO');
      return null;
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Get tier information from ELO
   */
  const getTierInfo = (elo: number) => {
    const tier = getTierFromElo(elo);
    const nextTier = getNextTier(elo);
    const eloToNext = getEloToNextTier(elo);

    return {
      current: tier,
      next: nextTier,
      eloToNext,
      progress: nextTier
        ? ((elo - tier.minElo) / (tier.maxElo - tier.minElo + 1)) * 100
        : 100,
    };
  };

  /**
   * Calculate how many games needed to reach next tier
   * Assumes average ELO gain per game
   */
  const estimateGamesToNextTier = (
    currentElo: number,
    avgEloPerGame: number = 15
  ): number => {
    const eloNeeded = getEloToNextTier(currentElo);
    if (eloNeeded <= 0) return 0;
    return Math.ceil(eloNeeded / avgEloPerGame);
  };

  return {
    updateElo,
    getTierInfo,
    estimateGamesToNextTier,
    updating,
    error,
  };
}

