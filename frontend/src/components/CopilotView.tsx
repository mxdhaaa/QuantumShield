import React, { useState } from 'react';
import { 
  BotMessageSquare, Send, Sparkles, ShieldCheck, 
  BookOpen, Terminal, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { ScanResult, CryptoFinding } from '../types';
import { askCopilot } from '../api';

interface CopilotViewProps {
  scanResult: ScanResult | null;
  selectedFinding: CryptoFinding | null;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  groundedEvidence?: string[];
  nistReferences?: string[];
  suggestedActions?: string[];
}

export const CopilotView: React.FC<CopilotViewProps> = ({ scanResult, selectedFinding }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I am **QuantumShield Copilot**, your Post-Quantum Cryptography migration intelligence assistant. I reason strictly over verified AST scan findings, deterministic blast radius graphs, and NIST FIPS 203/204/205 standards.\n\nHow can I assist your PQC migration strategy today?",
      groundedEvidence: ["Grounding active: AST Scanner & Deterministic Risk Engine"],
      nistReferences: ["NIST FIPS 203 (ML-KEM)", "NIST FIPS 204 (ML-DSA)", "NIST FIPS 205 (SLH-DSA)"],
      suggestedActions: ["What should we migrate first?", "Why can't ML-KEM replace ECDSA?", "Explain this finding to a CISO."]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetQueries = [
    "What should we migrate first?",
    "Why is RSA-2048 risky?",
    "What depends on this algorithm?",
    "Why can't ML-KEM replace ECDSA?",
    "Generate a migration plan for authentication.",
    "What could break during migration?",
    "Explain this finding to a CISO."
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await askCopilot(q, selectedFinding?.id);
      const botMsg: Message = {
        sender: 'assistant',
        text: res.answer,
        groundedEvidence: res.grounded_evidence,
        nistReferences: res.nist_references,
        suggestedActions: res.suggested_actions
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "Error communicating with the QuantumShield Copilot backend. Please verify the FastAPI server is running."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">QuantumShield Grounded AI Copilot</h2>
            <p className="text-xs text-[#94A3B8]">
              Grounded reasoning over verified AST findings, dependency graphs, and NIST FIPS 203/204/205 standards.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono bg-[#090D16] px-3 py-1 rounded-lg border border-[#1E293B]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Zero Hallucination Guardrail Active</span>
        </div>
      </div>

      {/* Preset Quick Actions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-[#64748B] font-semibold shrink-0 uppercase">Suggested Prompts:</span>
        {presetQueries.map((query, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(query)}
            className="px-3 py-1 rounded-lg bg-[#0F172A] hover:bg-[#162238] border border-[#1E293B] hover:border-cyan-500/40 text-xs text-[#CBD5E1] hover:text-cyan-300 font-medium whitespace-nowrap transition-all"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] h-[460px] overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-xl text-xs leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-[#0F172A] border border-[#1E293B] text-[#E2E8F0] shadow-lg'
              }`}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap font-sans text-xs">
                {msg.text}
              </div>

              {/* Grounded Evidence Box */}
              {msg.groundedEvidence && msg.groundedEvidence.length > 0 && (
                <div className="pt-2 border-t border-[#1E293B] space-y-1">
                  <div className="text-[10px] text-[#64748B] font-mono uppercase flex items-center gap-1 font-bold">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>Grounded Scan Verification:</span>
                  </div>
                  <div className="space-y-0.5">
                    {msg.groundedEvidence.map((ev, i) => (
                      <div key={i} className="text-[11px] font-mono text-cyan-300 bg-[#060A12] px-2 py-0.5 rounded border border-[#1E293B]/60">
                        {ev}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NIST References */}
              {msg.nistReferences && msg.nistReferences.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.nistReferences.map((ref, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Reasoning over verified AST findings & standards...</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 rounded-xl bg-[#0F172A] border border-[#1E293B] flex items-center space-x-3"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask QuantumShield Copilot about algorithms, blast radius, HNDL risk, or PQC migration..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
