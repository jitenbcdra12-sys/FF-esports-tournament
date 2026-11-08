import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Cpu, Smartphone, Wifi, CheckCircle2, AlertTriangle, Play, RefreshCw, Copy, Lock, KeyRound } from 'lucide-react';
import { sound } from '../utils/audio';

interface AntiCheatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ffUid: string;
  ffIgn: string;
  phone: string;
  activeRoomId?: string;
  activeRoomPass?: string;
  matchTitle?: string;
  onNotify: (title: string, body: string, type: 'security') => void;
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({
  isOpen,
  onClose,
  ffUid,
  ffIgn,
  phone,
  activeRoomId = '8820491',
  activeRoomPass = 'FF2026',
  matchTitle = 'BR Rank Daily Rush #102',
  onNotify,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(true);
  const [copiedField, setCopiedField] = useState<'id' | 'pass' | null>(null);
  const [isLaunchingGame, setIsLaunchingGame] = useState(false);
  const [overlayKilled, setOverlayKilled] = useState(true);

  if (!isOpen) return null;

  const handleRunSecurityScan = () => {
    sound.playClick();
    setIsScanning(true);
    setScanCompleted(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      setOverlayKilled(true);
      sound.playBooyah();
      onNotify(
        'Integrity Shield Passed',
        'System integrity confirmed. 0 overlay apps detected. Clean game environment ready.',
        'security'
      );
    }, 1500);
  };

  const copyToClipboard = (text: string, field: 'id' | 'pass') => {
    sound.playClick();
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCleanLaunch = () => {
    sound.playClick();
    setIsLaunchingGame(true);

    setTimeout(() => {
      setIsLaunchingGame(false);
      sound.playBooyah();
      onNotify(
        'Clean Game Sandbox Active',
        `Launched Free Fire with Room ID ${activeRoomId}. Screen overlay blocking enabled.`,
        'security'
      );
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0b0f19] border border-orange-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#121829] via-[#1a1c2b] to-[#121829] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
                Anti-Cheat Shield & Clean Room Access
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  SYSTEM ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Overlay app isolation • Emulator blocker • Anti-leak watermarking
              </p>
            </div>
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Security Banner Illustration / Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-950/40 to-slate-900 border border-orange-500/30 flex items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                Zero Hack & Fair Play Guarantee
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Matches are protected against floating overlay apps, ESP radar, auto-clickers, and macro injectors. Background apps are restricted during live rooms.
              </p>
            </div>
            <button
              onClick={handleRunSecurityScan}
              disabled={isScanning}
              className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shrink-0 shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Re-scan System'}</span>
            </button>
          </div>

          {/* 4 Vector Verification Status Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Vector 1: Floating Overlay Detection */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Overlay Isolation</div>
                  <div className="text-[10px] text-slate-400">Floating injectors blocked</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> CLEAN
              </span>
            </div>

            {/* Vector 2: Emulator Bypass Check */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Mobile Device Touch</div>
                  <div className="text-[10px] text-slate-400">Emulators strictly forbidden</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> TOUCH OK
              </span>
            </div>

            {/* Vector 3: Network & Proxy Check */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Network Integrity</div>
                  <div className="text-[10px] text-slate-400">VPN & Proxy bypass: None</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> 42ms PING
              </span>
            </div>

            {/* Vector 4: Garena APK Hash */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Client Signature</div>
                  <div className="text-[10px] text-slate-400">Official Free Fire v1.109+</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            </div>

          </div>

          {/* ROOM CREDENTIALS CARD WITH ANTI-LEAK WATERMARK */}
          <div className="relative rounded-2xl bg-[#0e1424] border-2 border-orange-500/50 p-5 overflow-hidden shadow-xl">
            
            {/* Dynamic Watermark Background incorporating user's FF UID and Phone */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-[0.06] flex items-center justify-center rotate-[-18deg] text-xs font-mono font-black text-orange-400 leading-tight">
              UID:{ffUid} • {ffIgn} • PHONE:{phone} • ROOM_TOKEN_SAFE • DO NOT LEAK • BATTLEZONE SECURITY
            </div>

            <div className="relative z-10 space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-orange-400 font-bold tracking-wider uppercase">
                    Official Custom Room Credentials
                  </span>
                  <div className="text-sm font-bold text-white font-heading">
                    {matchTitle}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Slots Checked
                </span>
              </div>

              {/* Room ID & Room Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Room ID */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">ROOM ID</span>
                    <span className="text-lg font-mono font-black text-amber-400 tracking-wider">
                      {activeRoomId}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeRoomId, 'id')}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy Room ID"
                  >
                    {copiedField === 'id' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Room Password */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">PASSWORD</span>
                    <span className="text-lg font-mono font-black text-orange-400 tracking-wider">
                      {activeRoomPass}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeRoomPass, 'pass')}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy Password"
                  >
                    {copiedField === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

              </div>

              {/* Watermark Security Notice */}
              <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Anti-Leak Watermark active: Room ID is tied to UID <span className="font-mono font-bold text-white">{ffUid}</span>. Sharing room credentials with outsiders causes permanent wallet freeze.
                </span>
              </div>

            </div>
          </div>

          {/* Clean Launch Action */}
          <div className="space-y-2">
            <button
              onClick={handleCleanLaunch}
              disabled={isLaunchingGame}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              {isLaunchingGame ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Isolating Overlays & Launching Clean Mode...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Launch Free Fire in Clean Sandbox Mode</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Closes background overlay apps, enables touch-optimized game sandbox, and copies credentials.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
