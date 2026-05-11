import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StaticsParameters, StaticsResult } from '../hooks/useStaticsSolver';
import { 
  Settings2, 
  BookOpen, 
  RefreshCcw, 
  ArrowRight, 
  Target, 
  LayoutDashboard,
  Brain,
  History,
  Terminal
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Challenges } from './Sidebar/Challenges';

interface Props {
  params: StaticsParameters;
  setParams: (p: StaticsParameters) => void;
  result: StaticsResult;
  userId?: string;
}

type Tab = 'CONFIG' | 'LOGS' | 'CHALLENGES';

export function SolverPanel({ params, setParams, result, userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('CONFIG');
  const [expanded, setExpanded] = useState(false);

  const updateParam = (key: keyof StaticsParameters, val: number) => {
    setParams({ ...params, [key]: val });
  };

  const tabs = [
    { id: 'CONFIG', icon: Settings2, label: 'Parámetros', desc: 'Inputs & Control' },
    { id: 'LOGS', icon: BookOpen, label: 'Cálculos', desc: 'Matemática Vectorial' },
    { id: 'CHALLENGES', icon: Brain, label: 'Misiones', desc: 'Entrenamiento' },
  ];

  return (
    <>
      {/* Sidebar Navigation - Sleek Vertical Bar */}
      <div id="tutorial-step-sidebar" className="fixed top-0 right-0 h-screen w-20 bg-[#020617]/80 backdrop-blur-3xl border-l border-white/5 z-[60] flex flex-col items-center py-20 gap-8 shadow-[-10px_0_40px_rgba(0,0,0,0.5)]">
        <div className="mb-10 flex flex-col items-center">
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center p-3 border border-white/10 group hover:border-cyan-500/50 transition-all cursor-pointer">
              <LayoutDashboard className="w-full h-full text-zinc-500 group-hover:text-cyan-400 transition-colors" />
           </div>
        </div>

        <div className="flex flex-col gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                setExpanded(true);
              }}
              className={cn(
                "group relative w-14 h-14 flex flex-col items-center justify-center rounded-2xl transition-all duration-500",
                activeTab === tab.id && expanded
                  ? "bg-white text-black shadow-xl scale-110" 
                  : "text-zinc-600 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id && expanded ? "text-cyan-600" : "group-hover:text-cyan-400")} />
              
              {activeTab === tab.id && expanded && (
                <motion.div 
                  layoutId="sidebarActive"
                  className="absolute -right-px top-2 bottom-2 w-0.5 bg-cyan-500 rounded-l-full shadow-[0_0_15px_rgba(6,182,212,1)]" 
                />
              )}
              
              {/* Tooltip */}
              <div className="absolute right-24 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0 bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white whitespace-nowrap">
                {tab.label}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto pb-12 flex flex-col items-center gap-4">
           <div className="w-px h-16 bg-gradient-to-b from-white/10 to-transparent" />
           <span className="text-[7px] font-mono text-zinc-800 vertical-text font-black tracking-[0.5em] uppercase">Statix_Core</span>
        </div>
      </div>

      {/* Main Terminal Panel */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop for focus */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[40]"
            />

            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-12 bottom-12 right-28 w-[90vw] max-w-[800px] z-50 pointer-events-auto"
            >
              <div className="w-full h-full bg-[#020617]/90 backdrop-blur-[50px] rounded-[48px] border border-white/10 flex flex-col relative overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
                {/* Visual Ornaments */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none" />
                
                {/* Header Section */}
                <div className="relative z-10 px-12 pt-12 pb-8 flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                      </div>
                      <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
                        {tabs.find(t => t.id === activeTab)?.label}
                      </h2>
                    </div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.6em] pl-10">Diagnostic_Panel • {activeTab}_v4</p>
                  </div>
                  
                  <button 
                    onClick={() => setExpanded(false)}
                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 active:scale-95 group"
                  >
                    <RefreshCcw className="w-5 h-5 text-zinc-500 group-hover:text-white transition-all duration-500" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative z-10 overflow-y-auto terminal-scroll px-12">
                  <AnimatePresence mode="wait">
                    {activeTab === 'CONFIG' && (
                      <motion.div
                        key="config"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="space-y-10 pb-12"
                      >
                        {/* Control Grid */}
                        <div className="grid grid-cols-1 gap-8">
                          <ParamSlider label="Fuerza Axial (P)" value={params.loadA} unit="N" min={100} max={2000} color="text-rose-500" icon="⚡" onChange={(v) => updateParam('loadA', v)} />
                          <ParamSlider label="Brazo Palanca (AB)" value={params.leverLength} unit="mm" min={100} max={500} color="text-emerald-500" icon="📏" onChange={(v) => updateParam('leverLength', v)} />
                          <ParamSlider label="Sistema Rotor (E)" value={params.pulleyRadius} unit="mm" min={50} max={300} color="text-sky-500" icon="🌀" onChange={(v) => updateParam('pulleyRadius', v)} />
                        </div>

                        {/* Real-time Telemetry */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                          <ResultCard label="Output Tension" value={`${result.tension.toFixed(0)}N`} color="text-cyan-400" status="Optimal" />
                          <ResultCard label="Convergence" value="Stable" color="text-emerald-400" status="Synced" />
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Other tabs follow similar layout patterns... */}
                    {activeTab === 'LOGS' && (
                      <motion.div
                        key="logs"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="h-full flex flex-col pb-12"
                      >
                         <div className="bg-black/40 rounded-[32px] border border-white/5 overflow-hidden flex flex-col h-full shadow-inner">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <Terminal className="w-5 h-5 text-cyan-500" />
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Procedural_Calculations</span>
                               </div>
                               <div className="flex gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                  <div className="w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                               </div>
                            </div>
                            <div className="flex-1 p-10 font-mono text-[11px] space-y-6 overflow-y-auto">
                               {result.steps.map((step, i) => (
                                 <motion.div 
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: i * 0.04 }}
                                   key={i} className="flex gap-8 group"
                                  >
                                    <span className="text-zinc-700 font-black shrink-0 w-8">{(i + 1).toString().padStart(2, '0')}</span>
                                    <p className="text-zinc-300 font-light group-hover:text-white transition-colors">{step}</p>
                                 </motion.div>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'CHALLENGES' && (
                      <motion.div
                        key="challenges"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full flex flex-col pb-12"
                      >
                        <Challenges onSelect={(p) => setParams(p)} userId={userId} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Status Footer */}
                <div className="px-12 py-10 border-t border-white/5 bg-black/20 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-8">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Compute_Efficiency</span>
                        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: '68%' }} 
                             className="h-full bg-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                           />
                        </div>
                      </div>
                      <div className="h-6 w-px bg-white/5" />
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">Engine_Safe_Lock</span>
                   </div>
                   
                   <button 
                     onClick={() => window.print()}
                     className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-cyan-400 hover:text-white transition-all shadow-xl active:scale-95"
                   >
                     Generar Reporte
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ResultCard({ label, value, color, status }: { label: string, value: string, color: string, status?: string }) {
  return (
    <div className="relative group p-8 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[32px] overflow-hidden transition-all hover:border-white/10 hover:bg-white/[0.05]">
      <div className="absolute top-0 right-0 p-6 flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
         <span className="text-[7px] font-mono tracking-widest text-emerald-500 uppercase">{status || 'LIVE'}</span>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-cyan-500 transition-colors">{label}</span>
        <p className={`text-5xl font-black font-mono tracking-tighter transition-all duration-700 group-hover:scale-105 origin-left ${color}`}>{value}</p>
      </div>

      <div className="mt-8 flex gap-1">
         {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
           <div key={i} className={cn("h-1 flex-1 rounded-full bg-white/5 transition-all duration-500", i < 5 && "bg-cyan-500/20 group-hover:bg-cyan-500/40")} />
         ))}
      </div>
    </div>
  );
}

function ParamSlider({ label, value, min, max, unit, icon, color = "text-cyan-400", onChange }: { label: string, value: number, min: number, max: number, unit?: string, icon?: string, color?: string, onChange: (v: number) => void }) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="group space-y-8 p-6 rounded-[32px] transition-all hover:bg-white/[0.02]">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-cyan-500/10 group-hover:scale-110 transition-all border border-white/5 shadow-inner">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1 italic">Input_Module_01</span>
            <label className="text-[13px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none group-hover:text-white transition-colors">{label}</label>
          </div>
        </div>
        <div className="flex items-baseline gap-2 bg-black/60 px-5 py-2.5 rounded-2xl border border-white/5 shadow-2xl">
          <span className={`text-3xl font-black font-mono tracking-tighter ${color}`}>{value}</span>
          <span className="text-[10px] font-mono text-zinc-600 uppercase font-bold tracking-tighter">{unit}</span>
        </div>
      </div>

      <div className="relative h-14 flex items-center group/slider">
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full h-1.5 bg-white/5 rounded-full relative overflow-hidden">
             <div className="absolute inset-y-0 left-0 bg-white/10 w-full animate-shimmer" />
          </div>
        </div>
        
        <div 
          className="absolute h-1.5 bg-gradient-to-r from-cyan-600 via-cyan-400 to-white rounded-full shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300 pointer-events-none" 
          style={{ width: `${percentage}%` }}
        >
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)] group-hover/slider:scale-125 transition-transform" />
        </div>

        <input 
          type="range" 
          min={min} max={max} step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-full bg-transparent appearance-none cursor-pointer z-10 accent-transparent"
        />
      </div>
    </div>
  );
}
