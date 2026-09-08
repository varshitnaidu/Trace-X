import type { DemoCase } from '../data/demoData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface AuthUser {
  email: string;
  name: string;
  role: 'ADMIN' | 'ANALYST';
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface ThreatSource {
  name: string;
  status: string;
  verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'NEUTRAL' | 'UNAVAILABLE' | 'CRITICAL';
}

export interface IndicatorLookupResult {
  indicator: string;
  type: string;
  reputation: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'UNKNOWN';
  abuseConfidenceScore: number;
  totalReports: number;
  country: string;
  asn: string;
  usageType: string;
  sources: ThreatSource[];
}

export interface ProviderStatusItem {
  name: string;
  status: string;
  configured: boolean;
  quota: string;
  latency: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  analyst: string;
  action: string;
  resource: string;
  status: string;
  hash: string;
  previousHash: string;
}

export interface AuditVerificationResponse {
  verified: boolean;
  entries_checked: number;
  tampering_detected: boolean;
  genesis_root: string;
  latest_hash: string;
  tampered_entry_id?: string;
  message: string;
}

export interface CampaignItem {
  id: string;
  name: string;
  threatActorGroup: string;
  firstSeen: string;
  lastSeen: string;
  severity: string;
  confidenceScore: number;
  associatedEmailsCount: number;
  sharedDomains: string[];
  sharedIPs: string[];
  targetedSectors: string[];
  summary: string;
  caseIds?: string[];
}

export interface PlatformSettingsResponse {
  environment: string;
  demo_mode: boolean;
  providers: {
    virustotal: string;
    abuseipdb: string;
    phishtank: string;
    urlhaus: string;
    rdap: string;
    llm: string;
  };
  weights: Record<string, number>;
}

// Token helper functions
export const getToken = (): string | null => {
  return localStorage.getItem('tracex_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('tracex_token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('tracex_token');
};

const getHeaders = (isJson: boolean = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<LoginResponse> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(err.detail || 'Authentication failed');
      }
      const data: LoginResponse = await res.json();
      setToken(data.access_token);
      return data;
    },

    getMe: async (): Promise<AuthUser> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Session expired');
      return res.json();
    },

    logout: (): void => {
      clearToken();
    },
  },

  analysis: {
    analyzeFile: async (file: File, liveMode: boolean = false): Promise<DemoCase> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('live', String(liveMode));

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: { message: 'Analysis failed' } }));
        const msg = typeof err.detail === 'object' ? err.detail.message : err.detail;
        throw new Error(msg || 'Analysis failed');
      }

      return res.json();
    },

    analyzeRaw: async (rawContent: string, liveMode: boolean = false): Promise<DemoCase> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/analyze/raw`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          raw_content: rawContent,
          live: liveMode,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: { message: 'Analysis failed' } }));
        const msg = typeof err.detail === 'object' ? err.detail.message : err.detail;
        throw new Error(msg || 'Analysis failed');
      }

      return res.json();
    },
  },

  cases: {
    list: async (): Promise<DemoCase[]> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/cases`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Failed to fetch cases');
      return res.json();
    },

    get: async (caseId: string): Promise<DemoCase> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error(`Case ${caseId} not found`);
      return res.json();
    },

    chat: async (caseId: string, question: string): Promise<{ reply: string }> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}/chat`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error('Failed to query AI assistant');
      return res.json();
    },
  },

  intelligence: {
    lookup: async (indicator: string, type?: string): Promise<IndicatorLookupResult> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/intelligence/lookup`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ indicator, type }),
      });
      if (!res.ok) throw new Error('Threat intelligence query failed');
      return res.json();
    },

    getProviders: async (): Promise<ProviderStatusItem[]> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/intelligence/providers`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Failed to fetch provider statuses');
      return res.json();
    },
  },

  campaigns: {
    list: async (): Promise<CampaignItem[]> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/campaigns`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return res.json();
    },

    get: async (campaignId: string): Promise<CampaignItem> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Campaign not found');
      return res.json();
    },
  },

  audit: {
    list: async (): Promise<AuditLogItem[]> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/audit`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Failed to fetch audit ledger');
      return res.json();
    },

    verify: async (): Promise<AuditVerificationResponse> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/audit/verify`, {
        method: 'POST',
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Audit verification failed');
      return res.json();
    },
  },

  reports: {
    download: async (caseId: string, format: 'pdf' | 'csv' | 'json'): Promise<void> => {
      const url = `${API_BASE_URL}/api/v1/reports/${caseId}/${format}`;
      const res = await fetch(url, { headers: getHeaders(false) });
      if (!res.ok) throw new Error(`Failed to download report (${res.status})`);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = format === 'pdf' ? `REP-${caseId}.pdf` : (format === 'csv' ? `IOCs-${caseId}.csv` : `Dossier-${caseId}.json`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    },
  },

  settings: {
    get: async (): Promise<PlatformSettingsResponse> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/settings`, {
        headers: getHeaders(true),
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },

    updateWeights: async (weights: Record<string, number>): Promise<void> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/settings/weights`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ weights }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to update weights' }));
        throw new Error(err.detail || 'Failed to update weights');
      }
    },
  },

  health: {
    check: async (): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/health`);
        return res.ok;
      } catch {
        return false;
      }
    },
  },
};
