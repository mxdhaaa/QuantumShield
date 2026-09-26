import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, RefreshCw, ShieldCheck, ShieldAlert, 
  ArrowRight, FileCheck, Layers, Award, AlertCircle
} from 'lucide-react';
import { ScanResult, ValidationComparison, TabType } from '../types';
import { runValidation } from '../api';

interface ValidationViewProps {
  scanResult: ScanResult | null;
  onNavigate: (tab: TabType) => void;
}

export const ValidationView: React.FC<ValidationViewProps> = ({ scanResult, onNavigate }) => {
  const [validationData, setValidationData] = useState<ValidationComparison | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const fetchValidation = async () => {
    setIsValidating(true);
    try {
      const val = await runValidation();
      setValidationData(val);
    } catch (e) {
      console.error(e);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    fetchValidation();
  }, [scanResult]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Cryptographic Validation & Rescan Audit</h2>
            <p className="text-xs text-[#94A3B8]">
              Automated audit verification validating residual quantum risk and NIST compliance post-simulation.
            </p>
          </div>
        </div>

        <button
          onClick={fetchValidation}
          disabled={isValidating}
          className="px-4 py-2 rounded-lg bg-[#090D16] border border-[#1E293B] hover:border-cyan-500 text-xs font-semibold text-cyan-400 flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
          <span>Run Rescan Audit</span>
        </button>
      </div>

      {validationData && (
        <div className="space-y-6">
          {/* Before vs After Impact KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0F172A] border border-red-500/30">
              <span className="text-xs text-[#94A3B8]">Vulnerabilities Before</span>
              <div className="text-3xl font-mono font-bold text-red-400 mt-2">
                {validationData.before_quantum_vulnerable_count}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Classical public keys</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-emerald-500/30">
              <span className="text-xs text-[#94A3B8]">Vulnerabilities After</span>
              <div className="text-3xl font-mono font-bold text-emerald-400 mt-2">
                {validationData.after_quantum_vulnerable_count}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Residual exposed items</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-cyan-500/30">
              <span className="text-xs text-[#94A3B8]">Risk Reduction</span>
              <div className="text-3xl font-mono font-bold text-cyan-400 mt-2">
                {validationData.risk_reduction_percentage}%
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Quantum exposure mitigated</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-purple-500/30">
              <span className="text-xs text-[#94A3B8]">Migration Coverage</span>
              <div className="text-3xl font-mono font-bold text-purple-400 mt-2">
                {validationData.coverage_percentage}%
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">PQC readiness compliance</div>
            </div>
          </div>

          {/* Compliance & Standards Checklist */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#1E293B]">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Formal Compliance Checklist</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(validationData.compliance_status).map(([std, passed]) => (
                <div key={std} className={`p-3 rounded-lg border flex items-center space-x-3 ${
                  passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${passed ? 'text-emerald-400' : 'text-red-400'}`} />
                  <div>
                    <div className="text-xs font-bold font-mono">{std.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] opacity-80">{passed ? 'Verified Compliant' : 'Unresolved'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diff Table */}
          <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1E293B] bg-[#090D16] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Before vs After Primitive Transformation Log</h3>
              <span className="text-xs font-mono text-cyan-400">{validationData.findings_diff.length} Primitives Verified</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070A10] text-[#64748B] uppercase text-[10px] border-b border-[#1E293B]">
                  <tr>
                    <th className="px-4 py-2.5">Original Algorithm (Before)</th>
                    <th className="px-4 py-2.5">Migrated Standard (After)</th>
                    <th className="px-4 py-2.5">Migration State</th>
                    <th className="px-4 py-2.5 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] text-[11px]">
                  {validationData.findings_diff.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#131F37] transition-colors">
                      <td className="px-4 py-3 text-red-400">{item.before}</td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">{item.after}</td>
                      <td className="px-4 py-3 text-[#CBD5E1] uppercase text-[10px]">{item.status.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.mitigated ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {item.mitigated ? 'PASS' : 'REMAINING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
