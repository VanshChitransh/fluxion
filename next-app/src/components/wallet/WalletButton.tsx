'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-950/50 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-mono text-green-400">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
        <Button 
          onClick={disconnect} 
          variant="outline" 
          size="sm"
          className="border-red-500/30 hover:bg-red-950/50"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !h-10 !px-6 !rounded-lg !font-semibold !transition-all" />
  );
}

// Compact version for mobile
export function WalletButtonCompact() {
  const { connected, publicKey } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-950/50 border border-green-500/30 rounded">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        <span className="text-xs font-mono text-green-400">
          {publicKey.toBase58().slice(0, 4)}...
        </span>
      </div>
    );
  }

  return (
    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
      <Wallet className="w-4 h-4 mr-2" />
      Connect
    </Button>
  );
}

