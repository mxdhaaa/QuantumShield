import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { MOCK_REPOSITORIES, MOCK_FINDINGS, MOCK_CERTIFICATES } from '../../data/mockData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportsCenterProps {
  onOpenCopilot: () => void;
  tenantName: string;
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({ onOpenCopilot, tenantName }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [reportAudience, setReportAudience] = useState<'CISO Executive' | 'DevOps & SecOps' | 'Audit & Compliance'>('CISO Executive');

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#070A14',
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`QUANTUMSHIFT_PQC_Assessment_Report_${tenantName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Executive Reports Center
          </h1>
          <p className="text-xs text-slate-400">
            Generate, preview, and export high-fidelity CISO reports for Post-Quantum Migration Readiness
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={reportAudience}
            onChange={(e: any) => setReportAudience(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500"
          >
            <option value="CISO Executive">CISO Executive Report</option>
            <option value="DevOps & SecOps">DevOps & SecOps Technical Audit</option>
            <option value="Audit & Compliance">NIST Compliance & Legal Report</option>
          </select>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-cyan-200" />
            <span>{isExporting ? 'Generating PDF...' : 'Export Executive PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable / Canvas Report Preview Window */}
      <div 
        ref={reportRef} 
        className="glass-panel rounded-2xl p-8 lg:p-12 space-y-8 bg-[#070A14] border-cyan-500/30 text-slate-100 shadow-2xl font-sans relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Report Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider text-white">
                QUANTUM<span className="text-cyan-400">SHIFT</span>
              </span>
              <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono">
                CONFIDENTIAL CISO AUDIT
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-200">Post-Quantum Cryptography Migration Assessment</h2>
            <p className="text-xs text-slate-400 font-mono">Tenant Scope: {tenantName}</p>
          </div>

          <div className="text-right text-xs font-mono space-y-1 text-slate-400">
            <div>Generated Date: <strong>September 26, 2026</strong></div>
            <div>NIST Standard: <strong>FIPS 203 / FIPS 204 Compliant</strong></div>
            <div>Readiness Rating: <strong className="text-cyan-300">Stage 3 (Hybrid)</strong></div>
          </div>
        </div>

        {/* Mandatory Disclaimer Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-amber-300 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Compliance & Guarantee Disclaimer
          </div>
          <p className="leading-relaxed">
            This assessment identifies cryptographic dependencies and migration considerations. It does not prove, certify, or guarantee that a system is quantum-safe.
          </p>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            1. Executive Summary
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            QUANTUMSHIFT performed static code analysis, certificate inventorying, and dependency graph topology parsing across <strong>{MOCK_REPOSITORIES.length} repositories</strong> and <strong>{MOCK_CERTIFICATES.length} enterprise TLS certificates</strong>. The organization currently exhibits an overall Post-Quantum Readiness Score of <strong>42%</strong>.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Critical RSA Primitives</div>
              <div className="text-xl font-bold text-rose-400">4 Findings</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Expiring Certificates</div>
              <div className="text-xl font-bold text-amber-400">2 Certs (&lt;50d)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Hybrid PQC Gate</div>
              <div className="text-xl font-bold text-emerald-400">Active (ML-KEM)</div>
            </div>
          </div>
        </div>

        {/* Section 2: Confirmed Findings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            2. Confirmed Cryptographic Findings
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {MOCK_FINDINGS.slice(0, 3).map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{f.file} (Line {f.line})</div>
                  <div className="text-[10px] text-slate-400">{f.evidence}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {f.algorithm} ({f.severity})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Certificate Inventory */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            3. Enterprise Certificate Inventory
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {MOCK_CERTIFICATES.slice(0, 3).map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{c.name}</div>
                  <div className="text-[10px] text-slate-400">Issuer: {c.issuer} • Key: {c.keyType} ({c.keySize}-bit)</div>
                </div>
                <span className="text-[10px] font-bold text-amber-300">
                  Expires: {c.expirationDate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Migration Priorities & Compatibility Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
              4. Immediate Migration Priorities
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-mono">
              <li>Hot-swap RSA-2048 in <code className="text-cyan-300">azure-auth-gateway-service</code> to ML-KEM-768.</li>
              <li>Deprecate SHA1withRSA in <code className="text-cyan-300 font-mono">payment-token-vault-api</code>.</li>
              <li>Upgrade BouncyCastle dependency to version &gt;=1.78.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
              5. Testing Recommendations & Limitations
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Validate TLS 1.3 handshake latency when negotiating composite Kyber768 ciphertext (1088 bytes) over legacy network middleboxes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>QUANTUMSHIFT Enterprise Report Generator</span>
          <span>Page 1 of 1 • Internal CISO Copy</span>
        </div>

      </div>

    </div>
  );
};
