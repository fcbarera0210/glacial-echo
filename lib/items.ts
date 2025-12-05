import { Item, OperationEvent, EventChoice, GameState } from '@/types/game';
import { rand } from './utils';

// ============================================================================
// SUMINISTROS (Hearts/Introspection) - Tipo: 'supplies'
// ============================================================================

export const SUPPLIES_ITEMS: Record<string, Item> = {
  // Comunes (9)
  'ration': {
    id: 'supply_ration',
    name: 'Ración Deshidratada',
    type: 'supplies',
    rarity: 'common',
    description: 'Ración de emergencia militar. Nutritiva pero insípida.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.life = Math.min(100, newState.life + 10);
      return {
        newState,
        message: '> SISTEMA: Consumes la ración. +10% Integridad Física.'
      };
    }
  },
  'water': {
    id: 'supply_water',
    name: 'Agua Purificada',
    type: 'supplies',
    rarity: 'common',
    description: 'Agua purificada en botella sellada.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.life = Math.min(100, newState.life + 8);
      newState.mental = Math.min(100, newState.mental + 8);
      return {
        newState,
        message: '> SISTEMA: Bebes agua. +8% Integridad Física, +8% Estabilidad Mental.'
      };
    }
  },
  'coffee': {
    id: 'supply_coffee',
    name: 'Café Caliente',
    type: 'supplies',
    rarity: 'common',
    description: 'Café recién hecho. El aroma te recuerda a casa.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.mental = Math.min(100, newState.mental + 15);
      return {
        newState,
        message: '> SISTEMA: El café te da energía. +15% Estabilidad Mental.'
      };
    }
  },
  'chocolate': {
    id: 'supply_chocolate',
    name: 'Barra de Chocolate',
    type: 'supplies',
    rarity: 'common',
    description: 'Chocolate amargo. Un pequeño placer en la oscuridad.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.mental = Math.min(100, newState.mental + 5);
      return {
        newState,
        message: '> SISTEMA: El chocolate mejora tu ánimo. +5% Estabilidad Mental.'
      };
    }
  },
  'bandages': {
    id: 'supply_bandages',
    name: 'Vendas Estériles',
    type: 'supplies',
    rarity: 'common',
    description: 'Vendas médicas estériles. Detienen el sangrado.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.life = Math.min(100, newState.life + 15);
      return {
        newState,
        message: '> SISTEMA: Aplicas las vendas. +15% Integridad Física.'
      };
    }
  },
  'battery': {
    id: 'supply_battery',
    name: 'Batería AA',
    type: 'supplies',
    rarity: 'common',
    description: 'Batería alcalina. Útil para dispositivos portátiles.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      // Se usa en eventos, no tiene efecto directo
      return {
        newState: state,
        message: '> SISTEMA: Batería guardada. Útil para eventos de energía.'
      };
    }
  },
  'tape': {
    id: 'supply_tape',
    name: 'Cinta Adhesiva',
    type: 'supplies',
    rarity: 'common',
    description: 'Cinta adhesiva industrial. Reparaciones menores.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      // Se usa en eventos, no tiene efecto directo
      return {
        newState: state,
        message: '> SISTEMA: Cinta guardada. Útil para reparaciones.'
      };
    }
  },
  'whisky': {
    id: 'supply_whisky',
    name: 'Whisky (Culito)',
    type: 'supplies',
    rarity: 'common',
    description: 'Whisky barato. Calienta el cuerpo pero nubla la mente.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.mental = Math.min(100, newState.mental + 15);
      newState.life = Math.max(0, newState.life - 5);
      return {
        newState,
        message: '> SISTEMA: El whisky te relaja. +15% Estabilidad Mental, -5% Integridad Física.'
      };
    }
  },
  'thermal_patch': {
    id: 'supply_thermal_patch',
    name: 'Parche Térmico',
    type: 'supplies',
    rarity: 'common',
    description: 'Parche químico que genera calor. Dura un turno.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.life = Math.min(100, newState.life + 5);
      // El efecto de evitar daño por frío se maneja en la lógica del día
      return {
        newState,
        message: '> SISTEMA: Aplicas el parche térmico. +5% Integridad Física. Protección contra frío por 1 día.'
      };
    }
  },
  // Especiales (5)
  'medkit': {
    id: 'supply_medkit',
    name: 'Botiquín Militar',
    type: 'supplies',
    rarity: 'special',
    description: 'Botiquín médico completo. Curación masiva.',
    stackable: false,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.life = Math.min(100, newState.life + 50);
      return {
        newState,
        message: '> SISTEMA: Usas el botiquín militar. +50% Integridad Física.'
      };
    }
  },
  'recorder': {
    id: 'supply_recorder',
    name: 'Grabadora de Voz',
    type: 'supplies',
    rarity: 'special',
    description: 'Grabadora antigua. Escuchas una voz familiar...',
    stackable: false,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.mental = Math.min(100, newState.mental + 30);
      return {
        newState,
        message: '> SISTEMA: Escuchas la grabadora. Una voz familiar te tranquiliza. +30% Estabilidad Mental.'
      };
    }
  },
  'adrenaline': {
    id: 'supply_adrenaline',
    name: 'Inyección Adrenalina',
    type: 'supplies',
    rarity: 'special',
    description: 'Inyección de adrenalina. Anula penalización de dado por 2 días.',
    stackable: false,
    specialEffect: 'adrenaline_boost',
    effect: (state: GameState) => {
      const newState = { ...state };
      // El efecto de anular penalización se maneja en la lógica del juego
      return {
        newState,
        message: '> SISTEMA: Inyectas adrenalina. Penalización de dado anulada por 2 días.'
      };
    }
  },
  'photo': {
    id: 'supply_photo',
    name: 'Foto Arrugada',
    type: 'supplies',
    rarity: 'special',
    description: 'Foto de tus seres queridos. Un recuerdo clave.',
    stackable: false,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.mental = Math.min(100, newState.mental + 50);
      return {
        newState,
        message: '> SISTEMA: Miras la foto. Recuerdas por qué luchas. +50% Estabilidad Mental.'
      };
    }
  },
  'banano': {
    id: 'supply_banano',
    name: 'Banano',
    type: 'supplies',
    rarity: 'special',
    description: 'Banano especial. Expande inventario en +2 espacios (máximo 8).',
    stackable: false,
    specialEffect: 'expand_inventory',
    effect: (state: GameState) => {
      const newState = { ...state };
      if (newState.inventoryMaxSlots < 8) {
        newState.inventoryMaxSlots = 8;
      }
      return {
        newState,
        message: '> SISTEMA: Usas el banano. Inventario expandido a 8 espacios.'
      };
    }
  }
};

