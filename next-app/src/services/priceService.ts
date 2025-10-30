/**
 * Price Service - Fetches SOL/USDC price data
 * Uses Pyth Network for real-time prices
 */

import { API_ENDPOINTS } from '@/lib/constants';

export interface PricePoint {
  timestamp: number;
  price: number;
}

/**
 * Fetch current SOL/USDC price from Pyth Network
 */
export async function getCurrentPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.PYTH_MAINNET}?ids[]=${API_ENDPOINTS.PYTH_SOL_USD_ID}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price from Pyth');
    }

    const data = await response.json();
    const priceData = data[0]?.price;

    if (!priceData) {
      throw new Error('No price data available');
    }

    // Pyth returns price with exponent (e.g., price * 10^exponent)
    const price = Number(priceData.price) * Math.pow(10, priceData.expo);
    return price;
  } catch (error) {
    console.error('Error fetching price from Pyth:', error);
    // Fallback to mock price if API fails
    return generateMockPrice();
  }
}

/**
 * Generate mock SOL/USDC price for testing
 * Base price around $24 with realistic volatility
 */
export function generateMockPrice(basePrice: number = 24, volatility: number = 0.02): number {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return basePrice * (1 + change);
}

/**
 * Generate array of mock prices with realistic movement
 */
export function generateMockPrices(
  count: number,
  startPrice: number = 24,
  volatility: number = 0.02
): PricePoint[] {
  const prices: PricePoint[] = [];
  let currentPrice = startPrice;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    currentPrice = generateMockPrice(currentPrice, volatility);
    prices.push({
      timestamp: now + i * 1000, // 1 second intervals
      price: currentPrice,
    });
  }

  return prices;
}

/**
 * Simulate price stream for development
 * Returns a generator that yields prices at intervals
 */
export async function* streamPrices(
  intervalMs: number = 1000,
  volatility: number = 0.02,
  startPrice?: number
): AsyncGenerator<PricePoint> {
  let currentPrice = startPrice || (await getCurrentPrice());

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    
    try {
      // Try to get real price
      currentPrice = await getCurrentPrice();
    } catch {
      // Fallback to mock if real price fails
      currentPrice = generateMockPrice(currentPrice, volatility);
    }

    yield {
      timestamp: Date.now(),
      price: currentPrice,
    };
  }
}

/**
 * Fetch historical prices for chart
 * For now, generates mock data. Can be replaced with real API later
 */
export async function getHistoricalPrices(
  durationSeconds: number,
  intervalSeconds: number = 1
): Promise<PricePoint[]> {
  const count = Math.floor(durationSeconds / intervalSeconds);
  return generateMockPrices(count);
}

