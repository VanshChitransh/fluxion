'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePriceData } from '@/hooks/usePriceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createChart, IChartApi, LineData, SeriesMarker, Time, DeepPartial, ISeriesApi } from 'lightweight-charts';
import confetti from 'canvas-confetti';
import { TrendingUp, TrendingDown, Trophy, Target, Zap, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { GameType } from '@/lib/solana/program';
import { TransactionNotification } from '@/components/blockchain/TransactionNotification';
import { useWallet } from '@solana/wallet-adapter-react';

interface PredictBattleGameProps {
  onComplete?: () => void;
}

type GamePhase = 
  | 'ready'
  | 'countdown' 
  | 'observing' 
  | 'predicting' 
  | 'waiting' 
  | 'revealing' 
  | 'result';

export function PredictBattleGame({ onComplete }: PredictBattleGameProps) {
  const { user } = useAuth();
  const { connected } = useWallet();
  const { updateElo, recordGame, txLoading, txError, lastTxSignature, profileExists } = useBlockchain();
  const { currentPrice, priceHistory, loading: priceLoading, error: priceError } = usePriceData({
    useMockData: true,
    updateInterval: 1000,
    volatility: 0.02
  });
  
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdown, setCountdown] = useState(3);
  const [observeTime, setObserveTime] = useState(15);
  const [waitTime, setWaitTime] = useState(3);
  const [prediction, setPrediction] = useState<'UP' | 'DOWN' | null>(null);
  const [chartData, setChartData] = useState<{ timestamp: number; price: number }[]>([]);
  const [startPrice, setStartPrice] = useState(0);
  const [endPrice, setEndPrice] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const previousPriceRef = useRef<number | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.log('Chart container not ready');
      return;
    }

    console.log('Initializing lightweight-charts...');
    let chart: IChartApi | null = null;
    let newSeries: ISeriesApi<'Line'> | null = null;

    try {
      const containerWidth = chartContainerRef.current.clientWidth || 800;
      
      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#1a1f2e' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#334155' },
          horzLines: { color: '#334155' },
        },
        width: containerWidth,
        height: 450,
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
          borderColor: '#4b5563',
          rightOffset: 5,
          barSpacing: 10,
          minBarSpacing: 5,
        },
        rightPriceScale: {
          borderColor: '#4b5563',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        crosshair: {
          mode: 1, // Normal crosshair mode
          vertLine: {
            color: '#6366f1',
            width: 1,
            style: 2,
            labelBackgroundColor: '#6366f1',
          },
          horzLine: {
            color: '#6366f1',
            width: 1,
            style: 2,
            labelBackgroundColor: '#6366f1',
          },
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });

      console.log('Chart created, adding series...');

      // Create a line series with better visibility
      // Using addSeries (newer API)
      // @ts-ignore - Type definitions may not match runtime
      newSeries = chart.addSeries('Line', {
        color: '#10b981',
        lineWidth: 3,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
        lastValueVisible: true,
        priceLineVisible: true,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
      }) as any;

      chartRef.current = chart;
      seriesRef.current = newSeries;

      console.log('Chart initialized successfully!', { chart: !!chart, series: !!newSeries });

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      const cleanup = () => {
        console.log('Cleaning up chart...');
        window.removeEventListener('resize', handleResize);
        try {
          if (chartRef.current) {
            chartRef.current.remove();
          }
        } catch (error) {
          console.error('Error cleaning up chart:', error);
        } finally {
          chartRef.current = null;
          seriesRef.current = null;
        }
      };

      return cleanup;
    } catch (error) {
      console.error('Error initializing chart:', error);
      setError('Failed to initialize chart');
    }
  }, []);

  // Update chart data and track price direction
  useEffect(() => {
    console.log('Price history update:', { 
      historyLength: priceHistory?.length, 
      hasChart: !!chartRef.current,
      hasSeries: !!seriesRef.current,
      currentPrice,
      phase 
    });
    
    if (!priceHistory?.length || !seriesRef.current) {
      console.warn('Missing data or chart:', { 
        priceHistory: priceHistory?.length, 
        seriesRef: !!seriesRef.current 
      });
      return;
    }

    try {
      // For the game, only show recent data (last 60 seconds / 60 points)
      // This prevents the "large bump then small changes" issue
      const recentDataCount = phase === 'ready' ? 60 : 100; // Show more during game
      const recentHistory = priceHistory.slice(-recentDataCount);
      
      const data = recentHistory
        .filter(p => p && p.timestamp && p.price) // Filter out any null values
        .map((p) => ({
          time: Math.floor(p.timestamp / 1000) as Time,
          value: p.price,
        }));
      
      console.log('Setting chart data:', { 
        totalPoints: priceHistory.length,
        showingPoints: data.length, 
        sample: data.slice(-3) 
      });
      
      if (data.length > 0) {
        seriesRef.current.setData(data);
        
        // Fit content to show all visible data nicely
        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }, 0);
        
        // Track price direction for visual feedback
        const latestPrice = data[data.length - 1].value;
        if (previousPriceRef.current !== null) {
          if (latestPrice > previousPriceRef.current) {
            setPriceDirection('up');
          } else if (latestPrice < previousPriceRef.current) {
            setPriceDirection('down');
          }
        }
        previousPriceRef.current = latestPrice;
      }
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [priceHistory, currentPrice, phase]);

  // Simple canvas fallback chart
  useEffect(() => {
    if (!canvasRef.current || !priceHistory || priceHistory.length < 2) {
      console.log('Canvas not ready:', { hasCanvas: !!canvasRef.current, dataPoints: priceHistory?.length });
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }
    
    // Use recent data only (same as lightweight-charts)
    const recentDataCount = phase === 'ready' ? 60 : 100;
    const recentHistory = priceHistory.slice(-recentDataCount);
    
    console.log('Drawing canvas chart with', recentHistory.length, 'points (out of', priceHistory.length, 'total)');
    
    // Set proper canvas size
    const width = canvas.offsetWidth || 800;
    const height = canvas.offsetHeight || 450;
    
    // Use devicePixelRatio for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set canvas style size
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Clear canvas with background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Get price range with some padding
    const prices = recentHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.1;
    
    // Draw price line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    recentHistory.forEach((point, index) => {
      const x = (index / (recentHistory.length - 1)) * (width - 40) + 20;
      const normalizedPrice = (point.price - (minPrice - padding)) / (priceRange + 2 * padding);
      const y = height - (normalizedPrice * (height - 40)) - 20;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw price labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`High: $${maxPrice.toFixed(2)}`, 10, 20);
    ctx.fillText(`Low: $${minPrice.toFixed(2)}`, 10, height - 10);
    ctx.fillText(`Now: $${currentPrice?.toFixed(2) || ''}`, width - 120, height / 2);
    
    // Draw title
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('SOL/USDC Price Chart', width / 2 - 80, 25);
    
  }, [priceHistory, currentPrice, phase]);

  // Handle prediction submission (using ref to avoid dependency issues)
  const submitPredictionRef = useRef<(() => Promise<void>) | null>(null);
  
  submitPredictionRef.current = async () => {
    if (!prediction) return;

    setLoading(true);
    setError(null);

    try {
      // In development, use local mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay for realism
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Calculate actual price movement
        const priceChange = endPrice - startPrice;
        const priceChangePercent = (priceChange / startPrice) * 100;
        const actualDirection: 'UP' | 'DOWN' = priceChange >= 0 ? 'UP' : 'DOWN';
        const isCorrect = prediction === actualDirection;
        
        // Generate random but realistic ELO change
        const baseEloChange = isCorrect ? 15 : -10;
        const convictionBonus = Math.abs(priceChangePercent) > 2 ? 5 : 0;
        const eloChange = isCorrect ? baseEloChange + convictionBonus : baseEloChange;
        
        // Mock current ELO (in real app this comes from user profile)
        const mockCurrentElo = 1000 + Math.floor(Math.random() * 500);
        const newElo = Math.max(0, mockCurrentElo + eloChange);
        
        // Determine tier based on ELO
        const getTier = (elo: number) => {
          if (elo >= 2000) return 'Diamond';
          if (elo >= 1600) return 'Platinum';
          if (elo >= 1200) return 'Gold';
          if (elo >= 800) return 'Silver';
          return 'Bronze';
        };
        
        const newTier = getTier(newElo);
        const oldTier = getTier(mockCurrentElo);
        const tierChanged = newTier !== oldTier && eloChange > 0;
        
        const mockResult = {
          correct: isCorrect,
          actualDirection,
          priceChange,
          priceChangePercent,
          eloChange,
          newElo,
          newTier,
          tierChanged,
          unlockedNFT: tierChanged && Math.random() > 0.5 ? {
            id: 'mock-nft-' + Date.now(),
            name: `${newTier} Trader Trophy`,
            imageUrl: '/assets/nfts/trophy.png'
          } : undefined,
          aiFeedback: {
            analysis: isCorrect 
              ? `Excellent prediction! You correctly identified the ${actualDirection === 'UP' ? 'upward momentum' : 'downward pressure'} in the price action. The price moved ${Math.abs(priceChangePercent).toFixed(2)}% ${actualDirection}.`
              : `Close, but the market moved ${actualDirection} instead. The price ${actualDirection === 'UP' ? 'gained' : 'lost'} ${Math.abs(priceChangePercent).toFixed(2)}%. Keep analyzing patterns!`,
            strengths: isCorrect ? [
              "Quick pattern recognition",
              "Good timing on entry",
              "Patient observation period"
            ] : [
              "Quick decision making",
              "Confident in your analysis",
              "Good engagement with the chart"
            ],
            improvements: [
              "Consider volume analysis for confirmation",
              "Watch for key support/resistance levels",
              "Factor in broader market sentiment",
              "Look for candlestick patterns"
            ],
            marketInsight: actualDirection === 'UP' 
              ? "The market showed bullish signals with increasing buy pressure during this period."
              : "The market displayed bearish pressure with selling momentum during this timeframe."
          }
        };
        
        setResult(mockResult);
        setPhase('result');

        // Record on blockchain if wallet is connected and profile exists
        if (connected && profileExists) {
          try {
            console.log('Recording game result on-chain...');
            
            // Update ELO
            await updateElo(eloChange, isCorrect, GameType.PredictBattle);
            
            // Record game result
            const pnlInCents = Math.floor(priceChange * 10000); // Convert to cents
            await recordGame(
              GameType.PredictBattle,
              isCorrect,
              eloChange,
              'SOL/USDC',
              pnlInCents
            );
            
            console.log('Game result recorded on blockchain!');
          } catch (blockchainError) {
            console.error('Failed to record on blockchain:', blockchainError);
            // Don't block the UI, just log the error
          }
        }

        // Confetti for wins!
        if (mockResult.correct) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        // Tier up celebration
        if (mockResult.tierChanged) {
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.5 },
              colors: ['#FFD700', '#FFA500', '#FF6347']
            });
          }, 500);
        }
        
        return;
      }

      // Production mode: make actual API call
      if (!user) {
        setError('Please sign in to play');
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/game/predict-battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          prediction,
          displayDuration: 7,
          chartData,
          startPrice,
          endPrice: currentPrice || 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit prediction');

      const data = await response.json();
      setResult(data);
      setPhase('result');

      // Confetti for wins!
      if (data.correct) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Tier up celebration
      if (data.tierChanged && data.eloChange > 0) {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FFA500', '#FF6347']
          });
        }, 500);
      }

    } catch (err) {
      console.error('Submit prediction error:', err);
      setError('Failed to submit prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrediction = () => {
    submitPredictionRef.current?.();
  };

  const handlePredict = (direction: 'UP' | 'DOWN') => {
    setPrediction(direction);
    setPhase('waiting');
    setWaitTime(3);
  };

  const handleStartGame = () => {
    setPhase('countdown');
    setCountdown(3);
  };

  // Game flow - countdown and phase transitions
  useEffect(() => {
    if (phase === 'ready') return; // Don't start game flow until user clicks start

    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } 
    
    if (phase === 'countdown' && countdown === 0) {
      const safeCurrentPrice = currentPrice ?? 24.5;
      setPhase('observing');
      setObserveTime(15);
      setChartData([]);
      setStartPrice(safeCurrentPrice);
      return;
    } 
    
    if (phase === 'observing' && observeTime > 0) {
      // Collect chart data during observation
      const timer = setTimeout(() => {
        const timestamp = Date.now();
        const price = currentPrice ?? 24.5;
        setChartData(prev => [...prev, { timestamp, price }]);
        setObserveTime(observeTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } 
    
    if (phase === 'observing' && observeTime === 0) {
      setPhase('predicting');
      return;
    } 
    
    if (phase === 'waiting' && waitTime > 0) {
      // Continue collecting data but hidden
      const timer = setTimeout(() => {
        const timestamp = Date.now();
        const price = currentPrice ?? 24.5;
        setChartData(prev => [...prev, { timestamp, price }]);
        setWaitTime(waitTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } 
    
    if (phase === 'waiting' && waitTime === 0) {
      const safeCurrentPrice = currentPrice ?? 24.5;
      setEndPrice(safeCurrentPrice);
      // Trigger submission on next tick to avoid calling during render
      const timer = setTimeout(() => handleSubmitPrediction(), 100);
      return () => clearTimeout(timer);
    }
  }, [phase, countdown, observeTime, waitTime]);

  const handlePlayAgain = () => {
    setPhase('ready');
    setCountdown(3);
    setPrediction(null);
    setResult(null);
    setChartData([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-white">
            <Target className="w-10 h-10 text-blue-500" />
            Predict Battle
          </h1>
          <p className="text-gray-300">
            Watch the chart for 7 seconds, then predict the next move!
          </p>
        </div>

      {/* Ready State - Start Button */}
      {phase === 'ready' && (
        <Card className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-700">
          <CardContent className="p-12 text-center space-y-6">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-white">Ready to Test Your Skills?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            You'll see a live SOL/USDC chart for <span className="text-blue-400 font-bold">15 seconds</span>.
              <br />
              After that, predict if the price will go <span className="text-green-400 font-bold">UP 📈</span> or <span className="text-red-400 font-bold">DOWN 📉</span>.
            </p>
            <div className="flex gap-4 justify-center items-center text-sm text-gray-400">
              <span>✅ Win: +15 ELO</span>
              <span>•</span>
              <span>❌ Loss: -10 ELO</span>
              <span>•</span>
              <span>🔥 Bonus: +5 ELO for high conviction</span>
            </div>
            <Button 
              onClick={handleStartGame} 
              size="lg" 
              className="text-2xl px-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              🚀 Start Game
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Phase Indicator */}
      {phase !== 'ready' && (
        <Card className="bg-gradient-to-r from-blue-950/50 to-purple-950/50 border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-white">
                  {phase === 'countdown' && `Get Ready... ${countdown}`}
                  {phase === 'observing' && `📊 Observe the Chart - ${observeTime}s remaining`}
                  {phase === 'predicting' && '🎯 Make Your Prediction!'}
                  {phase === 'waiting' && `⏳ Waiting for result... (${waitTime}s)`}
                  {phase === 'result' && (result?.correct ? '✅ Correct!' : '❌ Incorrect')}
                </span>
              </div>
              {phase === 'observing' && (
                <Progress value={(15 - observeTime) / 15 * 100} className="w-32" />
              )}
              {phase === 'waiting' && (
                <Progress value={(3 - waitTime) / 3 * 100} className="w-32" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {phase !== 'ready' && (
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                SOL/USDC Live Price
              </span>
              {currentPrice && (
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-mono transition-colors ${
                    priceDirection === 'up' ? 'text-green-400' : 
                    priceDirection === 'down' ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    ${currentPrice.toFixed(2)}
                  </span>
                  <span className={`text-xl transition-transform ${priceDirection === 'up' ? 'animate-bounce' : ''}`}>
                    {priceDirection === 'up' ? '↗' : priceDirection === 'down' ? '↘' : '→'}
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="relative">
              {/* Debug info */}
              {!priceHistory?.length && (
                <div className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded text-sm z-10">
                  Loading price data... ({priceHistory?.length || 0} points)
                </div>
              )}
              
              {/* Main chart container - Professional trading chart */}
              <div 
                ref={chartContainerRef}
                className={`rounded-lg overflow-hidden bg-[#1a1f2e] min-h-[450px] ${phase === 'predicting' || phase === 'waiting' ? 'blur-xl opacity-30' : ''}`}
                style={{ 
                  width: '100%', 
                  height: '450px', 
                  display: chartRef.current ? 'block' : 'none' 
                }}
              />
              
              {/* Canvas fallback - shown if lightweight-charts fails */}
              {!chartRef.current && (
                <canvas
                  ref={canvasRef}
                  className={`rounded-lg bg-slate-800 ${phase === 'predicting' || phase === 'waiting' ? 'blur-xl opacity-30' : ''}`}
                  style={{ 
                    width: '100%', 
                    height: '450px',
                    display: 'block'
                  }}
                />
              )}
              
              {(phase === 'predicting' || phase === 'waiting') && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="text-center">
                    <div className="text-8xl font-bold text-white drop-shadow-2xl mb-4">❓</div>
                    <p className="text-2xl font-bold text-white drop-shadow-lg">
                      {phase === 'predicting' ? 'Make your prediction!' : 'Analyzing...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chart Controls Info */}
            {chartRef.current && phase === 'observing' && (
              <div className="mt-3 p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-1">
                  <div className="font-semibold mb-1">📊 Chart Controls:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>🖱️ <strong>Mouse Wheel:</strong> Zoom in/out</div>
                    <div>👆 <strong>Click + Drag:</strong> Pan chart</div>
                    <div>📍 <strong>Hover:</strong> Crosshair price</div>
                    <div>🔍 <strong>Double Click:</strong> Fit to view</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Data info for debugging */}
            <div className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>Data points: {priceHistory?.length || 0}</span>
              <span>
                {chartRef.current ? '✅ Professional Chart' : '⚠️ Canvas Fallback'} | 
                Series: {seriesRef.current ? '✅' : '❌'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Buttons */}
      {phase === 'predicting' && (
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handlePredict('UP')}
            size="lg"
            className="h-32 text-2xl font-bold bg-green-600 hover:bg-green-700"
          >
            <TrendingUp className="w-12 h-12 mr-3" />
            UP 📈
          </Button>
          <Button
            onClick={() => handlePredict('DOWN')}
            size="lg"
            className="h-32 text-2xl font-bold bg-red-600 hover:bg-red-700"
          >
            <TrendingDown className="w-12 h-12 mr-3" />
            DOWN 📉
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Alert>
          <Brain className="w-4 h-4 animate-pulse" />
          <AlertDescription>AI is analyzing your prediction...</AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Result */}
      {phase === 'result' && result && (
        <div className="space-y-4">
          {/* Result Header */}
          <Card className={`border-2 ${result.correct ? 'border-green-500 bg-green-950/30' : 'border-red-500 bg-red-950/30'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-3xl">
                  {result.correct ? '✅ Correct Prediction!' : '❌ Wrong Prediction'}
                </span>
                <span className={`text-2xl ${result.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.eloChange >= 0 ? '+' : ''}{result.eloChange} ELO
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span>Your Prediction:</span>
                <span className="font-bold">{prediction}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span>Actual Direction:</span>
                <span className="font-bold">{result.actualDirection}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span>Price Change:</span>
                <span className={result.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {result.priceChangePercent >= 0 ? '+' : ''}{result.priceChangePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span>New ELO:</span>
                <span className="font-bold text-blue-400">{result.newElo}</span>
              </div>
              {result.tierChanged && (
                <div className="mt-4 p-4 bg-yellow-950/50 border border-yellow-600 rounded-lg">
                  <p className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Tier Up! Welcome to {result.newTier}!
                  </p>
                  {result.unlockedNFT && (
                    <p className="mt-2 text-green-400">🎁 Unlocked NFT: {result.unlockedNFT.name}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Feedback */}
          <Card className="bg-gradient-to-br from-purple-950/50 to-blue-950/50 border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">Analysis</h4>
                <p className="text-gray-300">{result.aiFeedback.analysis}</p>
              </div>

              <div>
                <h4 className="font-semibold text-green-300 mb-2">✅ Strengths</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {result.aiFeedback.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">💡 Improvements</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {result.aiFeedback.improvements.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-300 mb-2">📊 Market Insight</h4>
                <p className="text-gray-300">{result.aiFeedback.marketInsight}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handlePlayAgain} size="lg" className="flex-1">
              Play Again
            </Button>
            <Button onClick={onComplete} size="lg" variant="outline" className="flex-1">
              Back to Menu
            </Button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {(priceLoading || priceError) && (
        <Alert variant="destructive">
          <AlertDescription>
            {priceLoading ? 'Loading price data...' : 'Disconnected from price feed. Reconnecting...'}
          </AlertDescription>
        </Alert>
      )}
      </div>
      
      {/* Transaction Notification */}
      <TransactionNotification
        signature={lastTxSignature}
        loading={txLoading}
        error={txError}
      />
    </div>
  );
}

