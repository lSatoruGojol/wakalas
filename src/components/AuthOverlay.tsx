import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Github, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface Props {
  show: boolean;
}

export function AuthOverlay({ show }: Props) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        setError('Error de enlace. Reintentar protocolo.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-20 blueprint-bg" />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg p-16 glass-card rounded-[60px] border-white/5 shadow-[0_0_150px_rgba(0,0,0,0.9)] flex flex-col items-center text-center gap-12"
      >
        <div className="relative group">
          <div className="absolute -inset-10 bg-cyan-500/20 blur-[60px] animate-pulse" />
          <div className="relative w-32 h-32 bg-black border-2 border-white/10 rounded-[40px] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-500">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-transparent to-transparent" />
             <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,1)] animate-[scan_3s_linear_infinite]" />
             <div className="absolute bottom-0 right-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,1)] animate-[scan_3s_linear_infinite_reverse]" />
             <ShieldCheck className="w-14 h-14 text-cyan-400 relative z-10" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2 italic-serif-headers drop-shadow-2xl">
            STATIX_<span className="text-cyan-500">PRIME</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_rgba(6,182,212,1)]" />
             <p className="text-[11px] text-zinc-400 font-mono font-black tracking-[0.6em] uppercase leading-none opacity-80">Security Protocol v2.4 Active</p>
          </div>
        </div>
        
        <p className="text-zinc-500 text-base max-w-sm font-light leading-relaxed px-4">
          Autorice el acceso biométrico digital para sincronizar su perfil de ingeniería y desplegar el motor de estática avanzada.
        </p>
        
        <div className="w-full space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="group relative w-full py-6 bg-white text-black rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-cyan-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            <span className="relative group-hover:text-white transition-colors flex items-center justify-center gap-4">
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              {isLoggingIn ? 'Sincronizando...' : 'Google Workspace'}
            </span>
          </button>

          <button
            disabled={isLoggingIn}
            className="group relative w-full py-6 bg-zinc-900 text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 border border-white/5 opacity-50 cursor-not-allowed"
          >
            <span className="relative flex items-center justify-center gap-4">
              <Github className="w-5 h-5" />
              GitHub Secure
            </span>
          </button>

          {error && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-mono tracking-widest font-black"
            >
              FAILED: {error}
            </motion.div>
          )}

          <div className="mt-8 flex justify-center gap-4 text-zinc-800">
             <div className="w-2 h-2 rounded-full bg-cyan-500/20 animate-bounce [animation-delay:-0.3s]" />
             <div className="w-2 h-2 rounded-full bg-cyan-500/40 animate-bounce [animation-delay:-0.15s]" />
             <div className="w-2 h-2 rounded-full bg-cyan-500/20 animate-bounce" />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
           <span className="text-[9px] text-zinc-700 font-mono tracking-[0.3em] uppercase">Auth_Gateway v4.0.21</span>
           <div className="flex gap-1 justify-center">
              <div className="w-1 h-1 rounded-full bg-cyan-500/20" />
              <div className="w-1 h-1 rounded-full bg-cyan-500" />
              <div className="w-1 h-1 rounded-full bg-cyan-500/20" />
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
