import type { FC } from 'react';
import {
  LayoutDashboard,
  MailSearch,
  Crosshair,
  ShieldAlert,
  Layers,
  FolderLock,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Terminal,
  FileKey2,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  demoMode: boolean;
  userRole: 'ADMIN' | 'ANALYST';
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  demoMode,
  userRole,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const primaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Email', icon: MailSearch, badge: 'CORE' },
    { id: 'investigations', label: 'Investigations', icon: Crosshair },
    { id: 'intelligence', label: 'Threat Intelligence', icon: ShieldAlert },
    { id: 'campaigns', label: 'Campaigns', icon: Layers },
    { id: 'cases', label: 'Cases', icon: FolderLock },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (userRole === 'ADMIN') {
    primaryNav.push({ id: 'audit', label: 'Audit / Ledger', icon: FileKey2, badge: 'ADMIN' });
  }

  const handleNavClick = (id: string) => {
    onTabChange(id);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col justify-between select-none glass-panel border-r border-slate-800/80 bg-[#070b13]/95 backdrop-blur-xl transition-all duration-300 relative ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className={`p-4 border-b border-slate-800/80 flex items-center justify-between ${collapsed ? 'px-3' : 'px-5'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-wider text-white font-mono">TRACE-X</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-700/50">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
                  Threat Intelligence SOC
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile drawer */}
          <div className="flex md:hidden">
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {!collapsed && (
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Forensic Workstation
            </p>
          )}

          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer relative ${
                    collapsed
                      ? 'justify-center p-3'
                      : 'justify-between px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  {/* Left Cyan Accent Strip */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                  )}

                  <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center' : ''}`}>
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        item.badge === 'ADMIN'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip for Collapsed Mode */}
                {collapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono border border-slate-700 shadow-xl whitespace-nowrap">
                      {item.label}
                      {item.badge && <span className="ml-1.5 text-[9px] text-cyan-400">({item.badge})</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* System Status & Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#06090e]/70 space-y-2">
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> SOC Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">Mode:</span>
              <span className={`text-[10px] font-semibold ${demoMode ? 'text-amber-400' : 'text-cyan-400'}`}>
                {demoMode ? 'DEMO MODE' : 'LIVE INTEL'}
              </span>
            </div>
          </div>
        )}

        {/* Collapse / Expand Toggle Button (desktop only) */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-2 text-xs font-mono text-slate-400"><ChevronLeft className="w-4 h-4" /><span>Collapse Sidebar</span></div>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
