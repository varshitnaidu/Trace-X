import type { FC } from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN' | 'BENIGN' | 'SUSPICIOUS' | 'MALICIOUS';

interface SeverityBadgeProps {
  severity: ThreatSeverity | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: FC<SeverityBadgeProps> = ({
  severity,
  score,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const norm = (severity || 'LOW').toUpperCase();

  let colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  let Icon = Info;

  if (norm === 'CRITICAL' || norm === 'MALICIOUS') {
    colorClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950/50';
    Icon = AlertOctagon;
  } else if (norm === 'HIGH' || norm === 'SUSPICIOUS') {
    colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/50';
    Icon = AlertTriangle;
  } else if (norm === 'MEDIUM') {
    colorClasses = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950/50';
    Icon = AlertCircle;
  } else if (norm === 'LOW') {
    colorClasses = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    Icon = Info;
  } else if (norm === 'CLEAN' || norm === 'BENIGN') {
    colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/50';
    Icon = CheckCircle2;
  }

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-md border tracking-wide uppercase ${colorClasses} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{norm}</span>
      {typeof score === 'number' && (
        <span className="opacity-75 font-normal pl-1 border-l border-current/25">
          {score}/100
        </span>
      )}
    </span>
  );
};
