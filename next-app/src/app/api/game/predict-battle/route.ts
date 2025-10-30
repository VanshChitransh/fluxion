import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/authMiddleware';
import { db } from '@/lib/server/firebaseAdmin';
import { generatePredictBattleFeedback } from '@/services/aiService';
import { calculateEloChange } from '@/lib/server/eloCalculations';
import { getTierFromElo } from '@/lib/utils';

export interface PredictBattleRequest {
  prediction: 'UP' | 'DOWN';
  displayDuration: number; // How long chart was shown (in seconds)
  chartData: { timestamp: number; price: number }[];
  startPrice: number;
  endPrice: number;
}

export interface PredictBattleResponse {
  correct: boolean;
  actualDirection: 'UP' | 'DOWN';
  priceChange: number;
  priceChangePercent: number;
  eloChange: number;
  newElo: number;
  newTier: string;
  tierChanged: boolean;
  unlockedNFT?: {
    id: string;
    name: string;
    imageUrl: string;
  };
  aiFeedback: {
    analysis: string;
    strengths: string[];
    improvements: string[];
    marketInsight: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const body: PredictBattleRequest = await req.json();
      const { prediction } = body;
      
      // Add some randomness to make it more realistic
      const isCorrect = Math.random() > 0.4; // 60% chance of correct prediction
      const priceChangePercent = (Math.random() - 0.5) * 2;
      const actualDirection = priceChangePercent >= 0 ? 'UP' : 'DOWN';
      
      const response: PredictBattleResponse = {
        correct: isCorrect,
        actualDirection,
        priceChange: priceChangePercent * 100,
        priceChangePercent,
        eloChange: isCorrect ? Math.floor(Math.random() * 20) + 10 : -Math.floor(Math.random() * 15) - 5,
        newElo: 1625,
        newTier: 'Gold',
        tierChanged: Math.random() > 0.9, // 10% chance of tier change
        unlockedNFT: Math.random() > 0.9 ? {
          id: 'mock-nft-1',
          name: 'Golden Trader Trophy',
          imageUrl: '/assets/nfts/golden-trophy.png'
        } : undefined,
        aiFeedback: {
          analysis: `${isCorrect ? 'Excellent' : 'Close, but not quite'}! The price movement ${actualDirection === 'UP' ? 'showed upward momentum' : 'indicated downward pressure'}.`,
          strengths: [
            "Quick pattern recognition",
            "Good timing on entry",
            "Patient observation period"
          ],
          improvements: [
            "Consider volume analysis",
            "Watch for key resistance levels",
            "Factor in market sentiment"
          ],
          marketInsight: `The market ${actualDirection === 'UP' ? 'showed bullish signals' : 'displayed bearish pressure'} during this period.`
        }
      };

      return NextResponse.json(response);
    }

    // Production code starts here
    const userId = await verifyAuthToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PredictBattleRequest = await req.json();
    const { prediction, displayDuration, chartData, startPrice, endPrice } = body;

    // Validate input
    if (!prediction || !['UP', 'DOWN'].includes(prediction)) {
      return NextResponse.json({ error: 'Invalid prediction' }, { status: 400 });
    }

    // Calculate actual price movement
    const priceChange = endPrice - startPrice;
    const priceChangePercent = (priceChange / startPrice) * 100;
    const actualDirection: 'UP' | 'DOWN' = priceChange >= 0 ? 'UP' : 'DOWN';
    const correct = prediction === actualDirection;

    // Fetch user's current ELO
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const currentElo = userData.elo?.current || 1000;
    const currentTier = getTierFromElo(currentElo);

    // Calculate ELO change
    // For Predict Battle: +15 ELO for correct, -10 ELO for incorrect
    const baseEloChange = correct ? 15 : -10;
    
    // Bonus for high conviction (very large price moves)
    const convictionBonus = Math.abs(priceChangePercent) > 2 ? 5 : 0;
    const eloChange = correct ? baseEloChange + convictionBonus : baseEloChange;

    const newElo = Math.max(0, currentElo + eloChange);
    const newTier = getTierFromElo(newElo);
    const tierChanged = currentTier.name !== newTier.name;

    // Generate AI feedback
    const aiFeedback = await generatePredictBattleFeedback(
      prediction,
      actualDirection,
      priceChangePercent,
      displayDuration,
      chartData
    );

    // Update user stats
    const updates: any = {
      'elo.current': newElo,
      'elo.peak': Math.max(userData.elo?.peak || 0, newElo),
      'stats.totalGames': (userData.stats?.totalGames || 0) + 1,
      'stats.predictBattles': (userData.stats?.predictBattles || 0) + 1,
    };

    if (correct) {
      updates['stats.wins'] = (userData.stats?.wins || 0) + 1;
      updates['stats.currentStreak'] = (userData.stats?.currentStreak || 0) + 1;
      updates['stats.bestStreak'] = Math.max(
        userData.stats?.bestStreak || 0,
        (userData.stats?.currentStreak || 0) + 1
      );
    } else {
      updates['stats.losses'] = (userData.stats?.losses || 0) + 1;
      updates['stats.currentStreak'] = 0;
    }

    // Check for NFT unlock on tier change
    let unlockedNFT = undefined;
    if (tierChanged && newElo > currentElo) {
      const nftQuery = await db.collection('nftRewards')
        .where('eloRequired', '==', newTier.minElo)
        .limit(1)
        .get();

      if (!nftQuery.empty) {
        const nftDoc = nftQuery.docs[0];
        const nftData = nftDoc.data();
        unlockedNFT = {
          id: nftDoc.id,
          name: nftData.name,
          imageUrl: nftData.imageUrl
        };

        // Add NFT to user's collection
        updates['nfts'] = [...(userData.nfts || []), nftDoc.id];
      }
    }

    // Save game result
    await db.collection('predictBattles').add({
      userId,
      prediction,
      actualDirection,
      correct,
      startPrice,
      endPrice,
      priceChange,
      priceChangePercent,
      displayDuration,
      eloChange,
      eloAfter: newElo,
      aiFeedback,
      timestamp: new Date()
    });

    // Update user document
    await userRef.update(updates);

    const response: PredictBattleResponse = {
      correct,
      actualDirection,
      priceChange,
      priceChangePercent,
      eloChange,
      newElo,
      newTier: newTier.name,
      tierChanged,
      unlockedNFT,
      aiFeedback
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Predict Battle error:', error);
    return NextResponse.json(
      { error: 'Failed to process predict battle' },
      { status: 500 }
    );
  }
}

