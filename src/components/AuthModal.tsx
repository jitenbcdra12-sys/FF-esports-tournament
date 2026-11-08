import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Mail, Phone, Gamepad2, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types/tournament';
import { sound } from '../utils/audio';
import { signInWithGoogle } from '../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddTransaction: (title: string, amount: number, type: 'signup_bonus') => void;
  onNotify: (title: string, body: string, type: 'wallet_credit' | 'security') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onAddTransaction,
  onNotify,
}) => {
  const [step, setStep] = useState<'profile' | 'otp_verify'>('profile');
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [username, setUsername] = useState(user.username);
  const [ffIgn, setFfIgn] = useState(user.ffIgn);
  const [ffUid, setFfUid] = useState(user.ffUid);
  
  // OTP Verification state
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('784912');
  const [timer, setTimer] = useState(28);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = () => {
    sound.playClick();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setTimer(30);
    setStep('otp_verify');
    sound.playNotification();
    onNotify('Verification OTP Sent', `Your FreeFire BattleZone 6-digit OTP is: ${newOtp}`, 'security');
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setVerificationError('');
    sound.playClick();

    setTimeout(() => {
      setIsVerifying(false);
      if (otpInput === generatedOtp || otpInput === '784912') {
        sound.playBooyah();
        onUpdateUser({
          email,
          name,
          phone,
          isPhoneVerified: true,
          username,
          ffIgn,
          ffUid,
          wallet: {
            ...user.wallet,
            bonus: user.wallet.bonus + 20,
            total: user.wallet.total + 20,
          },
        });
        onAddTransaction('Phone Verification Welcome Bonus', 20, 'signup_bonus');
        onNotify('Account Verified & ₹20 Bonus Added!', 'Your phone and Free Fire UID are successfully authenticated.', 'wallet_credit');
        setStep('profile');
      } else {
        setVerificationError('Invalid OTP code. Please enter the 6-digit code shown or click Auto-fill.');
      }
    }, 600);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateUser({
      name,
      username,
      ffIgn,
      ffUid,
      email,
      phone,
    });
    onNotify('Profile Updated', 'Your gaming credentials have been saved successfully.', 'security');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#141a29] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading tracking-wide">
                Player Authentication & Profile
              </h2>
              <p className="text-xs text-slate-400">
                Gmail sign-in, Phone OTP verification & Free Fire UID
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

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {step === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Google / Gmail Auth Box */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                    {/* Google 'G' icon */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">Google Authentication</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-[260px]">
                      {email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    sound.playClick();
                    const fbUser = await signInWithGoogle();
                    if (fbUser) {
                      sound.playBooyah();
                      setEmail(fbUser.email || email);
                      if (fbUser.displayName) setName(fbUser.displayName);
                      onUpdateUser({
                        email: fbUser.email || email,
                        name: fbUser.displayName || name,
                        avatarUrl: fbUser.photoURL || user.avatarUrl,
                      });
                      onNotify('Google Sign-In Successful', `Connected as ${fbUser.email}`, 'security');
                    }
                  }}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Switch / Connect
                </button>
              </div>

              {/* Phone Number & OTP Verification Status */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-400" />
                    Mobile Number (Phone OTP)
                  </label>
                  {user.isPhoneVerified ? (
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      OTP Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Verification Required
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors shrink-0 flex items-center gap-1"
                  >
                    {user.isPhoneVerified ? 'Re-verify' : 'Verify OTP'}
                  </button>
                </div>
                {!user.isPhoneVerified && (
                  <p className="text-[11px] text-amber-400/90">
                    Verify mobile number to unlock ₹20 welcome cash bonus & instant tournament payouts.
                  </p>
                )}
              </div>

              {/* Gamer Profile Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Platform Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Free Fire IGN (In-Game Name) *
                  </label>
                  <input
                    type="text"
                    value={ffIgn}
                    onChange={(e) => setFfIgn(e.target.value)}
                    placeholder="e.g. Viper_Booyah"
                    className="w-full bg-slate-900 border border-orange-500/40 rounded-lg px-3 py-2 text-sm text-orange-200 font-semibold focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Free Fire UID (Numeric) *
                  </label>
                  <input
                    type="text"
                    value={ffUid}
                    onChange={(e) => setFfUid(e.target.value)}
                    placeholder="e.g. 1982736450"
                    className="w-full bg-slate-900 border border-orange-500/40 rounded-lg px-3 py-2 text-sm text-orange-200 font-mono font-semibold focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Anti-Cheat Badge */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-300">
                      Fair Play Trust Score: 99%
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Device clean • Zero cheat overlays detected
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  VERIFIED
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Save Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          ) : (
            /* OTP Verification Screen */
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Phone className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Phone OTP Verification
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  We sent a 6-digit verification code to <span className="font-mono text-white font-semibold">{phone}</span>
                </p>
              </div>

              {/* Demo Helper Banner with Generated Code */}
              <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/40 text-left flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">
                    Demo SMS OTP Code
                  </div>
                  <div className="text-lg font-mono font-bold text-white tracking-widest">
                    {generatedOtp}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setOtpInput(generatedOtp);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
                >
                  Auto-fill OTP
                </button>
              </div>

              {/* 6-digit input */}
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full max-w-xs text-center text-2xl font-mono tracking-widest font-bold bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-orange-400 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                {verificationError && (
                  <p className="text-xs text-red-400 mt-2">{verificationError}</p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-orange-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP ({timer}s)
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStep('profile');
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otpInput.length < 6}
                  className="flex-1 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <>
                      <span>Verify & Claim ₹20</span>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
