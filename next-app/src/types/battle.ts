import { Timestamp } from 'firebase/firestore';

export type BattleType = 'PVP' | 'PVE';
export type BattleStatus = 'waiting' | 'active' | 'finished';
export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  type: TradeType;
  amount: number;
  price: number;
  timestamp: number;
}

export interface BattlePlayer {
  userId: string;
  displayName: string;
  photoURL?: string;
  elo: number;
  trades: Trade[];
  currentBalance: number;
  currentHoldings: number;
  finalBalance: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Battle {
  id: string;
  type: BattleType;
  status: BattleStatus;
  players: BattlePlayer[];
  startTime: Timestamp;
  endTime?: Timestamp;
  duration: number; // in seconds
  startingBalance: number;
  marketData: {
    symbol: string;
    prices: number[];
  };
  winner?: string;
  aiAnalysis?: BattleAIAnalysis;
}

export interface BattleAIAnalysis {
  winner: string;
  loser: string;
  summary: string;
}

export interface BattleResult {
  winner: string;
  players: Array<{
    userId: string;
    finalBalance: number;
    profitLoss: number;
    profitLossPercent: number;
    eloChange: number;
    newElo: number;
  }>;
  tierChanges?: Array<{
    userId: string;
    oldTier: string;
    newTier: string;
    nftUnlocked?: {
      tierId: number;
      tierName: string;
      imageUrl: string;
    };
  }>;
  aiAnalysis: BattleAIAnalysis;
}

export interface TradeExecution {
  success: boolean;
  currentBalance: number;
  currentHoldings: number;
  error?: string;
}

