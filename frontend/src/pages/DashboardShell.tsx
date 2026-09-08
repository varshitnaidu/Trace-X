import type { FC } from 'react';
import {
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Server,
  Layers,
  ArrowRight,
  Activity,
  Globe,
  FileCode2,
  Lock,
  Workflow
} from 'lucide-react';
import type { HealthResponse } from '../types';

interface DashboardShellProps {
  healthData: HealthResponse | null;
  backendOnline: boolean;
  onNavigateToAnalyze: () => void;
}

export const DashboardShell: FC<DashboardShellProps> = ({
  healthData,
  backendOnline,
  onNavigateToAnalyze,
}) => {
  const modules = [
    { title: 'Email MIME Parser', desc: 'RFC 5322 extraction, multipart, headers & body', status: 'Phase 1 Ready', icon: FileCode2, phase: 'Phase 1' },
    { title: 'Header Forensics', desc: 'Received chain, hop timeline & routing anomalies', status: 'Pending Phase 2', icon: Activity, phase: 'Phase 2' },
    { title: 'Auth Inspector', desc: 'SPF, DKIM, DMARC alignment & validation', status: 'Pending Phase 2', icon: ShieldCheck, phase: 'Phase 2' },
    { title: 'IOC Extraction', desc: 'Sanitized URLs, lookalike domains & public IP resolution', status: 'Pending Phase 2', icon: Globe, phase: 'Phase 2' },
    { title: 'Threat Intelligence', desc: 'VirusTotal, AbuseIPDB, PhishTank & RDAP abstraction', status: 'Pending Phase 2', icon: Server, phase: 'Phase 2' },
    { title: 'Hybrid Risk Engine', desc: 'Deterministic heuristics + NLP ML threat scoring', status: 'Pending Phase 2', icon: Cpu, phase: 'Phase 2' },
    { title: 'Evidence & Integrity', desc: 'SHA-256 hash preservation & tamper-evident logs', status: 'Pending Phase 2', icon: Lock, phase: 'Phase 2' },
    { title: 'Forensic PDF Reports', desc: 'Automated SOC investigation dossier generation', status: 'Pending Phase 2', icon: Workflow, phase: 'Phase 2' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-[#0c1629] to-slate-900 p-6 shadow-xl shadow-cyan-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SIH26106 • PHASE 1 INITIALIZATION
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                FOUNDATION ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              TRACE-X Cybersecurity Intelligence Platform
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              AI-Powered Email Threat Intelligence & Digital Forensics. Transforms raw, suspicious email
              artifacts into actionable SOC investigations, reconstructed relay paths, and tamper-evident reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToAnalyze}
              className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>Analyze Email Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Backend & Environment Live Telemetry Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#0c1322] border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">FastAPI Health</span>
            <Cpu className={`w-4 h-4 ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {backendOnline ? '200 OK' : 'OFFLINE'}
            </span>
            <span className={`text-xs font-mono ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {backendOnline ? 'API Connected' : 'Waiting for startup'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">
            Target: {healthData ? `${healthData.app} ${healthData.version}` : 'http://127.0.0.1:8000/api/v1/health'}
          </p>
        </div>

        <div className="rounded-xl bg-[#0c1322] border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Environment</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {healthData?.environment.toUpperCase() || 'DEVELOPMENT'}
            </span>
            <span className="text-xs font-mono text-cyan-400">
              {healthData?.demo_mode ? 'Demo Enabled' : 'Live Intel'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Mode: Offline-ready synthetic failover supported
          </p>
        </div>

        <div className="rounded-xl bg-[#0c1322] border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Phase Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">Phase 1</span>
            <span className="text-xs text-slate-400">of 24 Phases</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Architecture, FastAPI router & React SOC shell
          </p>
        </div>
      </div>

      {/* Architecture Component Modules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Architecture Modules & Readiness
          </h2>
          <span className="text-xs text-slate-400 font-mono">TRACE-X Core Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#0b1220] border border-slate-800/90 p-4 hover:border-cyan-500/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                    {mod.phase}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400">{mod.status}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Health Services JSON Telemetry */}
      {healthData && (
        <div className="rounded-xl bg-[#080d18] border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Live Backend Telemetry Response (GET /api/v1/health)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(healthData.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-[11px] font-mono text-cyan-300 overflow-x-auto">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
