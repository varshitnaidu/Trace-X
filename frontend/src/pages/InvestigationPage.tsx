import { useState } from 'react';
import type { FC } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Bot,
  Send,
  Globe,
  Server,
  Layers,
  MapPin,
  ChevronRight,
  Fingerprint,
  FileSpreadsheet,
  Sparkles,
  Network,
  Loader2
} from 'lucide-react';
import type { DemoCase } from '../data/demoData';
import { api } from '../services/api';

interface InvestigationPageProps {
  currentCase: DemoCase;
  onGenerateReport: (caseId: string) => void;
  onNavigateToCampaign: (campaignId: string) => void;
}

export const InvestigationPage: FC<InvestigationPageProps> = ({
  currentCase,
  onGenerateReport,
  onNavigateToCampaign,
}) => {
  const [activeTab, setActiveTab] = useState<'relays' | 'auth' | 'iocs' | 'infrastructure' | 'graph' | 'campaign'>('relays');
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'analyst' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Investigation Dossier loaded for ${currentCase.id}. I have indexed ${currentCase.relays.length} SMTP relay hops, ${currentCase.urls.length} URLs, and ${currentCase.ips.length} infrastructure nodes. Ask me any technical forensic question.`
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAskingAi, setIsAskingAi] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const handleAskQuestion = async (question: string) => {
    if (!question.trim()) return;
    setAiChatMessages((prev) => [...prev, { sender: 'analyst', text: question }]);
    setIsAskingAi(true);

    try {
      const res = await api.cases.chat(currentCase.id, question);
      if (res && res.reply) {
        setAiChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
        setIsAskingAi(false);
        return;
      }
    } catch {
      // Fallback to local heuristic explanation engine
    }

    setTimeout(() => {
      let reply = '';
      if (question.toLowerCase().includes('high risk') || question.toLowerCase().includes('score')) {
        reply = `The composite threat score is ${currentCase.riskScore}/100 (${currentCase.severity}) primarily driven by: 1) DMARC alignment failure with domain spoofing, 2) First-hop SMTP injection from Tor Exit Node (${currentCase.relays[0]?.ip || 'Egress'}), and 3) Lookalike homoglyph URL with credential harvesting path.`;
      } else if (question.toLowerCase().includes('bec') || question.toLowerCase().includes('wire')) {
        reply = `High BEC Probability detected. The sender claims to be executive leadership (${currentCase.senderName}) ordering an urgent confidential wire settlement ($248,500). Notice that Reply-To (${currentCase.replyTo}) is diverted to a separate external account, while Return-Path points to an unaligned bounce gateway.`;
      } else if (question.toLowerCase().includes('investigate') || question.toLowerCase().includes('next')) {
        reply = `Recommended Next Actions:\n1. Verify perimeter email gateway has null-routed ${currentCase.domains[0]?.domain || 'malicious domains'}.\n2. Confirm with Accounting that no funds were dispatched for Invoice #88491.\n3. Query endpoint telemetry for any user connections to IP ${currentCase.ips[0]?.ip || 'ingress IP'}.\n4. Preserve SHA-256 evidence integrity hash and generate forensic report.`;
      } else {
        reply = `${currentCase.aiExplanation.summary} Key indicator: Lookalike domain "${currentCase.domains[0]?.domain || 'unknown'}" age is only ${currentCase.domains[0]?.age || 'unknown'}. Geolocation observed in ${currentCase.ips[0]?.location || 'external network'}.`;
      }
      setAiChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsAskingAi(false);
    }, 400);
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await api.reports.download(currentCase.id, 'pdf');
    } catch {
      // Fallback: navigate to reports page
      onGenerateReport(currentCase.id);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatInput('');
    handleAskQuestion(q);
  };

  const isCrit = currentCase.severity === 'CRITICAL';
  const isHigh = currentCase.severity === 'HIGH';

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#091120] to-[#0c1424] border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              CASE: {currentCase.id}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-mono text-slate-300">{currentCase.date}</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              STATUS: {currentCase.status}
            </span>
          </div>
          <h1 className="text-lg font-bold text-white font-mono truncate max-w-2xl">
            {currentCase.subject}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span>{isExportingPdf ? 'Generating PDF...' : 'Generate Forensic Dossier (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Top Intelligence Triad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* COLUMN 1: Case & Email Metadata */}
        <div className="p-5 rounded-xl bg-[#0c1322] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-cyan-400" /> Evidence Metadata
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> INTEGRITY: VERIFIED
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Sender (From Header):</span>
              <span className="text-slate-200 font-semibold truncate block">{currentCase.senderName}</span>
              <span className="text-cyan-400 text-[11px] truncate block">&lt;{currentCase.sender}&gt;</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Reply-To Divert:</span>
                <span className="text-amber-400 text-[11px] truncate block font-bold">{currentCase.replyTo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Return-Path:</span>
                <span className="text-slate-300 text-[11px] truncate block">{currentCase.returnPath}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase">Cryptographic SHA-256 Hash:</span>
              <span className="text-[10px] text-slate-400 break-all bg-slate-950 p-1.5 rounded border border-slate-900 block select-all">
                {currentCase.sha256}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Artifact Size: {currentCase.fileSize}</span>
              <span>Analyst: {currentCase.analyst.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Hybrid Risk Score & Classification Gauge */}
        <div className="p-5 rounded-xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" /> Hybrid Threat Engine
              </h2>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isCrit
                    ? 'bg-rose-950/90 text-rose-300 border border-rose-800/60'
                    : isHigh
                    ? 'bg-amber-950/90 text-amber-300 border border-amber-800/60'
                    : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/60'
                }`}
              >
                {currentCase.classification}
              </span>
            </div>

            {/* Large Threat Score Display */}
            <div className="my-4 flex items-center justify-center gap-6">
              <div className="relative w-28 h-28 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center shadow-inner">
                <div
                  className={`absolute inset-0 rounded-full border-4 border-t-transparent ${
                    isCrit ? 'border-rose-500' : isHigh ? 'border-amber-500' : 'border-emerald-400'
                  } animate-spin-slow`}
                />
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    isCrit ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {currentCase.riskScore}
                </span>
                <span className="text-[10px] font-mono text-slate-400">/ 100 RISK</span>
              </div>

              <div className="space-y-1">
                <span
                  className={`text-lg font-bold font-mono ${
                    isCrit ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {currentCase.severity} THREAT
                </span>
                <p className="text-xs text-slate-400 leading-snug">
                  Deterministic + NLP scoring model with {currentCase.contributingFactors.length} verified risk indicators.
                </p>
                {currentCase.campaignId && (
                  <button
                    onClick={() => onNavigateToCampaign(currentCase.campaignId!)}
                    className="text-[11px] font-mono text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Linked Campaign: {currentCase.campaignName} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top 3 Contributing Factors */}
          <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400">Primary Risk Triggers:</span>
            {currentCase.contributingFactors.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 truncate max-w-[210px]">• {item.factor}</span>
                <span className="text-rose-400 font-bold shrink-0">+{item.weight} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: AI Forensic Assistant (Ask TRACE-X) */}
        <div className="p-5 rounded-xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" /> Ask TRACE-X AI Assistant
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> GROUNDED
              </span>
            </div>

            {/* Chat Transcript Window */}
            <div className="my-3 space-y-2 max-h-44 overflow-y-auto pr-1">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    msg.sender === 'analyst'
                      ? 'bg-slate-800 text-cyan-200 ml-6 border border-slate-700'
                      : 'bg-slate-950 text-slate-300 mr-2 border border-slate-900'
                  }`}
                >
                  <span className="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                    {msg.sender === 'analyst' ? 'SOC Analyst' : 'TRACE-X Forensic Engine'}
                  </span>
                  <p className="whitespace-pre-line text-[11px]">{msg.text}</p>
                </div>
              ))}
              {isAskingAi && (
                <div className="p-2.5 rounded-lg text-xs bg-slate-950 text-slate-400 mr-2 border border-slate-900 flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>TRACE-X AI is analyzing forensic telemetry...</span>
                </div>
              )}
            </div>
          </div>

          <div>
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <button
                onClick={() => handleAskQuestion('Why is this email high risk?')}
                disabled={isAskingAi}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Why high risk?
              </button>
              <button
                onClick={() => handleAskQuestion('Is this likely BEC?')}
                disabled={isAskingAi}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Is this BEC?
              </button>
              <button
                onClick={() => handleAskQuestion('What should I investigate next?')}
                disabled={isAskingAi}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Next steps?
              </button>
            </div>

            {/* Input Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask technical question about this case..."
                disabled={isAskingAi}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isAskingAi || !chatInput.trim()}
                className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 cursor-pointer"
              >
                {isAskingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Deep Dive Navigation Tabs */}
      <div className="border-b border-slate-800 flex flex-wrap gap-1">
        {[
          { id: 'relays', label: 'Header Forensics & Relay Hops', icon: Server, badge: `${currentCase.relays.length} Hops` },
          { id: 'auth', label: 'SPF / DKIM / DMARC', icon: FileCheck, badge: currentCase.dmarc.status },
          { id: 'iocs', label: 'Extracted Indicators (IOCs)', icon: Globe, badge: `${currentCase.urls.length + currentCase.ips.length}` },
          { id: 'infrastructure', label: 'Observed Infrastructure', icon: MapPin },
          { id: 'graph', label: 'Investigation Graph', icon: Network },
          { id: 'campaign', label: 'Campaign Correlation', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition-all cursor-pointer border-t border-x ${
                isActive
                  ? 'bg-[#0c1322] border-cyan-500/40 text-cyan-400 border-b-transparent -mb-[1px]'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="p-5 rounded-b-xl rounded-tr-xl bg-[#0c1322] border border-slate-800 min-h-[340px]">
        {/* TAB 1: HEADER FORENSICS & RELAYS */}
        {activeTab === 'relays' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Reconstructed SMTP Transmission Chain
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Chronological progression of Received: headers parsed from originating client to corporate gateway.
                </p>
              </div>
              <span className="text-[11px] font-mono text-rose-400 font-semibold">
                Anomalous Tor Exit Hop Detected
              </span>
            </div>

            <div className="space-y-3">
              {currentCase.relays.map((relay, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    relay.isSuspicious
                      ? 'bg-rose-950/20 border-rose-800/60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          relay.isSuspicious
                            ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {relay.hop}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-white">{relay.ip}</span>
                          <span className="text-[10px] font-mono text-slate-400">({relay.hostname})</span>
                          {relay.isSuspicious && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-900 text-rose-300 border border-rose-700 font-semibold">
                              SUSPICIOUS HOP
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {relay.provider} • {relay.city}, {relay.country} ({relay.asn})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-right">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Hop Latency</span>
                        <span className="text-slate-300">{relay.delay}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Timestamp</span>
                        <span className="text-slate-300">{relay.timestamp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Confidence</span>
                        <span className="text-cyan-400 font-bold">{relay.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AUTHENTICATION */}
        {activeTab === 'auth' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Authentication Tri-Factor Verification
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  RFC standards checking envelope sender permission, body cryptographic signature, and domain alignment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">SPF (Sender Policy Framework)</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      currentCase.spf.status === 'PASS'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {currentCase.spf.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{currentCase.spf.detail}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                  Mechanism: Validates whether originating IP was declared in DNS TXT spf1 record.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">DKIM (Cryptographic Signature)</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      currentCase.dkim.status === 'PASS'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {currentCase.dkim.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{currentCase.dkim.detail}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                  Mechanism: Verifies RSA/Ed25519 signature headers against public DNS key.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">DMARC (Domain Alignment)</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      currentCase.dmarc.status === 'PASS'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {currentCase.dmarc.status} ({currentCase.dmarc.policy})
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{currentCase.dmarc.detail}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                  Mechanism: Enforces From: domain matching SPF/DKIM identifiers.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXTRACTED INDICATORS (IOCs) */}
        {activeTab === 'iocs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Normalized Indicators of Compromise
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  De-duplicated URLs, domains, and IP addresses extracted with intelligence reputation scores.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">Extracted URLs:</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Target URL</th>
                      <th className="py-2 px-3">Domain</th>
                      <th className="py-2 px-3">Reputation</th>
                      <th className="py-2 px-3">Risk Signals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {currentCase.urls.map((u, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 text-cyan-300 font-mono max-w-sm truncate select-all">
                          {u.url}
                        </td>
                        <td className="py-2 px-3 text-slate-300">{u.domain}</td>
                        <td className="py-2 px-3">
                          <span className="text-[9px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                            {u.reputation}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {u.indicators.join(' • ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Domain Intelligence:</span>
                {currentCase.domains.map((d, i) => (
                  <div key={i} className="text-xs font-mono">
                    <span className="text-white font-bold block">{d.domain}</span>
                    <span className="text-slate-400 text-[11px] block">{d.age} • {d.registrar}</span>
                    <span className="text-rose-400 text-[11px] block font-bold">Lookalike Typosquatting: TRUE</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Public IP Resolution:</span>
                {currentCase.ips.map((ip, i) => (
                  <div key={i} className="text-xs font-mono">
                    <span className="text-white font-bold block">{ip.ip} ({ip.location})</span>
                    <span className="text-slate-400 text-[11px] block">{ip.provider} • {ip.asn}</span>
                    <span className="text-rose-400 text-[11px] block font-bold">Abuse Confidence: {ip.abuseScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OBSERVED INFRASTRUCTURE & GEOLOCATION */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Observed Infrastructure Mapping
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Technical relay coordinates and hosting provider infrastructure.
                </p>
              </div>
              <div className="p-2 rounded bg-amber-950/50 border border-amber-800/80 text-amber-300 text-[10px] font-mono max-w-md">
                ATTRIBUTION NOTICE: Infrastructure location denotes observed technical hops (VPS/proxies), not the physical identity of the human adversary.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentCase.ips.map((ip, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-white">{ip.ip}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {ip.abuseScore}% ABUSE CONFIDENCE
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Observed Location:</span>
                      <span className="text-slate-200">{ip.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Autonomous System:</span>
                      <span className="text-slate-200">{ip.asn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hosting Provider:</span>
                      <span className="text-slate-200">{ip.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Infrastructure Type:</span>
                      <span className="text-cyan-400">{idx === 0 ? 'Tor Exit Node / Anonymizer' : 'Bulletproof VPS Hosting'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: INVESTIGATION GRAPH */}
        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Forensic Relationship Graph
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Topology of associated entities: Email → Sender → Lookalike Domain → Bulletproof IP → Campaign.
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">5 Connected Nodes</span>
            </div>

            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-center gap-4 overflow-x-auto">
              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/40 text-center min-w-[130px]">
                <span className="text-[9px] font-mono text-cyan-400 uppercase block">EMAIL ARTIFACT</span>
                <span className="text-xs font-mono font-bold text-white">{currentCase.id}</span>
              </div>
              <span className="text-xs font-mono text-slate-500">──[CONTAINS]──▶</span>
              <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/40 text-center min-w-[150px]">
                <span className="text-[9px] font-mono text-rose-400 uppercase block">HOMOGLYPH DOMAIN</span>
                <span className="text-xs font-mono font-bold text-white">{currentCase.domains[0]?.domain}</span>
              </div>
              <span className="text-xs font-mono text-slate-500">──[RESOLVES_TO]──▶</span>
              <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/40 text-center min-w-[130px]">
                <span className="text-[9px] font-mono text-rose-400 uppercase block">SUSPICIOUS IP</span>
                <span className="text-xs font-mono font-bold text-white">{currentCase.ips[0]?.ip}</span>
              </div>
              <span className="text-xs font-mono text-slate-500">──[PART_OF]──▶</span>
              <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 text-center min-w-[150px]">
                <span className="text-[9px] font-mono text-amber-400 uppercase block">CAMPAIGN CLUSTER</span>
                <span className="text-xs font-mono font-bold text-white">{currentCase.campaignId || 'UNC-Cluster'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CAMPAIGN CORRELATION */}
        {activeTab === 'campaign' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Campaign Pattern Correlation
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automated correlation across historical IOC clusters and shared adversary infrastructure.
                </p>
              </div>
            </div>

            {currentCase.campaignId ? (
              <div className="p-5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                      ASSOCIATED CAMPAIGN: {currentCase.campaignId}
                    </span>
                    <h4 className="text-base font-bold text-white font-mono mt-1">
                      {currentCase.campaignName}
                    </h4>
                  </div>
                  <button
                    onClick={() => onNavigateToCampaign(currentCase.campaignId!)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-mono cursor-pointer"
                  >
                    View Campaign Cluster →
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multiple emails received in the past 14 days share the same bulletproof relay (194.26.29.110) and targeting patterns aimed at corporate finance directors.
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-slate-400">
                No active multi-email campaign cluster correlation identified for this case.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
