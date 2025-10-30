import React from 'react';

interface ProgressProps {
  value: number; // percent 0-100
  className?: string;
}

// TypeScript type support for progress component
export {};

export function Progress({ value, className = '' }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-800 rounded-lg h-2 overflow-hidden ${className}`}>
      <div
        className="bg-blue-500 h-2 rounded-lg transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
