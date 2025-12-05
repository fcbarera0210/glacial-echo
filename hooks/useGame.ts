'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '@/lib/game';
import { GameState, Card, GameOverReason, OperationEvent, EventChoice, Item } from '@/types/game';
import { loadGame, clearSave, saveGame } from '@/lib/storage';
import { formatTime } from '@/lib/utils';

interface LogEntry {
  text: string;
  type: string;
  timestamp: string;
}

export function useGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [previousState, setPreviousState] = useState<GameState | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [effectResult, setEffectResult] = useState<string | null>(null);
  const [dieValue, setDieValue] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<{ title: string; description: string; titleColor?: string } | null>(null);
  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<OperationEvent | null>(null);
  const [inventoryFullModal, setInventoryFullModal] = useState<{
    item: Item;
    onReplace: (index: number) => void;
    onDiscard: () => void;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
  } | null>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    let saved: ReturnType<typeof loadGame> = null;
    try {
      saved = loadGame();
    } catch (error) {
      console.error('Error al cargar partida guardada:', error);
    }
    
    const newGame = new Game(saved || undefined);
    
    // Configurar callbacks
    newGame.onStateChange = (newState) => {
      setState(prev => {
        // Guardar el estado anterior para animaciones (barras, etc.)
        // Solo guardar si hay un estado previo válido
        if (prev) {
          setPreviousState(prev);
        }
        return newState;
      });
    };

    newGame.onLogEntry = (text, type) => {
      setLogEntries(prev => {
        const newEntry = {
          text,
          type,
          timestamp: formatTime()
        };
        const updated = [...prev, newEntry];
        // Guardar el log actualizado junto con el estado del juego
        const currentGame = gameRef.current;
        if (currentGame) {
          saveGame(currentGame.state, currentGame.deck, currentGame.allCards, updated);
        }
        return updated;
      });
    };

    newGame.onCardDrawn = (card, result) => {
      setCurrentCard(card);
      setEffectResult(result);
      // Efecto visual para cartas de amenaza
      if (card.suit.type === 'threat') {
        const container = document.querySelector('.terminal-container');
        if (container) {
          (container as HTMLElement).style.boxShadow = "inset -1px -1px 0 #ff0000, inset 1px 1px 0 #ff0000";
          setTimeout(() => {
            (container as HTMLElement).style.boxShadow = "";
          }, 300);
        }
      }
    };

    newGame.onDieRolled = (roll) => {
      setDieValue(roll);
    };

    newGame.onGameOver = (reason, title, description, titleColor) => {
      setGameOver({ title, description, titleColor });
      clearSave();
    };

    newGame.onEventTriggered = (event) => {
      setCurrentEvent(event);
    };

    newGame.onInventoryFull = (item) => {
      setInventoryFullModal({
        item,
        onReplace: (index: number) => {
          if (gameRef.current) {
            const currentInventory = gameRef.current.state.inventory;
            const newInventory = [...currentInventory];
            newInventory[index] = item;
            gameRef.current.state.inventory = newInventory;
            gameRef.current.notifyStateChange();
            gameRef.current.onLogEntry?.(
              `> SISTEMA: ${item.name} agregado al inventario (reemplazando ${currentInventory[index].name}).`,
              'system'
            );
            // El log se guarda automáticamente en onLogEntry
          }
          setInventoryFullModal(null);
        },
        onDiscard: () => {
          if (gameRef.current) {
            gameRef.current.onLogEntry?.(
              `> SISTEMA: ${item.name} descartado (inventario lleno).`,
              'system'
            );
            // El log se guarda automáticamente en onLogEntry
          }
          setInventoryFullModal(null);
        }
      });
    };

    setGame(newGame);
    gameRef.current = newGame;
    setState(newGame.state);

    // Log inicial o cargar log guardado
    if (!saved) {
      const initialLog: LogEntry[] = [{
        text: `> SISTEMA INICIADO. USUARIO: ANALISTA_7.<br>
> TEMPERATURA EXTERNA: -64°C.<br>
> ESTADO DE LA BASE: CRÍTICO/ABANDONADA.<br>
> INICIANDO PROCESO DE RECUPERACIÓN DE DATOS...<br>
<br>
> ESPERANDO LANZAMIENTO DE DADO PARA CALCULAR ANCHO DE BANDA...`,
        type: 'system',
        timestamp: formatTime()
      }];
      setLogEntries(initialLog);
      // Guardar el log inicial
      saveGame(newGame.state, newGame.deck, newGame.allCards, initialLog);
    } else {
      // Cargar log guardado si existe
      if (saved.logEntries && saved.logEntries.length > 0) {
        setLogEntries(saved.logEntries);
      } else {
        // Mensaje cuando se carga una partida guardada sin log
        const recoveryLog: LogEntry[] = [{
          text: `> PARTIDA RECUPERADA.<br>
> CICLO ACTUAL: ${newGame.state.turn}<br>
> ESTADO DEL SISTEMA RESTAURADO.<br>
<br>
> CONTINUANDO DESDE EL ÚLTIMO PUNTO DE GUARDADO...`,
          type: 'system',
          timestamp: formatTime()
        }];
        setLogEntries(recoveryLog);
        saveGame(newGame.state, newGame.deck, newGame.allCards, recoveryLog);
      }
    }
  }, []);

  const handleNextAction = useCallback((userText?: string) => {
    if (game && !game.state.gameOver) {
      game.nextAction(userText);
      if (game.state.cardsPending === 0) {
        setCurrentCard(null);
        setEffectResult(null);
      }
    }
  }, [game]);

  const handleFinish = useCallback(() => {
    if (game) {
      setConfirmModal({
        title: 'FINALIZAR SESIÓN',
        message: '¿Estás seguro de finalizar la sesión? El sistema calculará tus probabilidades de supervivencia.',
        confirmText: 'FINALIZAR',
        cancelText: 'CANCELAR',
        confirmColor: 'var(--accent-red)',
        onConfirm: () => {
          if (game) {
            game.attemptFinish();
          }
        }
      });
    }
  }, [game]);

  const handleRestart = useCallback(() => {
    clearSave();
    window.location.reload();
  }, []);

  const handleNewGame = useCallback(() => {
    setConfirmModal({
      title: 'NUEVA PARTIDA',
      message: '¿Estás seguro de que quieres comenzar una nueva partida? Se perderá el progreso actual.',
      confirmText: 'CONFIRMAR',
      cancelText: 'CANCELAR',
      confirmColor: 'var(--accent-red)',
      onConfirm: () => {
        clearSave();
        window.location.reload();
      }
    });
  }, []);

  const handleJournalSubmit = useCallback((text: string) => {
    handleNextAction(text);
  }, [handleNextAction]);

  const handleItemUsed = useCallback((newState: GameState, message: string) => {
    if (game) {
      game.state = newState;
      game.notifyStateChange();
      if (message) {
        game.onLogEntry?.(message, 'system');
      }
      saveGame(game.state, game.deck, game.allCards, logEntries);
    }
  }, [game, logEntries]);

  const handleItemRemoved = useCallback((newState: GameState) => {
    if (game) {
      game.state = newState;
      game.notifyStateChange();
      saveGame(game.state, game.deck, game.allCards, logEntries);
    }
  }, [game, logEntries]);

  const handleEventChoice = useCallback((
    choice: EventChoice,
    result: { success: boolean; roll: number; difficulty: number },
    message: string
  ) => {
    if (game) {
      const resultMessage = game.processEventChoice(choice, result);
      if (message) {
        game.onLogEntry?.(message, 'system');
      }
      if (resultMessage) {
        game.onLogEntry?.(resultMessage, 'system');
      }
      // El modal se cierra desde el botón de cerrar, no automáticamente
      setCurrentEvent(null);
      saveGame(game.state, game.deck, game.allCards, logEntries);
    }
  }, [game, logEntries]);

  const handleRealityCheck = useCallback(() => {
    if (game && !game.state.gameOver) {
      const result = game.verifyReality();
      if (result.message) {
        game.onLogEntry?.(result.message, result.success ? 'system' : 'horror');
      }
      saveGame(game.state, game.deck, game.allCards, logEntries);
    }
  }, [game, logEntries]);

  // Calcular usos restantes de verificación de realidad
  const realityCheckUsesRemaining = game && state
    ? game.getMaxRealityChecksPerDay(state.mental) - game.realityCheckUsesToday
    : undefined;

  const showingRealState = game ? game.shouldShowRealState() : false;

  return {
    game,
    state,
    previousState,
    logEntries,
    currentCard,
    effectResult,
    dieValue,
    gameOver,
    showDeckViewer,
    setShowDeckViewer,
    confirmModal,
    setConfirmModal,
    handleNextAction,
    handleFinish,
    handleRestart,
    handleNewGame,
    handleJournalSubmit,
    handleItemUsed,
    handleItemRemoved,
    handleRealityCheck,
    realityCheckUsesRemaining,
    showingRealState,
    currentEvent,
    setCurrentEvent,
    handleEventChoice,
    inventoryFullModal,
    setInventoryFullModal
  };
}

