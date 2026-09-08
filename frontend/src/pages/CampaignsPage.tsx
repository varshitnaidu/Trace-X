import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Globe,
  Server,
  ArrowRight,
  Target
} from 'lucide-react';
import { DEMO_CAMPAIGNS } from '../data/demoData';
import { api, type CampaignItem } from '../services/api';

interface CampaignsPageProps {
  onSelectCampaign: (campaignId: string) => void;
}

export const CampaignsPage: FC<CampaignsPageProps> = ({ onSelectCampaign }) => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(DEMO_CAMPAIGNS);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const liveCampaigns = await api.campaigns.list();
        if (liveCampaigns && liveCampaigns.length > 0) {
          setCampaigns(liveCampaigns);
        }
      } catch {
        // Fallback to local demo campaigns
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#091120] to-[#0c1424] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              CLUSTER ATTRIBUTION
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-mono text-slate-300">{campaigns.length} Correlated Adversary Campaigns</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide font-mono">
            Correlated Threat Campaigns
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify shared infrastructure, recurring homoglyph patterns, and multi-recipient attacks.
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-xl bg-[#0c1322] border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-400">{c.id}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs font-mono text-slate-400">Cluster: {c.threatActorGroup}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    {c.severity}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white font-mono">{c.name}</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400 block text-[10px]">Confidence</span>
                  <span className="text-sm font-bold text-cyan-400">{c.confidenceScore}%</span>
                </div>
                <button
                  onClick={() => onSelectCampaign(c.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Inspect Correlation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{c.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-cyan-400" /> Shared Domains ({c.sharedDomains.length})
                </span>
                <div className="space-y-0.5">
                  {c.sharedDomains.map((d, i) => (
                    <span key={i} className="block text-slate-300 text-[11px] truncate">• {d}</span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-cyan-400" /> Bulletproof IPs ({c.sharedIPs.length})
                </span>
                <div className="space-y-0.5">
                  {c.sharedIPs.map((ip, i) => (
                    <span key={i} className="block text-slate-300 text-[11px] truncate">• {ip}</span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-cyan-400" /> Targeted Sectors
                </span>
                <div className="space-y-0.5">
                  {c.targetedSectors.map((s, i) => (
                    <span key={i} className="block text-slate-300 text-[11px] truncate">• {s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
