'use client';

import { useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Database, X } from 'lucide-react';
import { GameType } from '@/lib/solana/program';

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameResult: {
    won: boolean;
    eloChange: number;
    gameType: GameType;
    symbol: string;
    pnl: number;
  };
}

export function GameResultModal({ isOpen, onClose, gameResult }: GameResultModalProps) {
  const { connected } = useWallet();
  const { profileExists, updateElo, recordGame, txLoading } = useBlockchain();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [skipped, setSkipped] = useState(false);

  if (!isOpen) return null;

  const handleRecordOnChain = async () => {
    if (!connected || !profileExists) {
      setError('Wallet not connected or profile not created');
      return;
    }

    setError('');
    
    try {
      console.log('Recording game result on-chain...');
      
      // Update ELO
      await updateElo(gameResult.eloChange, gameResult.won, gameResult.gameType);
      
      // Record game result
      await recordGame(
        gameResult.gameType,
        gameResult.won,
        gameResult.eloChange,
        gameResult.symbol,
        gameResult.pnl
      );
      
      console.log('✅ Game result recorded on blockchain!');
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Failed to record on blockchain:', err);
      setError(err?.message || 'Failed to record on blockchain. Please try again.');
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-slate-800/95 border-green-500 backdrop-blur">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Recorded on Blockchain! ✅</h3>
              <p className="text-gray-300">Your results have been saved to Solana</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Skipped state
  if (skipped) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-slate-800/95 border-slate-700 backdrop-blur">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Results not recorded</h3>
              <p className="text-gray-300 text-sm">Your game was saved locally only</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main modal
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-slate-800/95 border-slate-700 backdrop-blur">
        <CardHeader className="text-center relative">
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-center mb-3">
            <Database className="w-12 h-12 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Save to Blockchain?
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            Record your game results on Solana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Result Summary */}
          <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Result:</span>
              <span className={`font-bold ${gameResult.won ? 'text-green-400' : 'text-red-400'}`}>
                {gameResult.won ? 'WIN ✅' : 'LOSS ❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ELO Change:</span>
              <span className={`font-bold ${gameResult.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {gameResult.eloChange >= 0 ? '+' : ''}{gameResult.eloChange}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Symbol:</span>
              <span className="text-white font-mono">{gameResult.symbol}</span>
            </div>
          </div>

          {/* Blockchain Benefits */}
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-blue-300">🔐 Recording on blockchain:</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• ✅ Permanent record of your achievement</li>
              <li>• 📊 Updates your global ELO ranking</li>
              <li>• 🏆 Counts towards leaderboard position</li>
              <li>• 🎁 Progress towards NFT rewards</li>
              <li>• ⚡ Small gas fee (~0.0001 SOL)</li>
            </ul>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!connected || !profileExists ? (
              <div className="p-3 bg-yellow-950/30 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300 text-center">
                  ⚠️ {!connected ? 'Connect your wallet' : 'Create blockchain profile'} to record results
                </p>
              </div>
            ) : null}

            <Button
              onClick={handleRecordOnChain}
              disabled={txLoading || !connected || !profileExists}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-semibold"
            >
              {txLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                '✅ Record on Blockchain'
              )}
            </Button>

            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full"
              disabled={txLoading}
            >
              ⏭️ Skip (Local Only)
            </Button>

            <p className="text-xs text-center text-gray-400">
              Skipping will save results locally but won't update blockchain
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