// ============================================================================
// INFRAESTRUCTURA (Diamonds/Base) - Tipo: 'base'
// ============================================================================

export const BASE_ITEMS: Record<string, Item> = {
  // Comunes (9)
  'flashlight': {
    id: 'base_flashlight',
    name: 'Linterna Táctica',
    type: 'base',
    rarity: 'common',
    description: 'Linterna LED potente. Bono en eventos de oscuridad.',
    stackable: false,
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Linterna guardada. Útil en eventos de oscuridad.'
      };
    }
  },
  'screwdriver': {
    id: 'base_screwdriver',
    name: 'Destornillador',
    type: 'base',
    rarity: 'common',
    description: 'Herramienta básica. Bono +1 dado en reparaciones.',
    stackable: false,
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Destornillador guardado. +1 dado en reparaciones.'
      };
    }
  },
  'network_cable': {
    id: 'base_network_cable',
    name: 'Cable de Red',
    type: 'base',
    rarity: 'common',
    description: 'Cable de red Ethernet. Bono +1 dado en hackeo.',
    stackable: false,
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Cable de red guardado. +1 dado en hackeo.'
      };
    }
  },
  'fuse': {
    id: 'base_fuse',
    name: 'Fusible Industrial',
    type: 'base',
    rarity: 'common',
    description: 'Fusible de repuesto. Repara generador (Evento).',
    stackable: false,
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Fusible guardado. Útil para reparar generador.'
      };
    }
  },
  'code_manual': {
    id: 'base_code_manual',
    name: 'Manual de Código',
    type: 'base',
    rarity: 'common',
    description: 'Manual de programación. Consumible: +15% a una barra de progreso aleatoria.',
    stackable: true,
    quantity: 1,
    effect: (state: GameState) => {
      const newState = { ...state };
      const r = Math.random();
      let message = '';
      if (r < 0.33) {
        if (newState.sosLocked) {
          message = '> SISTEMA: ERROR: Antena destruida. SOS fallido.';
        } else {
          newState.sos = Math.min(100, newState.sos + 15);
          message = '> SISTEMA: Progreso SOS: +15%.';
        }
      } else if (r < 0.66) {
        newState.firewall = Math.min(100, newState.firewall + 15);
        message = '> SISTEMA: Progreso Firewall: +15%.';
      } else {
        newState.analysis = Math.min(100, newState.analysis + 15);
        message = '> SISTEMA: Progreso Análisis: +15%.';
      }
      return { newState, message };
    }
  },
  'access_card': {
    id: 'base_access_card',
    name: 'Tarjeta de Acceso Nv1',
    type: 'base',
    rarity: 'common',
    description: 'Tarjeta de acceso nivel 1. Abre archivos encriptados fáciles.',
    stackable: false,
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Tarjeta guardada. Acceso a archivos nivel 1.'
      };
    }
  },
  'hammer': {
    id: 'base_hammer',
    name: 'Martillo',
    type: 'base',
    rarity: 'common',
    description: 'Martillo pesado. Herramienta / Arma básica.',
    stackable: false,
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Martillo guardado. Herramienta y arma básica.'
      };
    }
  },
  'flare': {
    id: 'base_flare',
    name: 'Bengala',
    type: 'base',
    rarity: 'common',
    description: 'Bengala de señalización. Uso único: +10% SOS inmediato.',
    stackable: false,
    effect: (state: GameState) => {
      const newState = { ...state };
      if (newState.sosLocked) {
        return {
          newState,
          message: '> SISTEMA: ERROR: Antena destruida. SOS fallido.'
        };
      }
      newState.sos = Math.min(100, newState.sos + 10);
      return {
        newState,
        message: '> SISTEMA: Disparas la bengala. +10% SOS inmediato.'
      };
    }
  },
  'coffee_thermos': {
    id: 'base_coffee_thermos',
    name: 'Termo de Café',
    type: 'base',
    rarity: 'common',
    description: 'Termo reutilizable. 1 uso por día: +2% Mental.',
    stackable: false,
    specialEffect: 'daily_coffee',
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.mental = Math.min(100, newState.mental + 2);
      return {
        newState,
        message: '> SISTEMA: Bebes del termo. +2% Estabilidad Mental. (1 uso por día)'
      };
    }
  },
  // Especiales (7)
  'antenna_kit': {
    id: 'base_antenna_kit',
    name: 'Kit Refuerzo Antena',
    type: 'base',
    rarity: 'special',
    description: 'CRÍTICO: Usar antes del Día 6 para evitar bloqueo SOS.',
    stackable: false,
    specialEffect: 'antenna_reinforcement',
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.isAntennaReinforced = true;
      return {
        newState,
        message: '> SISTEMA: Usas el Kit Refuerzo Antena. La antena está reforzada y resistirá la tormenta del Día 6.'
      };
    }
  },
  'encrypted_drive': {
    id: 'base_encrypted_drive',
    name: 'Disco Duro Encriptado',
    type: 'base',
    rarity: 'special',
    description: 'Disco con datos críticos. +25% Analysis al desencriptar.',
    stackable: false,
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.analysis = Math.min(100, newState.analysis + 25);
      return {
        newState,
        message: '> SISTEMA: Desencriptas el disco. +25% Análisis.'
      };
    }
  },
  'master_key': {
    id: 'base_master_key',
    name: 'Llave Maestra',
    type: 'base',
    rarity: 'special',
    description: 'Llave universal. Éxito automático en eventos de "Puerta/Cerradura".',
    stackable: false,
    specialEffect: 'auto_unlock',
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Llave guardada. Éxito automático en cerraduras.'
      };
    }
  },
  'heating_core': {
    id: 'base_heating_core',
    name: 'Núcleo de Calefacción',
    type: 'base',
    rarity: 'special',
    description: 'Núcleo térmico avanzado. +30% Life, reduce penalización de frío diaria.',
    stackable: false,
    specialEffect: 'reduce_cold_penalty',
    effect: (state: GameState) => {
      const newState = { ...state };
      newState.life = Math.min(100, newState.life + 30);
      return {
        newState,
        message: '> SISTEMA: Instalas el núcleo. +30% Integridad Física. Penalización de frío reducida.'
      };
    }
  },
  'optimization_algorithm': {
    id: 'base_optimization_algorithm',
    name: 'Algoritmo de Optimización',
    type: 'base',
    rarity: 'special',
    description: 'Reduce requisitos del Final S a 85% en cada barra.',
    stackable: false,
    specialEffect: 'final_s_85',
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Algoritmo guardado. Final S: requisitos reducidos a 85%.'
      };
    }
  },
  'data_backup': {
    id: 'base_data_backup',
    name: 'Backup de Datos',
    type: 'base',
    rarity: 'special',
    description: 'Permite redistribuir progreso entre barras.',
    stackable: false,
    specialEffect: 'redistribute_progress',
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Backup guardado. Permite redistribuir progreso.'
      };
    }
  },
  'master_protocol': {
    id: 'base_master_protocol',
    name: 'Protocolo Maestro',
    type: 'base',
    rarity: 'special',
    description: 'Reduce requisitos del Final S a 80% en cada barra.',
    stackable: false,
    specialEffect: 'final_s_80',
    effect: (state: GameState) => {
      return {
        newState: state,
        message: '> SISTEMA: Protocolo guardado. Final S: requisitos reducidos a 80%.'
      };
    }
  }
};

