import { Match, UserProfile, LeaderboardPlayer, WalletTransaction, PushNotification } from '../types/tournament';

// Helper to generate BR Rank match slots between 7:00 AM and 10:00 PM
export const generateDailyBrSlots = (): Match[] => {
  const matches: Match[] = [];
  const times = [
    '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:15 PM', '10:00 PM'
  ];

  const maps: ('Bermuda' | 'Purgatory' | 'Kalahari' | 'NexTerra')[] = ['Bermuda', 'Purgatory', 'Kalahari', 'NexTerra'];

  times.forEach((time, index) => {
    const matchNumber = index + 101;
    let initialCount = 0;
    let status: Match['status'] = 'open';

    // Make earlier slots realistic (some filling up, one live, one upcoming with 38 players)
    if (index === 0) {
      initialCount = 40;
      status = 'completed';
    } else if (index === 1) {
      initialCount = 38;
      status = 'room_ready';
    } else if (index === 2) {
      initialCount = 31;
      status = 'open';
    } else if (index === 3) {
      initialCount = 22;
      status = 'open';
    } else if (index === 4) {
      initialCount = 14;
      status = 'open';
    } else {
      initialCount = Math.floor(Math.random() * 8);
      status = 'open';
    }

    const players = Array.from({ length: initialCount }, (_, pIndex) => ({
      slotNumber: pIndex + 1,
      userId: `bot_br_${pIndex + 1}`,
      ffIgn: `Player_OP${Math.floor(100 + Math.random() * 900)}`,
      ffUid: `10${Math.floor(10000000 + Math.random() * 89999999)}`,
      joinedAt: `${time} - 12m ago`,
    }));

    matches.push({
      id: `match_br_${matchNumber}`,
      matchNumber,
      title: `BR Rank Daily Rush #${matchNumber}`,
      mode: 'br',
      map: maps[index % maps.length],
      version: 'TPP',
      entryFee: 15,
      perKillReward: 13,
      poolPrize: 40 * 13, // dynamic based on kills
      capacity: 40,
      scheduledTime: time,
      date: 'Today',
      status,
      roomId: status === 'room_ready' || status === 'completed' ? `883920${index}` : undefined,
      roomPassword: status === 'room_ready' || status === 'completed' ? `FF${990 + index}` : undefined,
      registeredPlayers: players,
    });
  });

  return matches;
};

export const initialCsMatches: Match[] = [
  {
    id: 'match_cs_201',
    matchNumber: 201,
    title: 'Clash Squad 4v4 Showdown #201',
    mode: 'cs',
    map: 'Bermuda',
    version: 'TPP',
    entryFee: 10,
    perKillReward: 0,
    poolPrize: 35, // Winner team gets ₹35
    capacity: 8,
    scheduledTime: '06:00 PM',
    date: 'Today',
    status: 'open',
    registeredPlayers: [
      { slotNumber: 1, userId: 'u1', ffIgn: 'Thunder_Vip', ffUid: '1092837461', joinedAt: '10m ago', team: 'Alpha' },
      { slotNumber: 2, userId: 'u2', ffIgn: 'DarkSniper', ffUid: '1083749201', joinedAt: '9m ago', team: 'Alpha' },
      { slotNumber: 3, userId: 'u3', ffIgn: 'GamerGirl99', ffUid: '1029384756', joinedAt: '8m ago', team: 'Alpha' },
      { slotNumber: 5, userId: 'u5', ffIgn: 'HeadHunter', ffUid: '1099887766', joinedAt: '5m ago', team: 'Bravo' },
      { slotNumber: 6, userId: 'u6', ffIgn: 'BlazeStriker', ffUid: '1044556677', joinedAt: '3m ago', team: 'Bravo' },
      { slotNumber: 7, userId: 'u7', ffIgn: 'GhostRider_FF', ffUid: '1011223344', joinedAt: '1m ago', team: 'Bravo' },
    ],
  },
  {
    id: 'match_cs_202',
    matchNumber: 202,
    title: 'Clash Squad 4v4 Showdown #202',
    mode: 'cs',
    map: 'Kalahari',
    version: 'TPP',
    entryFee: 10,
    perKillReward: 0,
    poolPrize: 35,
    capacity: 8,
    scheduledTime: '07:15 PM',
    date: 'Today',
    status: 'open',
    registeredPlayers: [
      { slotNumber: 1, userId: 'p1', ffIgn: 'Legendary_Ace', ffUid: '1088776655', joinedAt: '4m ago', team: 'Alpha' },
      { slotNumber: 2, userId: 'p2', ffIgn: 'Sniper_Queen', ffUid: '1077665544', joinedAt: '2m ago', team: 'Alpha' },
    ],
  },
  {
    id: 'match_cs_203',
    matchNumber: 203,
    title: 'Clash Squad 4v4 Night Battle #203',
    mode: 'cs',
    map: 'NexTerra',
    version: 'TPP',
    entryFee: 10,
    perKillReward: 0,
    poolPrize: 35,
    capacity: 8,
    scheduledTime: '08:30 PM',
    date: 'Today',
    status: 'open',
    registeredPlayers: [],
  },
];

