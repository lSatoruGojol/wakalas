import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box, Sphere, Text, Line, Float, Html, Grid, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { StaticsParameters, StaticsResult } from '../hooks/useStaticsSolver';

interface Props {
  params: StaticsParameters;
  result: StaticsResult;
  scale?: number;
  rotation?: [number, number, number];
}

export function StaticsModel({ params, result, scale = 1, rotation = [0, 0, 0] }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const [offset, setOffset] = useState(0);
  
  useFrame((state) => {
    // Small oscillation to simulate "active" system
    setOffset(Math.sin(state.clock.elapsedTime * 2) * 5);
    
    // Rotate the shaft and pulley
    if (groupRef.current) {
      // Rotation on X axis for the central shaft elements
      const shaft = groupRef.current.children.find(child => child.type === 'Mesh' && (child as any).geometry?.type === 'CylinderGeometry');
      if (shaft) shaft.rotation.x = state.clock.elapsedTime * 0.5;
    }
  });

  const scanlineRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (scanlineRef.current) {
      scanlineRef.current.position.x = (Math.sin(state.clock.elapsedTime * 0.5) * shaftLength) - (shaftLength / 4);
    }
  });

  const { distBC, distCD, distDE, leverLength, pulleyRadius, loadA } = params;
  const currentLoad = loadA + offset;
  
  const toUnits = (mm: number) => mm / 100;
  
  const bPos = [0, 0, 0];
  const cPos = [toUnits(distBC), 0, 0];
  const dPos = [toUnits(distBC + distCD), 0, 0];
  const ePos = [toUnits(distBC + distCD + distDE), 0, 0];
  
  const shaftLength = toUnits(distBC + distCD + distDE + 20);
  
  return (
    <group ref={groupRef} scale={scale} rotation={rotation}>
      {/* Structural Base / Floor */}
      <group position={[0, -1.8, 0]}>
        <ContactShadows 
          opacity={0.6} 
          scale={30} 
          blur={1.5} 
          far={10} 
          resolution={512} 
          color="#000000" 
        />
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          fadeStrength={15} 
          sectionSize={1.5} 
          sectionColor="#0ea5e9" 
          sectionThickness={1.5}
          cellSize={0.5}
          cellColor="#1e293b"
          cellThickness={0.8}
          position={[0, 0.01, 0]}
        />
      </group>

      {/* Ground Decorative Ring & Reflection Mask */}
      <group position={[0, -0.9, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8, 8.2, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.1} />
        </mesh>
        {/* Faux Reflection Glow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[12, 4]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.02} />
        </mesh>
      </group>

      {/* Holographic "Vector Flux" Lines - Connecting Supports */}
      {[0, toUnits(distBC), toUnits(distBC + distCD)].slice(1).map((x, i) => (
        <Line 
          key={i}
          points={[[0, -0.8, 0], [x, -0.8, 0]]}
          color="#06b6d4"
          lineWidth={0.5}
          transparent
          opacity={0.15}
          dashed
          dashSize={0.2}
          gapSize={0.1}
        />
      ))}

      {/* Main Support Stands - Replicated for Stability */}
      {[toUnits(distBC), toUnits(distBC + distCD)].map((x, i) => (
        <group key={i} position={[x, -0.9, 0]}>
          <Box args={[0.15, 1.8, 0.15]}>
            <meshPhysicalMaterial color="#020617" metalness={1} roughness={0.1} />
          </Box>
          <Box args={[0.3, 0.05, 0.3]} position={[0, -0.9, 0]}>
             <meshPhysicalMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
          </Box>
        </group>
      ))}

      {/* Main Support A - Kinetic Stand at Lever End */}
      <group position={[0, -0.9, 0]}>
        <Box args={[0.2, 1.8, 0.2]}>
          <meshPhysicalMaterial color="#0f172a" metalness={1} roughness={0.05} />
        </Box>
        <Box args={[0.5, 0.1, 0.5]} position={[0, -0.9, 0]}>
           <meshPhysicalMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
        </Box>
        <Cylinder args={[0.08, 0.12, 0.4, 32]} position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
           <meshPhysicalMaterial color="#334155" metalness={1} />
        </Cylinder>
      </group>

      {/* Energy Cable / Visualization Line */}
      <Line
        points={[
          [0, 0, toUnits(leverLength)], // Load P
          [0, 0, 0], // Center
          [toUnits(distBC + distCD + distDE), toUnits(pulleyRadius), 0], // Pulley top
        ]}
        color="#06b6d4"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      {/* Kinetic Data Stream Particles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Float key={i} speed={3} rotationIntensity={0} floatIntensity={2} position={[shaftLength * (i/4) - shaftLength/2, 0.5, 0]}>
           <Sphere args={[0.02, 8, 8]}>
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
           </Sphere>
        </Float>
      ))}

      {/* Cable Connectors - Glowy nodes */}
      {[
        [0, 0, toUnits(leverLength)],
        [0, 0, 0],
        [toUnits(distBC + distCD + distDE), toUnits(pulleyRadius), 0]
      ].map((p, i) => (
        <group key={i} position={p as any}>
          <Sphere args={[0.04, 16, 16]}>
            <meshBasicMaterial color="#06b6d4" />
          </Sphere>
          <Html position={[0, 0.3, 0]} center>
            <div className="text-[8px] font-mono text-cyan-400/50 uppercase tracking-tighter">NODE_0{i}</div>
          </Html>
        </group>
      ))}

      {/* Central Shaft - Ultra High Metal Finish */}
      <Cylinder 
        args={[0.065, 0.065, shaftLength, 64]} 
        rotation={[0, 0, Math.PI / 2]} 
        position={[shaftLength / 2 - 0.2, 0, 0]}
      >
        <meshPhysicalMaterial 
          color="#0f172a" 
          metalness={1} 
          roughness={0} 
          clearcoat={1}
          reflectivity={1}
        />
      </Cylinder>

      {/* Decorative Shaft Rings */}
      {[0.2, 0.4, 0.6, 0.8].map((factor, i) => (
        <Cylinder 
          key={i}
          args={[0.08, 0.08, 0.02, 32]} 
          rotation={[0, 0, Math.PI / 2]} 
          position={[(shaftLength * factor) - (shaftLength/2), 0, 0]}
        >
          <meshBasicMaterial color="#0ea5e9" />
        </Cylinder>
      ))}

      {/* Lever AB - Precision Machined Blue */}
      <group position={[0, 0, 0]}>
        <Cylinder 
          args={[0.05, 0.05, toUnits(leverLength), 32]} 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[0, 0, toUnits(leverLength) / 2]}
        >
          <meshPhysicalMaterial 
            color="#3b82f6" 
            metalness={1} 
            roughness={0.1} 
            emissive="#1d4ed8" 
            emissiveIntensity={0.2} 
          />
        </Cylinder>
        
        {/* Load P at A - Energy Node */}
        <group position={[0, 0, toUnits(leverLength)]}>
          <Sphere args={[0.1, 32, 32]}>
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
          </Sphere>
          <Float speed={4} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[0.2, 16, 16]}>
              <meshBasicMaterial color="#f43f5e" wireframe transparent opacity={0.1} />
            </Sphere>
          </Float>
          <ForceArrow vector={[0, -2, 0]} color="#f43f5e" label={`P: ${currentLoad.toFixed(1)} N`} />
        </group>
      </group>

      {/* Pulley at E - High Precision Rotor */}
      <group position={[toUnits(distBC + distCD + distDE), 0, 0]}>
        <group rotation={[Math.sin(Date.now() * 0.001) * 0.1, 0, 0]}>
          <Cylinder args={[toUnits(pulleyRadius), toUnits(pulleyRadius), 0.15, 64]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhysicalMaterial color="#cbd5e1" metalness={1} roughness={0} />
          </Cylinder>
          <Cylinder args={[toUnits(pulleyRadius) * 0.8, toUnits(pulleyRadius) * 0.8, 0.17, 64]} rotation={[0, 0, Math.PI / 2]}>
            <meshPhysicalMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.3} metalness={0.8} />
          </Cylinder>
          {/* Glowing Outer Edge */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <ringGeometry args={[toUnits(pulleyRadius) * 0.95, toUnits(pulleyRadius), 64]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
        
        {/* Support at E */}
        <group position={[0, -0.9, 0]}>
           <Box args={[0.2, 1.8, 0.2]}>
              <meshPhysicalMaterial color="#0f172a" metalness={1} />
           </Box>
           <Box args={[0.4, 0.1, 0.4]} position={[0, -0.9, 0]}>
              <meshPhysicalMaterial color="#334155" />
           </Box>
        </group>

        {/* Tension T */}
        <group position={[0, toUnits(pulleyRadius), 0]}>
          <ForceArrow vector={[0, 0, 3]} color="#f59e0b" label={`T: ${result.tension.toFixed(0)} N`} />
        </group>
      </group>

      {/* Holographic Scanline */}
      <group ref={scanlineRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[0, 3, 4, 1]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
        <Line 
          points={[[0, -3, 0], [0, 3, 0]]} 
          color="#06b6d4" 
          lineWidth={0.5} 
          transparent 
          opacity={0.2} 
        />
      </group>

      {/* Bearings at C and D */}
      <Bearing position={cPos} label="Support_C" reaction={result.reactionC} color="#10b981" />
      <Bearing position={dPos} label="Support_D" reaction={result.reactionD} color="#8b5cf6" />
    </group>
  );
}

function ForceArrow({ vector, color, label }: { vector: [number, number, number], color: string, label: string }) {
  return (
    <group>
      <Line points={[[0, 0, 0], vector]} color={color} lineWidth={5} />
      <Sphere args={[0.05, 16, 16]} position={vector}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </Sphere>
      <Html position={[vector[0]*1.1, vector[1]*1.1, vector[2]*1.1]} center>
        <div className="px-3 py-1.5 bg-black/90 backdrop-blur-md border border-white/10 rounded-full font-mono text-[10px] font-black whitespace-nowrap shadow-2xl flex items-center gap-2" style={{ color }}>
          <div className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: color }} />
          {label}
        </div>
      </Html>
    </group>
  );
}

function Bearing({ position, label, reaction, color }: { position: any, label: string, reaction: { y: number, z: number }, color: string }) {
  const magnitude = Math.sqrt(reaction.y ** 2 + reaction.z ** 2);
  
  return (
    <group position={position}>
      <Cylinder args={[0.12, 0.12, 0.2, 32]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhysicalMaterial color="#0f172a" metalness={1} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.22, 32]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Cylinder>
      
      <Html position={[0, 0.5, 0]} center>
         <div className="px-3 py-1 bg-black/60 border border-white/10 rounded font-mono text-[9px] font-black tracking-widest text-white/40 uppercase">
            {label}
         </div>
      </Html>

      <group>
        {Math.abs(reaction.y) > 0.1 && (
          <ForceArrow vector={[0, reaction.y / 350, 0]} color={color} label={`R_y: ${reaction.y.toFixed(0)}N`} />
        )}
        {Math.abs(reaction.z) > 0.1 && (
          <ForceArrow vector={[0, 0, reaction.z / 350]} color="#f472b6" label={`R_z: ${reaction.z.toFixed(0)}N`} />
        )}
      </group>
    </group>
  );
}
