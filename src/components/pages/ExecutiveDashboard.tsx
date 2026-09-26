import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FolderSearch, 
  Cpu, 
  KeyRound, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ArrowUpRight, 
  GitPullRequest,
  Zap,
  Lock,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { MOCK_REPOSITORIES, MOCK_FINDINGS, MOCK_CERTIFICATES } from '../../data/mockData';

interface ExecutiveDashboardProps {
  onNavigate: (page: string) => void;
  onOpenCopilot: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onNavigate, onOpenCopilot }) => {
  // Metric counts
  const totalRepos = MOCK_REPOSITORIES.length;
  const totalAlgorithms = 8;
  const totalCertificates = MOCK_CERTIFICATES.length;
  const criticalFindings = MOCK_FINDINGS.filter(f => f.severity === 'Critical').length;
  const readinessScore = 42; // %
  const hybridReadiness = 68; // %

  // Trend data
  const trendData = [
    { month: 'Apr 2026', risk: 88, pqcReadiness: 12, criticals: 18 },
    { month: 'May 2026', risk: 82, pqcReadiness: 24, criticals: 14 },
    { month: 'Jun 2026', risk: 74, pqcReadiness: 31, criticals: 11 },
    { month: 'Jul 2026', risk: 65, pqcReadiness: 38, criticals: 8 },
    { month: 'Aug 2026', risk: 58, pqcReadiness: 42, criticals: 6 },
    { month: 'Sep 2026', risk: 48, pqcReadiness: 58, criticals: 4 },
  ];

  // Distribution data
  const algoDistribution = [
    { name: 'RSA-2048 (Vulnerable)', count: 38, color: '#EF4444' },
    { name: 'ECDSA P-256 (Vulnerable)', count: 24, color: '#F59E0B' },
    { name: 'SHA-1 (Legacy Digest)', count: 18, color: '#DC2626' },
    { name: 'AES-256 (Quantum Safe)', count: 45, color: '#10B981' },
    { name: 'ML-KEM / Kyber (PQC Native)', count: 12, color: '#00F0FF' },
  ];

  // Heatmap domains
  const heatmapData = [
    { domain: 'Azure Auth Gateway', risk: 'Critical', score: 84, legacyCount: 14, hybridStatus: 'In Progress' },
    { domain: 'Payment Token Vault', risk: 'Critical', score: 91, legacyCount: 18, hybridStatus: 'Blocked' },
    { domain: 'Cloud KMS Wrapper', risk: 'High', score: 68, legacyCount: 8, hybridStatus: 'Testing' },
    { domain: 'Quantum Ingress Proxy', risk: 'Low', score: 18, legacyCount: 1, hybridStatus: 'Hybrid Ready' },
    { domain: 'Legacy Partner SFTP', risk: 'High', score: 78, legacyCount: 9, hybridStatus: 'Scheduled' },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-gradient-to-r from-slate-900 via-[#0B1224] to-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950/30">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Microsoft Security Center Integration
              </span>
              <span className="text-xs text-slate-400 font-mono">Last Scan: 10 mins ago</span>
            </div>

            <h1 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight">
              QUANTUM<span className="text-gradient-cyan">SHIFT</span> Executive Intelligence
            </h1>
            <p className="text-sm lg:text-base text-slate-300 max-w-2xl leading-relaxed">
              Continuous discovery, risk posture assessment, and dependency graph mapping for Post-Quantum Cryptography (PQC) readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenCopilot}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs lg:text-sm px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-cyan-200" />
              Ask Security Copilot
            </button>
            <button
              onClick={() => onNavigate('scanner')}
              className="bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs lg:text-sm px-4 py-3 rounded-xl flex items-center gap-2 transition"
            >
              <FolderSearch className="w-4 h-4 text-cyan-400" />
              Launch Scanner
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Repos Scanned */}
        <div 
          onClick={() => onNavigate('scanner')}
          className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Repositories</span>
            <FolderSearch className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalRepos}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">100% Covered</span>
          </div>
        </div>

        {/* Algorithms Discovered */}
        <div 
          onClick={() => onNavigate('findings')}
          className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Algorithms</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalAlgorithms}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-amber-400 font-semibold">3 Deprecated</span>
          </div>
        </div>

        {/* Certificates Found */}
        <div 
          onClick={() => onNavigate('certificates')}
          className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Certificates</span>
            <KeyRound className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalCertificates}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-semibold">2 Expiring Soon</span>
          </div>
        </div>

        {/* Critical Findings */}
        <div 
          onClick={() => onNavigate('findings')}
          className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer border-rose-500/30"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-rose-300">Critical Findings</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">{criticalFindings}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-semibold">Immediate Action</span>
          </div>
        </div>

        {/* Migration Readiness Score */}
        <div 
          onClick={() => onNavigate('planner')}
          className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Readiness Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">{readinessScore}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${readinessScore}%` }} />
          </div>
        </div>

        {/* Hybrid Readiness */}
        <div 
          onClick={() => onNavigate('lab')}
          className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Hybrid PQC Gate</span>
            <Lock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono">{hybridReadiness}%</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Stage 3 Active</span>
          </div>
        </div>

      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Readiness Gauge & Algorithm Distribution */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quantum Readiness Gauge & Trend Chart */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Quantum Vulnerability Index & Score Trend
                </h3>
                <p className="text-xs text-slate-400">Historical trend of Shor's algorithm risk exposure vs PQC adoption</p>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                Target: 95% by Q4 2027
              </span>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="pqcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B101D', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#F1F5F9' }}
                  />
                  <Area type="monotone" dataKey="pqcReadiness" name="PQC Readiness %" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#pqcGrad)" />
                  <Area type="monotone" dataKey="risk" name="Vulnerability Risk Index" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#riskGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-400 shrink-0" />
                <span>PQC Migration Progress: <strong className="text-cyan-300">58%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
                <span>Quantum Exposure Risk: <strong className="text-rose-400">48%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400 shrink-0" />
                <span>NIST Standards Compliant</span>
              </div>
            </div>
          </div>

          {/* Crypto Algorithm Distribution Chart */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-semibold text-white text-base">Crypto Algorithm Discovered Breakdown</h3>
                <p className="text-xs text-slate-400">Inventory of cryptographic primitives across source code AST & config files</p>
              </div>
              <button 
                onClick={() => onNavigate('findings')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <span>View Findings</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Donut Chart */}
              <div className="h-56 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={algoDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {algoDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#080C17" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0B101D', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white font-mono">137</span>
                  <span className="text-[10px] uppercase text-slate-400 tracking-wider">Total Instances</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2.5 font-mono text-xs">
                {algoDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-200 truncate">{item.name}</span>
                    </div>
                    <span className="text-white font-bold ml-2">{item.count}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (1/3): Risk Heatmap & PR CI/CD Checks */}
        <div className="space-y-6">
          
          {/* Risk Heatmap Widget */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-semibold text-white text-base">Risk Heatmap</h3>
                <p className="text-xs text-slate-400">Microservice domain risk scores</p>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                2 Critical Domains
              </span>
            </div>

            <div className="space-y-3">
              {heatmapData.map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{item.domain}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.risk === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      item.risk === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      Score: {item.score} ({item.risk})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Legacy primitives: <strong className="text-slate-200">{item.legacyCount}</strong></span>
                    <span className="text-cyan-400 font-mono">{item.hybridStatus}</span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.risk === 'Critical' ? 'bg-rose-500' :
                        item.risk === 'High' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} 
                      style={{ width: `${item.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CI/CD Security Checks & Pull Request Inspection */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-base">CI/CD Gate Status</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                Enforcing PQC
              </span>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-300 font-mono">PR #402 (BLOCKED)</span>
                  <span className="text-[10px] text-rose-400 font-bold uppercase">Critical Gate Violation</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Attempted commit of hardcoded <code className="text-rose-300">RSA-1024</code> key pair in <code className="text-slate-400">docker-compose.yml</code>.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
                  <span>Author: dev-team-lead</span>
                  <span className="text-rose-400 font-mono cursor-pointer hover:underline">View Policy Violation</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300 font-mono">PR #405 (PASSED)</span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">PQC Hybrid Validated</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Integrated <code className="text-cyan-300">ML-KEM-768</code> encapsulation wrapper in <code className="text-slate-400">quantum-ingress</code> proxy.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
                  <span>Author: sec-arch-bot</span>
                  <span className="text-emerald-400 font-mono">NIST FIPS 203 Clean</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
