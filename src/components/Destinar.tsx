import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, X, Terminal, Cpu, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Destinar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: 'Protocolos de inicio completados. Soy Destinar, tu compañero de ingeniería avanzada. ¿Qué dilema de estática resolveremos hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY no encontrada. Configure VITE_GEMINI_API_KEY en su entorno.');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Actúa como 'Destinar', un asistente virtual de ingeniería mecánica futurista y elegante. 
      Tu objetivo es ayudar al usuario con problemas de Estática, específicamente el 4.150 o variaciones del mismo.
      SÉ TÉCNICO, PROFESIONAL Y MUY ATENTO. Tu lenguaje debe sonar a tecnología de punta pero cercana.
      Respuesta breve, clara y en español.
      Pregunta: ${userMsg}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.text || 'Error de sincronización con el núcleo.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Interrupción en el flujo de datos. Por favor, reintente.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        id="tutorial-step-copilot"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-40 group z-[60]"
      >
        <div className="relative">
          {/* Animated Background Rings */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse scale-150" />
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
          
          <div className="relative p-6 rounded-[24px] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl group-hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform relative z-10" />
          </div>
        </div>
        <div className="absolute right-24 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 bg-white/5 backdrop-blur-xl text-white text-[10px] font-black px-4 py-2 rounded-xl tracking-[0.2em] pointer-events-none border border-white/10 whitespace-nowrap">
          INTERFAZ_CO-PILOT
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark backdrop for focus */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[65]"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-12 right-12 w-[460px] h-[750px] bg-[#020617] rounded-[40px] z-[70] flex flex-col overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,1)] border border-white/10"
            >
              {/* Internal Accents */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[100px] pointer-events-none" />
              
              {/* Header */}
              <div className="p-8 pb-4 relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center p-3">
                      <Cpu className="w-full h-full text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic tracking-tight">AI Co-Pilot</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Active_Node_4.5</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-xl transition-all border border-white/5 group"
                    title="Cerrar Asistente"
                  >
                    <X className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto terminal-scroll px-8 py-4 space-y-6 scroll-smooth">
                {messages.map((ms, i) => (
                  <div key={i} className={cn("flex flex-col", ms.role === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn(
                      "max-w-[85%] p-5 rounded-2xl text-[13px] leading-relaxed relative",
                      ms.role === 'user' 
                        ? 'bg-cyan-600 text-white shadow-xl rounded-tr-none' 
                        : 'bg-white/[0.03] border border-white/5 text-zinc-300 rounded-tl-none'
                    )}>
                      {ms.content}
                    </div>
                    <span className="text-[7px] font-mono text-zinc-700 uppercase tracking-widest mt-1.5 px-1">
                      {ms.role === 'user' ? 'AUTH_CLIENT' : 'SYS_KERNEL'}
                    </span>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-500/50 italic px-4">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Sincronizando...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-8 pt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe un comando o consulta..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-6 pr-16 py-5 text-sm font-mono focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-zinc-700 text-white"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-2 bottom-2 w-12 bg-white hover:bg-cyan-500 transition-all text-black hover:text-white rounded-xl flex items-center justify-center z-20 group"
                  >
                    <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
