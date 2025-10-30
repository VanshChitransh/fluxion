'use client';

import Link from 'next/link';
import { useAuthContext } from '../components/providers/AuthProvider';
import { getTierFromElo } from '../lib/utils';

export default function Home() {
  const { user, userProfile } = useAuthContext();
  const tier = userProfile ? getTierFromElo(userProfile.elo.rating) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {user && userProfile ? (
            <>
              <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
                <span className="text-2xl">{tier?.emoji}</span>
                <span className="text-white font-medium">
                  Welcome back, <span className="text-purple-400 font-bold">{userProfile.displayName}</span>!
                </span>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold text-white mb-2">
                  <span style={{ color: tier?.color }}>{userProfile.elo.rating}</span> ELO
                </div>
                <div className="text-xl text-gray-300">{tier?.name}</div>
              </div>
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{userProfile.stats.wins}</div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{userProfile.stats.losses}</div>
                  <div className="text-sm text-gray-400">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{userProfile.stats.totalGames}</div>
                  <div className="text-sm text-gray-400">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">{userProfile.stats.currentStreak}</div>
                  <div className="text-sm text-gray-400">Streak 🔥</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-6xl font-bold text-white mb-4">
                Fluxion <span className="text-purple-400">v2</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
                Master trading through prediction battles and compete in real-time markets.
                Climb the ELO ranks and unlock exclusive NFT rewards.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 text-sm">
                <span>🎮</span>
                <span>Sign in to start your trading journey!</span>
              </div>
            </>
          )}
        </div>

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Predict Battle Card */}
          <Link href={user ? "/predict" : "#"} onClick={(e) => !user && e.preventDefault()}>
            <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 transition-all border border-white/20 ${
              user ? 'hover:bg-white/20 cursor-pointer hover:scale-105' : 'opacity-60 cursor-not-allowed'
            }`}>
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-white mb-2">Predict Battle</h2>
              <p className="text-gray-300 mb-4">
                View a chart for 7 seconds, then predict if the price will go UP or DOWN.
                Test your market intuition!
              </p>
              <div className="flex gap-2 text-sm text-purple-300">
                <span>• Solo Mode</span>
                <span>• Quick Games</span>
                <span>• +10 ELO</span>
              </div>
              {!user && (
                <div className="mt-4 text-sm text-yellow-400">
                  🔒 Sign in required
                </div>
              )}
            </div>
          </Link>

          {/* Battle Royale Card */}
          <Link href={user ? "/battle" : "#"} onClick={(e) => !user && e.preventDefault()}>
            <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 transition-all border border-white/20 ${
              user ? 'hover:bg-white/20 cursor-pointer hover:scale-105' : 'opacity-60 cursor-not-allowed'
            }`}>
              <div className="text-4xl mb-4">⚔️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Battle Royale</h2>
              <p className="text-gray-300 mb-4">
                Compete 1v1 in 30-second trading battles. Execute trades and earn more profit than your opponent!
              </p>
              <div className="flex gap-2 text-sm text-purple-300">
                <span>• PvP Mode</span>
                <span>• 30 Seconds</span>
                <span>• +20 ELO</span>
              </div>
              {!user && (
                <div className="mt-4 text-sm text-yellow-400">
                  🔒 Sign in required
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/20 font-medium"
          >
            🏆 Leaderboard
          </Link>
          <Link
            href="/learn"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/20 font-medium"
          >
            📚 Learn
          </Link>
          <Link
            href="/markets"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/20 font-medium"
          >
            📈 Markets
          </Link>
        </div>
      </main>
    </div>
  );
}
