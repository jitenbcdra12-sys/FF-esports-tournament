import React from 'react';
import { Swords, Trophy, Wallet, ShieldCheck, User } from 'lucide-react';
import { sound } from '../utils/audio';

interface BottomNavProps {
  activeTab: 'matches' | 'leaderboard' | 'security' | 'rules';
  setActiveTab: (tab: 'matches' | 'leaderboard' | 'security' | 'rules') => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  onOpenAntiCheat: () => void;
  walletBalance: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenWallet,
  onOpenProfile,
  onOpenAntiCheat,
  walletBalance,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        
        {/* Tab 1: Matches / Tournaments */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('matches');
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'matches' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight whitespace-nowrap">Tourneys</span>
        </button>

        {/* Tab 2: Leaderboard */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('leaderboard');
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'leaderboard' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight whitespace-nowrap">Ranks</span>
        </button>

        {/* Tab 3: Wallet (Center focal touch target) */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenWallet();
          }}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-0.5 shadow-sm shadow-emerald-500/20">
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-tight text-emerald-300">
            ₹{walletBalance}
          </span>
        </button>

        {/* Tab 4: Anti-Cheat Shield */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenAntiCheat();
          }}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ShieldCheck className="w-5 h-5 mb-1 text-teal-400" />
          <span className="text-[10px] tracking-tight whitespace-nowrap">Shield</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight whitespace-nowrap">Profile</span>
        </button>

      </div>
    </nav>
  );
};
