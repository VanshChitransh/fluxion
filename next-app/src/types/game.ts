import { Timestamp } from 'firebase/firestore';

export type PredictionType = 'UP' | 'DOWN';

export interface PredictBattle {
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  startPrice: number;
  endPrice: number;
  prediction: PredictionType;
  correct: boolean;
  pointsEarned: number;
  eloChange: number;
  aiComment: string;
  chartData: number[];
}

export interface PredictBattleResult {
  correct: boolean;
  endPrice: number;
  priceChange: number;
  priceChangePercent: number;
  pointsEarned: number;
  newStreak: number;
  eloChange: number;
  newElo: number;
  tierChanged: boolean;
  newTier?: string;
  nftUnlocked?: NFTUnlock;
  aiComment: string;
}

export interface NFTUnlock {
  tierId: number;
  tierName: string;
  imageUrl: string;
  name: string;
  perk: string;
}

export interface PriceData {
  timestamp: number;
  price: number;
}

export interface MarketData {
  symbol: string;
  currentPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  change24h: number;
  change24hPercent: number;
}