// ============================================================================
// MAPEO DE CARTAS A OBJETOS/EVENTOS
// ============================================================================

// Mapeo de rangos a objetos de Suministros (Hearts)
export const HEARTS_MAPPING: Record<string, string> = {
  '2': 'ration',
  '3': 'water',
  '4': 'coffee',
  '5': 'chocolate',
  '6': 'bandages',
  '7': 'battery',
  '8': 'tape',
  '9': 'whisky',
  '10': 'thermal_patch',
  'J': 'medkit',
  'Q': 'recorder',
  'K': 'adrenaline',
  'A': 'photo'
};

// Mapeo de rangos a objetos de Infraestructura (Diamonds)
// 60% objeto positivo, 40% evento negativo (se maneja en la lógica)
export const DIAMONDS_MAPPING: Record<string, string> = {
  '2': 'flashlight',
  '3': 'screwdriver',
  '4': 'network_cable',
  '5': 'fuse',
  '6': 'code_manual',
  '7': 'access_card',
  '8': 'hammer',
  '9': 'flare',
  '10': 'coffee_thermos',
  'J': 'antenna_kit',
  'Q': 'encrypted_drive',
  'K': 'master_key',
  'A': 'heating_core'
};

// Mapeo de rangos especiales de Diamonds (objetos especiales adicionales)
export const DIAMONDS_SPECIAL_MAPPING: Record<string, string> = {
  '2': 'optimization_algorithm', // Para cartas especiales adicionales
  '3': 'data_backup',
  '4': 'master_protocol'
};

