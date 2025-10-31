'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePriceData } from '@/hooks/usePriceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import confetti from 'canvas-confetti';
import { Swords, Users, Clock, Target, Zap } from 'lucide-react';
import { GAME_CONSTANTS } from '@/lib/constants';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { GameType } from '@/lib/solana/program';
import { TransactionNotification } from '@/components/blockchain/TransactionNotification';
import { useWallet } from '@solana/wallet-adapter-react';
import { BlockchainAccountPrompt } from '@/components/blockchain/BlockchainAccountPrompt';
import { GameResultModal } from '@/components/blockchain/GameResultModal';

interface MultiplayerBattleGameProps {
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
  playerId: string;
}

interface PlayerState {
  id: string;
  name: string;
  balance: number;
  solHoldings: number;
  trades: Trade[];
  finalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function MultiplayerBattleGame({ onComplete }: MultiplayerBattleGameProps) {
  const { connected } = useWallet();
  const { updateElo, recordGame, txLoading, txError, lastTxSignature, profileExists } = useBlockchain();
  const { currentPrice, priceHistory } = usePriceData({
    useMockData: true,
    updateInterval: 1000,
    volatility: 0.03
  });

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdown, setCountdown] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // Players
  const [player1, setPlayer1] = useState<PlayerState>({
    id: 'player1',
    name: 'You',
    balance: GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE,
    solHoldings: 0,
    trades: [],
    finalValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
  });

