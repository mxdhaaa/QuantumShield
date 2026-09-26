import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  Sparkles, 
  AlertOctagon, 
  FileCode, 
  CheckCircle2,
  Copy,
  Zap
} from 'lucide-react';
import { MOCK_FINDINGS } from '../../data/mockData';
import type { CryptoFinding, SeverityLevel, AlgorithmCategory } from '../../types';

interface CryptographicFindingsProps {
  onOpenCopilot: () => void;
}

export const CryptographicFindings: React.FC<CryptographicFindingsProps> = ({ onOpenCopilot }) => {
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_FINDINGS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityLevel[]>(['Critical', 'High', 'Medium', 'Low']);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSeverity = (sev: SeverityLevel) => {
    if (selectedSeverities.includes(sev)) {
      if (selectedSeverities.length > 1) {
        setSelectedSeverities(selectedSeverities.filter(s => s !== sev));
      }
    } else {
      setSelectedSeverities([...selectedSeverities, sev]);
    }
  };

  const categories = ['ALL', 'Asymmetric Encryption', 'Hash Function', 'Digital Signature', 'Key Exchange', 'TLS Transport', 'Symmetric Cipher'];

  const filteredFindings = MOCK_FINDINGS.filter(f => {
    const matchesSev = selectedSeverities.includes(f.severity);
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchesSearch = f.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.algorithm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.evidence.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesCat && matchesSearch;
  });

  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Cryptographic Findings Explorer
          </h1>
          <p className="text-xs text-slate-400">
            Granular inventory of quantum-vulnerable primitive calls, hardcoded key lengths, and un-agile crypto usage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30">
            Total Discovered: <strong>{MOCK_FINDINGS.length} Findings</strong>
          </span>
          <button
            onClick={onOpenCopilot}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Remediate with Copilot</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings by file, algorithm, evidence..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Severity Checkboxes (4 cols) */}
          <div className="md:col-span-4 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-400 shrink-0">Severity:</span>
            {(['Critical', 'High', 'Medium', 'Low'] as SeverityLevel[]).map((sev) => {
              const active = selectedSeverities.includes(sev);
              return (
                <button
                  key={sev}
                  onClick={() => toggleSeverity(sev)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition ${
                    active 
                      ? sev === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' :
                        sev === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
                        sev === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                        'bg-slate-700 text-slate-200 border-slate-600'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Crypto Categories' : c}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Advanced Findings Table with Expandable Evidence Drawer */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">File / Line</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Migration Priority</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredFindings.map((finding) => {
                const isExpanded = expandedId === finding.id;

                return (
                  <React.Fragment key={finding.id}>
                    
                    {/* Main Row */}
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-900/90' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-slate-500">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                          finding.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-red' :
                          finding.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          finding.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {finding.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {finding.algorithm}
                      </td>

                      <td className="py-3.5 px-4 text-slate-200">
                        <div className="font-semibold text-cyan-300 truncate max-w-[220px]">{finding.file}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Line {finding.line} • {finding.repository}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {finding.category}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {finding.confidence}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-semibold ${
                          finding.migrationPriority === 'Immediate' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {finding.migrationPriority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]">
                          {isExpanded ? 'Hide' : 'Expand'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Evidence Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90">
                        <td colSpan={8} className="p-6 border-b border-slate-800 space-y-4">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Evidence Code Snippet */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                                <span className="flex items-center gap-1.5 font-mono text-cyan-400">
                                  <FileCode className="w-4 h-4" />
                                  Evidence Snippet
                                </span>
                                <button
                                  onClick={() => handleCopySnippet(finding.snippet, finding.id)}
                                  className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded transition"
                                >
                                  {copiedId === finding.id ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === finding.id ? 'Copied' : 'Copy Code'}</span>
                                </button>
                              </div>

                              <div className="bg-[#070A12] border border-cyan-500/20 rounded-xl p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed shadow-inner">
                                <pre>{finding.snippet}</pre>
                              </div>
                            </div>

                            {/* PQC Remediation & Action Plan */}
                            <div className="space-y-3 font-sans">
                              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                <span>PQC Remediation Strategy</span>
                              </div>

                              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {finding.replacementRecommendation}
                                </p>
                                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 font-mono">
                                  <span>Concern Level: <strong className="text-rose-400">{finding.migrationConcern}</strong></span>
                                  <span>Detected: {finding.detectedAt}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  onClick={onOpenCopilot}
                                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Generate Refactor PR</span>
                                </button>
                                <button className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-xl transition">
                                  Mark as False Positive
                                </button>
                              </div>

                            </div>

                          </div>

                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
