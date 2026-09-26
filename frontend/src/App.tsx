import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ScannerView } from './components/ScannerView';
import { InventoryView } from './components/InventoryView';
import { DependencyGraphView } from './components/DependencyGraphView';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { MigrationPlannerView } from './components/MigrationPlannerView';
import { SimulatorView } from './components/SimulatorView';
import { ValidationView } from './components/ValidationView';
import { CopilotView } from './components/CopilotView';
import { ScanResult, CryptoFinding, SimulationReport } from './types';
import { fetchCurrentScan, runScan, exportScanData } from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<CryptoFinding | null>(null);
  const [simulationReport, setSimulationReport] = useState<SimulationReport | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const loadScan = async (repoPath?: string) => {
    setIsScanning(true);
    try {
      const data = repoPath ? await runScan(repoPath) : await fetchCurrentScan();
      setScanResult(data);
      if (data.findings.length > 0 && !selectedFinding) {
        setSelectedFinding(data.findings[0]);
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    loadScan();
  }, []);

  const handleExport = async () => {
    try {
      const data = await exportScanData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantumshield_inventory_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
    }
  };

  const vulnCount = scanResult?.summary_stats.quantum_vulnerable || 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080C14] text-[#F8FAFC]">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        vulnCount={vulnCount} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          scanResult={scanResult}
          isScanning={isScanning}
          onScan={() => loadScan()}
          onExport={handleExport}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-[#080C14]">
          {activeTab === 'dashboard' && (
            <DashboardView 
              scanResult={scanResult} 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === 'scanner' && (
            <ScannerView 
              scanResult={scanResult}
              isScanning={isScanning}
              onScan={(path) => loadScan(path)}
              onSelectFinding={(f) => setSelectedFinding(f)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView 
              scanResult={scanResult}
              onSelectFinding={(f) => setSelectedFinding(f)}
              onNavigate={setActiveTab}
              onExport={handleExport}
            />
          )}

          {activeTab === 'dependencies' && (
            <DependencyGraphView 
              scanResult={scanResult}
              selectedFinding={selectedFinding}
              onSelectFinding={(f) => setSelectedFinding(f)}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'risk' && (
            <RiskAnalysisView 
              scanResult={scanResult}
              selectedFinding={selectedFinding}
              onSelectFinding={(f) => setSelectedFinding(f)}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'migration' && (
            <MigrationPlannerView 
              scanResult={scanResult}
              selectedFinding={selectedFinding}
              onSelectFinding={(f) => setSelectedFinding(f)}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'simulator' && (
            <SimulatorView 
              scanResult={scanResult}
              onNavigate={setActiveTab}
              simulationReport={simulationReport}
              setSimulationReport={setSimulationReport}
            />
          )}

          {activeTab === 'validation' && (
            <ValidationView 
              scanResult={scanResult}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'copilot' && (
            <CopilotView 
              scanResult={scanResult}
              selectedFinding={selectedFinding}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
