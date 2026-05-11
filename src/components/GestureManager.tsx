import React, { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import { MousePointer2 } from 'lucide-react';

interface GestureState {
  rotation: [number, number, number];
  scale: number;
}

interface Props {
  onGestureUpdate: (state: GestureState) => void;
}

export function GestureManager({ onGestureUpdate }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const stateRef = useRef<GestureState>({ rotation: [0, 0, 0], scale: 1 });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    let lastPos: { x: number, y: number } | null = null;
    let lastDist: number | null = null;

    hands.onResults((results: Results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setIsActive(true);
        
        // Rotation (One or Two hands)
        const firstHand = results.multiHandLandmarks[0];
        const currentPos = { x: firstHand[8].x, y: firstHand[8].y }; // Index finger tip
        
        if (lastPos) {
          const dx = currentPos.x - lastPos.x;
          const dy = currentPos.y - lastPos.y;
          
          stateRef.current.rotation[1] += dx * 5;
          stateRef.current.rotation[0] += dy * 5;
        }
        lastPos = currentPos;

        // Scaling (Distance between hands if 2 hands, or thumb-index if 1 hand)
        if (results.multiHandLandmarks.length === 2) {
          const h1 = results.multiHandLandmarks[0][8];
          const h2 = results.multiHandLandmarks[1][8];
          const dist = Math.sqrt(Math.pow(h1.x - h2.x, 2) + Math.pow(h1.y - h2.y, 2));
          
          if (lastDist) {
            const diff = dist - lastDist;
            stateRef.current.scale = Math.max(0.1, stateRef.current.scale + diff * 2);
          }
          lastDist = dist;
        } else {
          lastDist = null;
        }
        
        onGestureUpdate({ ...stateRef.current });
      } else {
        setIsActive(false);
        lastPos = null;
        lastDist = null;
      }
    });

    const camera = new cam.Camera(videoElement, {
      onFrame: async () => {
        if (videoElement) {
          await hands.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  return (
    <div id="tutorial-step-gesture" className="fixed top-44 left-12 w-64 h-48 rounded-[32px] overflow-hidden border border-white/20 glass-card z-[60] group shadow-2xl transition-all hover:w-80 hover:h-60">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none z-10" />
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE_FEED</span>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end">
          <span className="text-[8px] font-mono text-cyan-400/50 uppercase tracking-tighter">FPS: 30</span>
          <span className="text-[8px] font-mono text-cyan-400/50 uppercase tracking-tighter">RESOLUTION: 640x480</span>
      </div>
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1] opacity-40 group-hover:opacity-80 transition-opacity duration-700"
        playsInline
        muted
      />
      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center px-8">
          <div className="relative mb-4">
             <MousePointer2 className="w-6 h-6 text-cyan-500 mx-auto animate-bounce" />
             <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-relaxed">
            CALIBRANDO GESTOS <br/>
            <span className="text-[8px] text-zinc-500 font-normal">SISTEMA_STANDBY</span>
          </p>
        </div>
      </div>
      {isActive && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1">
          <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <span className="text-[8px] font-mono text-emerald-400 font-black tracking-widest">LINK_STABLE</span>
          </div>
        </div>
      )}
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20 m-4 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20 m-4 rounded-br-lg" />
    </div>
  );
}
