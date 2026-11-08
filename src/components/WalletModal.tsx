import React, { useState } from 'react';
import { X, Wallet, ArrowDownRight, ArrowUpRight, QrCode, CheckCircle2, ShieldCheck, Copy, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { UserProfile, WalletTransaction } from '../types/tournament';
import { sound } from '../utils/audio';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  transactions: WalletTransaction[];
  onAddMoney: (amount: number, method: string) => void;
  onWithdrawMoney: (amount: number, upiId: string) => boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  user,
  transactions,
  onAddMoney,
  onWithdrawMoney,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'withdraw' | 'history'>('add');
  
  // Add money state
  const [addAmount, setAddAmount] = useState<number>(50);
  const [selectedGateway, setSelectedGateway] = useState<'phonepe' | 'gpay' | 'paytm' | 'qr'>('qr');
  const [isProcessingAdd, setIsProcessingAdd] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(35);
  const [upiId, setUpiId] = useState('jiten@oksbi');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // History filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposit' | 'win_prize' | 'auto_refund'>('all');

  if (!isOpen) return null;

  const handleDepositSubmit = () => {
    if (addAmount < 10) {
      alert('Minimum deposit amount is ₹10');
      return;
    }
    sound.playClick();
    setIsProcessingAdd(true);

    setTimeout(() => {
      setIsProcessingAdd(false);
      setAddSuccess(true);
      sound.playCoins();
      onAddMoney(addAmount, selectedGateway.toUpperCase());

      setTimeout(() => {
        setAddSuccess(false);
      }, 2500);
    }, 1200);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setWithdrawMsg(null);

    if (withdrawAmount < 30) {
      setWithdrawMsg({ type: 'error', text: 'Minimum withdrawal amount is ₹30' });
      return;
    }
    if (withdrawAmount > user.wallet.winnings) {
      setWithdrawMsg({
        type: 'error',
        text: `Insufficient Winning Balance. You can withdraw up to ₹${user.wallet.winnings}.`,
      });
      return;
    }
    if (!upiId.includes('@')) {
      setWithdrawMsg({ type: 'error', text: 'Please enter a valid UPI ID (e.g. name@oksbi, phone@paytm)' });
      return;
    }

    setIsProcessingWithdraw(true);
    setTimeout(() => {
      const ok = onWithdrawMoney(withdrawAmount, upiId);
      setIsProcessingWithdraw(false);
      if (ok) {
        sound.playCoins();
        setWithdrawMsg({
          type: 'success',
          text: `₹${withdrawAmount} payout initiated to ${upiId}. Arriving in 2-5 minutes via IMPS.`,
        });
      } else {
        setWithdrawMsg({ type: 'error', text: 'Withdrawal failed. Please check balance.' });
      }
    }, 1200);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'deposit') return tx.type === 'deposit';
    if (historyFilter === 'win_prize') return tx.type === 'win_prize' || tx.type === 'kill_bounty';
    if (historyFilter === 'auto_refund') return tx.type === 'auto_refund';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c101b] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#131929] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading tracking-wide">
                Secure Esports Wallet
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Instant UPI Gateway</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% RBI & Escrow Protected
                </span>
              </div>
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

        {/* Balance Card Section */}
        <div className="p-4 sm:p-6 bg-[#0e1322] border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            
            {/* Total Balance */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">Total Balance</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-white tabular-nums">
                ₹{user.wallet.total}
              </span>
            </div>

            {/* Deposit Cash */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-cyan-400 font-medium block">Deposit Cash</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                ₹{user.wallet.deposit}
              </span>
              <span className="text-[10px] text-slate-500 block">For match entries</span>
            </div>

            {/* Winnings Cash */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-[11px] text-emerald-400 font-semibold block">Winnings</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                ₹{user.wallet.winnings}
              </span>
              <span className="text-[10px] text-emerald-500/80 block">Withdrawable</span>
            </div>

          </div>

          {/* Segmented Tab Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl mt-4">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('add');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'add'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Add Money
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('withdraw');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'withdraw'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw UPI
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('history');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Passbook
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: ADD MONEY */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              
              {/* Preset Amount Chips */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Select Deposit Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[20, 50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAddAmount(amt);
                      }}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                        addAmount === amt
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={addAmount}
                  onChange={(e) => setAddAmount(Number(e.target.value))}
                  placeholder="Enter custom amount"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Instant UPI Gateway
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* UPI QR */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGateway('qr');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedGateway === 'qr'
                        ? 'bg-orange-500/10 border-orange-500 text-orange-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                    <span className="text-xs font-bold block">UPI QR Scan</span>
                  </button>

                  {/* PhonePe */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGateway('phonepe');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedGateway === 'phonepe'
                        ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center mx-auto mb-1">
                      Pe
                    </div>
                    <span className="text-xs font-bold block">PhonePe</span>
                  </button>

                  {/* Google Pay */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGateway('gpay');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedGateway === 'gpay'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center mx-auto mb-1">
                      G
                    </div>
                    <span className="text-xs font-bold block">Google Pay</span>
                  </button>

                  {/* Paytm */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGateway('paytm');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedGateway === 'paytm'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-sky-500 text-white font-bold text-[9px] flex items-center justify-center mx-auto mb-1">
                      Pay
                    </div>
                    <span className="text-xs font-bold block">Paytm UPI</span>
                  </button>

                </div>
              </div>

              {/* Live Dynamic UPI QR Display */}
              {selectedGateway === 'qr' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
                    {/* Bespoke inline high-contrast QR code vector */}
                    <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      {/* Top-left marker */}
                      <rect x="10" y="10" width="28" height="28" fill="#0f172a" rx="2" />
                      <rect x="16" y="16" width="16" height="16" fill="white" />
                      <rect x="20" y="20" width="8" height="8" fill="#f97316" />
                      {/* Top-right marker */}
                      <rect x="62" y="10" width="28" height="28" fill="#0f172a" rx="2" />
                      <rect x="68" y="16" width="16" height="16" fill="white" />
                      <rect x="72" y="20" width="8" height="8" fill="#f97316" />
                      {/* Bottom-left marker */}
                      <rect x="10" y="62" width="28" height="28" fill="#0f172a" rx="2" />
                      <rect x="16" y="68" width="16" height="16" fill="white" />
                      <rect x="20" y="72" width="8" height="8" fill="#f97316" />
                      {/* Data dots */}
                      <rect x="44" y="12" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="16" width="6" height="6" fill="#0f172a" />
                      <rect x="44" y="28" width="6" height="6" fill="#0f172a" />
                      <rect x="12" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="24" y="50" width="6" height="6" fill="#0f172a" />
                      <rect x="44" y="44" width="12" height="12" fill="#0f172a" rx="1" />
                      <rect x="47" y="47" width="6" height="6" fill="#f97316" />
                      <rect x="62" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="74" y="48" width="6" height="6" fill="#0f172a" />
                      <rect x="84" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="44" y="64" width="6" height="6" fill="#0f172a" />
                      <rect x="54" y="72" width="6" height="6" fill="#0f172a" />
                      <rect x="70" y="68" width="8" height="8" fill="#0f172a" />
                      <rect x="82" y="78" width="8" height="8" fill="#0f172a" />
                    </svg>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-xs font-semibold text-slate-200">
                      Scan with any UPI App
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Amount: <span className="font-mono text-orange-400 font-bold">₹{addAmount}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between gap-2">
                      <span>battlezone.esports@axisbank</span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          navigator.clipboard?.writeText('battlezone.esports@axisbank');
                          alert('UPI ID copied to clipboard!');
                        }}
                        className="text-orange-400 hover:text-orange-300"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Deposit Button */}
              <button
                type="button"
                onClick={handleDepositSubmit}
                disabled={isProcessingAdd || addAmount < 10}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isProcessingAdd ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting UPI Gateway...</span>
                  </>
                ) : addSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>₹{addAmount} Added Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{addAmount}</span>
                    <ArrowDownRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          )}

          {/* TAB 2: WITHDRAW MONEY */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block">Available for Withdrawal</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ₹{user.wallet.winnings}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Min Withdrawal: ₹30</span>
                  <span className="block text-emerald-400 font-semibold">TDS Fee: ₹0.00</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  min={30}
                  max={user.wallet.winnings}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  placeholder="Min ₹30"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  UPI VPA / ID (Any Bank / PhonePe / GPay)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@paytm or name@oksbi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Funds will be transferred instantly via IMPS / UPI direct payout.
                </p>
              </div>

              {withdrawMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    withdrawMsg.type === 'success'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-950/40 text-red-300 border border-red-500/30'
                  }`}
                >
                  {withdrawMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{withdrawMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessingWithdraw || user.wallet.winnings < 30}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isProcessingWithdraw ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing UPI Transfer...</span>
                  </>
                ) : (
                  <>
                    <span>Transfer ₹{withdrawAmount} to UPI</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* TAB 3: PASSBOOK / TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              
              {/* Filter controls */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    historyFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({transactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('deposit')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    historyFilter === 'deposit' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Added
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('win_prize')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    historyFilter === 'win_prize' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Winnings
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('auto_refund')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    historyFilter === 'auto_refund' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Refunds
                </button>
              </div>

              {/* Transactions List */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredTransactions.map((tx) => {
                  const isPositive =
                    tx.type === 'deposit' ||
                    tx.type === 'win_prize' ||
                    tx.type === 'kill_bounty' ||
                    tx.type === 'auto_refund' ||
                    tx.type === 'signup_bonus';

                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">
                            {tx.title}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{tx.timestamp}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[10px] text-slate-500">{tx.referenceId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-mono font-bold tabular-nums ${
                            isPositive ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {isPositive ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                        </span>
                        <span className="text-[10px] text-emerald-500 block font-semibold uppercase">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
