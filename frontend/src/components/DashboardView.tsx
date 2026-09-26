import React from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertOctagon, Activity, 
  GitFork, Cpu, ArrowUpRight, Flame, Layers, Lock
} from 'lucide-react';
import { ScanResult, TabType } from '../types';

interface DashboardViewProps {
  scanResult: ScanResult | null;
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ scanResult, onNavigate }) => {
  if (!scanResult) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Cpu className="w-12 h-12 text-cyan-400 animate-pulse mb-3" />
        <p className="text-[#94A3B8] text-sm">No active scan loaded. Click 'Run Repository Scan' to analyze codebase.</p>
      </div>
    );
  }

  const { summary_stats, findings, risk_assessments } = scanResult;

  const statCards = [
    {
      title: 'Total Cryptographic Assets',
      value: summary_stats.total_assets,
      subtitle: `${scanResult.scanned_files_count} Python source files analyzed`,
      icon: Lock,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    {
      title: 'Quantum-Vulnerable Primitives',
      value: summary_stats.quantum_vulnerable,
      subtitle: 'Shor & discrete-log vulnerable',
      icon: ShieldAlert,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      title: 'Harvest-Now-Decrypt-Later (HNDL)',
      value: summary_stats.hndl_active_threats,
      subtitle: 'Mosca theorem X+Y > Z exposure',
      icon: Flame,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    },
    {
      title: 'Dependency Graph Nodes',
      value: summary_stats.dependency_nodes,
      subtitle: `${summary_stats.dependency_edges} interconnected call edges`,
      icon: GitFork,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Crypto-Agility Readiness Index */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#0F172A] via-[#111C33] to-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>NIST PQC POSTURE OVERVIEW</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Post-Quantum Migration Posture</h2>
          <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed">
            AST-level analysis identified <span className="text-red-400 font-semibold">{summary_stats.quantum_vulnerable} quantum-vulnerable primitives</span> out of {summary_stats.total_assets} total cryptographic assets. Active key establishment channels present immediate <span className="text-amber-400 font-semibold">Harvest-Now-Decrypt-Later (HNDL)</span> interception exposure.
          </p>
        </div>

        {/* Agility Gauge Card */}
        <div className="bg-[#090D16] border border-[#1E293B] p-4 rounded-xl flex items-center space-x-5 shrink-0 z-10 shadow-lg">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1E293B]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={summary_stats.crypto_agility_index >= 70 ? "text-emerald-400" : (summary_stats.crypto_agility_index >= 40 ? "text-amber-400" : "text-cyan-400")}
                strokeDasharray={`${summary_stats.crypto_agility_index}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-mono font-bold text-white">{summary_stats.crypto_agility_index}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Crypto-Agility Index</div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Post-Quantum Readiness</div>
            <button 
              onClick={() => onNavigate('simulator')}
              className="mt-2 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Simulate Migration <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-4 rounded-xl bg-[#0F172A] border ${stat.borderColor} transition-all hover:bg-[#131F37]`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8]">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-[#64748B] mt-1">{stat.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Section: High-Priority Findings & Cryptographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: High-Priority Quantum Findings Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Critical & High Quantum Exposures</h3>
            </div>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              View Full Inventory <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16] text-[#64748B] font-semibold uppercase tracking-wider text-[10px] border-b border-[#1E293B]">
                <tr>
                  <th className="px-3 py-2.5">Algorithm</th>
                  <th className="px-3 py-2.5">Primitive</th>
                  <th className="px-3 py-2.5">File & Line</th>
                  <th className="px-3 py-2.5">Explainable Risk</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-mono text-[11px]">
                {findings.filter(f => f.quantum_status === 'quantum-vulnerable' || f.quantum_status === 'legacy-broken').slice(0, 5).map((f) => {
                  const risk = risk_assessments[f.id];
                  return (
                    <tr key={f.id} className="hover:bg-[#131F37] transition-colors">
                      <td className="px-3 py-2.5 text-white font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                        {f.algorithm}
                      </td>
                      <td className="px-3 py-2.5 text-[#94A3B8] uppercase text-[10px]">
                        {f.primitive.replace('_', ' ')}
                      </td>
                      <td className="px-3 py-2.5 text-[#64748B]">
                        {f.file}:{f.line}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          risk?.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {risk ? `${risk.level} (${risk.overall_score})` : 'HIGH'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => onNavigate('migration')}
                          className="text-cyan-400 hover:text-cyan-300 font-sans text-xs underline"
                        >
                          Plan PQC
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: NIST Migration Quick Guidelines */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">NIST PQC Migration Target Map</h3>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Cryptographic correctness requires matching primitives to the appropriate FIPS standard:
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-[#090D16] border border-[#1E293B]">
                <div className="text-[11px] font-semibold text-cyan-400 flex items-center justify-between">
                  <span>Signatures (RSA / ECDSA)</span>
                  <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-500/30">FIPS 204</span>
                </div>
                <div className="text-[11px] text-[#E2E8F0] mt-1">Target: <strong>ML-DSA-65 / Dilithium</strong></div>
                <div className="text-[10px] text-[#64748B]">Alternative: SLH-DSA (FIPS 205 / Stateless Hash)</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090D16] border border-[#1E293B]">
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
                  <span>Key Exchange (ECDH / DH)</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">FIPS 203</span>
                </div>
                <div className="text-[11px] text-[#E2E8F0] mt-1">Target: <strong>ML-KEM-768 / Kyber</strong></div>
                <div className="text-[10px] text-[#64748B]">Hybrid: X25519 + ML-KEM-768 for TLS 1.3</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090D16] border border-[#1E293B]">
                <div className="text-[11px] font-semibold text-amber-400 flex items-center justify-between">
                  <span>Symmetric (AES / SHA)</span>
                  <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">NIST SP 800-38D</span>
                </div>
                <div className="text-[11px] text-[#E2E8F0] mt-1">Target: <strong>AES-256-GCM / SHA-384</strong></div>
                <div className="text-[10px] text-[#64748B]">Grover resistance: 128-bit quantum security margin</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('copilot')}
            className="w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            Ask Copilot: "What should we migrate first?"
          </button>
        </div>
      </div>
    </div>
  );
};
