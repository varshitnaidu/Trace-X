import { useState, useEffect } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeEmailPage } from './pages/AnalyzeEmailPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CasesPage } from './pages/CasesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditPage } from './pages/AuditPage';
import { LoginPage } from './pages/LoginPage';
import { ToastProvider } from './components/ui/Toast';
import { DEMO_CASES, type DemoCase } from './data/demoData';
import { api, type AuthUser } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    name: 'Sarah Jenkins (Senior SOC Lead)',
    role: 'ANALYST',
    email: 'sarah.jenkins@trace-x.soc'
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [caseList, setCaseList] = useState<DemoCase[]>(DEMO_CASES);
  const [selectedCase, setSelectedCase] = useState<DemoCase>(DEMO_CASES[0]);

  // Synchronize document title
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'TRACE-X | Security Command Center',
      analyze: 'TRACE-X | Analyze Email Artifact',
      investigations: 'TRACE-X | Forensic Investigation',
      intelligence: 'TRACE-X | Threat Intelligence & IOCs',
      campaigns: 'TRACE-X | Correlated Campaigns',
      cases: 'TRACE-X | Incident Cases',
      reports: 'TRACE-X | Forensic Reports & Dossiers',
      settings: 'TRACE-X | Platform Settings',
      audit: 'TRACE-X | Cryptographic Audit Ledger',
    };
    document.title = titles[activeTab] || 'TRACE-X | Threat Intelligence & Digital Forensics';
  }, [activeTab]);

  useEffect(() => {
    const checkBackend = async () => {
      const isOnline = await api.health.check();
      setBackendOnline(isOnline);
      if (isOnline) {
        try {
          const liveCases = await api.cases.list();
          if (liveCases && liveCases.length > 0) {
            setCaseList(liveCases);
            setSelectedCase((prev) => liveCases.find((c) => c.id === prev.id) || liveCases[0]);
          }
        } catch {
          // Fallback to local demo cases
        }
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDemoMode = () => {
    setDemoMode((prev) => !prev);
  };

  const handleSelectCase = (caseItem: DemoCase) => {
    setSelectedCase(caseItem);
    setActiveTab('investigations');
  };

  const handleAnalysisComplete = (newCase: DemoCase) => {
    setCaseList((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
    setSelectedCase(newCase);
    setActiveTab('investigations');
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <ToastProvider>
        <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        demoMode={demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        backendOnline={backendOnline}
        user={currentUser}
        onLogout={handleLogout}
        cases={caseList}
        onSelectCase={handleSelectCase}
      >
        {activeTab === 'dashboard' && (
          <DashboardPage
            onSelectCase={handleSelectCase}
            onNavigateToAnalyze={() => setActiveTab('analyze')}
            cases={caseList}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzeEmailPage
            demoMode={demoMode}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'investigations' && (
          <InvestigationPage
            currentCase={selectedCase}
            onGenerateReport={() => setActiveTab('reports')}
            onNavigateToCampaign={() => setActiveTab('campaigns')}
          />
        )}

        {activeTab === 'intelligence' && <ThreatIntelPage />}

        {activeTab === 'campaigns' && (
          <CampaignsPage onSelectCampaign={() => setActiveTab('investigations')} />
        )}

        {activeTab === 'cases' && <CasesPage onSelectCase={handleSelectCase} cases={caseList} />}

        {activeTab === 'reports' && <ReportsPage initialCaseId={selectedCase.id} />}

        {activeTab === 'settings' && <SettingsPage />}

        {activeTab === 'audit' && <AuditPage />}
      </AppLayout>
    </ToastProvider>
  );
}

export default App;
