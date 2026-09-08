import { useState } from 'react';
import type { FC, ChangeEvent, DragEvent } from 'react';
import {
  UploadCloud,
  FileCode,
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { DEMO_RAW_EML, type DemoCase } from '../data/demoData';
import { api } from '../services/api';

interface AnalyzeEmailPageProps {
  demoMode?: boolean;
  onAnalysisComplete: (caseData: DemoCase) => void;
}

type StepKey =
  | 'parse'
  | 'headers'
  | 'auth'
  | 'iocs'
  | 'intel'
  | 'ml'
  | 'risk'
  | 'graph';

interface ProgressStep {
  id: StepKey;
  label: string;
  detail: string;
}

const ANALYSIS_STEPS: ProgressStep[] = [
  { id: 'parse', label: 'Parsing Email MIME', detail: 'Decoding RFC 5322 headers, multipart boundary, text/plain & HTML' },
  { id: 'headers', label: 'Extracting Headers', detail: 'Mapping Return-Path, Reply-To, Message-ID & hop delays' },
  { id: 'auth', label: 'Checking Authentication', detail: 'Verifying SPF envelope, DKIM cryptographic signature, and DMARC alignment' },
  { id: 'iocs', label: 'Extracting Indicators', detail: 'Sanitizing URLs, de-obfuscating homoglyphic domains, resolving public IPs' },
  { id: 'intel', label: 'Querying Intelligence', detail: 'Scanning VirusTotal, AbuseIPDB, PhishTank & RDAP reputation feeds' },
  { id: 'ml', label: 'Running AI Threat Detection', detail: 'Evaluating linguistic urgency, executive spoofing, and NLP phishing probabilities' },
  { id: 'risk', label: 'Calculating Hybrid Risk', detail: 'Aggregating weighted heuristic factors into explainable 0-100 score' },
  { id: 'graph', label: 'Building Investigation', detail: 'Generating correlation nodes, campaign links, and tamper-evident SHA-256 hash' },
];

export const AnalyzeEmailPage: FC<AnalyzeEmailPageProps> = ({ demoMode = true, onAnalysisComplete }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedContent, setPastedContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.eml') || file.type === 'message/rfc822' || file.name.endsWith('.txt')) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage('Please upload a valid .eml or email message file.');
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleLoadPreset = (type: 'bec' | 'phishing' | 'benign') => {
    if (type === 'bec') {
      setPastedContent(DEMO_RAW_EML);
      setActiveTab('paste');
    } else if (type === 'phishing') {
      setPastedContent(`From: "Microsoft Security Team" <no-reply@security-microsoft-update365.com>
To: "Analyst" <analyst@company.org>
Subject: Action Required: Microsoft 365 Password Expiry Warning
Date: Sun, 06 Sep 2026 18:09:44 +0000
Authentication-Results: spf=softfail; dkim=none; dmarc=fail

Your password expires in 2 hours. Keep current credentials active:
https://security-microsoft-update365.com/login.aspx?auth=token991`);
      setActiveTab('paste');
    } else {
      setPastedContent(`From: "Internal Communications" <internal-comms@company.org>
To: "All Employees" <staff@company.org>
Subject: Monthly All-Hands Meeting Agenda & Slide Deck
Date: Sat, 05 Sep 2026 09:14:55 +0000
Authentication-Results: spf=pass; dkim=pass; dmarc=pass

Here are the slides for tomorrow:
https://intranet.company.org/all-hands/2026-09`);
      setActiveTab('paste');
    }
    setErrorMessage(null);
  };

  const runAnalysis = async () => {
    if (activeTab === 'upload' && !selectedFile) {
      setErrorMessage('Please select or drag an .eml email file to proceed.');
      return;
    }
    if (activeTab === 'paste' && !pastedContent.trim()) {
      setErrorMessage('Please paste raw email headers or MIME content into the box.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setCurrentStepIndex(0);

    // Progress animation while backend analysis runs
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 2 ? prev + 1 : prev));
    }, 280);

    try {
      let resultCase: DemoCase;
      if (activeTab === 'upload' && selectedFile) {
        resultCase = await api.analysis.analyzeFile(selectedFile, !demoMode);
      } else {
        resultCase = await api.analysis.analyzeRaw(pastedContent, !demoMode);
      }

      clearInterval(timer);
      setCurrentStepIndex(ANALYSIS_STEPS.length - 1);
      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(resultCase);
      }, 400);
    } catch (err: any) {
      clearInterval(timer);
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Analysis processing failed. Ensure backend is running.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#0d1527] via-[#091120] to-[#0d1527] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              FORENSIC INGESTION
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-mono text-slate-300">RFC 5322 & MIME Parser</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide font-mono">
            Analyze Suspicious Email Artifact
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit an untrusted email for multi-engine forensics, relay path reconstruction, and threat scoring.
          </p>
        </div>

        {/* Demo Fast-Load Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">Demo Presets:</span>
          <button
            onClick={() => handleLoadPreset('bec')}
            className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-800/60 text-[10px] font-mono font-semibold transition-all cursor-pointer"
          >
            Synthetic BEC
          </button>
          <button
            onClick={() => handleLoadPreset('phishing')}
            className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-800/60 text-[10px] font-mono font-semibold transition-all cursor-pointer"
          >
            M365 Phishing
          </button>
          <button
            onClick={() => handleLoadPreset('benign')}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono font-semibold transition-all cursor-pointer"
          >
            Clean Benign
          </button>
        </div>
      </div>

      {/* Input Selection Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Method 1: Upload .eml File</span>
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'paste'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Method 2: Paste Raw Headers & Body</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Input Workarea */}
      {!isAnalyzing && (
        <div className="space-y-4">
          {activeTab === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-10 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-950/10'
                  : 'border-slate-800 hover:border-slate-700 bg-[#0c1322]'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
                {selectedFile ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-white font-mono">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for cryptographic hashing
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-3 text-[11px] font-mono text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Remove & Select another
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag and drop email artifact (.eml, .msg) here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Or click below to browse filesystem for captured suspicious emails
                  </p>
                  <label className="mt-4 inline-block px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 cursor-pointer transition-all">
                    Browse Artifacts
                    <input
                      type="file"
                      accept=".eml,.txt,message/rfc822"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Paste raw RFC 5322 MIME or Received headers:</span>
                <span className="text-[10px] text-slate-500">Includes Received:, From:, Subject:, Body</span>
              </div>
              <textarea
                rows={12}
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder="From: ceo@paypal-billing.com&#10;To: target@corp.com&#10;Subject: Urgent wire transfer...&#10;Received: from mail-relay.ru..."
                className="w-full bg-[#0c1322] border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 resize-y leading-relaxed"
              />
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Safe Sandbox Execution: Attachments & scripts are isolated without execution.</span>
            </div>
            <button
              onClick={runAnalysis}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START FORENSIC ANALYSIS</span>
            </button>
          </div>
        </div>
      )}

      {/* Multi-Stage Forensic Progress Telemetry */}
      {isAnalyzing && (
        <div className="p-6 rounded-xl bg-[#0c1322] border border-cyan-500/40 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  TRACE-X Forensic Pipeline in Progress
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Executing deterministic header verification, IOC extraction & NLP threat models...
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Stage {currentStepIndex + 1} of {ANALYSIS_STEPS.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ANALYSIS_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isPast
                      ? 'bg-slate-900/60 border-emerald-500/40 text-slate-300'
                      : isCurrent
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/20 border-slate-800/60 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500 shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      <span className="text-xs font-mono font-semibold">{step.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isPast ? 'COMPLETED' : isCurrent ? 'RUNNING' : 'QUEUED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-tight">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
