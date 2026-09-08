import type { FC } from 'react';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Mail,
  UserCheck,
  Globe,
  Layers,
  ExternalLink,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DEMO_CASES, type DemoCase } from '../data/demoData';

interface DashboardPageProps {
  onSelectCase: (caseItem: DemoCase) => void;
  onNavigateToAnalyze: () => void;
  cases?: DemoCase[];
}

const trendData = [
  { day: 'Mon', phishing: 12, bec: 4, malware: 2 },
  { day: 'Tue', phishing: 19, bec: 7, malware: 5 },
  { day: 'Wed', phishing: 15, bec: 3, malware: 3 },
  { day: 'Thu', phishing: 28, bec: 11, malware: 8 },
  { day: 'Fri', phishing: 22, bec: 9, malware: 4 },
  { day: 'Sat', phishing: 14, bec: 2, malware: 1 },
  { day: 'Sun', phishing: 18, bec: 6, malware: 3 },
];

const classificationData = [
  { name: 'Phishing', value: 62, color: '#f59e0b' },
  { name: 'BEC / Wire Fraud', value: 31, color: '#ef4444' },
  { name: 'Impersonation', value: 22, color: '#06b6d4' },
  { name: 'Malware Disguise', value: 16, color: '#a855f7' },
  { name: 'Benign / Clean', value: 11, color: '#10b981' },
];

export const DashboardPage: FC<DashboardPageProps> = ({
  onSelectCase,
  onNavigateToAnalyze,
  cases = DEMO_CASES,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-[#0d1527] via-[#091120] to-[#0d1527] border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              SOC OPERATIONS OVERVIEW
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TELEMETRY SYNCHRONIZED
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide font-mono">
            TRACE-X Security Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time email forensic triage, correlation engine, and automated threat attribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToAnalyze}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Analyze New Email</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Triage</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">142</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">+14% past 24h</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-rose-900/30">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Critical Threats</span>
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-2">28</div>
          <div className="text-[10px] text-rose-400 font-mono mt-1">Requires SOC action</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-amber-900/30">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>High Threats</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-2">44</div>
          <div className="text-[10px] text-amber-400 font-mono mt-1">Pending review</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>BEC Fraud</span>
            <UserCheck className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-300 font-mono mt-2">31</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Executive spoofing</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Malicious URLs</span>
            <Globe className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-2">89</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Blocked at gateway</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1424] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Campaigns</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono mt-2">5</div>
          <div className="text-[10px] text-cyan-400 font-mono mt-1">Correlated clusters</div>
        </div>
      </div>

      {/* SOC Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Threat Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0d1424] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> 7-Day Ingestion & Threat Trends
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated classifications across corporate email gateway</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Phishing
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> BEC
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="phishingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="becGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area type="monotone" dataKey="phishing" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#phishingGrad)" />
                <Area type="monotone" dataKey="bec" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#becGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Classification Donut */}
        <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> Threat Classifications
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Detection categorization breakdown</p>
          </div>
          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800">
            {classificationData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-slate-200 font-bold ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Investigations Table */}
      <div className="p-5 rounded-xl bg-[#0d1424] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Recent Forensic Investigations
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any case to inspect header forensics, authentication, relay hops, and AI attribution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Filter Status:</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              All Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d16] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Analyst</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {cases.map((item) => {
                const isCrit = item.severity === 'CRITICAL';
                const isHigh = item.severity === 'HIGH';

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCase(item)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200 max-w-xs truncate font-medium">
                      {item.subject}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          item.classification === 'BEC'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                            : item.classification === 'PHISHING'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                        }`}
                      >
                        {item.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              isCrit ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${item.riskScore}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold ${
                            isCrit ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.riskScore}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-semibold">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.analyst.split(' ')[0]}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 group-hover:text-cyan-300">
                        Inspect <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
