import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position, 
  MarkerType,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Network, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  Search, 
  ZoomIn, 
  Layers, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';

interface DependencyIntelligenceGraphProps {
  onOpenCopilot: () => void;
}

// Custom Node Component for high-tech Cyber aesthetic
const CustomCyberNode = ({ data, selected }: any) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'border-rose-500 bg-[#160B12] text-rose-300 shadow-rose-950/50 glow-red';
      case 'High': return 'border-amber-500 bg-[#171208] text-amber-300 shadow-amber-950/50';
      case 'Medium': return 'border-yellow-500 bg-[#181608] text-yellow-300 shadow-yellow-950/50';
      case 'Safe':
      case 'Low': return 'border-emerald-500 bg-[#081812] text-emerald-300 shadow-emerald-950/50';
      default: return 'border-cyan-500 bg-[#08121E] text-cyan-300';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'application': return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', label: 'App' };
      case 'service': return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', label: 'Service' };
      case 'dependency': return { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', label: 'Dependency' };
      case 'library': return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', label: 'Library' };
      case 'certificate': return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'Cert' };
      case 'algorithm': return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'Algorithm' };
      default: return { bg: 'bg-slate-700 text-slate-300 border-slate-600', label: type };
    }
  };

  const badge = getTypeBadge(data.type);
  const isHighlight = data.isHighlighted;

  return (
    <div className={`px-4 py-3 rounded-2xl border-2 shadow-2xl transition-all duration-300 w-56 font-sans ${
      getRiskColor(data.riskLevel)
    } ${selected || isHighlight ? 'ring-2 ring-cyan-400 scale-105 shadow-cyan-500/50' : 'opacity-90'}`}>
      
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !w-2.5 !h-2.5" />
      
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.bg}`}>
          {badge.label}
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-400">{data.riskLevel} Risk</span>
      </div>

      <div className="font-bold text-xs text-white truncate my-1 font-mono tracking-tight">
        {data.label}
      </div>

      {data.details?.version && (
        <div className="text-[10px] font-mono text-slate-400 truncate">
          ver: {data.details.version}
        </div>
      )}

      {data.details?.pqcReplacement && (
        <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-cyan-300 flex items-center gap-1 font-mono">
          <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">{data.details.pqcReplacement}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2.5 !h-2.5" />
    </div>
  );
};

const nodeTypes = { customCyber: CustomCyberNode };

export const DependencyIntelligenceGraph: React.FC<DependencyIntelligenceGraphProps> = ({ onOpenCopilot }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [highlightPath, setHighlightPath] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  // Initial Graph Hierarchy
  const initialNodes: Node[] = [
    // Applications
    { id: 'app-1', type: 'customCyber', position: { x: 350, y: 0 }, data: { label: 'Enterprise Web Portal', type: 'application', riskLevel: 'Critical', details: { description: 'Main customer-facing portal and API router.', version: 'v3.8.2' } } },
    { id: 'app-2', type: 'customCyber', position: { x: 800, y: 0 }, data: { label: 'Cloud Storage API', type: 'application', riskLevel: 'High', details: { description: 'Microservice handling object storage encryptions.', version: 'v2.1.0' } } },

    // Services
    { id: 'srv-1', type: 'customCyber', position: { x: 200, y: 140 }, data: { label: 'Authentication Service', type: 'service', riskLevel: 'Critical', details: { description: 'OAuth2 & SAML Token issuer.', version: 'v4.0' } } },
    { id: 'srv-2', type: 'customCyber', position: { x: 500, y: 140 }, data: { label: 'Payment Vault API', type: 'service', riskLevel: 'Critical', details: { description: 'PCI-DSS Tokenization & Credit Card Vault.', version: 'v5.1' } } },
    { id: 'srv-3', type: 'customCyber', position: { x: 800, y: 140 }, data: { label: 'KMS Keywrapper Service', type: 'service', riskLevel: 'High', details: { description: 'HSM Master Key Wrapping Service.', version: 'v1.4' } } },

    // Dependencies
    { id: 'dep-1', type: 'customCyber', position: { x: 100, y: 280 }, data: { label: 'OpenSSL 1.1.1', type: 'dependency', riskLevel: 'Critical', details: { description: 'Deprecated C crypto engine.', version: '1.1.1w' } } },
    { id: 'dep-2', type: 'customCyber', position: { x: 350, y: 280 }, data: { label: 'BouncyCastle 1.65', type: 'dependency', riskLevel: 'High', details: { description: 'Java Security provider lacking PQC native primitives.', version: '1.65' } } },
    { id: 'dep-3', type: 'customCyber', position: { x: 650, y: 280 }, data: { label: 'Go Crypto/ECDH', type: 'dependency', riskLevel: 'High', details: { description: 'Golang Elliptic curve package.', version: 'go1.22' } } },
    { id: 'dep-4', type: 'customCyber', position: { x: 950, y: 280 }, data: { label: 'Kyber768 Hybrid Proxy', type: 'dependency', riskLevel: 'Safe', details: { description: 'Post-Quantum Dual KEM wrapper.', version: 'v1.0.2', pqcReplacement: 'ML-KEM-768 Active' } } },

    // Libraries / Certs
    { id: 'lib-1', type: 'customCyber', position: { x: 100, y: 420 }, data: { label: 'libcrypto.so', type: 'library', riskLevel: 'Critical', details: { description: 'Low-level shared object library.', version: '1.1.1' } } },
    { id: 'cert-1', type: 'customCyber', position: { x: 450, y: 420 }, data: { label: '*.contoso-payments.com', type: 'certificate', riskLevel: 'Critical', details: { description: 'RSA-2048 Signed Certificate.', version: 'Expires Nov 2026' } } },
    { id: 'cert-2', type: 'customCyber', position: { x: 800, y: 420 }, data: { label: 'kms.cloud.contoso.io', type: 'certificate', riskLevel: 'High', details: { description: 'ECC P-256 TLS Certificate.', version: 'Expires Oct 2026' } } },

    // Algorithms
    { id: 'alg-1', type: 'customCyber', position: { x: 100, y: 560 }, data: { label: 'RSA-2048', type: 'algorithm', riskLevel: 'Critical', details: { description: 'Vulnerable to Shor\'s Quantum Algorithm.', pqcReplacement: 'Migrate to ML-KEM-768' } } },
    { id: 'alg-2', type: 'customCyber', position: { x: 400, y: 560 }, data: { label: 'SHA1withRSA', type: 'algorithm', riskLevel: 'Critical', details: { description: 'Legacy Digest & Asymmetric Signature.', pqcReplacement: 'Migrate to ML-DSA-65' } } },
    { id: 'alg-3', type: 'customCyber', position: { x: 700, y: 560 }, data: { label: 'ECDSA P-256', type: 'algorithm', riskLevel: 'High', details: { description: 'Discrete Log vulnerable to quantum attack.', pqcReplacement: 'Upgrade to X25519+MLKEM' } } },
    { id: 'alg-4', type: 'customCyber', position: { x: 950, y: 560 }, data: { label: 'ML-KEM-768 (PQC)', type: 'algorithm', riskLevel: 'Safe', details: { description: 'NIST FIPS 203 Standardized Quantum Security.', pqcReplacement: 'Quantum Safe' } } },
  ];

  const initialEdges: Edge[] = [
    // App to Service
    { id: 'e1', source: 'app-1', target: 'srv-1', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
    { id: 'e2', source: 'app-1', target: 'srv-2', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
    { id: 'e3', source: 'app-2', target: 'srv-3', animated: true, style: { stroke: '#F59E0B', strokeWidth: 2 } },

    // Service to Dependency
    { id: 'e4', source: 'srv-1', target: 'dep-1', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
    { id: 'e5', source: 'srv-2', target: 'dep-2', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
    { id: 'e6', source: 'srv-3', target: 'dep-3', animated: true, style: { stroke: '#F59E0B', strokeWidth: 2 } },
    { id: 'e7', source: 'srv-3', target: 'dep-4', animated: true, style: { stroke: '#10B981', strokeWidth: 2 } },

    // Dependency to Library / Cert
    { id: 'e8', source: 'dep-1', target: 'lib-1', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
    { id: 'e9', source: 'dep-2', target: 'cert-1', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
    { id: 'e10', source: 'dep-3', target: 'cert-2', animated: true, style: { stroke: '#F59E0B', strokeWidth: 2 } },

    // Library / Cert to Algorithm
    { id: 'e11', source: 'lib-1', target: 'alg-1', animated: true, style: { stroke: '#EF4444', strokeWidth: 3 } },
    { id: 'e12', source: 'cert-1', target: 'alg-2', animated: true, style: { stroke: '#EF4444', strokeWidth: 3 } },
    { id: 'e13', source: 'cert-2', target: 'alg-3', animated: true, style: { stroke: '#F59E0B', strokeWidth: 3 } },
    { id: 'e14', source: 'dep-4', target: 'alg-4', animated: true, style: { stroke: '#00F0FF', strokeWidth: 3 } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Path highlighting on node click
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);

    // Compute connected path
    const connected: string[] = [node.id];
    initialEdges.forEach(e => {
      if (e.source === node.id) connected.push(e.target);
      if (e.target === node.id) connected.push(e.source);
    });

    setHighlightPath(connected);

    setNodes(nds => nds.map(n => ({
      ...n,
      data: {
        ...n.data,
        isHighlighted: connected.includes(n.id)
      }
    })));
  }, [setNodes]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-mono text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md shadow-lg shadow-cyan-500/20">
              SHOWSTOPPER INTERACTIVE DEMO
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
            <Network className="w-6 h-6 text-cyan-400" />
            Dependency Intelligence Graph
          </h1>
          <p className="text-xs text-slate-400">
            Interactive visual topology mapping: <strong className="text-slate-200">Application → Service → Dependency → Library → Certificate → Algorithm</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCopilot}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Ask Copilot About Graph Topology</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Graph Window (8 or 9 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-2 relative h-[680px] overflow-hidden border border-cyan-500/30 shadow-2xl">
          
          {/* Legend Banner */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-3 text-xs space-y-2 font-mono">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Risk Legend
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-rose-400 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical PQC Exposure</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Vulnerability</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Quantum Safe / Hybrid</span>
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#1E293B" gap={20} size={1} />
            <Controls />
            <MiniMap 
              style={{ backgroundColor: '#0B101D', border: '1px solid #1E293B', borderRadius: '12px' }}
              nodeColor={(n: any) => {
                if (n.data?.riskLevel === 'Critical') return '#EF4444';
                if (n.data?.riskLevel === 'High') return '#F59E0B';
                if (n.data?.riskLevel === 'Safe') return '#10B981';
                return '#38BDF8';
              }}
            />
          </ReactFlow>

        </div>

        {/* Right Drawer (4 cols): Selected Node Inspection Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {selectedNode ? (
            <div className="glass-panel rounded-2xl p-6 border-cyan-500/40 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Node Inspector
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  selectedNode.data.riskLevel === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  selectedNode.data.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {selectedNode.data.riskLevel} Risk
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedNode.data.label}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedNode.data.details?.description}</p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Hierarchy Level:</span>
                  <span className="text-cyan-300 capitalize">{selectedNode.data.type}</span>
                </div>

                {selectedNode.data.details?.version && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Version:</span>
                    <span className="text-slate-200">{selectedNode.data.details.version}</span>
                  </div>
                )}

                {selectedNode.data.details?.pqcReplacement && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      Migration Action Plan
                    </span>
                    <p className="text-xs text-cyan-200">{selectedNode.data.details.pqcReplacement}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={onOpenCopilot}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Analyze Node Path in Copilot</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[300px]">
              <Info className="w-8 h-8 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Click Any Graph Node to Inspect</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Selecting a node highlights its complete dependency chain across Applications, Libraries, Certificates, and Cryptographic Algorithms.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
