import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { DEMO_CASES, type DemoCase } from '../data/demoData';
import { api } from '../services/api';

interface CasesPageProps {
  onSelectCase: (caseItem: DemoCase) => void;
  cases?: DemoCase[];
}

export const CasesPage: FC<CasesPageProps> = ({ onSelectCase, cases }) => {
  const [caseList, setCaseList] = useState<DemoCase[]>(cases || DEMO_CASES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    if (cases && cases.length > 0) {
      setCaseList(cases);
      return;
    }
    const fetchCases = async () => {
      try {
        const liveCases = await api.cases.list();
        if (liveCases && liveCases.length > 0) {
          setCaseList(liveCases);
        }
      } catch {
        // Fallback to local demo cases
      }
    };
    fetchCases();
  }, [cases]);

  const filteredCases = caseList.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#091120] to-[#0c1424] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              CASE MANAGEMENT
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-mono text-slate-300">{filteredCases.length} Active Dossiers</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide font-mono">
            Incident Investigation Cases
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track, assign, and manage enterprise security incidents from initial triage to mitigation.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID, Subject, or Sender email address..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl bg-[#0c1322] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Date Reported</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Analyst</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-bold text-cyan-400 whitespace-nowrap">
                    {c.id}
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{c.date}</td>
                  <td className="py-3 px-4 font-sans text-slate-200 max-w-xs truncate font-medium">
                    {c.subject}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-semibold">
                      {c.classification}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        c.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : c.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-200">
                    {c.riskScore}/100
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {c.analyst}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 group-hover:text-cyan-300">
                      Open <ExternalLink className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
