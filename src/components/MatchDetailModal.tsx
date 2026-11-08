import React, { useState } from 'react';
import { X, Users, Crosshair, Trophy, ShieldCheck, Clock, AlertTriangle, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { Match, UserProfile } from '../types/tournament';
import { sound } from '../utils/audio';

interface MatchDetailModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onJoinMatch: (matchId: string, team?: 'Alpha' | 'Bravo') => boolean;
  onOpenRoomCredentials: (match: Match) => void;
  onOpenWallet: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  isOpen,
  onClose,
  user,
  onJoinMatch,
  onOpenRoomCredentials,
  onOpenWallet,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<'Alpha' | 'Bravo'>('Alpha');
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen || !match) return null;

  const isUserJoined = match.registeredPlayers.some((p) => p.userId === user.id);
  const slotsFilled = match.registeredPlayers.length;
  const isFull = slotsFilled >= match.capacity;
  const hasEnoughBalance = user.wallet.total >= match.entryFee;

  const handleJoinClick = () => {
    if (!hasEnoughBalance) {
      alert(`Insufficient balance (₹${user.wallet.total}). Match entry fee is ₹${match.entryFee}. Please add money.`);
      onOpenWallet();
      return;
    }

    sound.playClick();
    setIsJoining(true);

    setTimeout(() => {
      const ok = onJoinMatch(match.id, match.mode === 'cs' ? selectedTeam : undefined);
      setIsJoining(false);
      if (ok) {
        sound.playBooyah();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c101d] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#141b2c] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-mono font-bold">
              <span>{match.mode === 'br' ? '40-PLAYER BATTLE ROYALE' : match.mode === 'cs' ? 'CLASH SQUAD 4v4' : 'LONE WOLF 1v1'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-normal">{match.map} ({match.version})</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-heading tracking-wide">
              {match.title}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium block">Entry Fee</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                ₹{match.entryFee}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30">
              <span className="text-[10px] text-orange-400 font-semibold block">
                {match.mode === 'br' ? 'Per Kill Bounty' : 'Winner Pool'}
              </span>
              <span className="text-lg font-bold font-mono text-orange-400 tabular-nums">
                ₹{match.mode === 'br' ? match.perKillReward : match.poolPrize}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium block">Match Time</span>
              <span className="text-sm font-bold font-mono text-amber-300 tabular-nums">
                {match.scheduledTime}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium block">Slots</span>
              <span className="text-sm font-bold font-mono text-cyan-300 tabular-nums">
                {slotsFilled} / {match.capacity}
              </span>
            </div>

          </div>

          {/* Auto Refund & Anti-Cheat Rules Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GUARANTEED 100% AUTO-REFUND POLICY</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If the full {match.capacity} player slots are not filled by the scheduled start time ({match.scheduledTime}), the match will be cancelled automatically, and your ₹{match.entryFee} entry fee will be refunded 100% back to your wallet instantly.
            </p>
          </div>

          {/* Player In-Game Credentials Check */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 block font-medium">Your Free Fire Registration</span>
              <div className="text-xs text-slate-200 flex items-center gap-2">
                <span className="font-bold text-orange-400">{user.ffIgn}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono text-slate-400">UID: {user.ffUid}</span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              READY
            </span>
          </div>

          {/* Clash Squad 4v4 Team Picker */}
          {match.mode === 'cs' && !isUserJoined && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Choose Your Squad
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedTeam('Alpha');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedTeam === 'Alpha'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-sm font-bold font-heading">Squad Alpha (Red)</div>
                  <div className="text-[10px] text-slate-400">
                    {match.registeredPlayers.filter((p) => p.team === 'Alpha').length}/4 Players
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedTeam('Bravo');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedTeam === 'Bravo'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-sm font-bold font-heading">Squad Bravo (Blue)</div>
                  <div className="text-[10px] text-slate-400">
                    {match.registeredPlayers.filter((p) => p.team === 'Bravo').length}/4 Players
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Registered Slots Roster */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Slot Roster ({slotsFilled}/{match.capacity})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {match.capacity - slotsFilled} remaining
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800/90 divide-y divide-slate-800/60 p-1">
              {Array.from({ length: match.capacity }, (_, idx) => {
                const slotNum = idx + 1;
                const player = match.registeredPlayers[idx];

                return (
                  <div
                    key={slotNum}
                    className={`px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                      player?.userId === user.id ? 'bg-orange-950/40 text-orange-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-[11px] font-mono font-bold text-slate-500">
                        #{slotNum}
                      </span>
                      {player ? (
                        <div>
                          <span className="font-semibold text-slate-200">
                            {player.ffIgn}
                          </span>
                          {player.team && (
                            <span
                              className={`ml-1.5 text-[10px] font-mono px-1 rounded ${
                                player.team === 'Alpha'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              Team {player.team}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono italic">Empty Slot</span>
                      )}
                    </div>

                    <div>
                      {player ? (
                        <span className="font-mono text-[10px] text-slate-500">
                          UID: {player.ffUid.slice(0, 4)}****
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tournament Guidelines */}
          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-300 block">Match Rules & Room ID:</span>
            <p>1. Room ID & Password will be revealed 15 minutes before match start.</p>
            <p>2. Per Kill Bounty (₹13) is credited to Winning Wallet within 15 minutes of match end.</p>
            <p>3. Zero tolerance for emulators, config hacks, or screen overlays. Anti-cheat integrity scan runs before credentials display.</p>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center justify-between gap-3">
          {isUserJoined ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>You have registered for this tournament!</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenRoomCredentials(match);
                }}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>View Room ID & Pass</span>
              </button>
            </div>
          ) : isFull ? (
            <div className="w-full text-center py-2 text-xs font-mono text-amber-400 font-semibold">
              Tournament Slots are Full for this match! Choose the next slot.
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <div className="text-xs text-slate-400">
                Wallet Balance:{' '}
                <span className="font-mono text-emerald-400 font-bold">
                  ₹{user.wallet.total}
                </span>{' '}
                <span className="text-[10px] text-slate-500">
                  (Fee: ₹{match.entryFee})
                </span>
              </div>
              <button
                onClick={handleJoinClick}
                disabled={isJoining}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all"
              >
                <span>{isJoining ? 'Joining...' : `Pay ₹${match.entryFee} & Join`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
