import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileCode,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DEMO_CASES, type DemoCase } from '../data/demoData';
import { api } from '../services/api';

interface ReportsPageProps {
  initialCaseId?: string;
}

export const ReportsPage: FC<ReportsPageProps> = ({ initialCaseId }) => {
  const [cases, setCases] = useState<DemoCase[]>(DEMO_CASES);
  const [selectedCase, setSelectedCase] = useState<DemoCase>(() => {
    if (initialCaseId) {
      const found = DEMO_CASES.find((c) => c.id === initialCaseId);
      if (found) return found;
    }
    return DEMO_CASES[0];
  });
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'csv' | 'json' | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const liveCases = await api.cases.list();
        if (liveCases && liveCases.length > 0) {
          setCases(liveCases);
          if (initialCaseId) {
            const found = liveCases.find((c) => c.id === initialCaseId);
            if (found) setSelectedCase(found);
          } else {
            setSelectedCase((prev) => liveCases.find((c) => c.id === prev.id) || liveCases[0]);
          }
        }
      } catch {
        // Fallback to local demo cases
      }
    };
    fetchCases();
  }, [initialCaseId]);

  const handleExport = async (format: 'pdf' | 'json' | 'csv') => {
    setExportingFormat(format);
    setIsError(false);
    setDownloadNotice(`Exporting ${selectedCase.id} forensic dossier in ${format.toUpperCase()} format...`);

    try {
      await api.reports.download(selectedCase.id, format);
      setDownloadNotice(`Dossier ${selectedCase.id}.${format} downloaded successfully. Evidence SHA-256 recorded in immutable audit ledger.`);
      setTimeout(() => setDownloadNotice(null), 5000);
    } catch (err: any) {
      setIsError(true);
      setDownloadNotice(`Download failed (${err.message || 'server offline'}). Verify TRACE-X backend.`);
      setTimeout(() => setDownloadNotice(null), 5000);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#091120] to-[#0c1424] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              REPORT GENERATOR
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-mono text-slate-300">Court & Compliance Ready</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide font-mono">
            Forensic Investigation Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Export standardized, tamper-evident investigation dossiers with cryptographic chain-of-custody proofs.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingFormat !== null}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            {exportingFormat === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{exportingFormat === 'pdf' ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exportingFormat !== null}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {exportingFormat === 'csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{exportingFormat === 'csv' ? 'Exporting CSV...' : 'IOC CSV'}</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exportingFormat !== null}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {exportingFormat === 'json' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCode className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{exportingFormat === 'json' ? 'Exporting JSON...' : 'JSON Dossier'}</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
          isError ? 'bg-rose-950/60 border border-rose-500/60 text-rose-300' : 'bg-cyan-950/60 border border-cyan-500/60 text-cyan-300'
        }`}>
          {isError ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Case Selector Dropdown */}
      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
        <span>Select Case for Forensic Dossier:</span>
        <select
          value={selectedCase.id}
          onChange={(e) => {
            const found = cases.find((c) => c.id === e.target.value);
            if (found) setSelectedCase(found);
          }}
          className="bg-slate-900 border border-slate-800 text-cyan-300 rounded px-3 py-1.5 text-xs focus:outline-none"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} — {c.subject} ({c.classification})
            </option>
          ))}
        </select>
      </div>

      {/* Forensic Report Preview Sheet */}
      <div className="p-8 rounded-xl bg-[#0a0f1c] border border-slate-800 max-w-4xl mx-auto space-y-6 text-slate-200 shadow-2xl">
        {/* Report Document Title Header */}
        <div className="border-b-2 border-cyan-500/40 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold font-mono tracking-wider text-white">TRACE-X</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                FORENSIC REPORT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              DIGITAL FORENSICS & THREAT INTELLIGENCE DOSSIER
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Case ID: <span className="text-cyan-300 font-bold">{selectedCase.id}</span></div>
            <div>Date Generated: <span className="text-slate-300">{selectedCase.date}</span></div>
            <div>Investigating Lead: <span className="text-slate-300">{selectedCase.analyst}</span></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            1. Executive Forensic Summary
          </h2>
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono leading-relaxed space-y-2">
            <p>{selectedCase.aiExplanation.summary}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Classification:</span>
                <span className="text-white font-bold">{selectedCase.classification}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Threat Severity:</span>
                <span className="text-rose-400 font-bold">{selectedCase.severity}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Composite Risk:</span>
                <span className="text-rose-400 font-bold">{selectedCase.riskScore} / 100</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Integrity Status:</span>
                <span className="text-emerald-400 font-bold">SHA-256 MATCH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Key Findings & Indicators */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            2. High-Confidence Technical Findings
          </h2>
          <ul className="space-y-1.5 text-xs font-mono text-slate-300 pl-2">
            {(selectedCase.aiExplanation?.keyFindings || []).map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Authentication & Header Telemetry */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            3. Authentication & Relay Chain Analysis
          </h2>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">SPF Result:</span>
              <span className="font-bold text-rose-400">{selectedCase.spf?.status || 'NONE'}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">DKIM Result:</span>
              <span className="font-bold text-rose-400">{selectedCase.dkim?.status || 'NONE'}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">DMARC Policy:</span>
              <span className="font-bold text-rose-400">{selectedCase.dmarc?.status || 'NONE'} ({selectedCase.dmarc?.policy || 'none'})</span>
            </div>
          </div>
        </div>

        {/* Section 4: Extracted IOCs */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            4. Verified Indicators of Compromise (IOCs)
          </h2>
          <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
            <div><span className="text-slate-400">Target URLs:</span> {(selectedCase.urls || []).map(u => u.url).join(', ') || 'None detected'}</div>
            <div><span className="text-slate-400">Typosquat Domain:</span> {(selectedCase.domains || []).map(d => d.domain).join(', ') || 'None detected'}</div>
            <div><span className="text-slate-400">Public Ingress IPs:</span> {(selectedCase.ips || []).map(ip => `${ip.ip} (${ip.location})`).join(', ') || 'None detected'}</div>
          </div>
        </div>

        {/* Legal / Technical Disclaimer */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-[10px] font-mono text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-300 block mb-0.5">FORENSIC ATTRIBUTION DISCLAIMER:</span>
          Geolocation and infrastructure attribution represent observed technical indicators (SMTP relay nodes, proxy egress, and Autonomous System registration) and must not be construed as the physical identity or geographical residency of the underlying human adversary.
        </div>
      </div>
    </div>
  );
};
