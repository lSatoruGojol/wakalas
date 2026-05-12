import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Sparkles, ChevronRight, Play, Trophy, BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { StaticsParameters } from '../../hooks/useStaticsSolver';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  onSelect: (p: StaticsParameters) => void;
  userId?: string;
}

export function Challenges({ onSelect, userId }: Props) {
  const [generating, setGenerating] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);

  const generateChallenge = async () => {
    setGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY no encontrada. Configure VITE_GEMINI_API_KEY en las variables de entorno.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Genera un nuevo problema de estática basado en un eje con polea y palanca. 
      Devuelve ÚNICAMENTE un objeto JSON con este formato:
      {
        "title": "string",
        "description": "string corto",
        "params": { 
          "loadA": number, 
          "leverLength": number, 
          "pulleyRadius": number, 
          "distBC": number, 
          "distCD": number, 
          "distDE": number 
        }
      }
      Rangos sugeridos: loadA(500-1500), lever(150-300), pulley(80-180), dists(40-150).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      console.log('AI response text:', text);
      
      const challenge = JSON.parse(text);
      setCurrentChallenge(challenge);

      if (userId) {
        try {
          await addDoc(collection(db, 'users', userId, 'challenges'), {
            ...challenge,
            createdAt: serverTimestamp()
          });
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

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden group shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#030712] rounded-3xl border border-white/5 flex items-center justify-center mb-6 shadow-2xl group-hover:border-cyan-500/30 transition-all">
            <BrainCircuit className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic-serif-headers decoration-cyan-500/30 underline underline-offset-4 decoration-2">Generador Cuántico</h3>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-8 px-4">AI_Neural_Engine_v4.5 • Desafíos Sincronizados</p>
          
          <button
            onClick={generateChallenge}
            disabled={generating}
            className="group relative w-full py-5 bg-white text-black rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-2">
              {generating ? 'CONSULTANDO AL NÚCLEO...' : <>INICIAR_PROCESO <Sparkles className="w-4 h-4" /></>}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {currentChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            className="p-8 rounded-[40px] bg-[#0c0c14] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl"
          >
            {/* HUD Corner */}
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
            
            <div className="pt-6 flex gap-4">
              <button
                onClick={() => onSelect(currentChallenge.params)}
                className="group flex-1 py-4 bg-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              >
                CARGAR_MÓDULO <Play className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
              </button>
              <button className="w-16 h-16 bg-white/5 rounded-2xl hover:bg-amber-500/20 border border-white/5 transition-all flex items-center justify-center group/btn">
                <Trophy className="w-6 h-6 text-amber-500/50 group-hover/btn:text-amber-500 group-hover/btn:scale-110 transition-all" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
