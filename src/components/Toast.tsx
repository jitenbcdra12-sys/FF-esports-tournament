import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Bell, Wallet, ShieldCheck } from 'lucide-react';
import { PushNotification } from '../types/tournament';

interface ToastProps {
  notification: PushNotification | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'wallet_credit':
        return <Wallet className="w-5 h-5 text-emerald-400" />;
      case 'auto_refund':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      default:
        return <Bell className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-2xl bg-[#0e1424] border border-orange-500/50 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white tracking-wide">
            {notification.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-snug">
            {notification.body}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-white p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
