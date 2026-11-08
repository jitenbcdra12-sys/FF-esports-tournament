import React from 'react';
import { Shield, Bell, Wallet, Volume2, VolumeX, Flame, ShieldAlert, User, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/tournament';
import { sound } from '../utils/audio';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'matches' | 'leaderboard' | 'security' | 'rules';
  setActiveTab: (tab: 'matches' | 'leaderboard' | 'security' | 'rules') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  onOpenAntiCheat: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  onOpenWallet,
  onOpenProfile,
  onOpenAntiCheat,
  isAdmin,
  setIsAdmin,
  isSoundOn,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070a12]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element with flame accent) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('matches');
            }}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider font-heading uppercase text-white flex items-center gap-1.5">
                BattleZone
                <span className="text-xs tracking-widest text-orange-400 font-mono font-semibold px-1.5 py-0.5 rounded bg-orange-950/80 border border-orange-500/30">
                  ESPORTS
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Free Fire Official Tournaments
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single line, text with hover underlines) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('matches');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'matches'
                ? 'text-orange-400 border-orange-500'
                : 'text-slate-300 hover:text-white border-transparent'
            }`}
          >
            Tournaments
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('leaderboard');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'leaderboard'
                ? 'text-orange-400 border-orange-500'
                : 'text-slate-300 hover:text-white border-transparent'
            }`}
          >
            Live Leaderboard
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAntiCheat();
            }}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            Anti-Cheat Shield
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('rules');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'rules'
                ? 'text-orange-400 border-orange-500'
                : 'text-slate-300 hover:text-white border-transparent'
            }`}
          >
            Rules & Rewards
          </button>
        </nav>

        {/* Zone 3: Actions (Wallet, Notifications, Audio, Admin toggle, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Admin Switch Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsAdmin(!isAdmin);
            }}
            className={`text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Admin Tournament Management Dashboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isAdmin ? 'Exit Admin' : 'Admin Mode'}</span>
            <span className="sm:hidden">{isAdmin ? 'Admin' : 'Host'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle sound effects"
            className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNotifications();
            }}
            aria-label="Open notifications"
            className="relative w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Wallet Balance Pill */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWallet();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800/90 hover:from-slate-800 hover:to-slate-700/90 text-white border border-slate-700/80 hover:border-orange-500/50 px-3 py-1.5 rounded-lg transition-all group shadow-sm"
          >
            <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Wallet</div>
              <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400 tabular-nums">
                ₹{user.wallet.total}
              </div>
            </div>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            aria-label="Open profile settings"
            className="flex items-center gap-2 p-1 pl-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <img
              src={user.avatarUrl}
              alt={user.ffIgn}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-md bg-slate-800 object-cover border border-slate-700"
            />
            <span className="text-xs font-semibold text-slate-200 hidden md:inline max-w-[90px] truncate">
              {user.ffIgn}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
