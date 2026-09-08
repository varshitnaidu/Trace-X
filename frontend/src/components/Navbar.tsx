import type { FC } from 'react';
import {
  Search,
  Bell,
  Cpu,
  Database,
  LogOut,
  Menu
} from 'lucide-react';

interface NavbarProps {
  demoMode: boolean;
  onToggleDemoMode: () => void;
  backendOnline: boolean;
  user: { name: string; role: 'ADMIN' | 'ANALYST'; email: string };
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenStatusModal: () => void;
  onOpenNotifications: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  demoMode,
  onToggleDemoMode,
  backendOnline,
  user,
  onLogout,
  onOpenSearch,
  onOpenStatusModal,
  onOpenNotifications,
  onToggleMobileMenu,
}) => {
  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl bg-[#070b13]/85">
      {/* Left: Mobile Menu Toggle & Global Search Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar (opens Command Palette) */}
        <div className="relative w-full cursor-pointer" onClick={onOpenSearch}>
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search Case ID, IP, Domain, Hash, URL or Action..."
            className="w-full bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl pl-10 pr-16 py-2 text-xs text-slate-300 placeholder-slate-500 font-mono cursor-pointer transition-all shadow-inner"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Telemetry, and Profile */}
      <div className="flex items-center gap-2 sm:gap-3 ml-3">
        {/* System Health Pill (opens SystemStatusModal) */}
        <button
          onClick={onOpenStatusModal}
          title="Click to view full subsystem health"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backendOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                backendOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <Cpu className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <span className="text-slate-300 hidden md:inline text-[11px]">SYSTEM:</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              backendOnline
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
            }`}
          >
            {backendOnline ? 'OPERATIONAL' : 'DEGRADED'}
          </span>
        </button>

        {/* Demo vs Live Mode Switch */}
        <button
          onClick={onToggleDemoMode}
          title="Toggle between Synthetic Demonstration Data and Live API Feeds"
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
            demoMode
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold">
            {demoMode ? 'DEMO MODE' : 'LIVE INTEL'}
          </span>
        </button>

        {/* Notification Center Trigger */}
        <button
          onClick={onOpenNotifications}
          title="SOC Alert Center"
          className="relative p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        {/* Analyst Profile Header */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono shadow-inner">
            {user.role === 'ADMIN' ? 'AD' : 'SA'}
          </div>

          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>{user.name.split(' ')[0]}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{user.email}</p>
          </div>

          <button
            onClick={onLogout}
            title="Sign out of SOC Console"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
