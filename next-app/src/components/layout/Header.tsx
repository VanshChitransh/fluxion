'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '../providers/AuthProvider';
import AuthModal from '../auth/AuthModal';
import { getTierFromElo } from '../../lib/utils';
import { WalletButton } from '../wallet/WalletButton';

export default function Header() {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/battle', label: 'Battle Royale' },
    { href: '/predict', label: 'Predict' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/learn', label: 'Learn' },
    { href: '/markets', label: 'Markets' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const tier = userProfile ? getTierFromElo(userProfile.elo.rating) : null;

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white">
              Fluxion <span className="text-purple-400">v2</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {/* Wallet Button (always visible) */}
              <WalletButton />
              
              {user && userProfile ? (
                <>
                  {/* ELO Badge */}
                  <div className="text-sm text-gray-300">
                    <span
                      className="font-bold"
                      style={{ color: tier?.color }}
                    >
                      {userProfile.elo.rating}
                    </span>{' '}
                    <span className="text-xs">{tier?.emoji}</span>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      {userProfile.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt={userProfile.displayName}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {userProfile.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-white hidden sm:block">
                        {userProfile.displayName}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-xl py-2 z-50">
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

