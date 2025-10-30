'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PricePoint, getCurrentPrice, generateMockPrice } from '@/services/priceService';
import { mockPriceData } from '@/lib/mock-data';

interface UsePriceDataOptions {
  updateInterval?: number; // milliseconds
  useMockData?: boolean;
  volatility?: number;
}

// Check if we're in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

export function usePriceData(options: UsePriceDataOptions = {}) {
  const {
    updateInterval = 1000,
    useMockData = isDevelopment, // Default to true in development
    volatility = 0.02,
  } = options;

  // Initialize immediately with mock data for instant load
  const [currentPrice, setCurrentPrice] = useState<number | null>(
    useMockData ? mockPriceData.currentPrice : null
  );
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>(
    useMockData ? mockPriceData.priceHistory : []
  );
  const [loading, setLoading] = useState(!useMockData); // No loading if using mock data
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPriceRef = useRef<number | null>(useMockData ? mockPriceData.currentPrice : null);
  const initializedRef = useRef(useMockData); // Already initialized if using mock data

  // Update ref whenever currentPrice changes
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  // Fetch and update price
  const fetchPrice = useCallback(async () => {
    try {
      let price: number;

      if (useMockData) {
        // Generate new price based on current with some randomness
        const basePrice = currentPriceRef.current || mockPriceData.currentPrice;
        price = basePrice + (Math.random() - 0.5) * volatility * basePrice;
        price = Math.max(20, Math.min(30, price)); // Keep in reasonable range
      } else {
        price = await getCurrentPrice();
      }

      const pricePoint: PricePoint = {
        timestamp: Date.now(),
        price,
      };

      setCurrentPrice(price);
      setPriceHistory((prev) => [...prev, pricePoint].slice(-500)); // Keep last 500 points
      setError(null);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching price:', err);
      if (useMockData) {
        // Fallback to mock data if real data fails
        setCurrentPrice(mockPriceData.currentPrice);
        setPriceHistory(mockPriceData.priceHistory);
        setError(null);
      } else {
        setError(err.message || 'Failed to fetch price');
      }
      setLoading(false);
    }
  }, [useMockData, volatility]);

  // Start price updates
  useEffect(() => {
    // Initial fetch
    fetchPrice();

    // Setup interval for continuous updates
    intervalRef.current = setInterval(fetchPrice, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrice, updateInterval]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Clear history
  const clearHistory = useCallback(() => {
    setPriceHistory([]);
  }, []);

  return {
    currentPrice,
    priceHistory,
    loading,
    error,
    refresh,
    clearHistory,
  };
}

