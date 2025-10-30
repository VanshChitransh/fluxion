import { clsx, type ClassValue } from 'clsx';
import { ELO_TIERS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ELO Helper Functions
export function getTierFromElo(elo: number) {
  return ELO_TIERS.find(
    (tier) => elo >= tier.minElo && elo <= tier.maxElo
  ) || ELO_TIERS[0];
}

export function getNextTier(currentElo: number) {
  const currentTier = getTierFromElo(currentElo);
  const nextTierIndex = ELO_TIERS.findIndex((t) => t.id === currentTier.id) + 1;
  return nextTierIndex < ELO_TIERS.length ? ELO_TIERS[nextTierIndex] : null;
}

export function getEloToNextTier(currentElo: number) {
  const nextTier = getNextTier(currentElo);
  if (!nextTier) return 0;
  return nextTier.minElo - currentElo;
}

export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  actualScore: number, // 1 for win, 0.5 for draw, 0 for loss
  gamesPlayed: number
): number {
  const kFactor = gamesPlayed < 30 ? 32 : 24;
  const expectedScore = calculateExpectedScore(playerElo, opponentElo);
  return Math.round(kFactor * (actualScore - expectedScore));
}

// Formatting Functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function formatEloChange(change: number): string {
  return change >= 0 ? `+${change}` : `${change}`;
}

// Time Functions
export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${seconds}s`;
}

export function formatTimestamp(timestamp: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

// Validation
export function validateTradeAmount(
  tradeType: 'BUY' | 'SELL',
  amount: number,
  currentBalance: number,
  currentHoldings: number,
  currentPrice: number
): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (tradeType === 'BUY') {
    const cost = amount * currentPrice;
    if (cost > currentBalance) {
      return { valid: false, error: 'Insufficient balance' };
    }
  } else {
    if (amount > currentHoldings) {
      return { valid: false, error: 'Insufficient holdings' };
    }
  }

  return { valid: true };
}

// Random Utilities
export function generateMockPrice(
  basePrice: number,
  volatility: number = 0.02
): number {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return basePrice * (1 + change);
}

export function generateMockPrices(
  startPrice: number,
  count: number,
  volatility: number = 0.02
): number[] {
  const prices: number[] = [startPrice];
  for (let i = 1; i < count; i++) {
    prices.push(generateMockPrice(prices[i - 1], volatility));
  }
  return prices;
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

