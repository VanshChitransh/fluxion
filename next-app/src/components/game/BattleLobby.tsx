'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Bot, Users, Loader2, Trophy, Zap } from 'lucide-react';

interface BattleLobbyProps {
  onSelectMode: (mode: 'ai' | 'player') => void;
}

export function BattleLobby({ onSelectMode }: BattleLobbyProps) {
  const [searching, setSearching] = useState(false);

  const handleAIBattle = () => {
    onSelectMode('ai');
  };

  const handlePlayerBattle = () => {
    setSearching(true);
    // Simulate matchmaking delay
    setTimeout(() => {
      onSelectMode('player');
    }, 2000);
  };

  if (searching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-700 max-w-md w-full">
          <CardContent className="p-12 text-center space-y-6">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-white">Finding Opponent...</h2>
            <p className="text-gray-300">
              Searching for a player with similar skill level
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center justify-between">
                <span>Players online:</span>
                <span className="text-green-400">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Queue position:</span>
                <span className="text-blue-400">Matching...</span>
              </div>
            </div>
            <Button 
              onClick={() => setSearching(false)} 
              variant="outline"
              className="w-full"
            >
              Cancel Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-white">
            <Swords className="w-10 h-10 text-red-500" />
            Battle Royale
          </h1>
          <p className="text-gray-300">
            Choose your battle mode
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Battle */}
          <Card className="bg-gradient-to-br from-purple-950/50 to-blue-950/50 border-2 border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Bot className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl">VS AI Bot</span>
                </div>
                <Zap className="w-6 h-6 text-yellow-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Instant matchmaking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Practice your skills</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>No waiting time</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Standard ELO rewards</span>
                </div>
              </div>

              <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
                <div className="text-sm text-gray-400 mb-1">Difficulty</div>
                <div className="text-lg font-bold text-blue-400">Adaptive AI</div>
                <div className="text-xs text-gray-500 mt-1">
                  Adjusts to your trading style
                </div>
              </div>

              <Button 
                onClick={handleAIBattle}
                className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Bot className="w-5 h-5 mr-2" />
                Battle AI Now
              </Button>
            </CardContent>
          </Card>

          {/* Player Battle */}
          <Card className="bg-gradient-to-br from-red-950/50 to-orange-950/50 border-2 border-red-500/50 hover:border-red-400 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-red-400" />
                  <span className="text-2xl">VS Player</span>
                </div>
                <Trophy className="w-6 h-6 text-yellow-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400">★</span>
                  <span>Real-time multiplayer</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400">★</span>
                  <span>Skill-based matchmaking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400">★</span>
                  <span>Compete for rankings</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400">★</span>
                  <span>Higher ELO rewards</span>
                </div>
              </div>

              <div className="p-4 bg-red-950/30 rounded-lg border border-red-500/30">
                <div className="text-sm text-gray-400 mb-1">Players Online</div>
                <div className="text-lg font-bold text-red-400">12 Active</div>
                <div className="text-xs text-gray-500 mt-1">
                  Average wait: ~30 seconds
                </div>
              </div>

              <Button 
                onClick={handlePlayerBattle}
                className="w-full text-lg py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Users className="w-5 h-5 mr-2" />
                Find Opponent
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">+30 ELO</div>
              <div className="text-sm text-gray-400">Win vs Player</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">+25 ELO</div>
              <div className="text-sm text-gray-400">Win vs AI</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">30 sec</div>
              <div className="text-sm text-gray-400">Battle Duration</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">💡 Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <span className="text-blue-400 font-semibold">New players:</span> Start with AI battles to learn the mechanics
              </div>
              <div>
                <span className="text-red-400 font-semibold">Competitive:</span> Player battles offer higher rewards but tougher opponents
              </div>
              <div>
                <span className="text-green-400 font-semibold">Strategy:</span> Watch price movements carefully before trading
              </div>
              <div>
                <span className="text-purple-400 font-semibold">Limit:</span> Maximum 5 trades per battle - use them wisely!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

