import React, { useState } from 'react';
import { PlusCircle, ShieldAlert, KeyRound, Trophy, RefreshCw, Send, CheckCircle2, AlertTriangle, Users, Crosshair, DollarSign, Flame, Clock } from 'lucide-react';
import { Match, GameMode } from '../types/tournament';
import { sound } from '../utils/audio';

interface AdminDashboardProps {
  matches: Match[];
  onAddMatch: (match: Match) => void;
  onUpdateRoomCredentials: (matchId: string, roomId: string, roomPass: string) => void;
  onAutoRefundMatch: (matchId: string) => void;
  onDeclareBrResults: (matchId: string, playerKills: { userId: string; kills: number }[]) => void;
  onDeclareCsWinner: (matchId: string, winningTeam: 'Alpha' | 'Bravo') => void;
  onDeclareLoneWolfWinner: (matchId: string, winnerUserId: string) => void;
  onBroadcastNotification: (title: string, body: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  matches,
  onAddMatch,
  onUpdateRoomCredentials,
  onAutoRefundMatch,
  onDeclareBrResults,
  onDeclareCsWinner,
  onDeclareLoneWolfWinner,
  onBroadcastNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'refund' | 'results' | 'broadcast' | 'anticheat'>('matches');

  // New Match Form State
  const [mode, setMode] = useState<GameMode>('br');
  const [title, setTitle] = useState('BR Rank Evening Rush');
  const [map, setMap] = useState<'Bermuda' | 'Purgatory' | 'Kalahari' | 'NexTerra' | 'Iron Cage'>('Bermuda');
  const [time, setTime] = useState('06:30 PM');
  const [isCreating, setIsCreating] = useState(false);

  // Room Credentials State
  const [selectedMatchForRoom, setSelectedMatchForRoom] = useState<string>(matches[0]?.id || '');
  const [roomIdInput, setRoomIdInput] = useState('9928174');
  const [roomPassInput, setRoomPassInput] = useState('FF7788');
  const [roomUpdatedMsg, setRoomUpdatedMsg] = useState(false);

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // BR Result Declaration State
  const [selectedBrMatchId, setSelectedBrMatchId] = useState<string>('');
  const [brKillsMap, setBrKillsMap] = useState<{ [userId: string]: number }>({});

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsCreating(true);

    const matchNumber = Math.floor(100 + Math.random() * 900);
    const capacity = mode === 'br' ? 40 : mode === 'cs' ? 8 : 2;
    const entryFee = mode === 'br' ? 15 : mode === 'cs' ? 10 : 5;
    const perKillReward = mode === 'br' ? 13 : 0;
    const poolPrize = mode === 'cs' ? 35 : mode === 'lonewolf' ? 9 : 40 * 13;

    const newMatch: Match = {
      id: `match_${mode}_${Date.now()}`,
      matchNumber,
      title: title || `${mode.toUpperCase()} Match #${matchNumber}`,
      mode,
      map,
      version: 'TPP',
      entryFee,
      perKillReward,
      poolPrize,
      capacity,
      scheduledTime: time,
      date: 'Today',
      status: 'open',
      registeredPlayers: [],
    };

    setTimeout(() => {
      onAddMatch(newMatch);
      setIsCreating(false);
      sound.playBooyah();
      alert(`Tournament Match #${matchNumber} (${mode.toUpperCase()}) published successfully!`);
    }, 400);
  };

