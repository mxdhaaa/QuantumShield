import React from 'react';
import { Play, Download, RefreshCw, FolderGit2, ShieldAlert, Cpu } from 'lucide-react';
import { ScanResult } from '../types';

interface HeaderProps {
  scanResult: ScanResult | null;
  isScanning: boolean;
  onScan: () => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ scanResult, isScanning, onScan, onExport }) => {
  return (
    <header className="h-16 border-b border-[#1E293B] bg-[#0A101D] px-6 flex items-center justify-between shrink-0">
      {/* Target Repo Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs text-[#94A3B8] bg-[#0F172A] px-3 py-1.5 rounded-lg border border-[#1E293B]">
          <FolderGit2 className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-white text-xs">
            {scanResult ? scanResult.repo_path.replace(/\\/g, '/').split('/').slice(-2).join('/') : 'backend/demo_repo'}
          </span>
          <span className="text-[#64748B]">|</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            AST Parser Active
          </span>
        </div>

        {scanResult && (
          <div className="hidden lg:flex items-center space-x-2 text-xs">
            <span className="text-[#64748B]">Scan ID:</span>
            <span className="font-mono text-[#CBD5E1] bg-[#1E293B] px-2 py-0.5 rounded text-[11px]">{scanResult.scan_id}</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] text-xs font-medium text-[#94A3B8] hover:text-white transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>

        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning AST...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Repository Scan</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
