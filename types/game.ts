export type ItemType = 'supplies' | 'base' | 'threat' | 'operation';
export type ItemRarity = 'common' | 'special';
export type EventType = 'positive' | 'negative' | 'choice';

export interface Suit {
  symbol: string;
  type: 'introspection' | 'base' | 'threat' | 'work';
  color: string;
  label: string;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  stackable: boolean;
  quantity?: number; // Para objetos apilables
  effect?: (state: GameState) => { newState: GameState; message: string };
  // Para objetos especiales
  specialEffect?: string; // ID del efecto especial
}

export interface EventChoice {
  id: string;
  text: string;
  difficulty?: number; // Para operaciones
  successReward?: { type: 'sos' | 'firewall' | 'analysis' | 'mental' | 'life'; amount: number };
  failurePenalty?: { type: 'sos' | 'firewall' | 'analysis' | 'mental' | 'life'; amount: number };
  autoSuccess?: boolean; // Para opciones con objetos
  requiredItemId?: string; // Para opciones que requieren un objeto
}

export interface OperationEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface Card {
  id: number;
  suit: Suit;
  rank: string;
  text: string;
  effect: (state: GameState) => string;
  drawn: boolean;
  // Nueva información para objetos/eventos
  item?: Item;
  event?: OperationEvent | EventChoice;
}

// Tipo para cartas serializadas (sin la función effect)
export interface CardSerializable {
  id: number;
  suit: Suit;
  rank: string;
  text: string;
  drawn: boolean;
}

export interface GameState {
  mental: number;
  life: number;
  sos: number;
  firewall: number;
  analysis: number;
  day: number; // Cambiado de 'turn' a 'day'
  gameOver: boolean;
  cardsPending: number;
  sosLocked: boolean;
  rescueTimer: number | null; // Contador regresivo para rescate
  isAntennaReinforced: boolean; // Si la antena fue reforzada en Día 6
  inventory: Item[]; // Array de objetos (máximo 6 base, expandible a 8)
  inventoryMaxSlots: number; // Número máximo de espacios (6 base, 8 con "Banano")
  itemsUsedToday: string[]; // IDs de objetos usados en el día actual (para límites diarios)
  adrenalineBoostDays?: number; // Días restantes del efecto de adrenalina (anula penalización de dado)
  // Mantener 'turn' para compatibilidad con guardado antiguo (se migrará)
  turn?: number;
}

export interface LogEntry {
  text: string;
  type: string;
  timestamp: string;
}

export interface SavedGame {
  state: GameState;
  deck: CardSerializable[];
  allCards: CardSerializable[];
  logEntries?: LogEntry[];
  timestamp: number;
}

export type GameOverReason = 'insanity' | 'frozen' | 'deck_empty' | 'manual';

