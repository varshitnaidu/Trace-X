import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  KeyRound,
  Sliders,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Server,
  Database,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { api, type PlatformSettingsResponse } from '../services/api';

export const SettingsPage: FC = () => {
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [maskPii, setMaskPii] = useState<boolean>(true);
  const [platformConfig, setPlatformConfig] = useState<PlatformSettingsResponse | null>(null);

  const [weights, setWeights] = useState({
    headers: 20,
    auth: 15,
    urls: 15,
    domains: 10,
    ips: 10,
    ml: 15,
    bec: 5,
    impersonation: 5,
    attachments: 5,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const config = await api.settings.get();
        setPlatformConfig(config);
        if (config.weights) {
          setWeights((prev) => ({
            ...prev,
            ...config.weights,
          }));
        }
      } catch {
        // Fallback to local default configuration
      }
    };
    fetchSettings();
  }, []);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await api.settings.updateWeights(weights);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update platform settings');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const providersList = [
    {
      id: 'virustotal',
      name: 'VirusTotal v3 API',
      status: platformConfig?.providers?.virustotal || 'Configured (backend)',
      icon: Globe,
      desc: 'Multi-engine URL & file hash malware reputation',
    },
    {
      id: 'abuseipdb',
      name: 'AbuseIPDB API v2',
      status: platformConfig?.providers?.abuseipdb || 'Configured (backend)',
      icon: Server,
      desc: 'Crowdsourced IP abuse confidence scoring & reports',
    },
    {
      id: 'phishtank',
      name: 'PhishTank Database',
      status: platformConfig?.providers?.phishtank || 'Configured (backend)',
      icon: Database,
      desc: 'Known credential harvesting URL signatures',
    },
    {
      id: 'urlhaus',
      name: 'URLhaus Abuse.ch',
      status: platformConfig?.providers?.urlhaus || 'Active (Public Community)',
      icon: ShieldAlert,
      desc: 'Malware distribution site feeds with zero API quota limit',
    },
    {
      id: 'rdap',
      name: 'RDAP / ICANN Lookups',
      status: platformConfig?.providers?.rdap || 'Active (Public ICANN/IANA)',
      icon: Globe,
      desc: 'Authoritative registrar, ASN, and domain creation age queries',
    },
    {
      id: 'llm',
      name: 'Gemini / LLM Explainer',
      status: platformConfig?.providers?.llm || 'Configured (backend)',
      icon: Bot,
      desc: 'Natural language forensic reasoning and analyst copilot',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#091120] to-[#0c1424] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              SOC PLATFORM CONFIGURATION
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-mono text-slate-300">
              {platformConfig?.environment ? `Env: ${platformConfig.environment.toUpperCase()}` : 'Scoring & Privacy Policy'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide font-mono">
            TRACE-X Platform Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage threat feeds, configure deterministic risk weightings, and enforce PII data protection.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>System configuration updated and validated against local security policy.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Threat Intelligence API Integrations */}
      <div className="p-5 rounded-xl bg-[#0c1322] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" /> Threat Intelligence Integrations & Backend Credentials
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            SECURE SERVER-SIDE
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Per zero-trust architecture standards, third-party API credentials are securely managed in backend environment variables (<code className="text-cyan-400 font-mono">.env</code>) and are never exposed to or stored in client-side code.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {providersList.map((p) => {
            const Icon = p.icon;
            const isConfigured = !p.status.toLowerCase().includes('not configured');
            return (
              <div key={p.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{p.desc}</p>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-semibold px-1.5 py-0.5 rounded ${
                    isConfigured
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Hybrid Risk Engine Weighting Model */}
      <div className="p-5 rounded-xl bg-[#0c1322] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Hybrid Threat Scoring Weights
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust the deterministic contribution of individual forensic analyzers (Total: {totalWeight}/100)
            </p>
          </div>
          <span className={`text-xs font-mono font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalWeight === 100 ? 'NORMALIZED (100%)' : `SUM = ${totalWeight}% (Must equal 100%)`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Header Anomalies:</span>
              <span className="text-cyan-400 font-bold">{weights.headers} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={weights.headers}
              onChange={(e) => setWeights({ ...weights, headers: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Auth Failures (SPF/DMARC):</span>
              <span className="text-cyan-400 font-bold">{weights.auth} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.auth}
              onChange={(e) => setWeights({ ...weights, auth: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">URL Intelligence:</span>
              <span className="text-cyan-400 font-bold">{weights.urls} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.urls}
              onChange={(e) => setWeights({ ...weights, urls: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Domain Intelligence:</span>
              <span className="text-cyan-400 font-bold">{weights.domains} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={weights.domains}
              onChange={(e) => setWeights({ ...weights, domains: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">IP Reputation:</span>
              <span className="text-cyan-400 font-bold">{weights.ips} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={weights.ips}
              onChange={(e) => setWeights({ ...weights, ips: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">NLP / ML Phishing Model:</span>
              <span className="text-cyan-400 font-bold">{weights.ml} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.ml}
              onChange={(e) => setWeights({ ...weights, ml: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Privacy & PII Masking */}
      <div className="p-5 rounded-xl bg-[#0c1322] border border-slate-800 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-cyan-400" /> Privacy, Masking & Sensitive Data Protection
        </h2>
        <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              Mask Recipient & Internal Email Addresses
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Displays sensitive email addresses as sanitized tokens (e.g., <code className="text-cyan-400">j***@company.org</code>).
            </span>
          </div>
          <button
            onClick={() => setMaskPii(!maskPii)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold border transition-all cursor-pointer ${
              maskPii
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {maskPii ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>
    </div>
  );
};
