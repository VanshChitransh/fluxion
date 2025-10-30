import { NextRequest } from 'next/server';
import { verifyAuthToken, createAuthResponse } from '@/lib/server/authMiddleware';
import { adminDb, adminTimestamp, adminIncrement, adminArrayUnion } from '@/lib/server/firebaseAdmin';
import { detectTierChange } from '@/lib/server/eloCalculations';

interface UpdateEloRequest {
  userId: string;
  eloChange: number;
  gameType: 'predict' | 'battle';
  won: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(request);
    if (!auth.valid) {
      return createAuthResponse(auth.error || 'Unauthorized');
    }

    const body: UpdateEloRequest = await request.json();
    const { userId, eloChange, gameType, won } = body;

    // Verify user is updating their own ELO
    if (auth.uid !== userId) {
      return createAuthResponse('You can only update your own ELO', 403);
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const oldElo = userData.elo.rating;
    const newElo = Math.max(0, oldElo + eloChange); // ELO can't go below 0

    // Detect tier change
    const tierChange = detectTierChange(oldElo, newElo);

    // Prepare update data
    const updates: any = {
      'elo.rating': newElo,
      'elo.tier': tierChange.newTier.name,
      'elo.tierLevel': tierChange.newTier.id,
      'elo.lastUpdated': adminTimestamp(),
    };

    // Update highest ELO if new ELO is higher
    if (newElo > userData.elo.highestElo) {
      updates['elo.highestElo'] = newElo;
    }

    // Update stats based on game type
    if (gameType === 'predict') {
      updates['stats.predictBattles.played'] = adminIncrement(1);
      if (won) {
        updates['stats.predictBattles.correct'] = adminIncrement(1);
      }
      // Recalculate accuracy
      const newPlayed = (userData.stats.predictBattles.played || 0) + 1;
      const newCorrect = (userData.stats.predictBattles.correct || 0) + (won ? 1 : 0);
      updates['stats.predictBattles.accuracy'] = (newCorrect / newPlayed) * 100;
    } else if (gameType === 'battle') {
      updates['stats.battleRoyale.played'] = adminIncrement(1);
      if (won) {
        updates['stats.battleRoyale.wins'] = adminIncrement(1);
      }
    }

    // Update total games and wins/losses
    updates['stats.totalGames'] = adminIncrement(1);
    if (won) {
      updates['stats.wins'] = adminIncrement(1);
      updates['stats.currentStreak'] = adminIncrement(1);
      
      // Check if current streak > best streak
      const newStreak = (userData.stats.currentStreak || 0) + 1;
      if (newStreak > (userData.stats.bestStreak || 0)) {
        updates['stats.bestStreak'] = newStreak;
      }
    } else {
      updates['stats.losses'] = adminIncrement(1);
      updates['stats.currentStreak'] = 0; // Reset streak on loss
    }

    // Handle NFT unlock if tier went up
    let nftUnlockedData;
    if (tierChange.changed && tierChange.tierUp) {
      // Check if NFT already unlocked
      const alreadyUnlocked = userData.nftRewards?.some(
        (reward: any) => reward.tierId === tierChange.newTier.id
      );

      if (!alreadyUnlocked) {
        // Fetch NFT reward data
        const nftRewardRef = adminDb.collection('nftRewards').doc(`tier_${tierChange.newTier.id}`);
        const nftDoc = await nftRewardRef.get();

        if (nftDoc.exists) {
          const nftData = nftDoc.data()!;

          // Add to user's NFT rewards
          updates.nftRewards = adminArrayUnion({
            tierId: tierChange.newTier.id,
            tierName: tierChange.newTier.name,
            unlockedAt: adminTimestamp(),
            claimed: false,
          });

          nftUnlockedData = {
            tierId: tierChange.newTier.id,
            tierName: tierChange.newTier.name,
            imageUrl: nftData.imageUrl,
            name: nftData.name,
          };
        }
      }
    }

    // Update user document
    await userRef.update(updates);

    // Update leaderboard
    await updateLeaderboard(userId, newElo, tierChange.newTier.name, tierChange.newTier.id);

    // Return success response
    return Response.json({
      success: true,
      data: {
        oldElo,
        newElo,
        eloChange,
        oldTier: tierChange.oldTier.name,
        newTier: tierChange.newTier.name,
        tierChanged: tierChange.changed,
        tierUp: tierChange.tierUp,
        nftUnlocked: nftUnlockedData,
      },
    });
  } catch (error: any) {
    console.error('Error updating ELO:', error);
    return Response.json(
      { error: error.message || 'Failed to update ELO', success: false },
      { status: 500 }
    );
  }
}

async function updateLeaderboard(
  userId: string,
  elo: number,
  tier: string,
  tierLevel: number
): Promise<void> {
  const leaderboardRef = adminDb.collection('leaderboard').doc(userId);
  const userRef = adminDb.collection('users').doc(userId);

  const [leaderboardDoc, userDoc] = await Promise.all([
    leaderboardRef.get(),
    userRef.get(),
  ]);

  if (!userDoc.exists) return;

  const userData = userDoc.data()!;

  const leaderboardData = {
    userId,
    displayName: userData.displayName,
    photoURL: userData.photoURL || null,
    elo,
    tier,
    tierLevel,
    points: userData.stats.points || 0,
    wins: userData.stats.wins || 0,
    totalGames: userData.stats.totalGames || 0,
    winRate: userData.stats.totalGames > 0
      ? (userData.stats.wins / userData.stats.totalGames) * 100
      : 0,
    updatedAt: adminTimestamp(),
  };

  if (leaderboardDoc.exists) {
    await leaderboardRef.update(leaderboardData);
  } else {
    await leaderboardRef.set({ ...leaderboardData, rank: 0 });
  }
}

