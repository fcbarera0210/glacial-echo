import { rand } from './utils';

/**
 * Realiza una tirada de operación
 * @param difficulty Dificultad requerida (1-6)
 * @param mentalModifier Modificador mental
 * @param itemModifier Modificador de objeto (si aplica)
 * @returns Resultado de la tirada (1-6)
 */
export function rollOperation(
  difficulty: number,
  mentalModifier: number,
  itemModifier: number = 0
): number {
  const dieRoll = rand(1, 6);
  let total = dieRoll + mentalModifier + itemModifier;
  
  // Redondear si es necesario
  if (mentalModifier === 0.5 || mentalModifier === -0.5) {
    total = Math.round(total);
  }
  
  return Math.max(1, Math.min(6, total));
}

/**
 * Calcula el resultado de una operación
 * @param roll Resultado de la tirada
 * @param difficulty Dificultad requerida
 * @returns Objeto con éxito, recompensa y penalización
 */
export function calculateOperationResult(
  roll: number,
  difficulty: number
): { success: boolean; roll: number; difficulty: number } {
  return {
    success: roll >= difficulty,
    roll,
    difficulty
  };
}

/**
 * Obtiene el modificador de objeto según el tipo de operación
 */
export function getItemModifierForOperation(
  itemId: string,
  operationType: 'hack' | 'repair' | 'analyze' | 'transmit'
): number {
  // Modificadores de objetos para operaciones
  const modifiers: Record<string, number> = {
    'base_screwdriver': 1, // +1 en reparaciones
    'base_network_cable': 1, // +1 en hackeo
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

