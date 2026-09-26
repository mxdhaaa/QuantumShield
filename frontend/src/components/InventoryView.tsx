import React, { useState } from 'react';
import { 
  Database, Search, Filter, Download, ExternalLink, 
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpDown, ChevronRight
} from 'lucide-react';
import { ScanResult, CryptoFinding, TabType } from '../types';

interface InventoryViewProps {
  scanResult: ScanResult | null;
  onSelectFinding: (finding: CryptoFinding) => void;
  onNavigate: (tab: TabType) => void;
  onExport: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  scanResult, onSelectFinding, onNavigate, onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrimitive, setSelectedPrimitive] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const findings = scanResult?.findings || [];

  const filtered = findings.filter(f => {
    const matchesSearch = 
      f.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.usage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.component_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrimitive = selectedPrimitive === 'ALL' || f.primitive === selectedPrimitive;
    const matchesStatus = selectedStatus === 'ALL' || f.quantum_status === selectedStatus;

    return matchesSearch && matchesPrimitive && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by algorithm, file, usage, component..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs text-white placeholder-[#64748B] font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedPrimitive}
            onChange={(e) => setSelectedPrimitive(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs text-[#CBD5E1] focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Primitives</option>
            <option value="signature">Digital Signature</option>
            <option value="key_establishment">Key Establishment</option>
            <option value="symmetric_encryption">Symmetric Encryption</option>
            <option value="hashing">Cryptographic Hashing</option>
            <option value="pki_certificate">PKI / TLS Context</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs text-[#CBD5E1] focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Quantum Statuses</option>
            <option value="quantum-vulnerable">Quantum Vulnerable</option>
            <option value="conditionally-safe">Conditionally Safe</option>
            <option value="quantum-safe">Quantum Safe</option>
            <option value="legacy-broken">Legacy Broken</option>
          </select>

          <button
            onClick={onExport}
            className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16] text-[#64748B] font-semibold uppercase tracking-wider text-[10px] border-b border-[#1E293B]">
              <tr>
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3">Primitive</th>
                <th className="px-4 py-3">Key Size</th>
                <th className="px-4 py-3">Usage Context</th>
                <th className="px-4 py-3">File Location</th>
                <th className="px-4 py-3">Quantum Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#E2E8F0] font-mono text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#64748B]">
                    No cryptographic assets match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => {
                  const isVuln = f.quantum_status === 'quantum-vulnerable';
                  const isSafe = f.quantum_status === 'quantum-safe' || f.quantum_status === 'conditionally-safe';
                  return (
                    <tr key={f.id} className="hover:bg-[#131F37] transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isVuln ? 'bg-red-400 animate-pulse' : (isSafe ? 'bg-emerald-400' : 'bg-amber-400')}`}></span>
                        {f.algorithm}
                      </td>
                      <td className="px-4 py-3.5 uppercase text-[10px] text-[#94A3B8]">
                        {f.primitive.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3.5 text-cyan-300">
                        {f.key_size ? `${f.key_size} bits` : 'Context'}
                      </td>
                      <td className="px-4 py-3.5 text-[#CBD5E1] font-sans">
                        {f.usage}
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B]">
                        {f.file}:{f.line}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wide ${
                          isVuln 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : (f.quantum_status === 'legacy-broken' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
                        }`}>
                          {f.quantum_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-sans">
                        <button
                          onClick={() => {
                            onSelectFinding(f);
                            onNavigate('dependencies');
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium inline-flex items-center gap-1 transition-all"
                        >
                          <span>Blast Radius</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
