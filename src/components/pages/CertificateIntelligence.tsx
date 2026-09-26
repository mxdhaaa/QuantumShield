import React, { useState } from 'react';
import { 
  KeyRound, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles,
  Zap,
  Filter,
  Search
} from 'lucide-react';
import { MOCK_CERTIFICATES } from '../../data/mockData';

interface CertificateIntelligenceProps {
  onOpenCopilot: () => void;
}

export const CertificateIntelligence: React.FC<CertificateIntelligenceProps> = ({ onOpenCopilot }) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCerts = MOCK_CERTIFICATES.filter(c => {
    const matchesRisk = filterRisk === 'ALL' || c.riskLevel === filterRisk;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.signatureAlgorithm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const expiringCount = MOCK_CERTIFICATES.filter(c => c.daysToExpiry < 30).length;
  const legacyRsaCount = MOCK_CERTIFICATES.filter(c => c.keyType === 'RSA').length;

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-amber-400" />
            Certificate Intelligence & Inventory
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise TLS/SSL certificate health, expiration timeline, key size auditing, and composite PQC hybrid readiness
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCopilot}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Audit Certs with Copilot</span>
          </button>
        </div>
      </div>

      {/* Health Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-4 border-rose-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-rose-300">Expiring &lt; 30 Days</span>
            <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">{expiringCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Requires immediate renewal</div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Legacy RSA Key Size</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{legacyRsaCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Non-PQC standard signatures</div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Composite Hybrid Certs</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">1</div>
          <div className="text-[11px] text-slate-400 mt-1">Dilithium + RSA-4096</div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Inventory</span>
            <KeyRound className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{MOCK_CERTIFICATES.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">100% Certificate Coverage</div>
        </div>

      </div>

      {/* Certificate Expiration Visual Timeline */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-base">Certificate Expiration & PQC Timeline</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300">2026 - 2028 Projection</span>
        </div>

        {/* Timeline Bar */}
        <div className="space-y-3 pt-2 font-mono text-xs">
          {MOCK_CERTIFICATES.map((cert) => (
            <div key={cert.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{cert.name}</span>
                  <span className="text-[10px] text-slate-400">({cert.associatedService})</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  cert.daysToExpiry < 30 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  cert.daysToExpiry < 90 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  Expires in {cert.daysToExpiry} Days ({cert.expirationDate})
                </span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex">
                <div 
                  className={`h-full rounded-full transition-all ${
                    cert.daysToExpiry < 30 ? 'bg-rose-500' :
                    cert.daysToExpiry < 90 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.max(10, Math.min(100, (cert.daysToExpiry / 365) * 100))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Alg: <strong className="text-cyan-300">{cert.signatureAlgorithm}</strong></span>
                <span>Hybrid PQC Ready: <strong className={cert.hybridReadiness ? 'text-emerald-400' : 'text-rose-400'}>{cert.hybridReadiness ? 'YES (Composite)' : 'NO (Legacy)'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-white text-sm">Enterprise Certificate Inventory</h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certificate name or issuer..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Certificate Name</th>
                <th className="py-3 px-4">Issuer</th>
                <th className="py-3 px-4">Signature Algorithm</th>
                <th className="py-3 px-4">Key Type / Size</th>
                <th className="py-3 px-4">Expiration Date</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Hybrid PQC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {cert.name}
                    <div className="text-[10px] text-slate-500 font-mono font-normal">Service: {cert.associatedService}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{cert.issuer}</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold">{cert.signatureAlgorithm}</td>
                  <td className="py-3.5 px-4 text-slate-300">{cert.keyType} ({cert.keySize}-bit)</td>
                  <td className="py-3.5 px-4 text-slate-300">{cert.expirationDate}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cert.riskLevel === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      cert.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {cert.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      cert.hybridReadiness ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {cert.hybridReadiness ? 'Composite Active' : 'Not Hybrid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
