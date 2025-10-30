'use client';

import { PredictBattleGame } from '@/components/game/PredictBattleGame';
import  ProtectedRoute  from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function PredictBattlePage() {
  const router = useRouter();

  // In development, skip authentication
  if (process.env.NODE_ENV === 'development') {
    return <PredictBattleGame onComplete={() => router.push('/dashboard')} />;
  }

  // In production, require authentication
  return (
    <ProtectedRoute>
      <PredictBattleGame onComplete={() => router.push('/dashboard')} />
    </ProtectedRoute>
  );
}
