import React from 'react';
import { 
  LayoutDashboard, 
  FolderSearch, 
  ShieldAlert, 
  Network, 
  KeyRound, 
  Milestone, 
  FlaskConical, 
  FileText,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export type PageId = 
  | 'dashboard'
  | 'scanner'
  | 'findings'
  | 'graph'
  | 'certificates'
  | 'planner'
  | 'lab'
  | 'reports';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  criticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  criticalCount
}) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Executive Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'findings' as PageId, label: 'Cryptographic Findings', icon: ShieldAlert, badge: criticalCount > 0 ? `${criticalCount} Crit` : null, urgent: true },
    { id: 'graph' as PageId, label: 'Dependency Intelligence Graph', icon: Network, badge: 'Interactive', showstopper: true },
    { id: 'certificates' as PageId, label: 'Certificate Intelligence', icon: KeyRound, badge: '5 Certs' },
    { id: 'planner' as PageId, label: 'Migration Planner', icon: Milestone, badge: 'Phase 2' },
    { id: 'lab' as PageId, label: 'Crypto Agility Lab', icon: FlaskConical, badge: 'Sandbox' },
    { id: 'reports' as PageId, label: 'Reports Center', icon: FileText, badge: 'PDF' },
  ];

  return (
    <aside className="w-64 bg-[#080C17]/95 border-r border-slate-800/80 shrink-0 min-h-[calc(100vh-65px)] p-3 flex flex-col justify-between">
      
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold flex items-center justify-between">
          <span>Platform Modules</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-purple-600/10 border border-cyan-500/40 text-cyan-300 font-semibold shadow-lg shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-slate-900 text-slate-400 group-hover:text-cyan-300'
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold ${
                    item.showstopper
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm shadow-cyan-500/30'
                      : item.urgent
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                }`} />
              </div>

              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-glow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom PQC Status Card */}
      <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0B101D] border border-cyan-500/20 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            NIST Standard 2026
          </span>
          <span className="text-[10px] font-mono text-cyan-400">KYBER & DILITHIUM</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Full compliance active for NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) migration standards.
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
          <span>Agility Level:</span>
          <span className="text-emerald-400 font-mono font-semibold">Stage 3 (Hybrid)</span>
        </div>
      </div>

    </aside>
  );
};