export const initialLoneWolfMatches: Match[] = [
  {
    id: 'match_lw_301',
    matchNumber: 301,
    title: 'Lone Wolf 1v1 Gladiator #301',
    mode: 'lonewolf',
    map: 'Iron Cage',
    version: 'TPP',
    entryFee: 5,
    perKillReward: 0,
    poolPrize: 9, // Winner gets ₹9
    capacity: 2,
    scheduledTime: '05:45 PM',
    date: 'Today',
    status: 'open',
    registeredPlayers: [
      { slotNumber: 1, userId: 'u_lw1', ffIgn: 'OneTapKing_OP', ffUid: '1099228811', joinedAt: '2m ago' },
    ],
  },
  {
    id: 'match_lw_302',
    matchNumber: 302,
    title: 'Lone Wolf 1v1 Gladiator #302',
    mode: 'lonewolf',
    map: 'Iron Cage',
    version: 'TPP',
    entryFee: 5,
    perKillReward: 0,
    poolPrize: 9,
    capacity: 2,
    scheduledTime: '06:45 PM',
    date: 'Today',
    status: 'open',
    registeredPlayers: [],
  },
  {
    id: 'match_lw_303',
    matchNumber: 303,
    title: 'Lone Wolf 1v1 Midnight Duel #303',
    mode: 'lonewolf',
    map: 'Iron Cage',
    version: 'TPP',
    entryFee: 5,
    perKillReward: 0,
    poolPrize: 9,
    capacity: 2,
    scheduledTime: '09:00 PM',
    date: 'Today',
    status: 'open',
    registeredPlayers: [],
  },
];

export const defaultUser: UserProfile = {
  id: 'usr_me_777',
  name: 'Jitendra Verma',
  email: 'jitenbcdra12@gmail.com',
  phone: '+91 98765 43210',
  isPhoneVerified: true,
  username: 'jiten_esports',
  ffIgn: 'Viper_Booyah',
  ffUid: '1982736450',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ViperBooyah&backgroundColor=ff5722,0f172a',
  wallet: {
    total: 125,
    deposit: 60,
    winnings: 45,
    bonus: 20,
  },
  stats: {
    matchesPlayed: 18,
    totalKills: 42,
    wins: 6,
    winRate: 33.3,
    totalEarnings: 586,
    rankTier: 'Heroic',
  },
  antiCheatStatus: {
    isClean: true,
    lastScanTime: '10 mins ago',
    trustScore: 99,
    flaggedApps: [],
  },
  role: 'player',
};

