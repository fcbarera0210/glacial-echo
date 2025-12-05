import { SavedGame, GameState, Card, CardSerializable, LogEntry } from '@/types/game';
import { STORAGE_KEY } from './constants';

// Convierte Card a CardSerializable (elimina la función effect)
const serializeCard = (card: Card): CardSerializable => {
  const { effect, ...rest } = card;
  return rest;
};

export const saveGame = (state: GameState, deck: Card[], allCards: Card[], logEntries?: LogEntry[]): void => {
  if (typeof window === 'undefined') return;
  
  const savedGame: SavedGame = {
    state,
    deck: deck.map(serializeCard),
    allCards: allCards.map(serializeCard),
    logEntries,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGame));
  } catch (error) {
    console.error('Error guardando partida:', error);
  }
};

export const loadGame = (): SavedGame | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const savedGame: SavedGame = JSON.parse(saved);
    return savedGame;
  } catch (error) {
    console.error('Error cargando partida:', error);
    return null;
  }
};

export const clearSave = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error eliminando partida:', error);
  }
};

export const hasSave = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
};

