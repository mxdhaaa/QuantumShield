import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface SecurityCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityCopilotModal: React.FC<SecurityCopilotModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; code?: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am QUANTUMSHIFT Security Copilot. I analyze your enterprise codebase, certificate store, and dependency graph for Post-Quantum Readiness. How can I assist your migration team today?'
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Which repositories contain critical RSA-2048 findings?',
    'Explain how to replace SHA-1 with ML-DSA-65 in Java',
    'Summarize our Certificate expiration timeline for Q4 2026',
    'How does Crypto Agility decoupling work?'
  ];

  const handleSend = (textToSend?: string) => {
    const promptText = textToSend || query;
    if (!promptText.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: promptText }];
    setMessages(newMessages);
    setQuery('');
    setIsAnalyzing(true);

    setTimeout(() => {
      let botReply = '';
      let botCode = undefined;

      if (promptText.toLowerCase().includes('rsa') || promptText.toLowerCase().includes('critical')) {
        botReply = 'Based on QUANTUMSHIFT discovery index: 2 repositories contain critical RSA-2048 findings (`azure-auth-gateway-service` and `payment-token-vault-api`). RSA-2048 provides zero security against Shor\'s algorithm on a ~2000 qubit quantum computer. We recommend immediate transition to ML-KEM-768 for key exchange.';
        botCode = `// Recommended PQC Replacement (NIST FIPS 203)
import { MLKEM768 } from '@quantumshift/pqc-crypto';

const kem = new MLKEM768();
const { publicKey, ciphertext, sharedSecret } = await kem.encapsulate();`;
      } else if (promptText.toLowerCase().includes('sha-1') || promptText.toLowerCase().includes('java')) {
        botReply = 'In `payment-token-vault-api/SignatureValidator.java:88`, SHA-1 is coupled with RSA signatures. Upgrade your BouncyCastle provider to >=1.78 and update your signature initialization to use Dilithium3 (ML-DSA-65).';
        botCode = `// Upgraded Java Cryptography Provider
Signature sig = Signature.getInstance("ML-DSA-65", "BCPQC");
sig.initSign(privateKey);
sig.update(data);`;
      } else if (promptText.toLowerCase().includes('certificate')) {
        botReply = 'Found 2 critical certificates expiring within 50 days (`api.contoso-payments.com` & `kms.cloud.contoso.io`). Neither currently supports composite hybrid headers (Dilithium + RSA). You should issue hybrid certificates before Q4 2026.';
      } else {
        botReply = 'QUANTUMSHIFT has analyzed 5 repositories, 8 critical algorithms, and 5 enterprise TLS certificates. Migration readiness is currently 42%. Transitioning legacy providers to Crypto-Agile abstractions is your highest priority step.';
      }

      setMessages([...newMessages, { role: 'assistant', text: botReply, code: botCode }]);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B101D] border border-cyan-500/30 rounded-2xl w-full max-w-2xl shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                Security Copilot Intelligence
                <span className="text-[10px] uppercase tracking-widest font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Microsoft Security Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">Post-Quantum Cryptographic Context & Remediation AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-sm">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                m.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-900/30' 
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.code && (
                  <div className="mt-3 bg-slate-950 border border-cyan-500/20 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                    <pre>{m.code}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex gap-3 justify-start items-center text-cyan-400 text-xs">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 animate-spin" />
              </div>
              <span className="animate-pulse">Copilot is querying cryptographic dependency graph...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-2 bg-slate-900/40 border-t border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs text-slate-300 hover:text-cyan-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-full px-3 py-1 whitespace-nowrap transition flex items-center gap-1 shrink-0"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Security Copilot about PQC migration, RSA findings, certificates..."
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || isAnalyzing}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition shadow-lg shadow-cyan-900/40"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </div>

      </div>
    </div>
  );
};
