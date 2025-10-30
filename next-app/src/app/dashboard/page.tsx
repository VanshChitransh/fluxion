'use client';

import { useBlockchain } from '@/contexts/BlockchainContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTierFromElo } from '@/lib/utils';
import { Trophy, TrendingUp, Gamepad2, Target, Zap, Crown, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { profile, profileLoading, profileExists, refreshProfile } = useBlockchain();

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Dashboard</CardTitle>
            <CardDescription className="text-gray-300">
              Connect your wallet to view your stats
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profileExists || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">No Profile Found</CardTitle>
            <CardDescription className="text-gray-300">
              Profile initialization is in progress...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const tier = getTierFromElo(profile.elo);
  const winRate = profile.totalGames > 0 
    ? ((profile.wins / profile.totalGames) * 100).toFixed(1) 
    : '0.0';

  const explorerUrl = publicKey
    ? `https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">All data verified on Solana blockchain</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={refreshProfile}
              variant="outline"
              size="sm"
              className="border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {explorerUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-950/50"
              >
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  {profile.username}
                  <span className="text-2xl">{tier.emoji}</span>
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg mt-1">
                  {tier.name} Tier
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Wallet Address</div>
                <div className="text-white font-mono text-sm">
                  {profile.owner.toBase58().slice(0, 4)}...{profile.owner.toBase58().slice(-4)}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ELO Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Current ELO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: tier.color }}>
                {profile.elo}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Highest: {profile.highestElo}
              </p>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {winRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {profile.wins}W / {profile.losses}L
              </p>
            </CardContent>
          </Card>

          {/* Total Games Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Total Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {profile.totalGames}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                All recorded on-chain
              </p>
            </CardContent>
          </Card>

          {/* Earnings Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                ${(Number(profile.totalEarnings) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Game Mode Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Predict Battle Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Games Played</span>
                <span className="text-white font-semibold">{profile.predictGames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-green-400 font-semibold">
                  {profile.predictGames > 0 
                    ? ((profile.wins / profile.predictGames) * 100).toFixed(1) 
                    : '0.0'}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Battle Royale Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Games Played</span>
                <span className="text-white font-semibold">{profile.battleGames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-green-400 font-semibold">
                  {profile.battleGames > 0 
                    ? ((profile.wins / profile.battleGames) * 100).toFixed(1) 
                    : '0.0'}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="bg-blue-950/30 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm">🔗 Blockchain Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Profile Created:</span>
              <span>{new Date(Number(profile.createdAt) * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Last Played:</span>
              <span>{new Date(Number(profile.lastPlayed) * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Network:</span>
              <span className="text-purple-400">Solana Devnet</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
              <Link href="/predict">
                <Target className="w-4 h-4 mr-2" />
                Play Predict Battle
              </Link>
            </Button>
            <Button asChild className="flex-1 bg-gradient-to-r from-orange-600 to-red-600">
              <Link href="/battle">
                <Crown className="w-4 h-4 mr-2" />
                Battle Royale
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
