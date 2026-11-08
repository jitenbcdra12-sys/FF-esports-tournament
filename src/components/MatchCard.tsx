import React from 'react';
import { Users, Crosshair, Trophy, Clock, ShieldCheck, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { Match, UserProfile } from '../types/tournament';
import { sound } from '../utils/audio';

interface MatchCardProps {
  match: Match;
  user: UserProfile;
  onSelectMatch: (match: Match) => void;
  onOpenRoomCredentials: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  user,
  onSelectMatch,
  onOpenRoomCredentials,
}) => {
  const isUserJoined = match.registeredPlayers.some((p) => p.userId === user.id);
  const slotsFilled = match.registeredPlayers.length;
  const fillPercentage = Math.min(100, Math.round((slotsFilled / match.capacity) * 100));

  const getModeLabel = () => {
    switch (match.mode) {
      case 'br':
        return {
          title: 'BR Rank (40 Players)',
          badge: 'Battle Royale',
          color: 'from-orange-500 to-amber-600',
          textColor: 'text-orange-400',
        };
      case 'cs':
        return {
          title: 'CS Rank (4 vs 4)',
          badge: 'Clash Squad',
          color: 'from-blue-500 to-indigo-600',
          textColor: 'text-cyan-400',
        };
      case 'lonewolf':
        return {
          title: 'Lone Wolf (1 vs 1)',
          badge: '1v1 Duel',
          color: 'from-rose-500 to-red-600',
          textColor: 'text-rose-400',
        };
    }
  };

  const modeInfo = getModeLabel();

  return (
    <div className="group relative bg-[#0c101c] hover:bg-[#0f1424] border border-slate-800 hover:border-orange-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between shadow-lg">
      
      {/* Top Row: Title, Mode & Time */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className={`font-mono font-bold ${modeInfo.textColor}`}>
                {modeInfo.badge}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{match.map} ({match.version})</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-semibold">{match.date}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-heading tracking-wide group-hover:text-orange-400 transition-colors">
              {match.title}
            </h3>
          </div>

          {/* Time Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{match.scheduledTime}</span>
          </div>
        </div>

        {/* Prize & Rules Strip */}
        <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
          
          {/* Entry Fee */}
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Entry Fee</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white tabular-nums">
              ₹{match.entryFee}
            </span>
          </div>

          {/* Per Kill or Pool Prize */}
          <div>
            <span className="text-[10px] text-orange-400 font-medium block">
              {match.mode === 'br' ? 'Per Kill Bounty' : 'Winning Pool'}
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-orange-400 tabular-nums flex items-center justify-center gap-1">
              {match.mode === 'br' ? (
                <>
                  <Crosshair className="w-3.5 h-3.5" />
                  ₹{match.perKillReward}
                </>
              ) : (
                <>
                  <Trophy className="w-3.5 h-3.5" />
                  ₹{match.poolPrize}
                </>
              )}
            </span>
          </div>

          {/* Format / Capacity */}
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Format</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300 tabular-nums">
              {match.mode === 'br' ? '40 Player' : match.mode === 'cs' ? '4 vs 4' : '1 vs 1'}
            </span>
          </div>

        </div>

        {/* Auto Refund Guarantee Tag */}
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-lg mb-3">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span className="truncate">
            Auto-Refund: 100% money back if {match.capacity} players not full at match time.
          </span>
        </div>

        {/* Slot Progress Bar */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Slots: {slotsFilled}/{match.capacity}</span>
            </span>
            <span className={slotsFilled >= match.capacity ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              {match.capacity - slotsFilled > 0
                ? `${match.capacity - slotsFilled} left`
                : 'House Full'}
            </span>
          </div>

          {/* Visual Bar */}
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full bg-gradient-to-r ${modeInfo.color}`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom CTA Row */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {isUserJoined ? (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              You're Registered!
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenRoomCredentials(match);
              }}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>View Room ID & Pass</span>
            </button>
          </div>
        ) : match.status === 'completed' ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-slate-500 uppercase font-semibold">
              Match Finished
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onSelectMatch(match);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              View Results
            </button>
          </div>
        ) : match.status === 'cancelled_refunded' ? (
          <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Cancelled • All 100% Fees Refunded</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            <div className="text-xs text-slate-400">
              Entry <span className="font-mono text-white font-bold">₹{match.entryFee}</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onSelectMatch(match);
              }}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/20 flex items-center gap-1.5 transition-all group/btn"
            >
              <span>Join Match</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
