import React from 'react';

// TypeScript type support for alert component
export {};

export function Alert({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'destructive' }) {
  const color = variant === 'destructive' ? 'bg-red-900 border-red-700 text-red-200' : 'bg-blue-900 border-blue-700 text-blue-200';
  return <div className={`rounded-xl border px-4 py-3 mb-2 ${color}`}>{children}</div>;
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-md">{children}</div>;
}
