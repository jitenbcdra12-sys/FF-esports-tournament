import React, { useState, useEffect } from 'react';
import { 
  Flame, Swords, ShieldCheck, Crosshair, Trophy, Users, Clock, 
  ArrowRight, Sparkles, Filter, AlertTriangle, ShieldAlert, CheckCircle2,
  Phone, KeyRound, Wallet, ChevronRight, HelpCircle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MatchCard } from './components/MatchCard';
import { MatchDetailModal } from './components/MatchDetailModal';
import { WalletModal } from './components/WalletModal';
import { AuthModal } from './components/AuthModal';
import { AntiCheatModal } from './components/AntiCheatModal';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationModal } from './components/NotificationModal';
import { Toast } from './components/Toast';
import { 
  generateDailyBrSlots, 
  initialCsMatches, 
  initialLoneWolfMatches, 
  defaultUser, 
  initialLeaderboard, 
  initialTransactions, 
  initialNotifications 
} from './data/mockData';
import { Match, GameMode, UserProfile, WalletTransaction, PushNotification } from './types/tournament';
import { sound } from './utils/audio';
import { testFirestoreConnection } from './firebase';
import { 
  subscribeToMatches, 
  seedMatchesIfEmpty, 
  updateMatchInFirestore, 
  addTransactionToFirestore, 
  addNotificationToFirestore,
  syncUserProfile,
  onAuthUserChanged,
  fetchUserProfile 
} from './services/firebaseService';

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard' | 'security' | 'rules'>('matches');
  const [selectedModeFilter, setSelectedModeFilter] = useState<'all' | 'br' | 'cs' | 'lonewolf'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Core Data States
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [matches, setMatches] = useState<Match[]>(() => [
    ...generateDailyBrSlots(),
    ...initialCsMatches,
    ...initialLoneWolfMatches,
  ]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);
  const [notifications, setNotifications] = useState<PushNotification[]>(initialNotifications);
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  // Modal Open States
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isMatchDetailOpen, setIsMatchDetailOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAntiCheatOpen, setIsAntiCheatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Credentials target for Anti-Cheat view
  const [targetCredentialsMatch, setTargetCredentialsMatch] = useState<Match | null>(null);

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setIsSoundOn(next);
  };

  // Real-time Firestore initialization & subscription
  useEffect(() => {
    testFirestoreConnection();

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthUserChanged(async (fbUser) => {
      if (fbUser) {
        setUser((prev) => ({
          ...prev,
          id: fbUser.uid,
          email: fbUser.email || prev.email,
          name: fbUser.displayName || prev.name,
          avatarUrl: fbUser.photoURL || prev.avatarUrl,
        }));

        try {
          const remote = await fetchUserProfile(fbUser.uid);
          if (remote) {
            setUser((prev) => ({
              ...prev,
              ...remote,
              id: fbUser.uid,
            }));
          }
        } catch {
          // ignore
        }
      }
    });

    const unsubscribeMatches = subscribeToMatches((liveMatches) => {
      if (liveMatches && liveMatches.length > 0) {
        setMatches(liveMatches);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeMatches) unsubscribeMatches();
    };
  }, []);

  // Sync user profile changes to Firestore only when authenticated
  useEffect(() => {
    if (user.id !== 'usr_me_777') {
      syncUserProfile(user);
    }
  }, [user]);

  // Push Notification Dispatcher
  const dispatchNotification = (
    title: string,
    body: string,
    type: PushNotification['type'] = 'match_alert'
  ) => {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}`,
      title,
      body,
      type,
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
    addNotificationToFirestore(newNotif);
    sound.playNotification();
  };

  // Add Transaction Helper
  const addTransaction = (
    title: string,
    amount: number,
    type: WalletTransaction['type'],
    description: string = 'Processed by BattleZone Escrow',
    refId?: string
  ) => {
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      title,
      amount,
      type,
      status: 'completed',
      description,
      referenceId: refId || `REF_${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);
    addTransactionToFirestore(newTx);
  };

  // Joining a match
  const handleJoinMatch = (matchId: string, team?: 'Alpha' | 'Bravo'): boolean => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return false;

    if (user.wallet.total < match.entryFee) {
      alert(`Insufficient balance. Please add at least ₹${match.entryFee} to your wallet.`);
      setIsWalletOpen(true);
      return false;
    }

    // Deduct fee from wallet (deposit first, then winnings)
    let newDeposit = user.wallet.deposit;
    let newWinnings = user.wallet.winnings;
    const fee = match.entryFee;

    if (newDeposit >= fee) {
      newDeposit -= fee;
    } else {
      const remaining = fee - newDeposit;
      newDeposit = 0;
      newWinnings -= remaining;
    }

    const newTotal = newDeposit + newWinnings + user.wallet.bonus;

    setUser((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        deposit: newDeposit,
        winnings: newWinnings,
        total: newTotal,
      },
    }));

    // Register player to match slot
    const newSlotNumber = match.registeredPlayers.length + 1;
    const updatedPlayers = [
      ...match.registeredPlayers,
      {
        slotNumber: newSlotNumber,
        userId: user.id,
        ffIgn: user.ffIgn,
        ffUid: user.ffUid,
        joinedAt: 'Just now',
        team: team || (newSlotNumber % 2 === 0 ? 'Bravo' : 'Alpha'),
      },
    ];

    const updatedMatch: Match = {
      ...match,
      registeredPlayers: updatedPlayers,
      roomId: match.roomId || `894210${match.matchNumber}`,
      roomPassword: match.roomPassword || `BZ${match.matchNumber}`,
    };

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? updatedMatch : m))
    );
    updateMatchInFirestore(updatedMatch);

    addTransaction(
      `Entry Fee: ${match.title}`,
      match.entryFee,
      'entry_fee',
      `Registered as Slot #${newSlotNumber} (UID: ${user.ffUid})`
    );

    dispatchNotification(
      'Tournament Entry Confirmed!',
      `You joined ${match.title}. Auto-refund guarantee active: 100% refund if slots remain unfilled.`,
      'match_alert'
    );

    setIsMatchDetailOpen(false);
    return true;
  };

  // Open Room ID & Pass with Anti-Cheat protection
  const handleOpenRoomCredentials = (match: Match) => {
    setTargetCredentialsMatch(match);
    setIsAntiCheatOpen(true);
  };

  // Add Money via UPI
  const handleAddMoney = (amount: number, method: string) => {
    setUser((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        deposit: prev.wallet.deposit + amount,
        total: prev.wallet.total + amount,
      },
    }));

    addTransaction(
      `Wallet Top-Up via ${method}`,
      amount,
      'deposit',
      `Instant UPI deposit credited to Deposit Cash`
    );

    dispatchNotification(
      'Money Added to Wallet',
      `₹${amount} deposited successfully via ${method}. Ready for tournament entry.`,
      'wallet_credit'
    );
  };

  // Withdraw Money via UPI
  const handleWithdrawMoney = (amount: number, upiId: string): boolean => {
    if (amount > user.wallet.winnings) return false;

    setUser((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        winnings: prev.wallet.winnings - amount,
        total: prev.wallet.total - amount,
      },
    }));

    addTransaction(
      `Withdrawal to ${upiId}`,
      amount,
      'withdrawal',
      `IMPS payout processed with 0% fee`
    );

    dispatchNotification(
      'Withdrawal Initiated',
      `₹${amount} payout sent to ${upiId}. Arriving in 2-5 minutes via UPI IMPS.`,
      'wallet_credit'
    );

    return true;
  };

  // Auto-Refund Engine triggered by Admin or system
  const handleAutoRefundMatch = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const registeredCount = targetMatch.registeredPlayers.length;
    const isCurrentUserInMatch = targetMatch.registeredPlayers.some((p) => p.userId === user.id);

    // If current user is registered, refund 100% entry fee
    if (isCurrentUserInMatch) {
      setUser((prev) => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          deposit: prev.wallet.deposit + targetMatch.entryFee,
          total: prev.wallet.total + targetMatch.entryFee,
        },
      }));

      addTransaction(
        `Auto-Refund: ${targetMatch.title}`,
        targetMatch.entryFee,
        'auto_refund',
        `Full 100% refund. Match had ${registeredCount}/${targetMatch.capacity} players at start time.`
      );

      dispatchNotification(
        '100% Auto-Refund Processed!',
        `Match cancelled because ${targetMatch.capacity} player slots were not full. ₹${targetMatch.entryFee} refunded to your wallet.`,
        'auto_refund'
      );
    }

    // Update match status to cancelled_refunded
    const refundedMatch: Match = {
      ...targetMatch,
      status: 'cancelled_refunded',
      isRefunded: true,
      refundReason: `Only ${registeredCount} of ${targetMatch.capacity} slots filled at match start time. Full fees refunded.`,
    };

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? refundedMatch : m))
    );
    updateMatchInFirestore(refundedMatch);
  };

  // BR Result Declaration & ₹13 per Kill distribution
  const handleDeclareBrResults = (
    matchId: string,
    playerKills: { userId: string; kills: number }[]
  ) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    // Check if current user earned kills
    const myKillsObj = playerKills.find((pk) => pk.userId === user.id);
    const myKills = myKillsObj ? myKillsObj.kills : 4; // default 4 kills for demo simulation
    const myPrize = myKills * 13; // ₹13 per kill

    setUser((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        winnings: prev.wallet.winnings + myPrize,
        total: prev.wallet.total + myPrize,
      },
      stats: {
        ...prev.stats,
        totalKills: prev.stats.totalKills + myKills,
        matchesPlayed: prev.stats.matchesPlayed + 1,
        totalEarnings: prev.stats.totalEarnings + myPrize,
      },
    }));

    addTransaction(
      `Kill Bounty: ${myKills} Kills in ${targetMatch.title}`,
      myPrize,
      'kill_bounty',
      `₹13 per kill reward credited to Winning Balance`
    );

    dispatchNotification(
      'Match Results Declared - ₹' + myPrize + ' Won!',
      `You secured ${myKills} kills in ${targetMatch.title}! ₹${myPrize} credited straight to Winning Wallet.`,
      'wallet_credit'
    );

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'completed',
              winnerInfo: {
                totalKillsRecorded: 38,
                summary: 'All kills verified with OCR anti-cheat screenshot scanner.',
              },
            }
          : m
      )
    );
  };

  // CS 4v4 Result Declaration
  const handleDeclareCsWinner = (matchId: string, winningTeam: 'Alpha' | 'Bravo') => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const prize = 35; // ₹35 winner pool
    setUser((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        winnings: prev.wallet.winnings + prize,
        total: prev.wallet.total + prize,
      },
      stats: {
        ...prev.stats,
        wins: prev.stats.wins + 1,
        matchesPlayed: prev.stats.matchesPlayed + 1,
        totalEarnings: prev.stats.totalEarnings + prize,
      },
    }));

    addTransaction(
      `CS 4v4 Victory: Squad ${winningTeam} Won!`,
      prize,
      'win_prize',
      `₹35 Winning Team Prize Pool awarded to squad members`
    );

    dispatchNotification(
      `CS 4v4 Victory! ₹${prize} Won`,
      `Squad ${winningTeam} won the match! ₹35 winning team prize credited to your wallet.`,
      'wallet_credit'
    );

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'completed',
              winnerInfo: {
                winningTeam,
                summary: `Squad ${winningTeam} secured Booyah in 4v4 Clash Squad.`,
              },
            }
          : m
      )
    );
  };

  // Lone Wolf 1v1 Result Declaration
  const handleDeclareLoneWolfWinner = (matchId: string, winnerUserId: string) => {
    const prize = 9; // ₹9 winner pool
    setUser((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        winnings: prev.wallet.winnings + prize,
        total: prev.wallet.total + prize,
      },
      stats: {
        ...prev.stats,
        wins: prev.stats.wins + 1,
        matchesPlayed: prev.stats.matchesPlayed + 1,
        totalEarnings: prev.stats.totalEarnings + prize,
      },
    }));

    addTransaction(
      'Lone Wolf 1v1 Duel Champion',
      prize,
      'win_prize',
      `₹9 Winner Takes All prize pool credited`
    );

    dispatchNotification(
      'Lone Wolf 1v1 Won! ₹9 Credited',
      'Flawless 1v1 victory! ₹9 winner pool credited to your Winning Wallet.',
      'wallet_credit'
    );

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'completed',
              winnerInfo: {
                winnerName: user.ffIgn,
                summary: 'Duel finished with clean headshot.',
              },
            }
          : m
      )
    );
  };

  // Filtered Matches
  const filteredMatches = matches.filter((m) => {
    if (selectedModeFilter !== 'all' && m.mode !== selectedModeFilter) return false;
    if (timeFilter === 'morning') {
      return m.scheduledTime.includes('AM');
    }
    if (timeFilter === 'afternoon') {
      return (
        m.scheduledTime.includes('12:') ||
        m.scheduledTime.includes('01:') ||
        m.scheduledTime.includes('02:') ||
        m.scheduledTime.includes('03:') ||
        m.scheduledTime.includes('04:')
      );
    }
    if (timeFilter === 'evening') {
      return (
        m.scheduledTime.includes('05:') ||
        m.scheduledTime.includes('06:') ||
        m.scheduledTime.includes('07:') ||
        m.scheduledTime.includes('08:') ||
        m.scheduledTime.includes('09:') ||
        m.scheduledTime.includes('10:')
      );
    }
    return true;
  });

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white pb-20 lg:pb-8">
      
      {/* Top Bar Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAntiCheat={() => setIsAntiCheatOpen(true)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        isSoundOn={isSoundOn}
        onToggleSound={handleToggleSound}
      />

      {/* Real-time Toast Notifications */}
      <Toast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: ADMIN CONTROL DASHBOARD */}
        {isAdmin ? (
          <AdminDashboard
            matches={matches}
            onAddMatch={(newM) => {
              setMatches((prev) => [newM, ...prev]);
              updateMatchInFirestore(newM);
            }}
            onUpdateRoomCredentials={(mId, rId, rPass) => {
              setMatches((prev) =>
                prev.map((m) => {
                  if (m.id === mId) {
                    const updated = { ...m, roomId: rId, roomPassword: rPass, status: 'room_ready' as const };
                    updateMatchInFirestore(updated);
                    return updated;
                  }
                  return m;
                })
              );
              dispatchNotification(
                'Room ID & Password Published!',
                `Room ID: ${rId} & Pass: ${rPass} are now live. Anti-cheat integrity verified.`,
                'room_pass'
              );
            }}
            onAutoRefundMatch={handleAutoRefundMatch}
            onDeclareBrResults={handleDeclareBrResults}
            onDeclareCsWinner={handleDeclareCsWinner}
            onDeclareLoneWolfWinner={handleDeclareLoneWolfWinner}
            onBroadcastNotification={(t, b) => dispatchNotification(t, b, 'match_alert')}
          />
        ) : activeTab === 'leaderboard' ? (
          /* VIEW 2: LIVE LEADERBOARD */
          <LeaderboardView players={initialLeaderboard} />
        ) : activeTab === 'rules' ? (
          /* VIEW 3: TOURNAMENT RULES & AUTO-REFUND POLICY */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                Fair Play & Official Tournament Regulations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
                BattleZone Rules, Rewards & Auto-Refund Policy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* BR Rank Rule Card */}
              <div className="p-5 rounded-2xl bg-[#0c101d] border border-orange-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-400 font-heading">BR Rank Format</span>
                  <span className="text-xs font-mono text-slate-400">40 Players</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>• Daily slots run continuously from <span className="text-amber-400 font-bold">7:00 AM to 10:00 PM</span>.</p>
                  <p>• Entry Fee: <span className="font-mono text-white font-bold">₹15</span></p>
                  <p>• Reward: <span className="font-mono text-orange-400 font-bold">₹13 Per Kill</span> bounty credited directly to Winning Wallet.</p>
                  <p className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
                    <strong>Auto-Refund Guarantee:</strong> If 40 players are not filled by the scheduled match time, 100% of the ₹15 entry fee is immediately refunded to your wallet!
                  </p>
                </div>
              </div>

              {/* CS Rank Rule Card */}
              <div className="p-5 rounded-2xl bg-[#0c101d] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-cyan-400 font-heading">CS Rank (4 vs 4)</span>
                  <span className="text-xs font-mono text-slate-400">8 Players</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>• Squad Alpha vs Squad Bravo clash.</p>
                  <p>• Entry Fee: <span className="font-mono text-white font-bold">₹10</span> per player.</p>
                  <p>• Reward: <span className="font-mono text-cyan-400 font-bold">₹35 Pool Prize</span> awarded to the winning squad.</p>
                  <p className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
                    <strong>Auto-Refund Guarantee:</strong> If the 8 player slots (4v4) are not completed on time, ₹10 is refunded 100% back to wallet.
                  </p>
                </div>
              </div>

              {/* Lone Wolf Rule Card */}
              <div className="p-5 rounded-2xl bg-[#0c101d] border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-rose-400 font-heading">Lone Wolf (1 vs 1)</span>
                  <span className="text-xs font-mono text-slate-400">2 Players</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>• Pure 1v1 duel in Iron Cage arena.</p>
                  <p>• Entry Fee: <span className="font-mono text-white font-bold">₹5</span> per duelist.</p>
                  <p>• Reward: <span className="font-mono text-rose-400 font-bold">₹9 Winner Pool</span> for the duel champion.</p>
                  <p className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
                    <strong>Auto-Refund Guarantee:</strong> If opponent is not found / slots not filled on time, ₹5 is refunded 100% instantly.
                  </p>
                </div>
              </div>

            </div>

            {/* Anti-Hack Environment Section */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#101626] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-base font-bold text-white font-heading">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                Anti-Cheat & Clean Game Launch Technology
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As per tournament security regulations, during match hours any third-party app overlay, floating injector, macro tool, or game guardian app is blocked. Our clean sandbox ensures zero unauthorized interference with the official Free Fire client. Emulators are strictly barred—only physical mobile touch devices are permitted.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsAntiCheatOpen(true)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run Anti-Cheat Security Scan</span>
                </button>
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>View Wallet & UPI Deposit</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* VIEW 4: TOURNAMENT MATCHES FEED (DEFAULT) */
          <div className="space-y-6">
            
            {/* HERO BANNER SECTION */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0c101c]">
              
              {/* Background Esports Key Visual */}
              <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
                <img
                  src="/src/assets/images/ff_tournament_banner_1794168994883.jpg"
                  alt="Free Fire BattleZone Esports Arena"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-700"
                />
                {/* Measured Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/50 to-transparent" />
              </div>

              {/* Overlay Content Box */}
              <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end max-w-3xl">
                
                {/* Daily Schedule Kicker */}
                <div className="flex items-center gap-2 text-xs text-orange-400 font-mono font-bold uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>Morning 7:00 AM – Night 10:00 PM Daily 30 Matches</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Auto-Refund Guaranteed
                  </span>
                </div>

                {/* Hero Headline */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white font-heading tracking-wide leading-tight text-balance mb-3">
                  Play Free Fire Tournaments & Win Real Cash
                </h1>

                {/* Format Badges */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 max-w-2xl">
                  Compete in <strong>BR Rank (40-Player, ₹13/kill)</strong>, <strong>CS Rank 4v4 (₹35 Winner Team)</strong>, and <strong>Lone Wolf 1v1 (₹9 Winner)</strong>. Unfilled matches automatically refund 100% entry fee.
                </p>

                {/* Hero Action CTA buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedModeFilter('br');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-orange-600/30 flex items-center gap-2 transition-all group"
                  >
                    <span>Join BR Rank (₹13/Kill)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsAntiCheatOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm backdrop-blur-md flex items-center gap-2 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Anti-Cheat Shield Active</span>
                  </button>
                </div>

              </div>
            </div>

            {/* LIVE SYSTEM STATS TICKER STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              
              <div className="p-3.5 rounded-2xl bg-[#0c101c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                  <Crosshair className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">BR Rank Bounty</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-orange-400 tabular-nums">
                    ₹13 Per Kill
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0c101c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">CS 4v4 Winner Pool</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-cyan-300 tabular-nums">
                    ₹35 Pool Prize
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0c101c] border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lone Wolf 1v1</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-rose-300 tabular-nums">
                    ₹5 Fee · ₹9 Pool
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0c101c] border border-emerald-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Auto-Refund Guarantee</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    100% Back If Unfilled
                  </span>
                </div>
              </div>

            </div>

            {/* FILTER & SCHEDULE SELECTOR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c101c] border border-slate-800">
              
              {/* Mode Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedModeFilter('all');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    selectedModeFilter === 'all'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Matches ({matches.length})
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedModeFilter('br');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    selectedModeFilter === 'br'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>BR Rank (40P · ₹13/kill)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedModeFilter('cs');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    selectedModeFilter === 'cs'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>CS Rank (4v4 · ₹35)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedModeFilter('lonewolf');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    selectedModeFilter === 'lonewolf'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Lone Wolf (1v1 · ₹9)</span>
                </button>
              </div>

              {/* Time Interval Tabs */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-mono text-[11px] mr-1 hidden md:inline">
                  Time Slot:
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setTimeFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timeFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Day (7 AM - 10 PM)
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setTimeFilter('morning');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timeFilter === 'morning' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Morning
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setTimeFilter('evening');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timeFilter === 'evening' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Night
                </button>
              </div>

            </div>

            {/* MATCHES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  user={user}
                  onSelectMatch={(m) => {
                    setSelectedMatch(m);
                    setIsMatchDetailOpen(true);
                  }}
                  onOpenRoomCredentials={handleOpenRoomCredentials}
                />
              ))}
            </div>

            {filteredMatches.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-[#0c101c] border border-slate-800 text-slate-500 space-y-2">
                <Filter className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-semibold">No tournament matches match your filter.</p>
                <button
                  onClick={() => {
                    setSelectedModeFilter('all');
                    setTimeFilter('all');
                  }}
                  className="text-xs text-orange-400 font-bold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* MODALS */}
      
      {/* 1. Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={isMatchDetailOpen}
        onClose={() => setIsMatchDetailOpen(false)}
        user={user}
        onJoinMatch={handleJoinMatch}
        onOpenRoomCredentials={handleOpenRoomCredentials}
        onOpenWallet={() => {
          setIsMatchDetailOpen(false);
          setIsWalletOpen(true);
        }}
      />

      {/* 2. Wallet Modal (Add Money UPI, Withdraw, Passbook) */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        user={user}
        transactions={transactions}
        onAddMoney={handleAddMoney}
        onWithdrawMoney={handleWithdrawMoney}
      />

      {/* 3. Authentication & Profile Modal (Gmail, Phone OTP, FF UID) */}
      <AuthModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        onAddTransaction={(t, a, type) => addTransaction(t, a, type)}
        onNotify={(t, b, type) => dispatchNotification(t, b, type)}
      />

      {/* 4. Anti-Cheat Security Shield & Clean Game Launch */}
      <AntiCheatModal
        isOpen={isAntiCheatOpen}
        onClose={() => setIsAntiCheatOpen(false)}
        ffUid={user.ffUid}
        ffIgn={user.ffIgn}
        phone={user.phone}
        activeRoomId={targetCredentialsMatch?.roomId || '8839201'}
        activeRoomPass={targetCredentialsMatch?.roomPassword || 'FF2026'}
        matchTitle={targetCredentialsMatch?.title || 'BR Rank 40-Player Daily Rush #102'}
        onNotify={(t, b, type) => dispatchNotification(t, b, type)}
      />

      {/* 5. Notification Center Drawer */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          sound.playClick();
        }}
      />

      {/* Mobile Touch Bottom Navigation (Pattern 1) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAntiCheat={() => setIsAntiCheatOpen(true)}
        walletBalance={user.wallet.total}
      />

    </div>
  );
}
