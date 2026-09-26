import React, { useState } from 'react';
import { 
  PlayCircle, RefreshCw, CheckCircle2, AlertOctagon, 
  Layers, ArrowRight, ShieldCheck, Cpu, Flame, Check
} from 'lucide-react';
import { ScanResult, SimulationReport, TabType } from '../types';
import { runSimulation } from '../api';

interface SimulatorViewProps {
  scanResult: ScanResult | null;
  onNavigate: (tab: TabType) => void;
  simulationReport: SimulationReport | null;
  setSimulationReport: (report: SimulationReport) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  scanResult,
  onNavigate,
  simulationReport,
  setSimulationReport
}) => {
  const [migrationMode, setMigrationMode] = useState<'hybrid' | 'full_pqc'>('hybrid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const findings = scanResult?.findings || [];
  const vulnFindings = findings.filter(f => f.quantum_status === 'quantum-vulnerable' || f.quantum_status === 'legacy-broken');

  // Initialize all selected by default if empty
  React.useEffect(() => {
    if (selectedIds.length === 0 && vulnFindings.length > 0) {
      setSelectedIds(vulnFindings.map(f => f.id));
    }
  }, [vulnFindings]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExecuteSimulation = async () => {
    setIsSimulating(true);
    try {
      const rep = await runSimulation(selectedIds, migrationMode);
      setSimulationReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Crypto-Agility Migration Simulator</h2>
            <p className="text-xs text-[#94A3B8]">
              Simulates cryptographic algorithm migration, dependency cascades, and compatibility without modifying production code.
            </p>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="flex items-center bg-[#090D16] p-1 rounded-lg border border-[#1E293B]">
          <button
            onClick={() => setMigrationMode('hybrid')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              migrationMode === 'hybrid'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Hybrid Transition (Recommended)
          </button>
          <button
            onClick={() => setMigrationMode('full_pqc')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              migrationMode === 'full_pqc'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Full Pure PQC (FIPS 203/204)
          </button>
        </div>
      </div>

      {/* Main Grid: Item Selection & Simulation Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Finding Selector */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <span className="text-xs font-bold text-white uppercase">Vulnerable Primitives to Migrate</span>
            <button
              onClick={() => setSelectedIds(selectedIds.length === vulnFindings.length ? [] : vulnFindings.map(f => f.id))}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              {selectedIds.length === vulnFindings.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {vulnFindings.map(f => {
              const isChecked = selectedIds.includes(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() => handleToggleSelect(f.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                    isChecked
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                      : 'bg-[#090D16] border-[#1E293B] text-[#94A3B8] hover:bg-[#131F37]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-[#64748B]'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white font-mono">{f.algorithm}</div>
                    <div className="text-[11px] text-[#CBD5E1]">{f.usage}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{f.file}:{f.line}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleExecuteSimulation}
            disabled={isSimulating || selectedIds.length === 0}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Migration Cascade...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Execute Simulation ({selectedIds.length} Target Primitives)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Simulation Report & Cascade Diagnostics */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Simulation Cascade Impact Analysis</h3>
            {simulationReport && (
              <span className="text-xs font-mono font-bold text-emerald-400">
                Agility Readiness: {simulationReport.agility_readiness_score}%
              </span>
            )}
          </div>

          {simulationReport ? (
            <div className="space-y-4">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] text-center">
                  <div className="text-xl font-mono font-bold text-emerald-400">
                    {simulationReport.vulnerabilities_mitigated}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">Mitigated</div>
                </div>
                <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] text-center">
                  <div className="text-xl font-mono font-bold text-amber-400">
                    {simulationReport.residual_vulnerabilities}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">Residual</div>
                </div>
                <div className="p-3 rounded-lg bg-[#090D16] border border-cyan-500/30 text-center">
                  <div className="text-xl font-mono font-bold text-cyan-400">
                    {simulationReport.agility_readiness_score}%
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">PQC Readiness</div>
                </div>
              </div>

              {/* Breaking Changes & Compatibility Warnings */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-white">Identified Architectural Warnings:</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {simulationReport.breaking_changes_identified.map((change, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#090D16] border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                      <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Overhead */}
              <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] space-y-1">
                <span className="text-[11px] font-semibold text-white">Performance Overhead Estimate:</span>
                <p className="text-xs text-cyan-300 font-mono">{simulationReport.performance_overhead_estimate}</p>
              </div>

              <button
                onClick={() => onNavigate('validation')}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                <span>Generate Before vs After Validation Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 text-center text-[#64748B] space-y-2">
              <PlayCircle className="w-10 h-10 text-[#334155]" />
              <p className="text-xs">Select target findings and click 'Execute Simulation' to preview results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
