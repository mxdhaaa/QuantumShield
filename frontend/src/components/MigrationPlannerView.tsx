import React, { useState } from 'react';
import { 
  Compass, ArrowRight, ShieldCheck, AlertTriangle, 
  RotateCcw, CheckCircle2, Cpu, Zap, Layers
} from 'lucide-react';
import { ScanResult, CryptoFinding, TabType } from '../types';

interface MigrationPlannerViewProps {
  scanResult: ScanResult | null;
  selectedFinding: CryptoFinding | null;
  onSelectFinding: (finding: CryptoFinding) => void;
  onNavigate: (tab: TabType) => void;
}

export const MigrationPlannerView: React.FC<MigrationPlannerViewProps> = ({
  scanResult,
  selectedFinding,
  onSelectFinding,
  onNavigate
}) => {
  const findings = scanResult?.findings || [];
  const [activeFindingId, setActiveFindingId] = useState<string | null>(
    selectedFinding?.id || findings[0]?.id || null
  );

  const activeFinding = findings.find(f => f.id === activeFindingId) || findings[0];
  const plan = activeFinding ? scanResult?.migration_plans[activeFinding.id] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Context-Aware PQC Migration Planner</h2>
            <p className="text-xs text-[#94A3B8]">
              Technically defensible migration targets based on exact cryptographic usage: Signatures (FIPS 204/205) vs Key Encapsulation (FIPS 203).
            </p>
          </div>
        </div>

        {/* Algorithm Dropdown */}
        <select
          value={activeFinding?.id || ''}
          onChange={(e) => {
            setActiveFindingId(e.target.value);
            const found = findings.find(f => f.id === e.target.value);
            if (found) onSelectFinding(found);
          }}
          className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
        >
          {findings.map(f => (
            <option key={f.id} value={f.id}>
              {f.algorithm} [{f.primitive}] - {f.file}:{f.line}
            </option>
          ))}
        </select>
      </div>

      {plan && (
        <div className="space-y-6">
          {/* Algorithm Comparison Card: CURRENT vs TARGET */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Classical Algorithm */}
            <div className="p-5 rounded-xl bg-[#0F172A] border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Current Classical Primitive</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">Quantum Vulnerable</span>
              </div>
              <div className="text-xl font-mono font-bold text-white">{plan.current_algorithm}</div>
              <div className="text-xs text-[#94A3B8]">Usage: <strong className="text-white">{plan.usage}</strong></div>
              <div className="text-[11px] text-[#CBD5E1] bg-[#090D16] p-3 rounded-lg border border-[#1E293B] leading-relaxed">
                <strong className="text-red-400">Vulnerability Root Cause: </strong>
                {plan.quantum_vulnerability_reason}
              </div>
            </div>

            {/* Target Post-Quantum Standard */}
            <div className="p-5 rounded-xl bg-[#0F172A] border border-emerald-500/30 space-y-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">NIST Target Standard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">NIST Standardized</span>
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400">{plan.migration_candidate.target_standard}</div>
              <div className="text-xs text-[#94A3B8]">Target Primitive: <strong className="text-white">{plan.migration_candidate.target_primitive}</strong></div>
              <div className="text-[11px] text-cyan-300 bg-[#090D16] p-3 rounded-lg border border-cyan-500/30 leading-relaxed">
                <strong>Hybrid Transition Scheme: </strong>
                {plan.migration_candidate.hybrid_option || 'Direct replacement'}
              </div>
            </div>
          </div>

          {/* Size Delta & Compatibility Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1.5">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Key / Payload Size Delta</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] leading-relaxed font-mono">
                {plan.migration_candidate.key_ciphertext_size_delta}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-amber-500/30 space-y-1.5">
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Compatibility & Buffer Risk</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {plan.migration_candidate.compatibility_risk}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1.5">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Performance & Latency</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                {plan.migration_candidate.performance_impact}
              </p>
            </div>
          </div>

          {/* Multi-Phase Execution Plan */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Phase Migration Roadmap</h3>
              <span className="text-xs font-mono text-cyan-400">Estimated Effort: {plan.estimated_effort}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Step-by-Step Implementation:</span>
                <div className="space-y-2">
                  {plan.migration_candidate.migration_steps.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs text-[#E2E8F0] flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Validation Invariants:</span>
                  <div className="space-y-2">
                    {plan.migration_candidate.validation_requirements.map((req, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] space-y-1">
                  <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rollback Mechanism</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    {plan.migration_candidate.rollback_plan}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigate('simulator')}
                className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
              >
                <span>Simulate This Migration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
