// Game Constants
export const GAME_CONSTANTS = {
  PREDICT_BATTLE: {
    CHART_DISPLAY_TIME: 7000, // 7 seconds
    WAIT_TIME: 12000, // 12 seconds to reveal
    CORRECT_POINTS: 10,
    STREAK_BONUS: 5,
    ELO_WIN_BASE: 10,
    ELO_LOSS: -5,
  },
  BATTLE_ROYALE: {
    DURATION: 30000, // 30 seconds
    STARTING_BALANCE: 1000,
    MAX_TRADES: 5,
    WIN_POINTS: 20,
    LOSE_POINTS: 5,
    K_FACTOR_NEW: 32, // For players with < 30 games
    K_FACTOR_ESTABLISHED: 24, // For players with >= 30 games
  },
  STARTING_ELO: 1000,
};

// ELO Tiers Configuration
export const ELO_TIERS = [
  {
    id: 1,
    name: 'Bronze Trader',
    minElo: 0,
    maxElo: 999,
    color: '#CD7F32',
    nftReward: 'Bronze Merchant Card',
    perk: null,
    emoji: '🥉',
  },
  {
    id: 2,
    name: 'Silver Trader',
    minElo: 1000,
    maxElo: 1199,
    color: '#C0C0C0',
    nftReward: 'Silver Merchant Card',
    perk: '+5% XP boost',
    emoji: '🥈',
  },
  {
    id: 3,
    name: 'Gold Trader',
    minElo: 1200,
    maxElo: 1399,
    color: '#FFD700',
    nftReward: 'Gold Merchant Card',
    perk: '+10% XP boost',
    emoji: '🥇',
  },
  {
    id: 4,
    name: 'Platinum Trader',
    minElo: 1400,
    maxElo: 1599,
    color: '#E5E4E2',
    nftReward: 'Platinum Strategist Card',
    perk: 'Access to exclusive battles',
    emoji: '💎',
  },
  {
    id: 5,
    name: 'Diamond Trader',
    minElo: 1600,
    maxElo: 1799,
    color: '#B9F2FF',
    nftReward: 'Diamond Strategist Card',
    perk: 'AI insights unlocked',
    emoji: '💠',
  },
  {
    id: 6,
    name: 'Master Trader',
    minElo: 1800,
    maxElo: 1999,
    color: '#9B30FF',
    nftReward: 'Master Sage Card',
    perk: 'Custom profile badge',
    emoji: '🔮',
  },
  {
    id: 7,
    name: 'Grandmaster',
    minElo: 2000,
    maxElo: 2299,
    color: '#FF6347',
    nftReward: 'Grandmaster Oracle Card',
    perk: 'Exclusive tournaments',
    emoji: '👑',
  },
  {
    id: 8,
    name: 'Legendary',
    minElo: 2300,
    maxElo: Infinity,
    color: '#FFD700',
    nftReward: 'Legendary Flux Master Card',
    perk: 'Hall of Fame entry',
    emoji: '⚡',
  },
] as const;

// Price update intervals
export const PRICE_UPDATE_INTERVAL = 1000; // 1 second

// API Endpoints
export const API_ENDPOINTS = {
  PYTH_MAINNET: 'https://hermes.pyth.network/api/latest_price_feeds',
  PYTH_SOL_USD_ID: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
};

