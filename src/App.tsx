import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, PageId } from './components/common/Sidebar';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { SecurityCopilotModal } from './components/common/SecurityCopilotModal';

// Pages
import { ExecutiveDashboard } from './components/pages/ExecutiveDashboard';
import { RepositoryScanner } from './components/pages/RepositoryScanner';
import { CryptographicFindings } from './components/pages/CryptographicFindings';
import { DependencyIntelligenceGraph } from './components/pages/DependencyIntelligenceGraph';
import { CertificateIntelligence } from './components/pages/CertificateIntelligence';
import { MigrationPlanner } from './components/pages/MigrationPlanner';
import { CryptoAgilityLab } from './components/pages/CryptoAgilityLab';
import { ReportsCenter } from './components/pages/ReportsCenter';

import { MOCK_FINDINGS } from './data/mockData';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [activeTenant, setActiveTenant] = useState('Contoso Enterprise (Global Tenant)');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const criticalCount = MOCK_FINDINGS.filter(f => f.severity === 'Critical').length;

  // Keyboard shortcut Ctrl+K to open Security Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCopilotOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <ExecutiveDashboard onNavigate={(p: any) => setActivePage(p)} onOpenCopilot={() => setIsCopilotOpen(true)} />;
      case 'scanner':
        return <RepositoryScanner onOpenCopilot={() => setIsCopilotOpen(true)} />;
      case 'findings':
        return <CryptographicFindings onOpenCopilot={() => setIsCopilotOpen(true)} />;
      case 'graph':
        return <DependencyIntelligenceGraph onOpenCopilot={() => setIsCopilotOpen(true)} />;
      case 'certificates':
        return <CertificateIntelligence onOpenCopilot={() => setIsCopilotOpen(true)} />;
      case 'planner':
        return <MigrationPlanner onOpenCopilot={() => setIsCopilotOpen(true)} />;
      case 'lab':
        return <CryptoAgilityLab onOpenCopilot={() => setIsCopilotOpen(true)} />;
      case 'reports':
        return <ReportsCenter onOpenCopilot={() => setIsCopilotOpen(true)} tenantName={activeTenant} />;
      default:
        return <ExecutiveDashboard onNavigate={(p: any) => setActivePage(p)} onOpenCopilot={() => setIsCopilotOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Mandatory Compliance Banner across ALL pages */}
      <DisclaimerBanner />

      {/* Enterprise Topbar Header */}
      <Header 
        onOpenCopilot={() => setIsCopilotOpen(true)}
        activeTenant={activeTenant}
        setActiveTenant={setActiveTenant}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex w-full">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          activePage={activePage}
          setActivePage={setActivePage}
          criticalCount={criticalCount}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {renderActivePage()}
        </main>

      </div>

      {/* Security Copilot AI Dialog */}
      <SecurityCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

    </div>
  );
}

export default App;
