import { useState, useMemo } from 'react';

export interface StaticsParameters {
  loadA: number;
  leverLength: number;
  pulleyRadius: number;
  distBC: number;
  distCD: number;
  distDE: number;
}

export interface StaticsResult {
  tension: number;
  reactionC: { y: number; z: number };
  reactionD: { y: number; z: number };
  steps: string[];
}

export const useStaticsSolver = (params: StaticsParameters): StaticsResult => {
  const result = useMemo(() => {
    const { loadA, leverLength, pulleyRadius, distBC, distCD, distDE } = params;

    // 1. Momento en X para hallar Tension T
    // Sum M_x = 0
    // Force P at A (0, 0, L) -> Moment = P * L
    // Tension T at pulley (E) at radius R -> Moment = T * R
    // P * L = T * R
    const tension = (loadA * leverLength) / pulleyRadius;

    // 2. Fuerzas y Momentos para reacciones en C y D
    // C es el origen para momentos en este calculo simplificado
    // B = (0, 0, 0)
    // C = (distBC, 0, 0)
    // D = (distBC + distCD, 0, 0)
    // E = (distBC + distCD + distDE, 0, 0)
    
    // Suponemos que T es horizontal en +z (esto depende del dibujo, pero sigamos una convencion)
    // Si T es en +z: T_vec = (0, 0, T)
    // Si P es en -y: P_vec = (0, -P, 0)
    
    // Sum Fy = 0: Cy + Dy - P = 0
    // Sum Fz = 0: Cz + Dz + T = 0
    
    // Sum M_C = 0 (Momentos respecto a C)
    // MB = r_B/C x P_vec = (-distBC, 0, 0) x (0, -P, 0) = (0, 0, distBC * P)
    // MD = r_D/C x D_vec = (distCD, 0, 0) x (0, Dy, Dz) = (0, -distCD * Dz, distCD * Dy)
    // ME = r_E/C x T_vec = (distCD + distDE, 0, 0) x (0, 0, T) = (0, -(distCD + distDE) * T, 0)
    
    // Sum Mx = 0 (ya lo usamos para T)
    // Sum My = 0: -distCD * Dz - (distCD + distDE) * T = 0  => Dz = - (distCD + distDE) * T / distCD
    // Sum Mz = 0: distBC * P + distCD * Dy = 0 => Dy = - distBC * P / distCD
    
    const distCE = distCD + distDE;
    const dyD = -(distBC * loadA) / distCD;
    const dzD = -(distCE * tension) / distCD;
    
    const dyC = loadA - dyD;
    const dzC = -tension - dzD;

    const steps = [
      `1. Cálculo de la Tensión: Sumatoria de momentos respecto al eje del eje (X).`,
      `   ΣMx = 0  =>  (720 N)(200 mm) - T(120 mm) = 0`,
      `   T = (720 * 200) / 120 = ${tension.toFixed(2)} N`,
      `2. Equilibrio de Fuerzas y Momentos:`,
      `   Ubicamos el origen en el cojinete C.`,
      `   ΣMy = 0 respecto a C para hallar Dz:`,
      `   -Dz(${distCD} mm) - T(${distCE} mm) = 0  => Dz = ${dzD.toFixed(2)} N`,
      `   ΣMz = 0 respecto a C para hallar Dy:`,
      `   P(${distBC} mm) + Dy(${distCD} mm) = 0 => Dy = ${dyD.toFixed(2)} N`,
      `3. Reacciones en C por sumatoria de fuerzas:`,
      `   ΣFy = 0 => Cy + Dy - P = 0 => Cy = ${dyC.toFixed(2)} N`,
      `   ΣFz = 0 => Cz + Dz + T = 0 => Cz = ${dzC.toFixed(2)} N`,
    ];

    return {
      tension,
      reactionC: { y: dyC, z: dzC },
      reactionD: { y: dyD, z: dzD },
      steps
    };
  }, [params]);

  return result;
};
