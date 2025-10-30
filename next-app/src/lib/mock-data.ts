// Generate large mock price dataset for instant game start
const generateMockPrices = () => {
  const basePrice = 24.5; // SOL/USDC base price
  const history = [];
  let currentPrice = basePrice;
  
  // Generate 500 data points (8+ minutes of data)
  for (let i = 0; i < 500; i++) {
    const timestamp = Date.now() - (500 - i) * 1000; // Last 500 seconds
    
    // Create realistic price movement with trend + noise
    const trend = Math.sin(i * 0.02) * 0.5; // Slow trending wave
    const volatility = (Math.random() - 0.5) * 0.1; // Random volatility
    
    currentPrice = currentPrice + trend + volatility;
    currentPrice = Math.max(20, Math.min(30, currentPrice)); // Keep in reasonable range
    
    history.push({
      timestamp,
      price: currentPrice
    });
  }
  
  return {
    currentPrice: history[history.length - 1].price,
    priceHistory: history
  };
};

// Mock price data for development - pre-generated for instant loading
export const mockPriceData = generateMockPrices();

export const mockBattleResults = {
  correct: true,
  eloChange: 25,
  newElo: 1625,
  actualDirection: 'UP',
  priceChangePercent: 0.45,
  newTier: 'Gold',
  tierChanged: true,
  unlockedNFT: {
    name: 'Golden Trader Trophy'
  },
  aiFeedback: {
    analysis: "Excellent prediction! You correctly identified the upward momentum in the price action.",
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
    marketInsight: "The market showed clear bullish signals with increasing buy pressure."
  }
};

// Mock traders data carried over from v1
export const traders = [
  {
    owner: '1',
    name: 'Cypher',
    nft_mint: 'mint1',
    elo: 1850,
    wins: 120,
    losses: 45,
    xp: 8500,
    tier: 'Diamond',
    tierColor: 'text-cyan-400',
    skins: [],
    last_daily_claim: 0,
    image: 'trader-1',
  },
  // ... other traders
];

export const mockLeaderboardData = [
  { rank: 1, name: 'Cypher', elo: 1850, wins: 120, losses: 45 },
  { rank: 2, name: 'Nexus', elo: 1825, wins: 115, losses: 48 },
  { rank: 3, name: 'Vortex', elo: 1790, wins: 110, losses: 50 },
  // ... other entries
];