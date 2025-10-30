'use client';

import { useState } from 'react';
import { BattleLobby } from '@/components/game/BattleLobby';
import { BattleRoyaleGame } from '@/components/game/BattleRoyaleGame';
import { MultiplayerBattleGame } from '@/components/game/MultiplayerBattleGame';
import { useRouter } from 'next/navigation';

export default function BattleLobbyPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'lobby' | 'ai' | 'player'>('lobby');

  const handleComplete = () => {
    setMode('lobby');
  };

  if (mode === 'ai') {
    return <BattleRoyaleGame onComplete={handleComplete} />;
  }

  if (mode === 'player') {
    return <MultiplayerBattleGame onComplete={handleComplete} />;
  }

  return <BattleLobby onSelectMode={setMode} />;
}

