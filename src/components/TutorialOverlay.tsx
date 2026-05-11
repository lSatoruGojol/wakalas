import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles, Target, MousePointer2, Cpu, Settings2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface Step {
  id: string;
  targetId: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    targetId: 'tutorial-step-welcome',
    title: 'Statix Prime Core',
    content: 'Bienvenido al entorno de simulación de estática más avanzado. Aquí podrás resolver problemas complejos con precisión milimétrica.',
    icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
    position: 'center'
  },
  {
    id: 'canvas',
    targetId: 'tutorial-step-canvas',
    title: 'Simulación Geoespacial',
    content: 'Interactúa con el modelo 3D. El motor dinámico calcula tensiones y reacciones instantáneamente según los parámetros definidos.',
    icon: <Target className="w-6 h-6 text-blue-400" />,
    position: 'bottom'
  },
  {
    id: 'sidebar',
    targetId: 'tutorial-step-sidebar',
    title: 'Módulos de Control',
    content: 'Ajusta las cargas y longitudes aquí. También puedes acceder al registro de cálculos vectoriales y desafíos de campo.',
    icon: <Settings2 className="w-6 h-6 text-indigo-400" />,
    position: 'left'
  },
  {
    id: 'copilot',
    targetId: 'tutorial-step-copilot',
    title: 'IA Destinar',
    content: 'Tu enlace directo con la base de conocimientos. Solicita diagnósticos o explicaciones sobre la mecánica del sistema en cualquier momento.',
    icon: <Cpu className="w-6 h-6 text-cyan-400" />,
    position: 'left'
  },
  {
    id: 'gestures',
    targetId: 'tutorial-step-gesture',
    title: 'Enlace Biométrico',
    content: 'Habilita "Hand_Link" para controlar la cámara mediante gestos. Revolucionario para inspecciones sin contacto.',
    icon: <MousePointer2 className="w-6 h-6 text-emerald-400" />,
    position: 'right'
  }
];

export function TutorialOverlay({ onComplete, onStart }: { onComplete: () => void, onStart: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const step = STEPS[currentStep];

  useEffect(() => {
    if (currentStep > 0) {
      onStart();
    }
  }, [currentStep, onStart]);

  useEffect(() => {
    const updateCoords = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0) {
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
          setIsVisible(true);
          return;
        }
      }
      
      if (step.id === 'welcome') {
          setCoords({
              top: window.innerHeight / 2 - 60,
              left: window.innerWidth / 2 - 120,
              width: 240,
              height: 120
          });
          setIsVisible(true);
      } else {
        setTimeout(updateCoords, 100);
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [currentStep, step.targetId, step.id]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ffffff', '#3b82f6']
      });
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  if (!coords) return null;

  // Calculate card position to avoid edges and overlap
  const getCardStyle = () => {
    const padding = 16;
    const cardWidth = Math.min(440, window.innerWidth - padding * 2);
    const cardHeight = 320; // Maximum expected height
    
    let top = 0;
    let left = 0;

    // Safety check for coords
    const safeCoords = coords || { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 };

    if (step.id === 'welcome' || !isVisible) {
      top = window.innerHeight - cardHeight - 120;
      left = window.innerWidth / 2 - cardWidth / 2;
    } else if (step.position === 'bottom') {
      top = safeCoords.top + safeCoords.height + padding;
      left = safeCoords.left + safeCoords.width / 2 - cardWidth / 2;
    } else if (step.position === 'top') {
      top = safeCoords.top - cardHeight - padding;
      left = safeCoords.left + safeCoords.width / 2 - cardWidth / 2;
    } else if (step.position === 'left') {
      top = safeCoords.top + safeCoords.height / 2 - cardHeight / 2;
      left = safeCoords.left - cardWidth - padding;
    } else if (step.position === 'right') {
      top = safeCoords.top + safeCoords.height / 2 - cardHeight / 2;
      left = safeCoords.left + safeCoords.width + padding;
    }

    // Keep on screen with higher safety margins
    left = Math.max(padding, Math.min(left, window.innerWidth - cardWidth - padding));
    top = Math.max(step.position === 'top' ? padding : 80, Math.min(top, window.innerHeight - cardHeight - padding)); // Avoid top header unless needed

    return { top, left, width: cardWidth };
  };

  const cardStyle = getCardStyle();

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none">
      {/* SVG Mask for perfect hole */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="tutorial-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              animate={{
                x: coords.left - 15,
                y: coords.top - 15,
                width: coords.width + 30,
                height: coords.height + 30,
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 120 }}
              rx="24"
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#tutorial-mask)" className="backdrop-blur-[4px]" />
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute pointer-events-auto"
          style={cardStyle}
        >
          <div className="bg-[#0f172a] border border-white/10 rounded-[40px] p-10 shadow-[0_40px_120px_rgba(0,0,0,1)] overflow-hidden relative group">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-[0.3em] font-black">Step {currentStep + 1} / {STEPS.length}</span>
                   <div className="flex gap-1 mt-1">
                      {STEPS.map((_, i) => (
                        <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentStep ? "w-4 bg-cyan-500" : "w-1 bg-white/10")} />
                      ))}
                   </div>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white italic tracking-tight mb-4 uppercase decoration-cyan-500/30 underline underline-offset-8 decoration-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-light mb-10 italic-serif-headers min-h-[3.5em]">
                {step.content}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <button
                  onClick={onComplete}
                  className="text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.3em] pl-2"
                >
                  Saltar_Tutorial
                </button>

                <div className="flex items-center gap-4">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all group/btn active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-white hover:bg-cyan-500 text-black hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 shadow-xl"
                  >
                    {currentStep === STEPS.length - 1 ? (
                      <>ESTABLECER_ENLACE <CheckCircle2 className="w-4 h-4" /></>
                    ) : (
                      <>SIGUIENTE <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pulsing Target Highlight Ring */}
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          key={`highlight-${currentStep}`}
          className="absolute border-2 border-cyan-400/50 rounded-[22px] pointer-events-none shadow-[0_0_40px_rgba(6,182,212,0.4)]"
          style={{
            top: coords.top - 8,
            left: coords.left - 8,
            width: coords.width + 16,
            height: coords.height + 16,
          }}
        >
           <motion.div 
             animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
             transition={{ duration: 1.5, repeat: Infinity }}
             className="absolute inset-0 border-2 border-cyan-400 rounded-[22px]"
           />
        </motion.div>
      )}
    </div>
  );
}
