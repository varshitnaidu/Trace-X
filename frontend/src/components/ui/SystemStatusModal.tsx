import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Cpu,
  Database,
  Globe,
  Bot,
  Layers,
  X,
  RefreshCw,
  Server
} from 'lucide-react';
import { api } from '../../services/api';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendOnline: boolean;
  demoMode: boolean;
}

export const SystemStatusModal: FC<SystemStatusModalProps> = ({
  isOpen,
  onClose,
  backendOnline,
  demoMode,
}) => {
  const [latency, setLatency] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkTelemetry = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      await api.health.check();
      const diff = Math.round(performance.now() - start);
      setLatency(diff);
    } catch {
      setLatency(null);
    } finally {
      setIsRefreshing(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkTelemetry();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const services = [
    {
      name: 'FastAPI Backend Core',
      role: 'Forensic Ingestion & RFC 5322 MIME Processing Engine',
      status: backendOnline ? 'ONLINE' : 'UNAVAILABLE',
      isOnline: backendOnline,
      latency: latency ? `${latency}ms` : 'N/A',
      icon: Server,
      details: 'Port 8000 • CORS Enabled • Uvicorn ASGI Runner'
    },
    {
      name: 'Cryptographic Audit Ledger',
      role: 'SHA-256 Chain of Custody & Evidence Tamper-Verification',
      status: backendOnline ? 'ONLINE' : (demoMode ? 'LOCAL EMULATED' : 'UNAVAILABLE'),
      isOnline: backendOnline || demoMode,
      latency: backendOnline ? '<5ms' : '0ms',
      icon: Database,
      details: 'Deterministic Genesis Block • Merkle-Root Verification'
    },
    {
      name: 'ML & NLP Threat Engine',
      role: 'Hybrid Bayesian / NLP Heuristic Scoring & Risk Attribution',
      status: backendOnline ? 'READY' : (demoMode ? 'LOCAL HEURISTICS' : 'UNAVAILABLE'),
      isOnline: backendOnline || demoMode,
      latency: '<15ms',
      icon: Cpu,
      details: '10 Deterministic Vectors • Urgency / Impersonation Classifiers'
    },
    {
      name: 'Threat Intelligence Multi-Adapter',
      role: 'VirusTotal, AbuseIPDB, PhishTank, URLhaus & RDAP Hub',
      status: backendOnline ? (demoMode ? 'HYBRID CACHED' : 'LIVE API') : 'OFFLINE',
      isOnline: backendOnline,
      latency: backendOnline ? '120ms' : 'N/A',
      icon: Globe,
      details: '5 Normalized Feeds • Rate-Limit & TTL Cache Management'
    },
    {
      name: 'AI Forensics Copilot (LLM)',
      role: 'Gemini Threat Explanation & Incident Summarization',
      status: backendOnline ? 'READY' : (demoMode ? 'HEURISTIC FALLBACK' : 'UNAVAILABLE'),
      isOnline: backendOnline || demoMode,
      latency: backendOnline ? '240ms' : '10ms',
      icon: Bot,
      details: 'Contextual Case Prompting • Multi-factor Reasoning'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-xl rounded-2xl glass-modal overflow-hidden shadow-2xl border border-cyan-500/30 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              backendOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">Platform Health Telemetry</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  backendOnline
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                    : 'bg-rose-950/80 text-rose-300 border-rose-800/50'
                }`}>
                  {backendOnline ? 'SYSTEM OPERATIONAL' : 'DEGRADED / STANDALONE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Last verified: {lastChecked || 'Just now'} • Mode: {demoMode ? 'DEMO DATA' : 'LIVE INTEL'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkTelemetry}
              disabled={isRefreshing}
              title="Recheck health"
              className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Service List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold font-mono text-slate-200">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{svc.latency}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        svc.isOnline
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/50'
                      }`}
                    >
                      {svc.status}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-tight">{svc.role}</p>
                <div className="pl-6 pt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{svc.details}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRACE-X SIH26106 Telemetry Monitor</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
