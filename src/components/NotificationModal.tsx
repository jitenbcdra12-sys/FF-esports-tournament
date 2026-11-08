import React from 'react';
import { X, Bell, ShieldCheck, Wallet, Crosshair, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PushNotification } from '../types/tournament';
import { sound } from '../utils/audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'wallet_credit':
      case 'wallet_debit':
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'auto_refund':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'room_pass':
        return <CheckCircle2 className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c101c] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Push Notification Center
              </h2>
              <span className="text-[11px] text-slate-400">
                {notifications.filter((n) => !n.isRead).length} unread updates
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onMarkAllAsRead();
              }}
              className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Mark Read
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border transition-all ${
                  notif.isRead
                    ? 'bg-slate-950/60 border-slate-800/60 opacity-80'
                    : 'bg-slate-900 border-orange-500/30 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
