import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Sparkles, 
  Bell, 
  ChevronDown, 
  Building2, 
  CheckCircle2, 
  Activity,
  User,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  onOpenCopilot: () => void;
  activeTenant: string;
  setActiveTenant: (tenant: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCopilot,
  activeTenant,
  setActiveTenant,
  searchQuery,
  setSearchQuery
}) => {
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const tenants = [
    'QuantumShield Demo Environment',
    'Azure GovCloud Cyber Vault',
    'Woodgrove Financial Services'
  ];

  const notifications = [
    { title: 'Critical RSA-2048 Discovered', time: '10m ago', desc: 'New RSA finding in azure-auth-gateway-service', urgent: true },
    { title: 'Certificate Expiration Warning', time: '1h ago', desc: 'kms.cloud.contoso.io expires in 9 days', urgent: true },
    { title: 'Kyber Hybrid Test Passed', time: '3h ago', desc: 'Quantum proxy passed NIST FIPS 203 validation', urgent: false }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080C17]/90 border-b border-slate-800/80 backdrop-blur-xl px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      
      {/* Left: Brand & Tenant Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080C17] rounded-[11px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#080C17]" title="Scanning Engine Active" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
                QUANTUM<span className="text-gradient-cyan">SHIFT</span>
              </h1>
              <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold">
                v4.2 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Post-Quantum Migration & Crypto-Agility Engine
            </p>
          </div>
        </div>

        {/* Tenant Switcher Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg px-3 py-1.5 transition"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium truncate max-w-[180px]">{activeTenant}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showTenantDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-[#0B101D] border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                Select Microsoft Security Tenant
              </div>
              {tenants.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveTenant(t);
                    setShowTenantDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition ${
                    activeTenant === t ? 'text-cyan-400 font-semibold bg-cyan-500/10' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{t}</span>
                  {activeTenant === t && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search & Security Copilot Button */}
      <div className="flex-1 max-w-xl flex items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crypto findings, algorithms, certs, repos... (Ctrl + K)"
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            Ctrl K
          </kbd>
        </div>

        <button
          onClick={onOpenCopilot}
          className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition shadow-lg shadow-cyan-950/30 group"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden lg:inline">Security Copilot</span>
        </button>
      </div>

      {/* Right: Status Indicator & Notifications & User */}
      <div className="flex items-center gap-3">
        
        {/* Engine Status */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-900/80 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>NIST FIPS 203/204 Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 relative transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0B101D] border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Security Alerts (3)</span>
                <span className="text-[10px] text-cyan-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs hover:border-cyan-500/30 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold ${n.urgent ? 'text-rose-400' : 'text-emerald-400'}`}>{n.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-cyan-500/30">
            MS
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">SecOps Admin</div>
            <div className="text-[10px] text-slate-400 leading-tight">Azure Security Center</div>
          </div>
        </div>

      </div>

    </header>
  );
};

