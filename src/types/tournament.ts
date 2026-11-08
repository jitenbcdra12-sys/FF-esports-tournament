export type GameMode = 'br' | 'cs' | 'lonewolf';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  isPhoneVerified: boolean;
  username: string;
  ffIgn: string; // Free Fire In-Game Name
  ffUid: string; // Free Fire UID
  avatarUrl: string;
  wallet: {
    total: number;
    deposit: number;
    winnings: number;
    bonus: number;
  };
  stats: {
    matchesPlayed: number;
    totalKills: number;
    wins: number;
    winRate: number;
    totalEarnings: number;
    rankTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Heroic' | 'Grandmaster';
  };
  antiCheatStatus: {
    isClean: boolean;
    lastScanTime: string;
    trustScore: number; // 0 - 100
    flaggedApps: string[];
  };
  role: 'player' | 'admin';
}

export interface PlayerSlot {
  slotNumber: number;
  userId: string;
  ffIgn: string;
  ffUid: string;
  joinedAt: string;
  team?: 'Alpha' | 'Bravo'; // For CS 4v4
  kills?: number;
  wonPrize?: number;
}

export interface Match {
  id: string;
  matchNumber: number;
  title: string;
  mode: GameMode;
  map: 'Bermuda' | 'Purgatory' | 'Kalahari' | 'NexTerra' | 'Iron Cage';
  version: 'TPP' | 'FPP';
  entryFee: number;
  perKillReward: number; // ₹13 for BR
  poolPrize: number; // ₹35 for CS, ₹9 for Lone Wolf
  capacity: number; // 40 for BR, 8 for CS (4v4), 2 for Lone Wolf (1v1)
  scheduledTime: string; // e.g. "07:30 AM", "08:00 AM", etc.
  date: string;
  status: 'upcoming' | 'open' | 'room_ready' | 'live' | 'completed' | 'cancelled_refunded';
  roomId?: string;
  roomPassword?: string;
  roomPublishedAt?: string;
  registeredPlayers: PlayerSlot[];
  winnerInfo?: {
    winnerName?: string;
    winnerUid?: string;
    winningTeam?: 'Alpha' | 'Bravo';
    totalKillsRecorded?: number;
    summary?: string;
  };
  isRefunded?: boolean;
  refundReason?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'entry_fee' | 'kill_bounty' | 'win_prize' | 'auto_refund' | 'signup_bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  title: string;
  description: string;
  referenceId: string;
  timestamp: string;
}

export interface LeaderboardPlayer {
  rank: number;
  userId: string;
  name: string;
  ffIgn: string;
  ffUid: string;
  avatar: string;
  kills: number;
  matches: number;
  wins: number;
  totalEarnings: number;
  tier: 'Grandmaster' | 'Master' | 'Heroic' | 'Diamond';
  favoriteMode: 'BR Rank' | 'CS Rank' | 'Lone Wolf';
}

export interface PushNotification {
  id: string;
  userId?: string; // empty means broadcast to all
  title: string;
  body: string;
  type: 'match_alert' | 'wallet_credit' | 'wallet_debit' | 'auto_refund' | 'room_pass' | 'security';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
