import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  elo: UserElo;
  stats: UserStats;
  nftRewards: NFTReward[];
  createdAt: Timestamp;
  lastActive: Timestamp;
}

export interface UserElo {
  rating: number;
  tier: string;
  tierLevel: number;
  highestElo: number;
  lastUpdated: Timestamp;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  currentStreak: number;
  bestStreak: number;
  predictBattles: PredictBattleStats;
  battleRoyale: BattleRoyaleStats;
}

export interface PredictBattleStats {
  played: number;
  correct: number;
  accuracy: number;
}

export interface BattleRoyaleStats {
  played: number;
  wins: number;
  avgProfitLoss: number;
}

export interface NFTReward {
  tierId: number;
  tierName: string;
  unlockedAt: Timestamp;
  claimed: boolean;
}

