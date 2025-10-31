'use client';

import { useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Shield, Wallet } from 'lucide-react';

interface BlockchainAccountPromptProps {
  onClose: () => void;
  onSuccess: () => void;
  onSkip: () => void;
}

export function BlockchainAccountPrompt({ onClose, onSuccess, onSkip }: BlockchainAccountPromptProps) {
  const { connected, connect } = useWallet();
  const { profileExists, initializeProfile, txLoading } = useBlockchain();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length > 32) {
      setError('Username must be 32 characters or less');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setError('');
    
    try {
      const signature = await initializeProfile(username);
      console.log('Profile created! Transaction:', signature);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create profile:', err);
      setError(err?.message || 'Failed to create profile. Please try again.');
    }
  };

  // If wallet not connected
  if (!connected) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-slate-800/95 border-slate-700 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <Wallet className="w-12 h-12 text-purple-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-gray-300 text-base">
              To play games and earn rewards on Solana blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-blue-300">🔐 Why connect?</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Record your game results on-chain</li>
                <li>• Earn and track your ELO rating</li>
                <li>• Compete on global leaderboard</li>
                <li>• Unlock NFT rewards</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onSkip}
                variant="outline"
                className="flex-1"
              >
                Play Without Wallet
              </Button>
              <Button
                onClick={() => connect?.()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Connect Wallet
              </Button>
            </div>

            <p className="text-xs text-center text-gray-400">
              You can play games without a wallet, but results won't be saved on blockchain
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If profile already exists
  if (profileExists) {
    onSuccess();
    return null;
  }

  // Show profile creation form
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-slate-800/95 border-slate-700 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <Shield className="w-12 h-12 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {success ? 'Profile Created! 🎉' : 'Create Blockchain Profile'}
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            {success 
              ? 'Your profile is now live on Solana blockchain'
              : 'One-time setup to play games and earn rewards'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-gray-300">Redirecting to game...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Choose a Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (3-32 characters)"
                  maxLength={32}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500"
                  disabled={txLoading}
                />
                <p className="text-xs text-gray-400">
                  This will be stored on-chain and cannot be changed
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleCreate}
                  disabled={txLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-semibold"
                >
                  {txLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    'Create Profile (0.002 SOL)'
                  )}
                </Button>

                <Button
                  onClick={onSkip}
                  variant="outline"
                  className="w-full"
                  disabled={txLoading}
                >
                  Play Without Blockchain
                </Button>

                <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-blue-300">💡 What happens next?</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Profile stored permanently on Solana</li>
                    <li>• Starting ELO: 1000</li>
                    <li>• Track wins, losses, and earnings</li>
                    <li>• Compete on global leaderboard</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

