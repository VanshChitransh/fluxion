'use client';

import { useState, useEffect } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function ProfileInitializer({ children }: { children: React.ReactNode }) {
  const { connected } = useWallet();
  const { profileExists, profileLoading, initializeProfile, txLoading, client } = useBlockchain();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset state when wallet changes
  useEffect(() => {
    setUsername('');
    setError('');
    setSuccess(false);
  }, [connected]);

  // If not connected, show children
  if (!connected) {
    return <>{children}</>;
  }

  // If program not initialized, allow access (blockchain features disabled)
  if (!client || !client.program || !client.program.account) {
    console.warn('Blockchain program not initialized. Running in local mode.');
    return <>{children}</>;
  }

  // If profile exists, show children
  if (profileExists) {
    return <>{children}</>;
  }

  // If still loading profile check
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-gray-300">Checking blockchain profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show profile creation form
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
    } catch (err: any) {
      console.error('Failed to create profile:', err);
      setError(err?.message || 'Failed to create profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Welcome to Fluxion! 🚀
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            Create your on-chain profile to start trading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Profile Created!</h3>
                <p className="text-gray-300">Your profile is now live on Solana blockchain.</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Start Trading
              </Button>
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

