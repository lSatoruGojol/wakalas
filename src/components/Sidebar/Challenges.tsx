import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Sparkles, ChevronRight, Play, Trophy, BrainCircuit, History, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { StaticsParameters, useStaticsSolver } from '../../hooks/useStaticsSolver';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface Props {
  onSelect: (p: StaticsParameters) => void;
  userId?: string;
}

export function Challenges({ onSelect, userId }: Props) {
  const [generating, setGenerating] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch history when userId changes or when a new challenge is generated
  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    if (!userId) return;
    try {
      const q = query(
        collection(db, 'users', userId, 'challenges'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const h: any[] = [];
      querySnapshot.forEach((doc) => {
        h.push({ id: doc.id, ...doc.data() });
      });
      setHistory(h);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const generateChallenge = async () => {
    setGenerating(true);
    setShowSolution(false);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY no encontrada. Configure VITE_GEMINI_API_KEY en las variables de entorno.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Genera un nuevo problema de estática basado en un eje con polea y palanca. Devuelve los parámetros numéricos necesarios para el simulador.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título del problema" },
              description: { type: Type.STRING, description: "Breve descripción técnica" },
              params: {
                type: Type.OBJECT,
                properties: {
                  loadA: { type: Type.NUMBER, description: "Carga en A (500-1500)" },
                  leverLength: { type: Type.NUMBER, description: "Longitud palanca (150-300)" },
                  pulleyRadius: { type: Type.NUMBER, description: "Radio polea (80-180)" },
                  distBC: { type: Type.NUMBER, description: "Distancia B-C (40-150)" },
                  distCD: { type: Type.NUMBER, description: "Distancia C-D (40-150)" },
                  distDE: { type: Type.NUMBER, description: "Distancia D-E (40-150)" }
                },
                required: ["loadA", "leverLength", "pulleyRadius", "distBC", "distCD", "distDE"]
              }
            },
            required: ["title", "description", "params"]
          }
        }
      });

      const text = response.text || '';
      const challenge = JSON.parse(text);
      setCurrentChallenge(challenge);

      if (userId) {
        try {
          await addDoc(collection(db, 'users', userId, 'challenges'), {
            ...challenge,
            createdAt: serverTimestamp()
          });
          fetchHistory();
        } catch (dbError) {
          console.error('Error guardando en Firestore:', dbError);
        }
      }
    } catch (error) {
      console.error('Error en generateChallenge:', error);
    } finally {
      setGenerating(false);
    }
  };

  const SolutionDisplay = ({ params }: { params: StaticsParameters }) => {
    const solution = useStaticsSolver(params);
    return (
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mt-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 overflow-hidden"
      >
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 block">Resolución_Analítica</span>
        <div className="space-y-3">
          {solution.steps.map((step, idx) => (
            <p key={idx} className="text-[11px] text-zinc-400 font-mono leading-relaxed border-l-2 border-cyan-500/20 pl-3">
              {step}
            </p>
          ))}
          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[8px] text-zinc-500 block uppercase mb-1">Reacción C</span>
              <span className="text-xs font-bold text-white leading-none">
                Cy: {solution.reactionC.y.toFixed(1)} N<br/>
                Cz: {solution.reactionC.z.toFixed(1)} N
              </span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[8px] text-zinc-500 block uppercase mb-1">Reacción D</span>
              <span className="text-xs font-bold text-white leading-none">
                Dy: {solution.reactionD.y.toFixed(1)} N<br/>
                Dz: {solution.reactionD.z.toFixed(1)} N
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden group shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#030712] rounded-3xl border border-white/5 flex items-center justify-center mb-6 shadow-2xl group-hover:border-cyan-500/30 transition-all">
            <BrainCircuit className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic-serif-headers decoration-cyan-500/30 underline underline-offset-4 decoration-2">Generador Cuántico</h3>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-8 px-4">AI_Neural_Engine_v4.5 • Desafíos Sincronizados</p>
          
          <div className="flex w-full gap-3">
            <button
              onClick={generateChallenge}
              disabled={generating}
              className="group relative flex-1 py-5 bg-white text-black rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-2">
                {generating ? 'CONSULTANDO...' : <>INICIAR <Sparkles className="w-4 h-4" /></>}
              </span>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "w-16 rounded-[24px] border transition-all flex items-center justify-center",
                showHistory 
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" 
                  : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              <History className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 block">Historial_Reciente</span>
            {history.length === 0 ? (
              <p className="text-[10px] text-zinc-600 font-mono text-center py-4 italic">No hay registros en el núcleo.</p>
            ) : (
              history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setCurrentChallenge(h);
                    setShowHistory(false);
                  }}
                  className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                    <span className="text-xs font-bold text-white uppercase tracking-tight truncate w-full">{h.title}</span>
                    <span className="text-[8px] text-zinc-500 font-mono uppercase italic">
                      {h.createdAt?.toDate ? h.createdAt.toDate().toLocaleDateString() : 'Cargando...'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 transition-colors" />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentChallenge && (
          <motion.div
            key={currentChallenge.id || currentChallenge.title}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-[40px] bg-[#0c0c14] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-12 h-12 border-tr-[40px] border-r border-t border-cyan-500/30" />
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Protocolo_Activo</span>
                 <h4 className="text-xs font-black text-white uppercase tracking-wider">{currentChallenge.title}</h4>
              </div>
            </div>

            <p className="text-[12px] text-zinc-400 font-light leading-relaxed font-mono px-2">{currentChallenge.description}</p>
            
            <div className="pt-6 flex flex-col gap-3">
              <div className="flex gap-4">
                <button
                  onClick={() => onSelect(currentChallenge.params)}
                  className="group flex-1 py-4 bg-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  CARGAR_SIM <Play className="w-4 h-4 fill-current group-hover:animate-ping" />
                </button>
                <button 
                  onClick={() => setShowSolution(!showSolution)}
                  className={cn(
                    "w-16 h-16 rounded-2xl border transition-all flex items-center justify-center group/btn",
                    showSolution ? "bg-amber-500/20 border-amber-500" : "bg-white/5 border-white/5 hover:bg-amber-500/10"
                  )}
                >
                  <Trophy className={cn("w-6 h-6 transition-all", showSolution ? "text-amber-500 scale-110" : "text-amber-500/50 group-hover/btn:text-amber-500")} />
                </button>
              </div>

              <AnimatePresence>
                {showSolution && <SolutionDisplay params={currentChallenge.params} />}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
