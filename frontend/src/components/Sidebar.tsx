import React from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, Database, 
  GitFork, AlertTriangle, Compass, PlayCircle, 
  CheckCircle2, BotMessageSquare, ShieldAlert
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'scanner' 
  | 'inventory' 
  | 'dependencies' 
  | 'risk' 
  | 'migration' 
  | 'simulator' 
  | 'validation' 
  | 'copilot';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  vulnCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, vulnCount }) => {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'scanner' as TabType, label: 'Repository Scanner', icon: Search },
    { id: 'inventory' as TabType, label: 'Cryptographic Inventory', icon: Database },
    { id: 'dependencies' as TabType, label: 'Dependency Graph', icon: GitFork },
    { id: 'risk' as TabType, label: 'Quantum Risk Analysis', icon: AlertTriangle, badge: vulnCount > 0 ? `${vulnCount}` : undefined, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { id: 'migration' as TabType, label: 'Migration Planner', icon: Compass },
    { id: 'simulator' as TabType, label: 'Crypto-Agility Simulator', icon: PlayCircle },
    { id: 'validation' as TabType, label: 'Validation & Rescan', icon: CheckCircle2 },
    { id: 'copilot' as TabType, label: 'QuantumShield Copilot', icon: BotMessageSquare, badge: 'AI Grounded', badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
  ];

  return (
    <aside className="w-64 bg-[#0A101D] border-r border-[#1E293B] flex flex-col justify-between h-screen select-none shrink-0">
      <div>
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-[#1E293B] flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              QuantumShield
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">v1.0</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] tracking-wider uppercase font-medium">Post-Quantum Scanner</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Core Platform</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-[#94A3B8] hover:bg-[#131F37] hover:text-[#E2E8F0] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* NIST Compliance Footer Card */}
      <div className="p-3 m-3 rounded-lg bg-[#0F172A] border border-[#1E293B]">
        <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>NIST Standardized PQC</span>
        </div>
        <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed">
          FIPS 203 (ML-KEM) • FIPS 204 (ML-DSA) • FIPS 205 (SLH-DSA)
        </p>
      </div>
    </aside>
  );
};
