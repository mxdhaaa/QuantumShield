import React, { useState } from 'react';
import { 
  Milestone, 
  CheckSquare, 
  Square, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Sliders
} from 'lucide-react';
import { MOCK_MIGRATION_PHASES } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface MigrationPlannerProps {
  onOpenCopilot: () => void;
}

export const MigrationPlanner: React.FC<MigrationPlannerProps> = ({ onOpenCopilot }) => {
  const [phases, setPhases] = useState(MOCK_MIGRATION_PHASES);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(2);

  const toggleTask = (phaseId: number, taskId: string) => {
    const updated = phases.map(p => {
      if (p.id !== phaseId) return p;
      const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progress = Math.round((completedCount / updatedTasks.length) * 100);

      if (progress === 100 && p.progress !== 100) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }

      return {
        ...p,
        progress,
        status: progress === 100 ? ('Completed' as const) : progress > 0 ? ('In Progress' as const) : ('Upcoming' as const),
        tasks: updatedTasks
      };
    });
    setPhases(updated);
  };

  const selectedPhase = phases.find(p => p.id === selectedPhaseId) || phases[1];

  const totalTasks = phases.flatMap(p => p.tasks).length;
  const completedTasks = phases.flatMap(p => p.tasks).filter(t => t.completed).length;
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Milestone className="w-6 h-6 text-cyan-400" />
            Post-Quantum Migration Roadmap & Planner
          </h1>
          <p className="text-xs text-slate-400">
            5-Phase dependency-aware migration roadmap, NIST standards validation gates, and actionable task execution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }}
            className="bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Migration Plan</span>
          </button>
          <button
            onClick={onOpenCopilot}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Generate Copilot Action Plan</span>
          </button>
        </div>
      </div>

      {/* Overall Progress & Summary Header */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-[#0C1428] to-slate-900 border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Target Completion: Q1 2028 (NIST FIPS Compliance)
          </span>
          <h2 className="text-xl font-bold text-white">Overall Enterprise PQC Readiness: {overallProgress}%</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            {completedTasks} of {totalTasks} critical roadmap tasks executed across Confirmed (14), Probable (8), and Uncertain (3) findings.
          </p>
        </div>

        <div className="w-full md:w-64 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">{overallProgress}%</div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Phase 2 Currently Active</div>
        </div>
      </div>

      {/* 5-Phase Horizontal Timeline Selector */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {phases.map((phase) => {
          const isSelected = selectedPhaseId === phase.id;

          return (
            <div
              key={phase.id}
              onClick={() => setSelectedPhaseId(phase.id)}
              className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all ${
                isSelected 
                  ? 'border-cyan-400 bg-slate-900/90 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50' 
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">Phase {phase.id}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  phase.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                  phase.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {phase.status}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white truncate font-mono">{phase.title.split(':')[1] || phase.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1">{phase.targetWindow}</p>

              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${phase.progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Phase Detail & Dependency-Aware Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Interactive Task Checklist */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Roadmap Execution</span>
              <h3 className="text-lg font-bold text-white">{selectedPhase.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedPhase.subtitle}</p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30">
              {selectedPhase.progress}% Phase Completion
            </span>
          </div>

          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Dependency-Aware Action Checklist</h4>
            {selectedPhase.tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => toggleTask(selectedPhase.id, task.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  task.completed 
                    ? 'bg-slate-950/60 border-slate-800 opacity-75' 
                    : 'bg-slate-900/90 border-slate-700/80 hover:border-cyan-500/50'
                }`}
              >
                <div className="mt-0.5">
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 shrink-0 hover:text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                      task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      task.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Category: <strong className="text-slate-400">{task.category} Finding</strong></span>
                    <span>Assigned: <strong className="text-cyan-400">{task.assignedTeam}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Categorized Findings & Validation Gates */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Categorized Findings Box */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white text-sm border-b border-slate-800 pb-3">Findings Breakdown</h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-300">Confirmed Findings</span>
                  <div className="text-[10px] text-slate-400">100% verified AST matches</div>
                </div>
                <span className="text-xl font-bold text-rose-400">14</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-300">Probable Findings</span>
                  <div className="text-[10px] text-slate-400">High-confidence library hooks</div>
                </div>
                <span className="text-xl font-bold text-amber-400">8</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-300">Uncertain Findings</span>
                  <div className="text-[10px] text-slate-400">Requires manual SecOps review</div>
                </div>
                <span className="text-xl font-bold text-slate-400">3</span>
              </div>
            </div>
          </div>

          {/* Validation Gates Widget */}
          <div className="glass-panel rounded-2xl p-6 space-y-4 border-cyan-500/30">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-white text-sm">NIST Validation Gates</h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 text-emerald-400 border border-emerald-500/30">
                <span>NIST FIPS 203 (ML-KEM)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 text-emerald-400 border border-emerald-500/30">
                <span>NIST FIPS 204 (ML-DSA)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 text-amber-300 border border-amber-500/30">
                <span>Composite Signature Dual-Mode</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">In Testing</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
