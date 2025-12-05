"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemModifierForOperation = exports.calculateOperationResult = exports.rollOperation = void 0;
const utils_1 = require("./utils");
/**
 * Realiza una tirada de operación
 * @param difficulty Dificultad requerida (1-6)
 * @param mentalModifier Modificador mental
 * @param itemModifier Modificador de objeto (si aplica)
 * @returns Resultado de la tirada (1-6)
 */
function rollOperation(difficulty, mentalModifier, itemModifier = 0) {
    const dieRoll = (0, utils_1.rand)(1, 6);
    let total = dieRoll + mentalModifier + itemModifier;
    // Redondear si es necesario
    if (mentalModifier === 0.5 || mentalModifier === -0.5) {
        total = Math.round(total);
    }
    return Math.max(1, Math.min(6, total));
}
exports.rollOperation = rollOperation;
/**
 * Calcula el resultado de una operación
 * @param roll Resultado de la tirada
 * @param difficulty Dificultad requerida
 * @returns Objeto con éxito, recompensa y penalización
 */
function calculateOperationResult(roll, difficulty) {
    return {
        success: roll >= difficulty,
        roll,
        difficulty
    };
}
exports.calculateOperationResult = calculateOperationResult;
/**
 * Obtiene el modificador de objeto según el tipo de operación
 */
function getItemModifierForOperation(itemId, operationType) {
    // Modificadores de objetos para operaciones
    const modifiers = {
        'base_screwdriver': 1,
        'base_network_cable': 1,
        'base_destornillador': 1, // +1 en reparaciones (alias)
    };
    // Verificar si el objeto aplica a este tipo de operación
    if (operationType === 'repair' && (itemId === 'base_screwdriver' || itemId === 'base_destornillador')) {
        return modifiers[itemId] || 0;
    }
    if (operationType === 'hack' && itemId === 'base_network_cable') {
        return modifiers[itemId] || 0;
    }
    return 0;
}
exports.getItemModifierForOperation = getItemModifierForOperation;
