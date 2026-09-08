import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import {
  Search,
  Crosshair,
  MailSearch,
  LayoutDashboard,
  Layers,
  FolderLock,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import type { DemoCase } from '../../data/demoData';
import { SeverityBadge } from './SeverityBadge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  cases: DemoCase[];
  onSelectCase: (c: DemoCase) => void;
  onNavigate: (tabId: string) => void;
}

export const CommandPalette: FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  cases,
  onSelectCase,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (isOpen) handleClose();
        else {
          // Open handled by parent or local trigger
        }
      } else if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Filter matching cases
  const matchingCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(trimmed) ||
      c.subject.toLowerCase().includes(trimmed) ||
      c.sender.toLowerCase().includes(trimmed) ||
      c.classification.toLowerCase().includes(trimmed) ||
      c.ips?.some((ip) => ip.ip.toLowerCase().includes(trimmed)) ||
      c.domains?.some((d) => d.domain.toLowerCase().includes(trimmed))
  );

  // Quick Action navigation items
  const actions = [
    { id: 'analyze', label: 'Analyze New Email Artifact', icon: MailSearch, category: 'Forensic Actions' },
    { id: 'dashboard', label: 'Security Operations Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'investigations', label: 'Active Investigation Dossier', icon: Crosshair, category: 'Navigation' },
    { id: 'intelligence', label: 'Threat Intelligence & IOC Lookup', icon: ShieldAlert, category: 'Navigation' },
    { id: 'campaigns', label: 'Correlated Adversary Campaigns', icon: Layers, category: 'Navigation' },
    { id: 'cases', label: 'Incident Case Management', icon: FolderLock, category: 'Navigation' },
    { id: 'reports', label: 'Forensic PDF & IOC Report Center', icon: FileSpreadsheet, category: 'Navigation' },
    { id: 'settings', label: 'Platform Engine Settings & Scoring Weights', icon: Settings, category: 'Configuration' },
  ].filter((a) => a.label.toLowerCase().includes(trimmed) || a.id.toLowerCase().includes(trimmed));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-md transition-all">
      <div
        className="w-full max-w-2xl rounded-2xl glass-modal overflow-hidden shadow-2xl border border-cyan-500/30 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-slate-900/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Case ID, IP, domain, subject, hash or action (Ctrl+K)..."
            className="flex-1 bg-transparent border-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 text-xs font-mono cursor-pointer"
            >
              Clear
            </button>
          )}
          <kbd
            onClick={onClose}
            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer hover:text-slate-200"
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh]">
          {/* Matching Cases */}
          {matchingCases.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Investigations & Cases ({matchingCases.length})</span>
                <span className="text-cyan-400">Click to Inspect</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchingCases.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-900/40 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 text-left transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 shrink-0">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                          <span className="text-[11px] text-slate-500 font-mono">• {c.date}</span>
                        </div>
                        <p className="text-xs text-slate-200 truncate font-sans">{c.subject}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{c.sender}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={c.severity} score={c.riskScore} size="sm" />
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions / Navigation */}
          {actions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Quick Navigation & Workflows
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        onNavigate(act.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-lg bg-slate-900/40 hover:bg-cyan-950/30 border border-slate-800/60 hover:border-cyan-500/30 text-left transition-all flex items-center gap-3 group cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-200 block truncate font-sans">
                          {act.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{act.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchingCases.length === 0 && actions.length === 0 && (
            <div className="text-center py-10">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-mono">No indicators or actions matched "{query}"</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Try searching for a Case ID (e.g. CAS-2026), IP address, or command.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Ctrl+K</kbd></span>
            <span>Close: <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">ESC</kbd></span>
          </div>
          <span className="text-cyan-400">TRACE-X SOC INDEXER</span>
        </div>
      </div>
    </div>
  );
};
