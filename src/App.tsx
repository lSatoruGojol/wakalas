import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, ContactShadows, Stars, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Layers, BrainCircuit, Move3d, LogOut, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

import { useStaticsSolver, StaticsParameters } from './hooks/useStaticsSolver';
import { useAuth } from './hooks/useAuth';
import { logout } from './lib/firebase';
import { cn } from './lib/utils';

// Lazy load heavy components
const StaticsModel = lazy(() => import('./components/StaticsModel').then(module => ({ default: module.StaticsModel })));
const GestureManager = lazy(() => import('./components/GestureManager').then(module => ({ default: module.GestureManager })));
const SolverPanel = lazy(() => import('./components/SolverPanel').then(module => ({ default: module.SolverPanel })));
const Destinar = lazy(() => import('./components/Destinar').then(module => ({ default: module.Destinar })));
const AuthOverlay = lazy(() => import('./components/AuthOverlay').then(module => ({ default: module.AuthOverlay })));

import { TutorialOverlay } from './components/TutorialOverlay';

export default function App() {
  const { user, loading } = useAuth();
  const [started, setStarted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastSeen: serverTimestamp(),
            hasSeenTutorial: false
          });
          setShowTutorial(true);
        } else {
          const userData = userSnap.data();
          if (!userData.hasSeenTutorial && !localStorage.getItem('statix_has_seen_tutorial')) {
            setShowTutorial(true);
          }
        }
      };
      syncUser();
    }
  }, [user]);

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [gestures, setGestures] = useState({ rotation: [0, 0, 0] as [number, number, number], scale: 1.2 });
  const [params, setParams] = useState<StaticsParameters>({
    loadA: 720,
    leverLength: 200,
    pulleyRadius: 120,
    distBC: 80,
    distCD: 120,
    distDE: 40
  });

  const result = useStaticsSolver(params);

  const handleStart = () => {
    if (!user) return;
    setStarted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#10b981']
    });
  };

  return (
    <div className="w-full h-screen font-sans selection:bg-cyan-500/30 overflow-hidden bg-[#050505]">
      {/* Global Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
              <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Sincronizando Núcleo</span>
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Enlace Satelital Activo</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Blueprint Grid Layer */}
      <div className="fixed inset-0 blueprint-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none" />

      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay 
            onStart={handleStart}
            onComplete={async () => {
              setShowTutorial(false);
              localStorage.setItem('statix_has_seen_tutorial', 'true');
              if (user) {
                const { doc, updateDoc } = await import('firebase/firestore');
                const { db } = await import('./lib/firebase');
                await updateDoc(doc(db, 'users', user.uid), {
                  hasSeenTutorial: true
                });
              }
            }} 
          />
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <AuthOverlay show={!user && !loading} />
      </Suspense>

      <AnimatePresence>
        {!started && user && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Background 3D decorative element */}
            <div className="absolute inset-0 opacity-20">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                  <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                    <torusKnotGeometry args={[1.5, 0.5, 128, 32]} />
                    <MeshDistortMaterial color="#06b6d4" speed={2} distort={0.3} wireframe />
                  </mesh>
                </Float>
                <Environment preset="city" />
              </Canvas>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.6em] animate-pulse">
                  SYSTEM_CORE_ONLINE // ACCESS_GRANTED
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <h1 className="text-6xl md:text-[140px] font-black tracking-tighter mb-12 text-white leading-[0.75] uppercase italic-serif-headers drop-shadow-[0_0_80px_rgba(255,255,255,0.1)]">
                statix <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                  prime_v2
                </span>
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
                <FeatureCard 
                  icon={<Move3d className="w-5 h-5 text-cyan-400" />} 
                  title="Control Háptico" 
                  desc="Maneja el modelo 3D con gestos de tus manos frente a la cámara."
                />
                <FeatureCard 
                  icon={<BrainCircuit className="w-5 h-5 text-blue-400" />} 
                  title="IA Destinar" 
                  desc="Asistente especializado entrenado en mecánica racional y estática."
                />
                <FeatureCard 
                  icon={<Layers className="w-5 h-5 text-indigo-400" />} 
                  title="Balanceo Real" 
                  desc="Cálculo instantáneo de reacciones y tensiones según parámetros."
                />
              </div>

              <div className="flex flex-col items-center gap-6">
                <button
                  id="tutorial-step-welcome"
                  onClick={handleStart}
                  className="group relative px-16 py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                >
                  <div className="absolute inset-0 bg-cyan-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  <span className="relative group-hover:text-white transition-colors flex items-center gap-4">
                    SINCRO SISTEMA <Play className="w-4 h-4 fill-current" />
                  </span>
                </button>
                
                 <div className="flex items-center gap-6 px-10 py-5 bg-white/5 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-cyan-500/20 blur-lg rounded-full" />
                    <img 
                      src={user?.photoURL || ''} 
                      alt="User" 
                      className="w-12 h-12 rounded-full border border-cyan-500/50 relative z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user?.displayName}&background=06b6d4&color=fff`;
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white tracking-[0.2em]">{user?.displayName?.toUpperCase()}</span>
                    <span className="text-[9px] font-mono text-cyan-500/50 uppercase tracking-widest">{user?.email}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <button 
                    onClick={() => setShowTutorial(true)} 
                    className="group/tut flex flex-col items-center gap-1 px-4 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 group-hover/tut:scale-125 transition-transform" />
                    <span className="text-[8px] font-black text-zinc-500 group-hover/tut:text-cyan-400 tracking-widest uppercase">Tutorial</span>
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <button onClick={logout} className="group/logout flex flex-col items-center gap-1 px-4 hover:bg-red-500/5 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4 text-red-500/50 group-hover/logout:text-red-500 group-hover/logout:scale-110 transition-all" />
                    <span className="text-[8px] font-black text-zinc-500 group-hover/logout:text-red-500 tracking-widest uppercase">Salir</span>
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-12 flex items-center gap-8 text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
              <span>ISO 9001 COMPLIANT</span>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>ENGINEERING TOOLKIT V2.4</span>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>GPU ACCELERATED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={cn("relative w-full h-full transition-opacity duration-1000", started ? "opacity-100" : "opacity-0 invisible")}>
        {/* Superior Data Stream Header */}
        <header className="fixed top-0 left-0 right-0 z-[70] h-32 flex items-center px-12 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]" />
          
          <div className="relative w-full flex items-center justify-between">
            <div className="flex items-center gap-12">
              <div className="relative group pointer-events-auto">
                <div className="absolute -inset-4 bg-cyan-500/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col">
                  <h2 className="text-3xl font-black tracking-tighter text-white leading-none italic-serif-headers underline decoration-cyan-500/50 decoration-4 underline-offset-8">STATIX_PRIME</h2>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="h-0.5 w-8 bg-cyan-500" />
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.6em]">Vector_Engine_v4.5</span>
                  </div>
                </div>
              </div>

              <div className="h-16 w-px bg-white/10" />

              <div className="flex items-center gap-10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[11px] font-mono text-emerald-500/80 font-bold uppercase tracking-widest">Connected</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1">User_Auth</span>
                  <span className="text-[11px] font-mono text-white font-bold">{user?.email?.split('@')[0].toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Session_Time</span>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">00:42:15:09</span>
              </div>
              <button 
                onClick={() => setStarted(false)} 
                className="w-12 h-12 bg-white/5 hover:bg-red-500/20 rounded-2xl transition-all border border-white/10 flex items-center justify-center group"
              >
                <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Global Control Bar */}
        <div id="tutorial-step-controls" className="fixed bottom-12 left-12 z-[60] flex items-center gap-4 p-3 bg-black/60 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
          <ControlToggle 
            active={cameraEnabled} 
            onClick={() => setCameraEnabled(!cameraEnabled)}
            icon={<Move3d className="w-5 h-5" />}
            label="Hand_Link"
          />
          <div className="w-px h-10 bg-white/10 mx-2" />
          <div className="flex flex-col px-6">
             <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Telemetry</span>
             <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", cameraEnabled ? "bg-emerald-500" : "bg-red-500")} />
                <span className="text-[10px] font-mono font-black text-white/70 uppercase tracking-widest">
                  {cameraEnabled ? "Sensor_IO: 1" : "Sensor_IO: 0"}
                </span>
             </div>
          </div>
        </div>

        <div id="tutorial-step-canvas" className="absolute inset-0 z-0">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[10, 8, 15]} fov={40} />
            <OrbitControls 
              enablePan={false} 
              makeDefault
              rotateSpeed={0.5}
            />
            
            <Suspense fallback={null}>
              <StaticsModel 
                params={params} 
                result={result} 
                scale={gestures.scale}
                rotation={gestures.rotation}
              />
              <Environment preset="city" />
            </Suspense>
            
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          </Canvas>
        </div>

        {/* HUD Elements */}
        {started && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
             {/* Dynamic UI Components */}
            <div className="pointer-events-auto">
              <Suspense fallback={
                <div className="fixed top-8 right-8 p-4 glass-card rounded-2xl flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Cargando Módulos...</span>
                </div>
              }>
                <SolverPanel 
                  params={params} 
                  setParams={setParams} 
                  result={result} 
                  userId={user?.uid}
                />
                {cameraEnabled && <GestureManager onGestureUpdate={(s) => setGestures(s)} />}
                <Destinar />
              </Suspense>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="mb-8 p-5 bg-white/5 w-fit rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">{icon}</div>
        <h3 className="text-sm font-black text-white mb-3 uppercase tracking-[0.15em]">{title}_</h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed font-light tracking-wide">{desc}</p>
      </div>
    </div>
  );
}

function ControlToggle({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-2xl transition-all border",
        active 
          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
          : "bg-white/5 border-white/5 text-zinc-600 hover:text-zinc-400"
      )}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
