import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, ShieldCheck, Flame, 
  Activity, Layers, Clock, ArrowRight 
} from 'lucide-react';
import { ScanResult, CryptoFinding, TabType } from '../types';

interface RiskAnalysisViewProps {
  scanResult: ScanResult | null;
  selectedFinding: CryptoFinding | null;
  onSelectFinding: (finding: CryptoFinding) => void;
  onNavigate: (tab: TabType) => void;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
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
  const risk = activeFinding ? scanResult?.risk_assessments[activeFinding.id] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Deterministic Explainability */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Explainable Deterministic Quantum Risk Engine</h2>
            <p className="text-xs text-[#94A3B8]">
              Risk scoring is mathematically derived from NIST PQC vulnerabilities, Mosca's theorem (HNDL), blast radius, and migration complexity.
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

      {/* Main Grid: Overall Risk Score Card + 5 Factor Deep Dives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk Badge & Mosca Theorem Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Score Box */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Overall Exposure</span>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                risk?.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {risk?.level}
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-mono font-bold text-white">{risk?.overall_score}</span>
              <span className="text-sm text-[#64748B]">/ 100</span>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed bg-[#090D16] p-3 rounded-lg border border-[#1E293B]">
              {risk?.explanation}
            </p>

            <button
              onClick={() => onNavigate('migration')}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5"
            >
              <span>Generate Migration Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mosca Theorem HNDL Deep Dive */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            risk?.mosca_harvest_now_decrypt_later 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8]'
          }`}>
            <div className="flex items-center space-x-2">
              <Flame className={`w-4 h-4 ${risk?.mosca_harvest_now_decrypt_later ? 'text-amber-400' : 'text-[#64748B]'}`} />
              <span className="text-xs font-bold text-white">Mosca's Theorem (HNDL) Analysis</span>
            </div>

            <p className="text-[11px] leading-relaxed">
              <strong>Theorem condition:</strong> If $X$ (Shelf Life) + $Y$ (Migration Time) &gt; $Z$ (Time to CRQC), your encrypted data is already vulnerable today.
            </p>

            <div className="p-2.5 rounded bg-[#090D16] border border-[#1E293B] text-[11px] font-mono text-cyan-300">
              {risk?.mosca_harvest_now_decrypt_later 
                ? 'CRITICAL EXPOSURE: Key establishment session data is susceptible to retrospective decryption.'
                : 'NO DIRECT HNDL: Primitive uses short-lived tokens or symmetric quantum-resilient keys.'}
            </div>
          </div>
        </div>

        {/* Right Column: 5 Deterministic Weighted Factor Breakdown */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deterministic Factor Breakdown (100% Total Weight)</h3>
            <span className="text-[11px] text-[#64748B] font-mono">AST & Architecture Grounded</span>
          </div>

          <div className="space-y-3">
            {risk?.factors.map((factor, idx) => {
              const percentage = Math.round((factor.score / 10) * 100);
              return (
                <div key={idx} className="p-3.5 rounded-lg bg-[#090D16] border border-[#1E293B] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{factor.factor_name}</span>
                      <span className="text-[10px] text-[#64748B] font-mono bg-[#1E293B] px-1.5 py-0.2 rounded">
                        Weight: {Math.round(factor.weight * 100)}%
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-cyan-400">
                      {factor.score.toFixed(1)} / 10
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${factor.score >= 8 ? 'bg-red-500' : (factor.score >= 5 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                    {factor.description}
                  </p>
                  
                  <div className="text-[10px] font-mono text-[#64748B] bg-[#060911] p-1.5 rounded border border-[#1E293B]/50">
                    Evidence: {factor.evidence}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
