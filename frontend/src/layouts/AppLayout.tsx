import { useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { CommandPalette } from '../components/ui/CommandPalette';
import { SystemStatusModal } from '../components/ui/SystemStatusModal';
import { NotificationCenter } from '../components/ui/NotificationCenter';
import type { DemoCase } from '../data/demoData';

interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  backendOnline: boolean;
  user: { name: string; role: 'ADMIN' | 'ANALYST'; email: string };
  onLogout: () => void;
  cases: DemoCase[];
  onSelectCase: (caseItem: DemoCase) => void;
}

export const AppLayout: FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  demoMode,
  onToggleDemoMode,
  backendOnline,
  user,
  onLogout,
  cases,
  onSelectCase,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tracex_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('tracex_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a12] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Persistent / Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        demoMode={demoMode}
        userRole={user.role}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar
          demoMode={demoMode}
          onToggleDemoMode={onToggleDemoMode}
          backendOnline={backendOnline}
          user={user}
          onLogout={onLogout}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenStatusModal={() => setStatusModalOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onToggleMobileMenu={() => setMobileOpen(true)}
        />

        {/* Ambient Subtle Cyber Lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070b14]/90 relative z-10 ambient-cyber-grid">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        cases={cases}
        onSelectCase={onSelectCase}
        onNavigate={onTabChange}
      />

      {/* Subsystem Telemetry Status Modal */}
      <SystemStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        backendOnline={backendOnline}
        demoMode={demoMode}
      />

      {/* SOC Notification Center Drawer */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={onTabChange}
      />
    </div>
  );
};
