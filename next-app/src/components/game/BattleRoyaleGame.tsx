'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePriceData } from '@/hooks/usePriceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import confetti from 'canvas-confetti';
import { Swords, TrendingUp, TrendingDown, Trophy, Clock, DollarSign, Target, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GAME_CONSTANTS } from '@/lib/constants';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { GameType } from '@/lib/solana/program';
import { TransactionNotification } from '@/components/blockchain/TransactionNotification';
import { useWallet } from '@solana/wallet-adapter-react';
import { BlockchainAccountPrompt } from '@/components/blockchain/BlockchainAccountPrompt';
import { GameResultModal } from '@/components/blockchain/GameResultModal';

interface BattleRoyaleGameProps {
  onComplete?: () => void;
}

type GamePhase = 'ready' | 'countdown' | 'trading' | 'finished';

interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: number;
  solAmount?: number;
}

interface PlayerState {
  balance: number;
  solHoldings: number;
  trades: Trade[];
  finalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function BattleRoyaleGame({ onComplete }: BattleRoyaleGameProps) {
  const { user } = useAuth();
  const { connected } = useWallet();
  const { updateElo, recordGame, txLoading, txError, lastTxSignature, profileExists } = useBlockchain();
  const { currentPrice, priceHistory } = usePriceData({
    useMockData: true,
    updateInterval: 1000,
    volatility: 0.03 // Higher volatility for more action
  });

  // Game state
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdown, setCountdown] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    balance: GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE,
    solHoldings: 0,
    trades: [],
    finalValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
  });

  // AI Opponent state
  const [opponentState, setOpponentState] = useState<PlayerState>({
    balance: GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE,
    solHoldings: 0,
    trades: [],
    finalValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Blockchain prompts
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [pendingGameResult, setPendingGameResult] = useState<any>(null);

  // Chart refs
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

    console.log('Initializing Battle Royale chart...');

    try {
      const containerWidth = chartContainerRef.current.clientWidth || 800;

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#1a1f2e' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#334155' },
          horzLines: { color: '#334155' },
        },
        width: containerWidth,
        height: 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
          borderColor: '#4b5563',
        },
        rightPriceScale: {
          borderColor: '#4b5563',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
          mouseWheel: true,
          pinch: true,
        },
      });

      // @ts-ignore - Type compatibility
      const newSeries = chart.addSeries('Line', {
        color: '#3b82f6',
        lineWidth: 3,
        lastValueVisible: true,
        priceLineVisible: true,
      }) as any;

      chartRef.current = chart;
      seriesRef.current = newSeries;

      console.log('Battle Royale chart initialized!');

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        console.log('Cleaning up Battle Royale chart...');
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }, []);

  // Update chart data
  useEffect(() => {
    if (!priceHistory?.length || !seriesRef.current) return;

    const recentData = priceHistory.slice(-100);
    const data = recentData
      .filter(p => p && p.timestamp && p.price)
      .map((p) => ({
        time: Math.floor(p.timestamp / 1000) as Time,
        value: p.price,
      }));

    if (data.length > 0) {
      seriesRef.current.setData(data);
      setTimeout(() => chartRef.current?.timeScale().fitContent(), 0);
    }
  }, [priceHistory]);

  // Canvas fallback chart
  useEffect(() => {
    if (!canvasRef.current || !priceHistory || priceHistory.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const recentHistory = priceHistory.slice(-100);
    const width = canvas.offsetWidth || 800;
    const height = canvas.offsetHeight || 400;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // Clear and draw background
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

      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw price line
    const prices = recentHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.1;

    ctx.strokeStyle = '#3b82f6';
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

    // Draw labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`High: $${maxPrice.toFixed(2)}`, 10, 20);
    ctx.fillText(`Low: $${minPrice.toFixed(2)}`, 10, height - 10);
    ctx.fillText(`Now: $${currentPrice?.toFixed(2) || ''}`, width - 120, height / 2);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('SOL/USDC Live', width / 2 - 60, 25);
  }, [priceHistory, currentPrice]);

  // Game timer
  useEffect(() => {
    if (phase !== 'countdown' && phase !== 'trading') return;

    const timer = setInterval(() => {
      if (phase === 'countdown') {
        if (countdown > 0) {
          setCountdown(countdown - 1);
        } else {
          setPhase('trading');
          setTimeRemaining(30);
        }
      } else if (phase === 'trading') {
        if (timeRemaining > 0) {
          setTimeRemaining(timeRemaining - 1);
        } else {
          finalizeBattle();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, countdown, timeRemaining]);

  // AI opponent trading logic
  useEffect(() => {
    if (phase !== 'trading' || !currentPrice) return;

    // AI makes random trades every 3-8 seconds
    const aiInterval = setInterval(() => {
      if (opponentState.trades.length >= GAME_CONSTANTS.BATTLE_ROYALE.MAX_TRADES) return;

      const shouldTrade = Math.random() > 0.3;
      if (!shouldTrade) return;

      // AI logic: buy if balance > 300, sell if holdings > 0
      if (opponentState.balance > 300 && Math.random() > 0.5) {
        const amount = Math.min(opponentState.balance * 0.3, opponentState.balance);
        executeTrade('opponent', 'BUY', amount);
      } else if (opponentState.solHoldings > 0 && Math.random() > 0.5) {
        const solToSell = opponentState.solHoldings * (0.5 + Math.random() * 0.5);
        executeTrade('opponent', 'SELL', solToSell * currentPrice);
      }
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(aiInterval);
  }, [phase, opponentState, currentPrice]);

  const executeTrade = (player: 'player' | 'opponent', type: 'BUY' | 'SELL', amount: number) => {
    if (!currentPrice) return;

    const state = player === 'player' ? playerState : opponentState;
    const setState = player === 'player' ? setPlayerState : setOpponentState;

    if (state.trades.length >= GAME_CONSTANTS.BATTLE_ROYALE.MAX_TRADES) {
      if (player === 'player') {
        setError('Maximum 5 trades allowed!');
      }
      return;
    }

    const trade: Trade = {
      id: Date.now().toString(),
      type,
      amount,
      price: currentPrice,
      timestamp: Date.now(),
    };

    if (type === 'BUY') {
      if (state.balance < amount) {
        if (player === 'player') {
          setError('Insufficient balance!');
        }
        return;
      }
      const solAmount = amount / currentPrice;
      setState(prev => ({
        ...prev,
        balance: prev.balance - amount,
        solHoldings: prev.solHoldings + solAmount,
        trades: [...prev.trades, { ...trade, solAmount }],
      }));
    } else {
      const solAmount = amount / currentPrice;
      if (state.solHoldings < solAmount) {
        if (player === 'player') {
          setError('Insufficient SOL holdings!');
        }
        return;
      }
      setState(prev => ({
        ...prev,
        balance: prev.balance + amount,
        solHoldings: prev.solHoldings - solAmount,
        trades: [...prev.trades, { ...trade, solAmount }],
      }));
    }

    setError(null);
  };

  const handleBuy = (percentage: number) => {
    const amount = playerState.balance * (percentage / 100);
    executeTrade('player', 'BUY', amount);
  };

  const handleSell = (percentage: number) => {
    if (playerState.solHoldings === 0) {
      setError('No SOL to sell!');
      return;
    }
    const amount = playerState.solHoldings * (percentage / 100) * (currentPrice || 0);
    executeTrade('player', 'SELL', amount);
  };

  const finalizeBattle = () => {
    const safeCurrentPrice = currentPrice || 24.5;

    // Calculate final values
    const playerFinalValue = playerState.balance + (playerState.solHoldings * safeCurrentPrice);
    const playerPL = playerFinalValue - GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE;
    const playerPLPercent = (playerPL / GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE) * 100;

    const opponentFinalValue = opponentState.balance + (opponentState.solHoldings * safeCurrentPrice);
    const opponentPL = opponentFinalValue - GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE;
    const opponentPLPercent = (opponentPL / GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE) * 100;

    setPlayerState(prev => ({
      ...prev,
      finalValue: playerFinalValue,
      profitLoss: playerPL,
      profitLossPercent: playerPLPercent,
    }));

    setOpponentState(prev => ({
      ...prev,
      finalValue: opponentFinalValue,
      profitLoss: opponentPL,
      profitLossPercent: opponentPLPercent,
    }));

    const won = playerFinalValue > opponentFinalValue;
    const eloChange = won ? 25 : -10;

    setResult({
      won,
      playerPL,
      playerPLPercent,
      opponentPL,
      opponentPLPercent,
      eloChange,
      newElo: 1000 + eloChange,
    });

    setPhase('finished');

    // Store game result data for blockchain modal
    const pnlInCents = Math.floor(playerPL * 100); // Convert to cents
    setPendingGameResult({
      won,
      eloChange,
      gameType: GameType.BattleRoyale,
      symbol: 'SOL/USDC',
      pnl: pnlInCents
    });

    // Show the blockchain recording modal after a delay
    setTimeout(() => {
      setShowResultModal(true);
    }, 3000); // Wait 3 seconds to let user see result first

    if (won) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleStart = () => {
    // Check if user wants to use blockchain
    if (connected && !profileExists) {
      setShowAccountPrompt(true);
    } else {
      startGameCountdown();
    }
  };

  const startGameCountdown = () => {
    setPhase('countdown');
    setCountdown(3);
  };

  const handlePlayAgain = () => {
    setPhase('ready');
    setPlayerState({
      balance: GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE,
      solHoldings: 0,
      trades: [],
      finalValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
    });
    setOpponentState({
      balance: GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE,
      solHoldings: 0,
      trades: [],
      finalValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
    });
    setResult(null);
    setError(null);
    setShowResultModal(false);
    setPendingGameResult(null);
  };

  const currentValue = playerState.balance + (playerState.solHoldings * (currentPrice || 0));
  const currentPL = currentValue - GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE;
  const currentPLPercent = (currentPL / GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-white">
            <Swords className="w-10 h-10 text-red-500" />
            Battle Royale
          </h1>
          <p className="text-gray-300">
            30 seconds to trade. Highest profit wins!
          </p>
        </div>

        {/* Ready State */}
        {phase === 'ready' && (
          <Card className="bg-gradient-to-br from-red-950/50 to-purple-950/50 border-red-700">
            <CardContent className="p-12 text-center space-y-6">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-3xl font-bold text-white">Ready for Battle?</h2>
              <div className="space-y-2 text-lg text-gray-300 max-w-2xl mx-auto">
                <p>• <span className="text-blue-400 font-bold">$1,000</span> starting balance</p>
                <p>• <span className="text-green-400 font-bold">30 seconds</span> to trade SOL/USDC</p>
                <p>• <span className="text-yellow-400 font-bold">Max 5 trades</span> allowed</p>
                <p>• Highest <span className="text-purple-400 font-bold">profit</span> wins!</p>
              </div>
              <div className="flex gap-4 justify-center items-center text-sm text-gray-400">
                <span>🏆 Win: +25 ELO</span>
                <span>•</span>
                <span>💔 Loss: -10 ELO</span>
              </div>
              <Button 
                onClick={handleStart}
                size="lg"
                className="text-2xl px-12 py-8 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
              >
                ⚔️ Start Battle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <Card className="bg-gradient-to-br from-yellow-950/50 to-orange-950/50 border-yellow-700">
            <CardContent className="p-20 text-center">
              <div className="text-9xl font-bold text-white animate-bounce">
                {countdown}
              </div>
              <p className="text-2xl text-gray-300 mt-4">Get Ready!</p>
            </CardContent>
          </Card>
        )}

        {/* Trading Phase */}
        {phase === 'trading' && (
          <>
            {/* Timer & Stats Bar */}
            <Card className="bg-gradient-to-r from-blue-950/50 to-purple-950/50 border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="text-2xl font-bold text-white">{timeRemaining}s</span>
                    </div>
                    <Progress value={(30 - timeRemaining) / 30 * 100} className="w-32" />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Portfolio Value</div>
                      <div className="text-lg font-bold text-white">${currentValue.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">P&L</div>
                      <div className={`text-lg font-bold ${currentPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currentPL >= 0 ? '+' : ''}{currentPLPercent.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Trades</div>
                      <div className="text-lg font-bold text-white">{playerState.trades.length}/5</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-6">
              {/* Trading Panel */}
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Trading Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white font-mono">${playerState.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">SOL Holdings:</span>
                      <span className="text-white font-mono">{playerState.solHoldings.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Price:</span>
                      <span className="text-blue-400 font-mono">${currentPrice?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-green-400 mb-2">BUY SOL</div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => handleBuy(25)} size="sm" className="bg-green-600 hover:bg-green-700">
                          25%
                        </Button>
                        <Button onClick={() => handleBuy(50)} size="sm" className="bg-green-600 hover:bg-green-700">
                          50%
                        </Button>
                        <Button onClick={() => handleBuy(100)} size="sm" className="bg-green-600 hover:bg-green-700">
                          ALL
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-red-400 mb-2">SELL SOL</div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => handleSell(25)} size="sm" className="bg-red-600 hover:bg-red-700">
                          25%
                        </Button>
                        <Button onClick={() => handleSell(50)} size="sm" className="bg-red-600 hover:bg-red-700">
                          50%
                        </Button>
                        <Button onClick={() => handleSell(100)} size="sm" className="bg-red-600 hover:bg-red-700">
                          ALL
                        </Button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Trade History */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm font-semibold text-gray-400 mb-2">Your Trades</div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {playerState.trades.map((trade, i) => (
                        <div key={trade.id} className="text-xs flex justify-between items-center p-2 bg-slate-800/50 rounded">
                          <span className={trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                            {trade.type}
                          </span>
                          <span className="text-gray-300">${trade.amount.toFixed(2)}</span>
                          <span className="text-gray-500">@${trade.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {playerState.trades.length === 0 && (
                        <div className="text-xs text-gray-500 text-center py-4">No trades yet</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <div className="col-span-2">
                <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-blue-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-white">
                      <span>SOL/USDC Live Chart</span>
                      {currentPrice && (
                        <span className="text-2xl font-mono text-blue-400">
                          ${currentPrice.toFixed(2)}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    {/* Professional chart */}
                    <div
                      ref={chartContainerRef}
                      className="rounded-lg overflow-hidden bg-[#1a1f2e]"
                      style={{ 
                        width: '100%', 
                        height: '400px',
                        display: chartRef.current ? 'block' : 'none'
                      }}
                    />
                    
                    {/* Canvas fallback */}
                    {!chartRef.current && (
                      <canvas
                        ref={canvasRef}
                        className="rounded-lg bg-slate-800"
                        style={{ 
                          width: '100%', 
                          height: '400px',
                          display: 'block'
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {phase === 'finished' && result && (
          <div className="space-y-6">
            <Card className={`border-4 ${result.won ? 'border-green-500 bg-green-950/30' : 'border-red-500 bg-red-950/30'}`}>
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-6xl mb-4">
                    {result.won ? '🏆' : '💔'}
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {result.won ? 'Victory!' : 'Defeat'}
                  </div>
                  <div className={`text-3xl mt-2 ${result.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.eloChange >= 0 ? '+' : ''}{result.eloChange} ELO
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Your Results */}
                  <div className="p-6 bg-blue-950/30 border-2 border-blue-500/50 rounded-lg">
                    <div className="text-lg font-bold text-blue-400 mb-4">Your Performance</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Final Value:</span>
                        <span className="text-white font-bold">${playerState.finalValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit/Loss:</span>
                        <span className={`font-bold ${result.playerPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.playerPL >= 0 ? '+' : ''}${result.playerPL.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Return:</span>
                        <span className={`font-bold ${result.playerPLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.playerPLPercent >= 0 ? '+' : ''}{result.playerPLPercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trades:</span>
                        <span className="text-white">{playerState.trades.length}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Opponent Results */}
                  <div className="p-6 bg-purple-950/30 border-2 border-purple-500/50 rounded-lg">
                    <div className="text-lg font-bold text-purple-400 mb-4">AI Opponent</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Final Value:</span>
                        <span className="text-white font-bold">${opponentState.finalValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit/Loss:</span>
                        <span className={`font-bold ${result.opponentPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.opponentPL >= 0 ? '+' : ''}${result.opponentPL.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Return:</span>
                        <span className={`font-bold ${result.opponentPLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.opponentPLPercent >= 0 ? '+' : ''}{result.opponentPLPercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trades:</span>
                        <span className="text-white">{opponentState.trades.length}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Status */}
                {!connected && (
                  <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300">
                      ℹ️ Connect your wallet to record results on Solana blockchain
                    </p>
                  </div>
                )}
                {connected && !profileExists && (
                  <div className="p-3 bg-yellow-950/30 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-300">
                      ⚠️ Initialize your blockchain profile to record results on-chain
                    </p>
                  </div>
                )}
                {connected && profileExists && (
                  <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300">
                      ✅ Results recorded on Solana blockchain
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button onClick={handlePlayAgain} size="lg" className="flex-1">
                    ⚔️ Battle Again
                  </Button>
                  <Button onClick={onComplete} size="lg" variant="outline" className="flex-1">
                    Back to Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Blockchain Account Prompt */}
      {showAccountPrompt && (
        <BlockchainAccountPrompt
          onClose={() => setShowAccountPrompt(false)}
          onSuccess={() => {
            setShowAccountPrompt(false);
            startGameCountdown();
          }}
          onSkip={() => {
            setShowAccountPrompt(false);
            startGameCountdown();
          }}
        />
      )}
      
      {/* Game Result Modal */}
      {showResultModal && pendingGameResult && (
        <GameResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          gameResult={pendingGameResult}
        />
      )}
      
      {/* Transaction Notification */}
      <TransactionNotification
        signature={lastTxSignature}
        loading={txLoading}
        error={txError}
      />
    </div>
  );
}

