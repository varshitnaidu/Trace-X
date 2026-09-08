export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SystemMode = 'DEMO_DATA' | 'LIVE_INTELLIGENCE';

export interface HealthResponse {
  status: string;
  app: string;
  tagline: string;
  version: string;
  environment: string;
  demo_mode: boolean;
  timestamp: string;
  services: {
    api: string;
    parser: string;
    intelligence_adapters: string;
    risk_engine: string;
    ml_classifier: string;
  };
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  badgeVariant?: 'cyan' | 'amber' | 'rose' | 'emerald';
}
