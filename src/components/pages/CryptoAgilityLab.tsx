import React, { useState } from 'react';
import { 
  FlaskConical, 
  Cpu, 
  Play, 
  CheckCircle2, 
  Zap, 
  Code, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Lock,
  Sparkles,
  Terminal
} from 'lucide-react';
import { CRYPTO_LAB_PROVIDERS } from '../../data/mockData';
import { CryptoProviderType } from '../../types';
import confetti from 'canvas-confetti';

interface CryptoAgilityLabProps {
  onOpenCopilot: () => void;
}

export const CryptoAgilityLab: React.FC<CryptoAgilityLabProps> = ({ onOpenCopilot }) => {
  const [selectedProvider, setSelectedProvider] = useState<CryptoProviderType>('Hybrid Provider');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const providerObj = CRYPTO_LAB_PROVIDERS[selectedProvider];

  const handleRunSimulation = () => {
    setIsRunning(true);
    setConsoleLogs([
      `[INIT] Bootstrapping ICryptoProvider abstraction interface...`,
      `[CONFIG] Hot-swapped active provider -> "${providerObj.name}"`
    ]);

    setTimeout(() => {
      setConsoleLogs(prev => [
        ...prev,
        `[KEYGEN] Generated key pair (${providerObj.keySizeBits}-bit) in ${providerObj.latencyMs}ms.`,
        `[OPER] Executing provider.sign(payload) using algorithm: ${providerObj.algorithm}...`,
      ]);
    }, 600);

    setTimeout(() => {
      setConsoleLogs(prev => [
        ...prev,
        `[SIGNATURE] Produced signature payload: ${providerObj.signatureSizeBytes} Bytes.`,
        `[VERIFY] Executing provider.verify(payload, signature) -> VALID (100% OK)`,
        `[SUCCESS] Operation completed under 0-downtime hot-swap! Quantum Safety Rating: ${providerObj.quantumSafetyScore}/100`
      ]);
      setIsRunning(false);

      if (providerObj.quantumSafetyScore > 80) {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      }
    }, 1400);
  };

  const providersList: CryptoProviderType[] = [
    'RSA Provider',
    'ECC Provider',
    'Hybrid Provider',
    'Post-Quantum Provider'
  ];

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-purple-400" />
            Crypto Agility Lab & Provider Sandbox
          </h1>
          <p className="text-xs text-slate-400">
            Demonstrate zero-downtime hot-swapping of cryptographic providers via abstraction interfaces without changing business logic
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCopilot}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Generate Agility Abstraction SDK</span>
          </button>
        </div>
      </div>

      {/* Interactive Explanation Banner */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/30 flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
          <Layers className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            The Crypto-Agility Paradigm
            <span className="text-[10px] uppercase font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
              Zero Business Logic Mutation
            </span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            By abstracting underlying cryptography behind an <code className="text-cyan-300 font-mono">ICryptoProvider</code> interface, your high-level application business logic (e.g. <code className="text-amber-300 font-mono">authService.ts</code>) calls <code className="text-emerald-300 font-mono">provider.sign()</code> and remains 100% untouched while you swap providers from RSA to Kyber/Dilithium.
          </p>
        </div>
      </div>

      {/* Provider Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {providersList.map((pName) => {
          const pData = CRYPTO_LAB_PROVIDERS[pName];
          const isSelected = selectedProvider === pName;

          return (
            <div
              key={pName}
              onClick={() => setSelectedProvider(pName)}
              className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all ${
                isSelected 
                  ? 'glass-card-selected ring-2 ring-cyan-400/80' 
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  pData.quantumSafetyScore > 80 ? 'bg-emerald-500/20 text-emerald-300' :
                  pData.quantumSafetyScore > 20 ? 'bg-amber-500/20 text-amber-300' :
                  'bg-rose-500/20 text-rose-300'
                }`}>
                  Safety: {pData.quantumSafetyScore}/100
                </span>
                <span className="text-xs font-bold text-cyan-300 font-mono">{pData.keySizeBits}b</span>
              </div>

              <h4 className="text-sm font-bold text-white font-mono">{pData.id}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pData.algorithm}</p>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Latency: {pData.latencyMs}ms</span>
                <span className="text-cyan-400 font-bold">{isSelected ? 'ACTIVE' : 'Select'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Diagram & Execution Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (6 cols): Visual Architecture Flow */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Dynamic Architecture Flow
            </h3>
            <span className="text-xs font-mono text-cyan-300">Live Provider Link</span>
          </div>

          {/* Visual Architecture Chain */}
          <div className="space-y-4 py-2 font-mono text-xs">
            
            {/* Box 1: Application Layer */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Layer 1</span>
                <span className="font-bold text-white">Application Layer (authService.ts)</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded">UNTOUCHED</span>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90" />
            </div>

            {/* Box 2: Crypto Abstraction Interface */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">Layer 2 (Abstraction)</span>
                <span className="font-bold text-cyan-200">ICryptoProvider Interface</span>
              </div>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded font-bold">hotSwap()</span>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90" />
            </div>

            {/* Box 3: Hot-Swapped Provider */}
            <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all ${
              providerObj.quantumSafetyScore > 80 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider block font-bold">Layer 3 (Engine)</span>
                <span className="font-bold text-white">{providerObj.name}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/40">
                {providerObj.quantumSafetyScore > 80 ? 'PQC SECURE' : 'VULNERABLE'}
              </span>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-1.5">
              <span>Signature Size Payload:</span>
              <strong className="text-cyan-300">{providerObj.signatureSizeBytes} Bytes</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1">
              <span>NIST Standard Compliance:</span>
              <strong className="text-purple-300">{providerObj.pqcStandards}</strong>
            </div>
          </div>

        </div>

        {/* Right Column (6 cols): Code Snippet & Sandbox Terminal Console */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Code Snippet Box */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm font-mono">Crypto-Agility Code snippet</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">TypeScript / Node.js</span>
            </div>

            <div className="bg-slate-950 border border-cyan-500/20 rounded-xl p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
              <pre>{providerObj.sampleCode}</pre>
            </div>
          </div>

          {/* Execution Console & Run Button */}
          <div className="glass-panel rounded-2xl p-6 space-y-4 border-cyan-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">Provider Sandbox Output Console</h3>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Cryptographic Simulation</span>
              </button>
            </div>

            {/* Terminal Window */}
            <div className="bg-[#05070D] border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 h-44 overflow-y-auto space-y-1.5">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-600 italic">Click "Run Cryptographic Simulation" to execute live operation against active provider...</div>
              ) : (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-snug">{log}</div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
