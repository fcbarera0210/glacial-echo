"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForFakeLog = exports.getCorruptName = exports.getGlitchType = exports.shouldGlitchUI = exports.shouldShowHallucination = exports.generateFakeLog = void 0;
const utils_1 = require("./utils");
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
function generateFakeLog() {
    return FAKE_LOGS[(0, utils_1.rand)(0, FAKE_LOGS.length - 1)];
}
exports.generateFakeLog = generateFakeLog;
/**
 * Verifica si se debe mostrar una alucinación basado en el estado mental
 */
function shouldShowHallucination(mental) {
    // Mental < 40%: probabilidad de alucinación
    if (mental < 40) {
        // Probabilidad aumenta cuanto más bajo es el mental
        const probability = (40 - mental) / 40; // 0% a 100% cuando mental baja de 40 a 0
        return Math.random() < probability * 0.3; // Máximo 30% de probabilidad
    }
    return false;
}
exports.shouldShowHallucination = shouldShowHallucination;
/**
 * Verifica si se debe aplicar un glitch de UI
 */
function shouldGlitchUI(mental) {
    // Mental < 40%: probabilidad de glitch
    if (mental < 40) {
        const probability = (40 - mental) / 40;
        return Math.random() < probability * 0.2; // Máximo 20% de probabilidad
    }
    return false;
}
exports.shouldGlitchUI = shouldGlitchUI;
function getGlitchType() {
    const r = Math.random();
    if (r < 0.4)
        return 'button';
    if (r < 0.8)
        return 'inventory';
    return 'sound';
}
exports.getGlitchType = getGlitchType;
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
function getCorruptName(originalName) {
    return CORRUPT_NAMES[(0, utils_1.rand)(0, CORRUPT_NAMES.length - 1)];
}
exports.getCorruptName = getCorruptName;
/**
 * Verifica si se debe mostrar un log falso en este momento
 * Retorna el log falso o null
 */
function checkForFakeLog(mental) {
    if (shouldShowHallucination(mental)) {
        return generateFakeLog();
    }
    return null;
}
exports.checkForFakeLog = checkForFakeLog;
