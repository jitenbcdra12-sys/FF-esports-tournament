import React, { useState } from 'react';
import { Trophy, Medal, Flame, Crosshair, Award, Users } from 'lucide-react';
import { LeaderboardPlayer } from '../types/tournament';
import { sound } from '../utils/audio';

interface LeaderboardViewProps {
  players: LeaderboardPlayer[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ players }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'kills' | 'br' | 'cs' | 'lonewolf'>('all');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'alltime'>('weekly');

  const filteredPlayers = [...players].sort((a, b) => {
    if (filterMode === 'kills') {
      return b.kills - a.kills;
    }
    return b.totalEarnings - a.totalEarnings;
  });

  const topThree = filteredPlayers.slice(0, 3);
  const restPlayers = filteredPlayers.slice(3);

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 font-mono font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Official Esports Hall of Fame</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-wide">
            Live Tournament Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time rankings based on kill bounties, Booyah victories, and tournament prize earnings.
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => {
              sound.playClick();
              setFilterMode('all');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterMode === 'all' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Earners
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilterMode('kills');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              filterMode === 'kills' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            Most Kills
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilterMode('br');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterMode === 'br' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            BR Rank
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilterMode('cs');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterMode === 'cs' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            CS 4v4
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* #2 Silver (Placed Left on Desktop) */}
          <div className="order-2 md:order-1 bg-gradient-to-b from-slate-900 via-[#0e1422] to-[#0c101c] border border-slate-700/80 rounded-2xl p-5 text-center relative overflow-hidden shadow-lg">
            <div className="w-8 h-8 rounded-full bg-slate-400/20 text-slate-300 font-bold font-mono text-sm flex items-center justify-center mx-auto mb-3 border border-slate-400/40">
              #2
            </div>
            <img
              src={topThree[1].avatar}
              alt={topThree[1].ffIgn}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-slate-800 object-cover border-2 border-slate-400 shadow-md"
            />
            <h3 className="text-base font-bold text-white font-heading truncate">
              {topThree[1].ffIgn}
            </h3>
            <span className="text-[11px] font-mono text-slate-400 block mb-2">
              UID: {topThree[1].ffUid}
            </span>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Kills</span>
                <span className="font-mono font-bold text-white tabular-nums">{topThree[1].kills}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-[10px] text-emerald-400 block">Won</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">₹{topThree[1].totalEarnings}</span>
              </div>
            </div>
          </div>

          {/* #1 Gold (Center, Elevated & Glowing) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/40 via-[#181a29] to-[#0d111d] border-2 border-amber-500/60 rounded-2xl p-6 text-center relative overflow-hidden shadow-xl shadow-amber-500/10 md:-translate-y-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black font-mono text-base flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
              #1
            </div>
            <img
              src={topThree[0].avatar}
              alt={topThree[0].ffIgn}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl mx-auto mb-3 bg-slate-800 object-cover border-2 border-amber-400 shadow-lg shadow-amber-500/20"
            />
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <h3 className="text-lg font-bold text-white font-heading truncate">
                {topThree[0].ffIgn}
              </h3>
              <Flame className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            </div>
            <span className="text-[11px] font-mono text-amber-300/80 block mb-3 font-semibold">
              UID: {topThree[0].ffUid} • {topThree[0].tier}
            </span>
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Total Kills</span>
                <span className="font-mono font-extrabold text-white text-sm tabular-nums">{topThree[0].kills}</span>
              </div>
              <div className="w-px h-7 bg-slate-800" />
              <div>
                <span className="text-[10px] text-emerald-400 block font-semibold">Total Prize</span>
                <span className="font-mono font-extrabold text-emerald-400 text-base tabular-nums">
                  ₹{topThree[0].totalEarnings}
                </span>
              </div>
            </div>
          </div>

          {/* #3 Bronze (Placed Right on Desktop) */}
          <div className="order-3 bg-gradient-to-b from-slate-900 via-[#0e1422] to-[#0c101c] border border-amber-800/40 rounded-2xl p-5 text-center relative overflow-hidden shadow-lg">
            <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 font-bold font-mono text-sm flex items-center justify-center mx-auto mb-3 border border-amber-700/40">
              #3
            </div>
            <img
              src={topThree[2].avatar}
              alt={topThree[2].ffIgn}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-slate-800 object-cover border-2 border-amber-700/60 shadow-md"
            />
            <h3 className="text-base font-bold text-white font-heading truncate">
              {topThree[2].ffIgn}
            </h3>
            <span className="text-[11px] font-mono text-slate-400 block mb-2">
              UID: {topThree[2].ffUid}
            </span>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Kills</span>
                <span className="font-mono font-bold text-white tabular-nums">{topThree[2].kills}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-[10px] text-emerald-400 block">Won</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">₹{topThree[2].totalEarnings}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* DETAILED LEADERBOARD TABLE */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            All Challenger Standings
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {filteredPlayers.length} verified contenders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 uppercase tracking-wider font-mono bg-slate-950/60">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player & FF UID</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-center">Matches</th>
                <th className="py-3 px-4 text-center">Kills</th>
                <th className="py-3 px-4 text-right">Total Winnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredPlayers.map((p, index) => (
                <tr
                  key={p.userId}
                  className="hover:bg-slate-900/60 transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`inline-block w-6 text-center ${
                        index === 0
                          ? 'text-amber-400 font-black'
                          : index === 1
                          ? 'text-slate-300 font-bold'
                          : index === 2
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.ffIgn}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg bg-slate-800 object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
                          {p.ffIgn}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          UID: {p.ffUid}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-300 font-mono">
                      {p.tier}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-400">
                    {p.matches}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold tabular-nums text-white">
                    {p.kills}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-400 text-sm">
                    ₹{p.totalEarnings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
