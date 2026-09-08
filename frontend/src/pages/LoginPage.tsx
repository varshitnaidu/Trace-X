import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  ShieldCheck,
  User,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Radio,
  Lock,
  Cpu,
  Fingerprint,
  Layers,
  Network
} from 'lucide-react';
import { api, type AuthUser } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('sarah.jenkins@trace-x.soc');
  const [password, setPassword] = useState<string>('analyst123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [loginSuccessAnim, setLoginSuccessAnim] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      const isOnline = await api.health.check();
      if (mounted) setBackendOnline(isOnline);
    };
    probe();
    const timer = setInterval(probe, 5000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.auth.login(username, password);
      setLoginSuccessAnim(true);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'ADMIN' | 'ANALYST') => {
    setErrorMessage(null);
    setLoading(true);
    const email = role === 'ADMIN' ? 'admin@trace-x.soc' : 'sarah.jenkins@trace-x.soc';
    const pwd = role === 'ADMIN' ? 'admin123' : 'analyst123';
    setUsername(email);
    setPassword(pwd);

    try {
      const res = await api.auth.login(email, pwd);
      setLoginSuccessAnim(true);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch {
      // Offline fallback for hackathon demonstration
      setLoginSuccessAnim(true);
      setTimeout(() => {
        onLoginSuccess({
          email,
          name: role === 'ADMIN' ? 'SOC Administrator (CISO)' : 'Sarah Jenkins (Senior SOC Lead)',
          role,
        });
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#070a12] p-4 sm:p-6 lg:p-12 relative overflow-hidden font-sans">
      {/* Subtle Ambient Background Lighting & Cyber Grid */}
      <div className="absolute inset-0 ambient-cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div
        className={`w-full max-w-5xl rounded-3xl glass-panel border border-slate-800/80 shadow-2xl relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-500 ${
          loginSuccessAnim ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* ========================================================= */}
        {/* LEFT COLUMN: Brand & Capabilities Presentation */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/70 bg-gradient-to-br from-slate-950/80 via-[#0a101d]/60 to-[#070b14]/90 relative">
          {/* Faint Background Network Graph Visualization */}
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cyberLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <line x1="10%" y1="20%" x2="45%" y2="40%" stroke="url(#cyberLineGrad)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45%" y1="40%" x2="80%" y2="25%" stroke="url(#cyberLineGrad)" strokeWidth="1" />
              <line x1="45%" y1="40%" x2="50%" y2="75%" stroke="url(#cyberLineGrad)" strokeWidth="1" />
              <line x1="50%" y1="75%" x2="85%" y2="80%" stroke="url(#cyberLineGrad)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="15%" y1="70%" x2="50%" y2="75%" stroke="url(#cyberLineGrad)" strokeWidth="1" />

              <circle cx="10%" cy="20%" r="3" fill="#06b6d4" className="animate-ping" />
              <circle cx="45%" cy="40%" r="4" fill="#06b6d4" />
              <circle cx="80%" cy="25%" r="3" fill="#3b82f6" />
              <circle cx="50%" cy="75%" r="4" fill="#06b6d4" />
              <circle cx="85%" cy="80%" r="3" fill="#f43f5e" />
              <circle cx="15%" cy="70%" r="3" fill="#10b981" />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            {/* Logo & Product Heading */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono tracking-wider text-white">TRACE-X</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/60 font-semibold">
                      SIH26106
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-cyan-400 font-medium tracking-wide">
                    Threat Intelligence & Digital Forensics
                  </p>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                AI-Powered Email Threat Intelligence & Digital Forensics
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed font-sans">
                Investigate suspicious email activity, correlate infrastructure, and transform technical
                indicators into actionable forensic intelligence.
              </p>
            </div>

            {/* 3 Core Capability Cards */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200">Threat Detection</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Multi-vector heuristics, RFC 5322 MIME parsing, and Bayesian NLP classifier.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200">Digital Forensics</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    SMTP relay hop timelines, cryptographic SPF/DKIM/DMARC checks & SHA-256 evidence ledger.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200">Threat Intelligence</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Automated VirusTotal, AbuseIPDB, URLhaus & PhishTank enrichment with campaign clustering.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Telemetry Pill in Bottom-Left */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/70">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 flex items-center gap-2">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                System Health:
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300">
                  Frontend <span className="text-emerald-400 font-bold">ONLINE</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1 text-slate-300">
                  Backend{' '}
                  <span className={`font-bold ${backendOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {backendOnline ? 'ONLINE' : 'CONNECTING...'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Authentication Console Form */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#080d19]/90 relative">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase tracking-wider">
                  Analyst Access Gate
                </span>
                <span className="text-xs text-slate-500 font-mono">SOC CONSOLE v1.0</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2 font-mono">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your forensic operator credentials or choose a quick-access role.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 font-medium">
                  Analyst Email / Operator Identity
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="analyst@trace-x.soc"
                    className="w-full cyber-input rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 font-medium">
                  Access Key / Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full cyber-input rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
                  />
                  <span>Remember session</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('Please contact your SOC security administrator or use Quick-Auth below.');
                  }}
                  className="text-cyan-400 hover:underline hover:text-cyan-300"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl cyber-btn-primary font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : 'AUTHENTICATE TO SOC CONSOLE'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Quick Login Options */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Quick-Access Demo Profiles:</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Network className="w-3 h-3 text-cyan-400" />
                Zero-Config Available
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('ANALYST')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                    SOC Analyst
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  sarah.jenkins@trace-x.soc
                </span>
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                  Triage, forensic graph, IOCs
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 group-hover:text-amber-300">
                    SOC Administrator
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  admin@trace-x.soc
                </span>
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                  Full config, weights, audit ledger
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
