import { useState } from 'react';
import type { FC } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Flame,
  FileSpreadsheet,
  Layers,
  ChevronRight
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetTab?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'critical',
    title: 'Critical Threat Ingested: CAS-2026-0091',
    description: 'Urgent Wire Transfer spoofing CFO detected with DMARC failure and Tor exit relay injection.',
    timestamp: '12m ago',
    read: false,
    targetTab: 'investigations',
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Adversary Campaign Correlation Identified',
    description: 'Shared lookalike domain pattern linked 3 new email artifacts to FIN7-Phish Cluster.',
    timestamp: '45m ago',
    read: false,
    targetTab: 'campaigns',
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'Forensic PDF Dossier Generated',
    description: 'Case CAS-2026-0089 report successfully exported with verified SHA-256 hash.',
    timestamp: '2h ago',
    read: true,
    targetTab: 'reports',
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'Threat Intel Feed Refreshed',
    description: 'AbuseIPDB and VirusTotal local cache synchronized with 1,842 updated indicators.',
    timestamp: '5h ago',
    read: true,
    targetTab: 'intelligence',
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
}

export const NotificationCenter: FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.targetTab) {
      onNavigate(item.targetTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl glass-modal overflow-hidden shadow-2xl border border-cyan-500/30 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">SOC Alert Center</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500 text-slate-950 font-bold">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Real-time incident & intelligence stream</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="text-[10px]">Read All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-3 space-y-2 max-h-[65vh]">
          {notifications.map((n) => {
            let Icon = AlertTriangle;
            let iconCol = 'text-amber-400 bg-amber-950/40 border-amber-800/50';
            if (n.type === 'critical') {
              Icon = Flame;
              iconCol = 'text-rose-400 bg-rose-950/50 border-rose-800/60';
            } else if (n.type === 'success') {
              Icon = FileSpreadsheet;
              iconCol = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
            } else if (n.type === 'info') {
              Icon = Layers;
              iconCol = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50';
            }

            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group ${
                  n.read
                    ? 'bg-slate-900/30 border-slate-800/60 opacity-75 hover:opacity-100 hover:bg-slate-800/40'
                    : 'bg-slate-900/70 border-cyan-500/30 hover:border-cyan-500/50 shadow-sm'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconCol}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-mono font-bold truncate ${n.read ? 'text-slate-300' : 'text-cyan-300'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">{n.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 self-center" />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 text-center">
          <span className="text-[10px] font-mono text-slate-500">
            Automated SOC notification pipeline active
          </span>
        </div>
      </div>
    </div>
  );
};