  const [player2, setPlayer2] = useState<PlayerState>({
    id: 'player2',
    name: 'Opponent', // In dev mode, would be real player name
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

  // Initialize chart (same as BattleRoyale)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#1a1f2e' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#334155' },
          horzLines: { color: '#334155' },
        },
        width: chartContainerRef.current.clientWidth || 800,
        height: 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
      });

      const newSeries = chart.addSeries('Line', {
        color: '#3b82f6',
        lineWidth: 3,
      }) as any;

      chartRef.current = chart;
      seriesRef.current = newSeries;

      return () => {
        chart.remove();
      };
    } catch (error) {
      console.error('Chart error:', error);
    }
  }, []);

  // Update chart
  useEffect(() => {
    if (!priceHistory?.length || !seriesRef.current) return;

    const data = priceHistory.slice(-100)
      .filter(p => p?.timestamp && p?.price)
      .map((p) => ({
        time: Math.floor(p.timestamp / 1000) as Time,
        value: p.price,
      }));

    if (data.length > 0) {
      seriesRef.current.setData(data);
      setTimeout(() => chartRef.current?.timeScale().fitContent(), 0);
    }
  }, [priceHistory]);

  // Canvas fallback
  useEffect(() => {
    if (!canvasRef.current || !priceHistory || priceHistory.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const recentHistory = priceHistory.slice(-100);
    const width = canvas.offsetWidth || 800;
    const height = 400;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Price line
    const prices = recentHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    recentHistory.forEach((point, index) => {
      const x = (index / (recentHistory.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [priceHistory, currentPrice]);

  // Game timer
  useEffect(() => {
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

  // Simulate opponent trades (in dev mode)
  useEffect(() => {
    if (phase !== 'trading' || !currentPrice) return;

    const interval = setInterval(() => {
      if (player2.trades.length >= GAME_CONSTANTS.BATTLE_ROYALE.MAX_TRADES) return;

      // Opponent makes random trades
      if (Math.random() > 0.6) {
        if (player2.balance > 300 && Math.random() > 0.5) {
          const amount = player2.balance * (0.2 + Math.random() * 0.3);
          executeTrade('player2', 'BUY', amount);
        } else if (player2.solHoldings > 0 && Math.random() > 0.5) {
          const amount = player2.solHoldings * currentPrice * (0.3 + Math.random() * 0.4);
          executeTrade('player2', 'SELL', amount);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [phase, player2, currentPrice]);

  const executeTrade = (playerId: string, type: 'BUY' | 'SELL', amount: number) => {
    if (!currentPrice) return;

    const state = playerId === 'player1' ? player1 : player2;
    const setState = playerId === 'player1' ? setPlayer1 : setPlayer2;

    if (state.trades.length >= GAME_CONSTANTS.BATTLE_ROYALE.MAX_TRADES) {
      if (playerId === 'player1') setError('Max 5 trades!');
      return;
    }

    const trade: Trade = {
      id: Date.now().toString() + playerId,
      type,
      amount,
      price: currentPrice,
      timestamp: Date.now(),
      playerId,
    };

    if (type === 'BUY') {
      if (state.balance < amount) {
        if (playerId === 'player1') setError('Insufficient balance!');
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
        if (playerId === 'player1') setError('Insufficient SOL!');
        return;
      }
      setState(prev => ({
        ...prev,
        balance: prev.balance + amount,
        solHoldings: prev.solHoldings - solAmount,
        trades: [...prev.trades, { ...trade, solAmount }],
      }));
    }

    if (playerId === 'player1') setError(null);
  };

  const handleBuy = (percentage: number) => {
    executeTrade('player1', 'BUY', player1.balance * (percentage / 100));
  };

  const handleSell = (percentage: number) => {
    if (player1.solHoldings === 0) {
      setError('No SOL to sell!');
      return;
    }
    executeTrade('player1', 'SELL', player1.solHoldings * (percentage / 100) * (currentPrice || 0));
  };

  const finalizeBattle = () => {
    const safePrice = currentPrice || 24.5;

    const p1Final = player1.balance + (player1.solHoldings * safePrice);
    const p1PL = p1Final - GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE;
    const p1PLPercent = (p1PL / GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE) * 100;

    const p2Final = player2.balance + (player2.solHoldings * safePrice);
    const p2PL = p2Final - GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE;
    const p2PLPercent = (p2PL / GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE) * 100;

    setPlayer1(prev => ({
      ...prev,
      finalValue: p1Final,
      profitLoss: p1PL,
      profitLossPercent: p1PLPercent,
    }));

    setPlayer2(prev => ({
      ...prev,
      finalValue: p2Final,
      profitLoss: p2PL,
      profitLossPercent: p2PLPercent,
    }));

    const won = p1Final > p2Final;
    const eloChange = won ? 30 : -12; // Higher rewards for PvP

    setResult({
      won,
      eloChange,
      newElo: 1000 + eloChange,
    });

    setPhase('finished');

    // Store game result data for blockchain modal
    const pnlInCents = Math.floor(p1PL * 100); // Convert to cents
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
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  const handleStart = () => {
    // Check if user wants to use blockchain
    if (connected && !profileExists) {
      setShowAccountPrompt(true);
    } else {
      setPhase('countdown');
    }
  };

  const currentValue = player1.balance + (player1.solHoldings * (currentPrice || 0));
  const currentPL = currentValue - GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE;
  const currentPLPercent = (currentPL / GAME_CONSTANTS.BATTLE_ROYALE.STARTING_BALANCE) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-white">
            <Users className="w-10 h-10 text-red-500" />
            Multiplayer Battle
          </h1>
          <p className="text-gray-300">
            Real-time competition • 30 seconds
          </p>
        </div>

        {/* Ready State - Start Button */}
        {phase === 'ready' && (
          <Card className="bg-gradient-to-br from-red-950/50 to-orange-950/50 border-red-700">
            <CardContent className="p-12 text-center space-y-6">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-3xl font-bold text-white">Ready for Battle?</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                You'll compete against an opponent in real-time trading.
                <br />
                <span className="text-red-400 font-bold">30 seconds</span> to make the most profit!
              </p>
              <div className="flex gap-4 justify-center items-center text-sm text-gray-400">
                <span>🎯 5 Max Trades</span>
                <span>•</span>
                <span>💰 $10,000 Starting Balance</span>
                <span>•</span>
                <span>🏆 Highest P&L Wins</span>
              </div>
              <Button 
                onClick={handleStart} 
                size="lg" 
                className="text-2xl px-12 py-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
              >
                🚀 Start Battle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <Card className="bg-gradient-to-br from-red-950/50 to-orange-950/50 border-red-700">
            <CardContent className="p-20 text-center">
              <div className="text-9xl font-bold text-white animate-pulse">
                {countdown}
              </div>
              <p className="text-2xl text-gray-300 mt-4">Battle starts in...</p>
              <div className="mt-6 flex justify-center gap-12">
                <div className="text-center">
                  <div className="text-sm text-gray-400">You</div>
                  <div className="text-xl font-bold text-blue-400">{player1.name}</div>
                </div>
                <div className="text-4xl text-red-500">VS</div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Opponent</div>
                  <div className="text-xl font-bold text-red-400">{player2.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trading Phase */}
        {phase === 'trading' && (
          <>
            {/* Stats Bar */}
            <Card className="bg-gradient-to-r from-red-950/50 to-purple-950/50 border-red-800">
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-white">{timeRemaining}s</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Your P&L</div>
                    <div className={`text-lg font-bold ${currentPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentPL >= 0 ? '+' : ''}{currentPLPercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="text-lg font-bold text-blue-400">${currentPrice?.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Your Trades</div>
                    <div className="text-lg font-bold text-white">{player1.trades.length}/5</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Opp Trades</div>
                    <div className="text-lg font-bold text-orange-400">{player2.trades.length}/5</div>
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
                    Your Trades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white font-mono">${player1.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SOL:</span>
                      <span className="text-white font-mono">{player1.solHoldings.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-green-400 mb-2">BUY</div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => handleBuy(25)} size="sm" className="bg-green-600 hover:bg-green-700">25%</Button>
                        <Button onClick={() => handleBuy(50)} size="sm" className="bg-green-600 hover:bg-green-700">50%</Button>
                        <Button onClick={() => handleBuy(100)} size="sm" className="bg-green-600 hover:bg-green-700">ALL</Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-red-400 mb-2">SELL</div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => handleSell(25)} size="sm" className="bg-red-600 hover:bg-red-700">25%</Button>
                        <Button onClick={() => handleSell(50)} size="sm" className="bg-red-600 hover:bg-red-700">50%</Button>
                        <Button onClick={() => handleSell(100)} size="sm" className="bg-red-600 hover:bg-red-700">ALL</Button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm font-semibold text-gray-400 mb-2">Trade History</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {player1.trades.map(trade => (
                        <div key={trade.id} className="text-xs flex justify-between p-2 bg-slate-800/50 rounded">
                          <span className={trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                            {trade.type}
                          </span>
                          <span className="text-gray-300">${trade.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <div className="col-span-2">
                <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Live Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={chartContainerRef}
                      className="rounded-lg bg-[#1a1f2e]"
                      style={{ 
                        width: '100%', 
                        height: '400px',
                        display: chartRef.current ? 'block' : 'none'
                      }}
                    />
                    {!chartRef.current && (
                      <canvas
                        ref={canvasRef}
                        className="rounded-lg bg-slate-800"
                        style={{ width: '100%', height: '400px', display: 'block' }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Opponent Activity */}
            <Card className="bg-gradient-to-br from-orange-950/30 to-red-950/30 border-orange-700/50">
              <CardHeader>
                <CardTitle className="text-orange-400 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Opponent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto">
                  {player2.trades.map(trade => (
                    <div key={trade.id} className="flex-shrink-0 px-3 py-2 bg-orange-950/50 rounded border border-orange-700/30">
                      <div className={`text-xs font-semibold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.type} ${trade.amount.toFixed(0)}
                      </div>
                    </div>
                  ))}
                  {player2.trades.length === 0 && (
                    <div className="text-sm text-gray-500">No trades yet...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Results */}
        {phase === 'finished' && result && (
          <Card className={`border-4 ${result.won ? 'border-green-500 bg-green-950/30' : 'border-red-500 bg-red-950/30'}`}>
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-6xl mb-4">{result.won ? '🏆' : '💔'}</div>
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
                <div className="p-6 bg-blue-950/30 border-2 border-blue-500/50 rounded-lg">
                  <div className="text-lg font-bold text-blue-400 mb-4">You</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Final Value:</span>
                      <span className="text-white font-bold">${player1.finalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P&L:</span>
                      <span className={`font-bold ${player1.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {player1.profitLoss >= 0 ? '+' : ''}${player1.profitLoss.toFixed(2)} ({player1.profitLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trades:</span>
                      <span className="text-white">{player1.trades.length}/5</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-orange-950/30 border-2 border-orange-500/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-400 mb-4">Opponent</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Final Value:</span>
                      <span className="text-white font-bold">${player2.finalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P&L:</span>
                      <span className={`font-bold ${player2.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {player2.profitLoss >= 0 ? '+' : ''}${player2.profitLoss.toFixed(2)} ({player2.profitLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trades:</span>
                      <span className="text-white">{player2.trades.length}/5</span>
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

              <div className="flex gap-4">
                <Button onClick={onComplete} size="lg" className="flex-1">
                  Back to Lobby
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Blockchain Account Prompt */}
      {showAccountPrompt && (
        <BlockchainAccountPrompt
          onClose={() => setShowAccountPrompt(false)}
          onSuccess={() => {
            setShowAccountPrompt(false);
            setPhase('countdown');
          }}
          onSkip={() => {
            setShowAccountPrompt(false);
            setPhase('countdown');
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

