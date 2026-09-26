import React, { useState, useMemo } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, 
  Node, Edge, MarkerType 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  GitFork, ShieldAlert, AlertTriangle, Layers, 
  ArrowRight, ShieldCheck, Cpu, Info 
} from 'lucide-react';
import { ScanResult, CryptoFinding, TabType } from '../types';

interface DependencyGraphViewProps {
  scanResult: ScanResult | null;
  selectedFinding: CryptoFinding | null;
  onSelectFinding: (finding: CryptoFinding) => void;
  onNavigate: (tab: TabType) => void;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  scanResult,
  selectedFinding,
  onSelectFinding,
  onNavigate
}) => {
  const [activeFindingId, setActiveFindingId] = useState<string | null>(
    selectedFinding?.id || scanResult?.findings[0]?.id || null
  );

  const depGraph = scanResult?.dependency_graph;
  const findings = scanResult?.findings || [];
  const activeFinding = findings.find(f => f.id === activeFindingId) || findings[0];
  const blastRadius = activeFinding ? depGraph?.blast_radii[activeFinding.id] : null;

  // Build React Flow nodes and edges with automatic layout positioning
  const { nodes, edges } = useMemo(() => {
    if (!depGraph) return { nodes: [], edges: [] };

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Layout tiers:
    // Tier 1: Application (Y = 50)
    // Tier 2: Services / Modules (Y = 180)
    // Tier 3: Crypto Findings / Primitives (Y = 320)
    // Tier 4: Downstream Clients / APIs (Y = 480)

    const appNodes = depGraph.nodes.filter(n => n.type === 'application');
    const serviceNodes = depGraph.nodes.filter(n => n.type === 'service');
    const cryptoNodes = depGraph.nodes.filter(n => n.type === 'crypto_primitive');
    const clientNodes = depGraph.nodes.filter(n => ['external_client', 'external_api', 'storage'].includes(n.type));

    // Place Application Nodes
    appNodes.forEach((n, idx) => {
      flowNodes.push({
        id: n.id,
        position: { x: 450 + idx * 300, y: 40 },
        data: { label: n.label },
        style: {
          background: '#0F172A',
          color: '#38BDF8',
          border: '1.5px solid #0284C7',
          borderRadius: '10px',
          padding: '12px 18px',
          fontSize: '13px',
          fontWeight: '700',
          boxShadow: '0 0 15px rgba(2, 132, 199, 0.25)'
        }
      });
    });

    // Place Service Nodes
    serviceNodes.forEach((n, idx) => {
      flowNodes.push({
        id: n.id,
        position: { x: 80 + idx * 240, y: 160 },
        data: { label: n.label },
        style: {
          background: '#111C33',
          color: '#E2E8F0',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '11px',
          fontWeight: '600'
        }
      });
    });

    // Place Crypto Primitive Nodes
    cryptoNodes.forEach((n, idx) => {
      const isSelected = activeFinding && n.id === `finding:${activeFinding.id}`;
      const isVuln = n.data.quantum_status === 'quantum-vulnerable';
      flowNodes.push({
        id: n.id,
        position: { x: 60 + idx * 210, y: 290 },
        data: { label: `${n.label}\n(${n.data.quantum_status})` },
        style: {
          background: isSelected ? '#3B0716' : '#090D16',
          color: isVuln ? '#F87171' : '#34D399',
          border: isSelected ? '2px solid #EF4444' : (isVuln ? '1px solid #7F1D1D' : '1px solid #065F46'),
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: isSelected ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none'
        }
      });
    });

    // Place Downstream Client Nodes
    clientNodes.forEach((n, idx) => {
      flowNodes.push({
        id: n.id,
        position: { x: 120 + idx * 260, y: 440 },
        data: { label: n.label },
        style: {
          background: '#0F172A',
          color: '#A855F7',
          border: '1px solid #6B21A8',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '11px',
          fontWeight: '500'
        }
      });
    });

    // Edges
    depGraph.edges.forEach((e) => {
      const isHighlighted = activeFinding && (e.source === `finding:${activeFinding.id}` || e.target === `finding:${activeFinding.id}`);
      flowEdges.push({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? '#EF4444' : '#334155',
          strokeWidth: isHighlighted ? 2.5 : 1
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#EF4444' : '#475569'
        }
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [depGraph, activeFinding]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Dependency-Aware Cryptographic Graph & Blast Radius</h2>
            <p className="text-xs text-[#94A3B8]">
              Select any cryptographic finding to inspect upstream invocation callers, data flow exposure, and downstream impact.
            </p>
          </div>
        </div>

        {/* Algorithm Quick Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#64748B] font-mono">Target:</span>
          <select
            value={activeFinding?.id || ''}
            onChange={(e) => {
              setActiveFindingId(e.target.value);
              const found = findings.find(f => f.id === e.target.value);
              if (found) onSelectFinding(found);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {findings.map(f => (
              <option key={f.id} value={f.id}>
                {f.algorithm} - {f.file}:{f.line}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Container: Interactive React Flow + Side Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px]">
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 rounded-xl bg-[#070B12] border border-[#1E293B] overflow-hidden relative shadow-inner">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={(_, node) => {
              if (node.id.startsWith('finding:')) {
                const findingId = node.id.replace('finding:', '');
                setActiveFindingId(findingId);
                const found = findings.find(f => f.id === findingId);
                if (found) onSelectFinding(found);
              }
            }}
            fitView
          >
            <Background color="#1E293B" gap={16} size={1} />
            <Controls className="bg-[#0F172A] border border-[#1E293B] text-white" />
            <MiniMap 
              nodeColor={(node) => {
                if (node.id.startsWith('finding:')) return '#EF4444';
                if (node.id.startsWith('client:')) return '#A855F7';
                return '#0284C7';
              }} 
              maskColor="rgba(8, 12, 20, 0.85)"
              className="bg-[#0F172A] border border-[#1E293B] rounded"
            />
          </ReactFlow>
        </div>

        {/* Right: Blast Radius & Impact Drawer */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#1E293B]">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Blast Radius Intelligence</h3>
                <span className="text-[11px] font-mono text-cyan-400">{activeFinding?.algorithm}</span>
              </div>
            </div>

            {/* Criticality Summary */}
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs">
              <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Impact Assessment</span>
              </div>
              <p className="text-red-200/90 leading-relaxed text-[11px]">
                {blastRadius?.criticality_summary || 'Local module impact.'}
              </p>
            </div>

            {/* Exposure Vector */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[#64748B] text-[11px] uppercase font-semibold">Data Flow Exposure:</span>
              <div className="p-2.5 rounded-lg bg-[#090D16] border border-[#1E293B] text-[#CBD5E1] text-[11px]">
                {blastRadius?.data_flow_exposure || 'Internal Service Boundary'}
              </div>
            </div>

            {/* Direct Callers */}
            <div className="space-y-1.5">
              <span className="text-[#64748B] text-[11px] uppercase font-semibold">Direct Callers & Dependents ({blastRadius?.direct_dependents.length || 0}):</span>
              <div className="space-y-1">
                {blastRadius?.direct_dependents.map((dep, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-[#E2E8F0] p-1.5 rounded bg-[#090D16] border border-[#1E293B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span className="truncate">{dep}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Indirect Downstream Systems */}
            <div className="space-y-1.5">
              <span className="text-[#64748B] text-[11px] uppercase font-semibold">Cascading Downstream Systems ({blastRadius?.indirect_dependents.length || 0}):</span>
              <div className="space-y-1">
                {blastRadius?.indirect_dependents.map((dep, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-[#94A3B8] p-1.5 rounded bg-[#090D16] border border-[#1E293B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <span className="truncate">{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('migration')}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>View Context-Aware Migration Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
