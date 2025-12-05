import { Item, GameState } from '@/types/game';
import { getItemById } from './items';

/**
 * Verifica si se puede agregar un objeto al inventario
 */
export function canAddItem(
  inventory: Item[],
  item: Item,
  maxSlots: number
): boolean {
  // Si el inventario no está lleno, se puede agregar
  if (inventory.length < maxSlots) {
    return true;
  }

  // Si está lleno, verificar si el objeto es apilable y ya existe en el inventario
  if (item.stackable) {
    const existingItem = inventory.find(i => i.id === item.id);
    return existingItem !== undefined;
  }

  return false;
}

/**
 * Intenta agregar un objeto al inventario
 * Retorna el nuevo inventario o null si no se puede agregar
 */
export function addItem(
  inventory: Item[],
  item: Item,
  maxSlots: number
): { newInventory: Item[]; message: string } | null {
  // Verificar si el objeto es apilable y ya existe
  if (item.stackable) {
    const existingIndex = inventory.findIndex(i => i.id === item.id);
    if (existingIndex !== -1) {
      // Apilar el objeto
      const newInventory = [...inventory];
      const existingItem = newInventory[existingIndex];
      newInventory[existingIndex] = {
        ...existingItem,
        quantity: (existingItem.quantity || 1) + 1
      };
      return {
        newInventory,
        message: `${item.name} apilado. Cantidad: ${newInventory[existingIndex].quantity}`
      };
    }
  }

  // Verificar si hay espacio
  if (inventory.length >= maxSlots) {
    return null; // Inventario lleno
  }

  // Agregar nuevo objeto
  const newItem: Item = {
    ...item,
    quantity: item.stackable ? 1 : undefined
  };

  return {
    newInventory: [...inventory, newItem],
    message: `${item.name} agregado al inventario.`
  };
}

/**
 * Elimina un objeto del inventario por índice
 */
export function removeItem(inventory: Item[], index: number): Item[] {
  if (index < 0 || index >= inventory.length) {
    return inventory;
  }

  const newInventory = [...inventory];
  newInventory.splice(index, 1);
  return newInventory;
}

/**
 * Reduce la cantidad de un objeto apilable
 */
export function reduceItemQuantity(
  inventory: Item[],
  index: number
): Item[] {
  if (index < 0 || index >= inventory.length) {
    return inventory;
  }

  const item = inventory[index];
  if (!item.stackable || !item.quantity || item.quantity <= 1) {
    // Si no es apilable o solo hay 1, eliminar completamente
    return removeItem(inventory, index);
  }

  // Reducir cantidad
  const newInventory = [...inventory];
  newInventory[index] = {
    ...item,
    quantity: item.quantity - 1
  };
  return newInventory;
}

/**
 * Usa un objeto del inventario
 * Retorna el nuevo inventario, nuevo estado y mensaje
 */
export function useItem(
  inventory: Item[],
  index: number,
  state: GameState,
  maxSlots: number
): { newInventory: Item[]; newState: GameState; message: string } | null {
  if (index < 0 || index >= inventory.length) {
    return null;
  }

  const item = inventory[index];
  
  // Verificar si el objeto es reutilizable (no se elimina al usar)
  // El kit de refuerzo antena NO es reutilizable, debe desaparecer al usarse
  const isReusable = item.specialEffect === 'daily_coffee' || 
                     item.specialEffect === 'reduce_cold_penalty' ||
                     item.specialEffect === 'auto_unlock' ||
                     item.specialEffect === 'final_s_85' ||
                     item.specialEffect === 'final_s_80' ||
                     item.specialEffect === 'redistribute_progress' ||
                     item.id === 'base_coffee_thermos' ||
                     item.id === 'base_heating_core' ||
                     item.id === 'base_master_key' ||
                     item.id === 'base_optimization_algorithm' ||
                     item.id === 'base_data_backup' ||
                     item.id === 'base_master_protocol';
  
  // Si el objeto tiene un efecto, aplicarlo
  if (item.effect) {
    const result = item.effect(state);
    let newInventory: Item[];

    // Si es reutilizable, NO eliminar del inventario
    if (isReusable) {
      newInventory = inventory; // Mantener el objeto
    }
    // Si es apilable, reducir cantidad; si no, eliminar
    else if (item.stackable && item.quantity && item.quantity > 1) {
      newInventory = reduceItemQuantity(inventory, index);
    } else {
      newInventory = removeItem(inventory, index);
    }

    // Aplicar efectos especiales
    const newState = applySpecialEffects(result.newState, item);
    
    // Actualizar el inventario en el estado
    newState.inventory = newInventory;
    
    // Si el objeto tiene límite de uso diario (como el termo), agregarlo a itemsUsedToday
    if (item.specialEffect === 'daily_coffee' || item.id === 'base_coffee_thermos') {
      if (!newState.itemsUsedToday) {
        newState.itemsUsedToday = [];
      }
      if (!newState.itemsUsedToday.includes(item.id)) {
        newState.itemsUsedToday = [...newState.itemsUsedToday, item.id];
      }
    }

    return {
      newInventory,
      newState,
      message: result.message
    };
  }

  // Si no tiene efecto directo, solo eliminar del inventario
  const newInventory = removeItem(inventory, index);
  const newState = { ...state, inventory: newInventory };
  return {
    newInventory,
    newState,
    message: `> SISTEMA: ${item.name} usado.`
  };
}

/**
 * Aplica efectos especiales de objetos
 */
function applySpecialEffects(state: GameState, item: Item): GameState {
  const newState = { ...state };

  switch (item.specialEffect) {
    case 'expand_inventory':
      // El efecto de expandir inventario ya se aplicó en el efecto del objeto
      // Solo asegurarse de que el máximo sea 8
      if (newState.inventoryMaxSlots < 8) {
        newState.inventoryMaxSlots = 8;
      }
      break;
    case 'adrenaline_boost':
      // Activar efecto de adrenalina por 2 días
      if (!newState.adrenalineBoostDays) {
        newState.adrenalineBoostDays = 2;
      } else {
        newState.adrenalineBoostDays = 2; // Resetear a 2 días si se usa de nuevo
      }
      break;
    case 'reduce_cold_penalty':
      // Se maneja en la lógica del día
      break;
    case 'daily_coffee':
      // Se maneja en la lógica del día (1 uso por día)
      break;
    case 'antenna_reinforcement':
      // Se maneja en el evento del Día 6
      break;
    case 'auto_unlock':
      // Se maneja en eventos de puertas/cerraduras
      break;
    case 'final_s_85':
    case 'final_s_80':
    case 'redistribute_progress':
      // Se maneja en la lógica de finales
      break;
  }

  return newState;
}

/**
 * Verifica si el jugador tiene un objeto específico en el inventario
 */
export function hasItem(inventory: Item[], itemId: string): boolean {
  return inventory.some(item => item.id === itemId);
}

/**
 * Obtiene un objeto del inventario por ID
 */
export function getItemFromInventory(
  inventory: Item[],
  itemId: string
): Item | null {
  return inventory.find(item => item.id === itemId) || null;
}

/**
 * Obtiene el número total de objetos en el inventario (contando apilados)
 */
export function getInventoryItemCount(inventory: Item[]): number {
  return inventory.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);
}

/**
 * Obtiene el número de espacios ocupados en el inventario
 */
export function getInventoryUsedSlots(inventory: Item[]): number {
  return inventory.length;
}

/**
 * Verifica si el inventario está lleno
 */
export function isInventoryFull(inventory: Item[], maxSlots: number): boolean {
  return inventory.length >= maxSlots;
}

