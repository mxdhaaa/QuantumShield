import React, { useState } from 'react';
import { 
  FolderSearch, 
  UploadCloud, 
  FileCode, 
  Play, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter, 
  Code, 
  ShieldAlert,
  ArrowRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { MOCK_FINDINGS, MOCK_REPOSITORIES } from '../../data/mockData';
import { CryptoFinding } from '../../types';

interface RepositoryScannerProps {
  onOpenCopilot: () => void;
}

export const RepositoryScanner: React.FC<RepositoryScannerProps> = ({ onOpenCopilot }) => {
  const [selectedRepo, setSelectedRepo] = useState(MOCK_REPOSITORIES[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [selectedFinding, setSelectedFinding] = useState<CryptoFinding | null>(MOCK_FINDINGS[0]);
  const [algoFilter, setAlgoFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    'src': true,
    'src/crypto': true,
    'src/auth': true,
    'config': true
  });

  const currentRepoObj = MOCK_REPOSITORIES.find(r => r.id === selectedRepo) || MOCK_REPOSITORIES[0];

  const handleStartScan = () => {
    setIsScanning(true);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 800);
    setTimeout(() => setScanStep(3), 1600);
    setTimeout(() => setScanStep(4), 2400);
    setTimeout(() => {
      setIsScanning(false);
      setScanStep(0);
    }, 3200);
  };

  const filteredFindings = MOCK_FINDINGS.filter(f => {
    const matchesAlgo = algoFilter === 'ALL' || f.algorithm.toUpperCase().includes(algoFilter.toUpperCase());
    const matchesSearch = f.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.evidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.algorithm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAlgo && matchesSearch;
  });

  const scanStepsList = [
    'Parsing Source Code Abstract Syntax Tree (AST)...',
    'Extracting Cryptographic Primitive Signatures (RSA, SHA-1, ECDSA)...',
    'Auditing Third-Party Library Version Maps (OpenSSL, BouncyCastle)...',
    'Indexing Quantum Dependency Topology & Vulnerability Metrics...'
  ];

  const algoTabs = ['ALL', 'RSA', 'SHA1', 'SHA256', 'ECDSA', 'TLS', 'OpenSSL', 'BouncyCastle'];

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderSearch className="w-6 h-6 text-cyan-400" />
            Repository Crypto Scanner
          </h1>
          <p className="text-xs text-slate-400">
            Deep static code analysis (SAST) & AST parsing for quantum-vulnerable cryptographic primitives
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500"
          >
            {MOCK_REPOSITORIES.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.language})</option>
            ))}
          </select>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Scanning Repository...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-cyan-200 fill-cyan-200" />
                <span>Run Quantum Scanner</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="glass-panel rounded-2xl p-6 border-dashed border-2 border-slate-700 hover:border-cyan-500/50 transition-colors flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Drag and drop code repository (.zip / Git tree) or select workspace</h3>
          <p className="text-xs text-slate-400 mt-1">Supports C/C++, Java, Go, Rust, Python, TypeScript, TLS Configs & OpenSSL scripts</p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
            Current Target: <strong className="text-cyan-300">{currentRepoObj.name}</strong>
          </span>
          <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-full">
            {currentRepoObj.totalFiles} Files Indexed
          </span>
        </div>
      </div>

      {/* Live Scan Progress Panel */}
      {isScanning && (
        <div className="glass-panel rounded-2xl p-6 border-cyan-500/50 bg-slate-900/90 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <h3 className="font-semibold text-white text-sm">Quantum Scanner Engine Active</h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/40">
              Step {scanStep} / 4
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(scanStep / 4) * 100}%` }}
            />
          </div>

          <div className="space-y-2 font-mono text-xs">
            {scanStepsList.map((stepText, idx) => {
              const isCompleted = idx + 1 < scanStep;
              const isCurrent = idx + 1 === scanStep;

              return (
                <div key={idx} className={`flex items-center gap-2.5 ${
                  isCompleted ? 'text-emerald-400' : isCurrent ? 'text-cyan-300 font-semibold' : 'text-slate-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Repository Tree (Left) & Discovery Table / Code Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Interactive Repository Tree */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 space-y-3 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Repository AST Tree
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{currentRepoObj.branch}</span>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold py-1">
              <ChevronDown className="w-4 h-4 text-cyan-400" />
              <span>{currentRepoObj.name}/</span>
            </div>

            {/* Folder Structure */}
            <div className="pl-4 space-y-1">
              <div>
                <button 
                  onClick={() => setTreeExpanded({ ...treeExpanded, 'src': !treeExpanded['src'] })}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white py-1 w-full text-left"
                >
                  {treeExpanded['src'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="text-amber-300 font-medium">src/</span>
                </button>

                {treeExpanded['src'] && (
                  <div className="pl-4 space-y-1">
                    
                    <button 
                      onClick={() => setTreeExpanded({ ...treeExpanded, 'src/crypto': !treeExpanded['src/crypto'] })}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white py-1 w-full text-left"
                    >
                      {treeExpanded['src/crypto'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span className="text-amber-200">crypto/</span>
                    </button>

                    {treeExpanded['src/crypto'] && (
                      <div className="pl-4 space-y-1">
                        <div 
                          onClick={() => setSelectedFinding(MOCK_FINDINGS[0])}
                          className="flex items-center justify-between text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded cursor-pointer border border-rose-500/20"
                        >
                          <span className="truncate">rsaKeyManager.cpp</span>
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded">RSA</span>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setTreeExpanded({ ...treeExpanded, 'src/auth': !treeExpanded['src/auth'] })}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white py-1 w-full text-left"
                    >
                      {treeExpanded['src/auth'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span className="text-amber-200">auth/</span>
                    </button>

                    {treeExpanded['src/auth'] && (
                      <div className="pl-4 space-y-1">
                        <div 
                          onClick={() => setSelectedFinding(MOCK_FINDINGS[2])}
                          className="flex items-center justify-between text-amber-300 hover:bg-amber-500/10 px-2 py-1 rounded cursor-pointer border border-amber-500/20"
                        >
                          <span className="truncate">jwtSigner.ts</span>
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">ECDSA</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

              <div>
                <button 
                  onClick={() => setTreeExpanded({ ...treeExpanded, 'config': !treeExpanded['config'] })}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white py-1 w-full text-left"
                >
                  {treeExpanded['config'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="text-amber-300 font-medium">config/</span>
                </button>

                {treeExpanded['config'] && (
                  <div className="pl-4 space-y-1">
                    <div 
                      onClick={() => setSelectedFinding(MOCK_FINDINGS[7])}
                      className="flex items-center justify-between text-slate-300 hover:bg-slate-800 px-2 py-1 rounded cursor-pointer"
                    >
                      <span className="truncate">crypto-policy.json</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">SHA256</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Discovery Results & Syntax Code Viewer */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters & Tabs */}
          <div className="glass-panel rounded-2xl p-4 space-y-4">
            
            {/* Search and Algo Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter findings by file or algorithm..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {algoTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAlgoFilter(tab)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      algoFilter === tab
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>

            {/* Findings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">File / Path</th>
                    <th className="py-2.5 px-3">Line</th>
                    <th className="py-2.5 px-3">Algorithm</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Migration Concern</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {filteredFindings.map((finding) => (
                    <tr 
                      key={finding.id}
                      onClick={() => setSelectedFinding(finding)}
                      className={`cursor-pointer transition-colors ${
                        selectedFinding?.id === finding.id 
                          ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400' 
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-200 font-semibold truncate max-w-[200px]">
                        {finding.file}
                      </td>
                      <td className="py-3 px-3 text-slate-400">L{finding.line}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          finding.algorithm.includes('RSA') || finding.algorithm === 'SHA1' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {finding.algorithm}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{finding.confidence}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[11px] ${
                          finding.severity === 'Critical' ? 'text-rose-400 font-semibold' : 'text-amber-400'
                        }`}>
                          {finding.migrationConcern}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800">
                          <Code className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Syntax-Highlighted Code Viewer Drawer */}
          {selectedFinding && (
            <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-semibold text-white text-sm font-mono">{selectedFinding.file}</h3>
                    <p className="text-[11px] text-slate-400">Line {selectedFinding.line} • Detected Algorithm: <strong className="text-cyan-300">{selectedFinding.algorithm}</strong></p>
                  </div>
                </div>

                <button
                  onClick={onOpenCopilot}
                  className="bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copilot Refactor</span>
                </button>
              </div>

              {/* Code Snippet Container */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto text-slate-200 leading-relaxed shadow-inner">
                <div className="text-slate-500 text-[10px] pb-2 border-b border-slate-900 mb-2 flex items-center justify-between">
                  <span>Source AST Viewer</span>
                  <span>{selectedFinding.repository}</span>
                </div>
                <pre>{selectedFinding.snippet}</pre>
              </div>

              {/* PQC Replacement Recommendation Box */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Post-Quantum Migration Recommendation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedFinding.replacementRecommendation}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