// Mapeo de rangos a objetos especiales adicionales (Banano)
export const SPECIAL_ITEMS_MAPPING: Record<string, string> = {
  'banano': 'banano' // Se puede encontrar en cualquier carta especial
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

export function getItemById(id: string): Item | null {
  // Buscar en Suministros
  for (const item of Object.values(SUPPLIES_ITEMS)) {
    if (item.id === id) return item;
  }
  // Buscar en Infraestructura
  for (const item of Object.values(BASE_ITEMS)) {
    if (item.id === id) return item;
  }
  return null;
}

export function getItemByCard(suit: string, rank: string): Item | null {
  if (suit === '♥' || suit === 'HEARTS') {
    const key = HEARTS_MAPPING[rank];
    if (key && SUPPLIES_ITEMS[key]) {
      return { ...SUPPLIES_ITEMS[key] };
    }
  } else if (suit === '♦' || suit === 'DIAMONDS') {
    // 60% objeto, 40% evento (se maneja en la lógica del juego)
    const key = DIAMONDS_MAPPING[rank];
    if (key && BASE_ITEMS[key]) {
      return { ...BASE_ITEMS[key] };
    }
  }
  return null;
}

// Función para obtener todos los objetos de un tipo
export function getItemsByType(type: 'supplies' | 'base'): Item[] {
  if (type === 'supplies') {
    return Object.values(SUPPLIES_ITEMS);
  } else {
    return Object.values(BASE_ITEMS);
  }
}

