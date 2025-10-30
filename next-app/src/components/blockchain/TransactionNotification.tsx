'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TransactionNotificationProps {
  signature: string | null;
  loading: boolean;
  error: string | null;
  onClose?: () => void;
}

export function TransactionNotification({
  signature,
  loading,
  error,
  onClose,
}: TransactionNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (signature || loading || error) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [signature, loading, error]);

  useEffect(() => {
    if (signature && !loading && !error) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [signature, loading, error, onClose]);

  if (!visible) return null;

  const explorerUrl = signature
    ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    : null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5">
      <Card className="w-80 bg-slate-800/95 border-slate-700 backdrop-blur shadow-xl">
        <div className="p-4">
          {loading && (
            <div className="flex items-start gap-3">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Processing Transaction</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Please confirm in your wallet...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-white">Transaction Failed</h4>
                <p className="text-sm text-red-300 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setVisible(false);
                    onClose?.();
                  }}
                  className="text-xs text-gray-400 hover:text-white mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {signature && !loading && !error && (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-white">Transaction Confirmed!</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Your result is now on-chain
                </p>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 mt-2"
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

