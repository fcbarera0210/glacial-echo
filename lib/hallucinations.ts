import { rand } from './utils';

/**
 * Logs falsos que aparecen cuando la cordura es baja
 */
const FAKE_LOGS = [
  ">> TE VEO DORMIR.",
  ">> SISTEMA: Oxígeno agotado...",
  ">> ADVERTENCIA: Temperatura crítica. -80°C detectado.",
  ">> ERROR: Señal de rescate interceptada. No hay ayuda en camino.",
  ">> ALERTA: Múltiples entidades detectadas en el sector 7.",
  ">> SISTEMA: Archivo corrupto. Datos perdidos.",
  ">> ADVERTENCIA: Sistema de soporte vital fallando...",
  ">> ERROR: Conexión con base principal perdida.",
  ">> TE VEO. TE VEO. TE VEO.",
  ">> SISTEMA: Análisis de datos: 0%. Todo está perdido.",
  ">> ADVERTENCIA: Firewall comprometido. La entidad entra.",
  ">> ERROR: No eres tú. Ya no eres tú.",
  ">> SISTEMA: Calefacción: OFF. Congelación inminente.",
  ">> ADVERTENCIA: Múltiples fallos de sistema detectados.",
  ">> ERROR: La base está vacía. Siempre estuvo vacía.",
];

/**
 * Genera un log falso aleatorio
 */
export function generateFakeLog(): string {
  return FAKE_LOGS[rand(0, FAKE_LOGS.length - 1)];
}

/**
 * Verifica si se debe mostrar una alucinación basado en el estado mental
 */
export function shouldShowHallucination(mental: number): boolean {
  // Mental < 40%: probabilidad de alucinación
  if (mental < 40) {
    // Probabilidad aumenta cuanto más bajo es el mental
    const probability = (40 - mental) / 40; // 0% a 100% cuando mental baja de 40 a 0
    return Math.random() < probability * 0.3; // Máximo 30% de probabilidad
  }
  return false;
}

/**
 * Verifica si se debe aplicar un glitch de UI
 */
export function shouldGlitchUI(mental: number): boolean {
  // Mental < 40%: probabilidad de glitch
  if (mental < 40) {
    const probability = (40 - mental) / 40;
    return Math.random() < probability * 0.2; // Máximo 20% de probabilidad
  }
  return false;
}

/**
 * Obtiene el tipo de glitch de UI
 */
export type GlitchType = 'button' | 'inventory' | 'sound';

export function getGlitchType(): GlitchType {
  const r = Math.random();
  if (r < 0.4) return 'button';
  if (r < 0.8) return 'inventory';
  return 'sound';
}

/**
 * Genera un nombre corrupto para objetos del inventario
 */
const CORRUPT_NAMES = [
  'CENIZAS',
  'NADA',
  'ERROR',
  'VACÍO',
  'PERDIDO',
  'CORRUPTO',
  'ESTÁTICA',
  'SILENCIO',
  'OLVIDO',
  'NIEBLA'
];

export function getCorruptName(originalName: string): string {
  return CORRUPT_NAMES[rand(0, CORRUPT_NAMES.length - 1)];
}

/**
 * Verifica si se debe mostrar un log falso en este momento
 * Retorna el log falso o null
 */
export function checkForFakeLog(mental: number): string | null {
  if (shouldShowHallucination(mental)) {
    return generateFakeLog();
  }
  return null;
}