  const handlePublishRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForRoom || !roomIdInput || !roomPassInput) return;
    sound.playClick();
    onUpdateRoomCredentials(selectedMatchForRoom, roomIdInput, roomPassInput);
    setRoomUpdatedMsg(true);
    sound.playNotification();
    setTimeout(() => setRoomUpdatedMsg(false), 2500);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;
    sound.playClick();
    onBroadcastNotification(broadcastTitle, broadcastBody);
    setBroadcastSuccess(true);
    sound.playNotification();
    setBroadcastTitle('');
    setBroadcastBody('');
    setTimeout(() => setBroadcastSuccess(false), 2500);
  };

  // Find matches eligible for refund (unfilled slots)
  const unfilledMatches = matches.filter(
    (m) => m.status !== 'completed' && m.status !== 'cancelled_refunded' && m.registeredPlayers.length < m.capacity
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0e1424] border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Tournament Host & Master Control Panel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
            Admin Tournament Management
          </h2>
          <p className="text-xs text-slate-300">
            Publish matches, distribute secure Room IDs, trigger auto-refunds for unfilled slots, and settle per-kill payouts.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Total Matches</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">{matches.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-amber-400 block font-medium">Unfilled Slots</span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">{unfilledMatches.length}</span>
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('matches');
          }}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'matches' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Create Match
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('refund');
          }}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'refund' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Auto-Refund Unfilled ({unfilledMatches.length})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('results');
          }}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'results' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Publish Results & ₹13 Kills
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('broadcast');
          }}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'broadcast' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          Push Notification
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('anticheat');
          }}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'anticheat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Security Logs
        </button>
      </div>

      {/* TAB 1: CREATE MATCH & ROOM ID PUBLISHER */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Create Match Card */}
          <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-orange-400" />
              Schedule New Tournament Match
            </h3>

            <form onSubmit={handleCreateMatch} className="space-y-4">
              
              {/* Game Mode Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Game Mode & Pricing Model
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMode('br');
                      setTitle('BR Rank 40-Player Daily Rush');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      mode === 'br'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-heading">BR Rank</div>
                    <div className="text-[10px] text-slate-400">40 Slots • ₹15 Entry</div>
                    <div className="text-[10px] text-orange-400 font-mono font-bold">₹13/Kill</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMode('cs');
                      setTitle('CS Rank 4v4 Squad Clash');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      mode === 'cs'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-heading">CS Rank (4v4)</div>
                    <div className="text-[10px] text-slate-400">8 Slots • ₹10 Entry</div>
                    <div className="text-[10px] text-cyan-400 font-mono font-bold">₹35 Winner</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMode('lonewolf');
                      setTitle('Lone Wolf 1v1 Arena Duel');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      mode === 'lonewolf'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-heading">Lone Wolf (1v1)</div>
                    <div className="text-[10px] text-slate-400">2 Slots • ₹5 Entry</div>
                    <div className="text-[10px] text-rose-400 font-mono font-bold">₹9 Winner</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Match Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Map
                  </label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="NexTerra">NexTerra</option>
                    <option value="Iron Cage">Iron Cage</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 07:30 PM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isCreating ? 'Publishing...' : 'Publish Tournament to Feed'}</span>
              </button>

            </form>
          </div>

          {/* Room ID & Password Publisher */}
          <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Publish Room ID & Password to Players
            </h3>
            <p className="text-xs text-slate-400">
              When Room ID and Password are saved here, they are instantly encrypted and delivered to registered players with dynamic watermarks.
            </p>

            <form onSubmit={handlePublishRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Active Match
                </label>
                <select
                  value={selectedMatchForRoom}
                  onChange={(e) => setSelectedMatchForRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.scheduledTime}) - {m.registeredPlayers.length}/{m.capacity} players
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Room ID
                  </label>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    placeholder="e.g. 8839201"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Room Password
                  </label>
                  <input
                    type="text"
                    value={roomPassInput}
                    onChange={(e) => setRoomPassInput(e.target.value)}
                    placeholder="e.g. FF99"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-orange-400 font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {roomUpdatedMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Room ID & Password broadcasted to registered players!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>Broadcast Room ID to Registered Users</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 2: AUTO-REFUND UNFILLED MATCHES */}
      {activeTab === 'refund' && (
        <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Unfilled Slots & Auto-Refund Engine
              </h3>
              <p className="text-xs text-slate-400">
                Rule: If 40 players in BR, 8 players in CS 4v4, or 2 players in Lone Wolf are not filled at match time, 100% money is refunded instantly.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {unfilledMatches.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                All scheduled matches have reached capacity or are completed! No refunds pending.
              </div>
            ) : (
              unfilledMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                      <span className="font-mono text-orange-400 font-bold uppercase">{match.mode}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-300 font-mono">{match.scheduledTime}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-red-400 font-mono font-semibold">
                        {match.registeredPlayers.length}/{match.capacity} Players (Unfilled)
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white font-heading">
                      {match.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Total pool to refund:{' '}
                      <span className="font-mono text-emerald-400 font-bold">
                        ₹{match.registeredPlayers.length * match.entryFee}
                      </span>{' '}
                      (₹{match.entryFee} × {match.registeredPlayers.length} players)
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onAutoRefundMatch(match.id);
                      sound.playNotification();
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 shrink-0 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Cancel Match & Refund 100%</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISH RESULTS & SETTLE REWARDS */}
      {activeTab === 'results' && (
        <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              Declare Tournament Results & Distribute Winnings
            </h3>
            <p className="text-xs text-slate-400">
              Select completed match to distribute kill bounties (₹13 per kill in BR) and winner pool prizes (₹35 in CS, ₹9 in Lone Wolf).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matches
              .filter((m) => m.status !== 'cancelled_refunded')
              .slice(0, 6)
              .map((match) => (
                <div
                  key={match.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-orange-400 font-bold uppercase">{match.mode}</span>
                    <span className="text-slate-400 font-mono">{match.scheduledTime}</span>
                  </div>
                  <div className="text-sm font-bold text-white font-heading truncate">
                    {match.title}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Players: <span className="font-mono text-white">{match.registeredPlayers.length}</span>
                  </div>

                  {match.mode === 'br' ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        // simulate declaring BR results with 3 kills for registered players
                        const kills = match.registeredPlayers.map((p, idx) => ({
                          userId: p.userId,
                          kills: idx === 0 ? 5 : idx === 1 ? 4 : 2,
                        }));
                        onDeclareBrResults(match.id, kills);
                        sound.playBooyah();
                        alert(`BR Results declared! ₹13/kill credited to winning players.`);
                      }}
                      className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                    >
                      Credit ₹13/Kill Bounties
                    </button>
                  ) : match.mode === 'cs' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onDeclareCsWinner(match.id, 'Alpha');
                          sound.playBooyah();
                          alert('Squad Alpha declared winners! ₹35 pool prize credited.');
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                      >
                        Alpha Wins (₹35)
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onDeclareCsWinner(match.id, 'Bravo');
                          sound.playBooyah();
                          alert('Squad Bravo declared winners! ₹35 pool prize credited.');
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                      >
                        Bravo Wins (₹35)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (match.registeredPlayers[0]) {
                          onDeclareLoneWolfWinner(match.id, match.registeredPlayers[0].userId);
                          sound.playBooyah();
                          alert('Lone Wolf winner declared! ₹9 prize credited.');
                        } else {
                          alert('No players in this match.');
                        }
                      }}
                      className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      Declare Duel Winner (₹9)
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST PUSH NOTIFICATION */}
      {activeTab === 'broadcast' && (
        <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 max-w-xl">
          <h3 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            Send Broadcast Push Notification
          </h3>
          <p className="text-xs text-slate-400">
            Send an instant notification alert to all registered Free Fire players in the app.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Notification Title
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Room ID will be published in 5 minutes!"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Message Body
              </label>
              <textarea
                rows={3}
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="All registered players please open Anti-Cheat Shield and ready your Free Fire game client..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {broadcastSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Broadcast delivered to all players!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Push Notification</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: ANTI-CHEAT SECURITY LOGS */}
      {activeTab === 'anticheat' && (
        <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Integrity Guard Live Security Logs
          </h3>
          <p className="text-xs text-slate-400">
            Live telemetry inspecting screen overlays, emulator bypass attempts, and watermark leak audits.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {[
              { time: '12:14:02', user: 'Viper_Booyah (1982736450)', event: 'Integrity scan passed (0 overlays detected)', status: 'PASS' },
              { time: '12:10:15', user: 'Gamer_X (1092837461)', event: 'Native touch device hardware verified', status: 'PASS' },
              { time: '12:05:30', user: 'AutoAim_Bot99 (1099228811)', event: 'Floating overlay app "MacroTouch" blocked by sandbox', status: 'BLOCKED' },
              { time: '11:58:19', user: 'RaiStar_God (1002938475)', event: 'Official Garena binary SHA256 verified', status: 'PASS' },
              { time: '11:45:00', user: 'System Watchdog', event: 'Anti-leak watermark stamps active for Room #8839201', status: 'AUDIT' },
            ].map((log, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{log.time}</span>
                  <span className="text-slate-300 font-semibold">{log.user}:</span>
                  <span className="text-slate-400">{log.event}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === 'PASS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : log.status === 'BLOCKED'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
