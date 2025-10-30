// TypeScript type support for button component
export {};
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'solid', size = 'md', ...props }, ref) => {
    let base =
      'rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Size classes
    if (size === 'sm') base += ' text-sm px-4 py-2';
    else if (size === 'lg') base += ' text-xl px-8 py-4';
    else base += ' text-base px-6 py-3';
    
    // Variant classes
    if (variant === 'outline') base += ' border border-gray-700 bg-transparent hover:bg-gray-800 text-white';
    else base += ' bg-blue-600 hover:bg-blue-700 text-white';

    return <button ref={ref} className={base + ' ' + className} {...props} />;
  }
);
Button.displayName = 'Button';
