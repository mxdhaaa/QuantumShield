import React, { useState } from 'react';
import { 
  Search, Play, FolderTree, Code2, CheckCircle, AlertTriangle, 
  Terminal, FileCode, CheckCircle2, ShieldAlert, Zap
} from 'lucide-react';
import { ScanResult, CryptoFinding } from '../types';

interface ScannerViewProps {
  scanResult: ScanResult | null;
  isScanning: boolean;
  onScan: (repoPath?: string) => void;
  onSelectFinding: (finding: CryptoFinding) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ 
  scanResult, isScanning, onScan, onSelectFinding 
}) => {
  const [customPath, setCustomPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const findings = scanResult?.findings || [];
  const files = Array.from(new Set(findings.map(f => f.file)));
  const currentFile = selectedFile || files[0] || 'auth_service.py';
  const fileFindings = findings.filter(f => f.file === currentFile);

  return (
    <div className="space-y-6">
      {/* Scanner Control Bar */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex items-center space-x-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="Enter repository absolute path (leave empty for Seeded Demo Repo)..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs text-white placeholder-[#64748B] font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button
            onClick={() => onScan(customPath || undefined)}
            disabled={isScanning}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isScanning ? 'Parsing AST...' : 'Run Deep AST Scan'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#94A3B8] shrink-0 font-mono">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>AST Semantic Grammar Analysis Engine</span>
        </div>
      </div>

      {/* Main Grid: File List + Code Inspector + Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Column: Scanned Files Explorer */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <FolderTree className="w-4 h-4 text-cyan-400" />
              <span>Target Source Files ({files.length})</span>
            </div>
            <span className="text-[10px] text-[#64748B] font-mono">AST Parsed</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[460px]">
            {files.map((file) => {
              const fileCount = findings.filter(f => f.file === file).length;
              const hasVuln = findings.some(f => f.file === file && f.quantum_status === 'quantum-vulnerable');
              const isSelected = currentFile === file;

              return (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-500/15 text-white border border-cyan-500/40 shadow-sm font-semibold'
                      : 'bg-[#090D16] text-[#94A3B8] hover:bg-[#131F37] border border-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${hasVuln ? 'text-red-400' : 'text-emerald-400'}`} />
                    <span className="truncate">{file}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      hasVuln ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {fileCount} primitive{fileCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Evidence & AST Finding Markers */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono">{currentFile}</span>
            </div>
            <span className="text-xs text-[#94A3B8]">
              {fileFindings.length} Cryptographic call site{fileFindings.length > 1 ? 's' : ''} detected
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
            {fileFindings.map((f) => (
              <div 
                key={f.id}
                className={`p-4 rounded-lg bg-[#090D16] border transition-all ${
                  f.quantum_status === 'quantum-vulnerable'
                    ? 'border-red-500/30 hover:border-red-500/60'
                    : (f.quantum_status === 'legacy-broken' ? 'border-amber-500/30' : 'border-emerald-500/30')
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-sm text-white">{f.algorithm}</span>
                    <span className="text-[11px] font-mono text-[#64748B]">Line {f.line}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      f.quantum_status === 'quantum-vulnerable'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : (f.quantum_status === 'legacy-broken' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
                    }`}>
                      {f.quantum_status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8] font-sans">
                    Primitive: <strong className="text-white uppercase">{f.primitive.replace('_', ' ')}</strong>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="text-xs text-[#CBD5E1]">
                    <span className="text-[#64748B]">Usage Context: </span>
                    <span className="text-cyan-300 font-medium">{f.usage}</span>
                  </div>

                  {/* Code Evidence Block */}
                  <div className="relative group">
                    <pre className="p-3 rounded bg-[#060911] border border-[#1E293B] text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed">
                      <code>{f.evidence}</code>
                    </pre>
                  </div>

                  {f.context_notes && (
                    <div className="text-[11px] text-[#94A3B8] bg-[#0E1626] p-2.5 rounded border border-[#1E293B]/60 leading-relaxed">
                      <strong className="text-white">Cryptographic Assessment: </strong>
                      {f.context_notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
