import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/90 border-y border-amber-500/30 px-4 py-2.5 backdrop-blur-md flex items-center justify-center gap-3 text-xs md:text-sm text-amber-200/90 shadow-lg shadow-amber-950/20 z-40">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <span className="font-medium tracking-wide">
        <strong className="text-amber-300 font-semibold uppercase tracking-wider text-[11px] mr-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
          Compliance Disclaimer
        </strong>
        This assessment identifies cryptographic dependencies and migration considerations. It does not prove, certify, or guarantee that a system is quantum-safe.
      </span>
    </div>
  );
};