export const initialLeaderboard: LeaderboardPlayer[] = [
  {
    rank: 1,
    userId: 'lb_1',
    name: 'Sameer Khan',
    ffIgn: 'RaiStar_God',
    ffUid: '1002938475',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RaiStar&backgroundColor=f59e0b',
    kills: 184,
    matches: 52,
    wins: 28,
    totalEarnings: 2840,
    tier: 'Grandmaster',
    favoriteMode: 'BR Rank',
  },
  {
    rank: 2,
    userId: 'lb_2',
    name: 'Aakash Sharma',
    ffIgn: 'Pahadi_Gamer',
    ffUid: '1088492019',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pahadi&backgroundColor=0284c7',
    kills: 162,
    matches: 48,
    wins: 23,
    totalEarnings: 2350,
    tier: 'Grandmaster',
    favoriteMode: 'BR Rank',
  },
  {
    rank: 3,
    userId: 'lb_3',
    name: 'Rohit Sen',
    ffIgn: 'Killer_CS_OP',
    ffUid: '1077443322',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KillerCS&backgroundColor=dc2626',
    kills: 145,
    matches: 61,
    wins: 34,
    totalEarnings: 1980,
    tier: 'Master',
    favoriteMode: 'CS Rank',
  },
  {
    rank: 4,
    userId: 'lb_4',
    name: 'Vikas Patel',
    ffIgn: 'MafiaHeadshot',
    ffUid: '1066554433',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mafia&backgroundColor=10b981',
    kills: 119,
    matches: 41,
    wins: 17,
    totalEarnings: 1610,
    tier: 'Heroic',
    favoriteMode: 'Lone Wolf',
  },
  {
    rank: 5,
    userId: 'lb_5',
    name: 'Deepak Roy',
    ffIgn: 'ActionBolt_FF',
    ffUid: '1055443322',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ActionBolt&backgroundColor=8b5cf6',
    kills: 98,
    matches: 39,
    wins: 14,
    totalEarnings: 1340,
    tier: 'Heroic',
    favoriteMode: 'BR Rank',
  },
  {
    rank: 6,
    userId: 'usr_me_777',
    name: 'Jitendra Verma',
    ffIgn: 'Viper_Booyah',
    ffUid: '1982736450',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ViperBooyah&backgroundColor=ff5722',
    kills: 42,
    matches: 18,
    wins: 6,
    totalEarnings: 586,
    tier: 'Heroic',
    favoriteMode: 'BR Rank',
  },
];

export const initialTransactions: WalletTransaction[] = [
  {
    id: 'tx_101',
    userId: 'usr_me_777',
    type: 'signup_bonus',
    amount: 20,
    status: 'completed',
    title: 'Sign Up & Phone Verification Bonus',
    description: 'Welcome gift added to Bonus Cash',
    referenceId: 'BONUS_NEW_USER_777',
    timestamp: 'Today, 08:30 AM',
  },
  {
    id: 'tx_102',
    userId: 'usr_me_777',
    type: 'deposit',
    amount: 50,
    status: 'completed',
    title: 'UPI Wallet Top-up',
    description: 'Paid via PhonePe UPI (Ref: 409281726)',
    referenceId: 'DEP_UPI_982741',
    timestamp: 'Today, 09:15 AM',
  },
  {
    id: 'tx_103',
    userId: 'usr_me_777',
    type: 'entry_fee',
    amount: 15,
    status: 'completed',
    title: 'Entry Fee: BR Rank Daily Rush #101',
    description: 'Deducted from Deposit Balance',
    referenceId: 'ENTRY_BR_101',
    timestamp: 'Today, 10:00 AM',
  },
  {
    id: 'tx_104',
    userId: 'usr_me_777',
    type: 'kill_bounty',
    amount: 52, // 4 kills * ₹13 = ₹52
    status: 'completed',
    title: 'Kill Bounty: 4 Kills in BR #101',
    description: '₹13 × 4 kills credited to Winning Balance',
    referenceId: 'KILL_REWARD_101',
    timestamp: 'Today, 10:45 AM',
  },
  {
    id: 'tx_105',
    userId: 'usr_me_777',
    type: 'auto_refund',
    amount: 15,
    status: 'completed',
    title: 'Auto Refund: Match #99 Cancelled',
    description: 'Full 100% refund - 40 players slot not reached on time',
    referenceId: 'REFUND_BR_099',
    timestamp: 'Yesterday, 07:15 PM',
  },
];

export const initialNotifications: PushNotification[] = [
  {
    id: 'notif_1',
    title: 'Auto Refund Guarantee Active',
    body: 'BR Rank matches need 40 players to start. If slots remain unfilled at match time, 100% ₹15 refund is credited immediately!',
    type: 'auto_refund',
    timestamp: '15 mins ago',
    isRead: false,
  },
  {
    id: 'notif_2',
    title: 'Per Kill ₹13 Reward Rate',
    body: 'Earn ₹13 for every kill in 40-Player BR Rank matches! 5 kills = ₹65 straight to Winning Wallet.',
    type: 'match_alert',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: 'notif_3',
    title: 'Anti-Cheat Shield Active',
    body: 'System scanner verifies background overlay apps, emulators, and watermark protection before Room ID access.',
    type: 'security',
    timestamp: '2 hours ago',
    isRead: true,
  },
];
