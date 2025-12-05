'use client';

import { useRef } from 'react';
import { useGame } from '@/hooks/useGame';
import { useFontSize } from '@/hooks/useFontSize';
import StatsPanel from '@/components/StatsPanel';
import LogPanel from '@/components/LogPanel';
import CardPanel from '@/components/CardPanel';
import InventoryPanel from '@/components/InventoryPanel';
import GameOverModal from '@/components/GameOverModal';
import DeckViewerModal from '@/components/DeckViewerModal';
import ConfirmModal from '@/components/ConfirmModal';
import EventModal from '@/components/EventModal';
import InventoryFullModal from '@/components/InventoryFullModal';

export default function Home() {
  const {
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
  } = useGame();

  const { increaseFontSize, decreaseFontSize } = useFontSize();
  const journalTextareaRef = useRef<HTMLTextAreaElement>(null);

  if (!state || !game) {
    return (
      <div className="loading-screen">
        CARGANDO SISTEMA...
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* HEADER */}
      <header className="game-header">
        <div className="game-title">
          GLACIAL_ECHO.EXE <span className="blink">_</span>
        </div>
        <div className="header-controls">
          <div className="control-group">
            <button 
              className="btn-control" 
              onClick={decreaseFontSize}
              title="Disminuir tamaño de fuente"
            >
              A-
            </button>
            <button 
              className="btn-control" 
              onClick={increaseFontSize}
              title="Aumentar tamaño de fuente"
            >
              A+
            </button>
          </div>
          <button 
            className="btn-control" 
            onClick={() => setShowDeckViewer(true)}
          >
            VER DB
          </button>
          <button 
            className="btn-control" 
            onClick={handleNewGame}
            style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
            title="Comenzar nueva partida"
          >
            NUEVA PARTIDA
          </button>
          <div className="turn-display">
            DÍA: {state.day.toString().padStart(2, '0')}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="game-content">
        {/* PANEL DE ESTADÍSTICAS */}
        <StatsPanel 
          state={state} 
          previousState={previousState || undefined}
          onRealityCheck={handleRealityCheck}
          realityCheckUsesRemaining={realityCheckUsesRemaining}
          showingRealState={showingRealState}
        />

        {/* PANEL DE LOG */}
        <LogPanel 
          entries={logEntries}
          onJournalSubmit={handleJournalSubmit}
          textareaRef={journalTextareaRef}
        />

        {/* PANEL DE ACCIONES */}
        <CardPanel
          state={state}
          currentCard={currentCard}
          effectResult={effectResult}
          deckSize={game.deck.length}
          dieValue={dieValue}
          onNextAction={() => {
            // Obtener texto del journal antes de la acción
            const journalText = journalTextareaRef.current?.value.trim();
            if (journalText && journalTextareaRef.current) {
              journalTextareaRef.current.value = '';
            }
            // handleNextAction ya maneja el texto del journal internamente
            handleNextAction(journalText);
          }}
          onFinish={handleFinish}
        />
      </div>

      {/* PANEL DE INVENTARIO */}
      <div className="inventory-section">
        <InventoryPanel
          state={state}
          onItemUsed={handleItemUsed}
          onItemRemoved={handleItemRemoved}
        />
      </div>

      {/* MODALES */}
      {gameOver && (
        <GameOverModal
          isVisible={!!gameOver}
          title={gameOver.title}
          description={gameOver.description}
          titleColor={gameOver.titleColor}
          logEntries={logEntries}
          onRestart={handleRestart}
        />
      )}

      <DeckViewerModal
        isVisible={showDeckViewer}
        allCards={game.allCards}
        onClose={() => setShowDeckViewer(false)}
      />

      {confirmModal && (
        <ConfirmModal
          isVisible={!!confirmModal}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          confirmColor={confirmModal.confirmColor}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {currentEvent && state && (
        <EventModal
          isVisible={!!currentEvent}
          event={currentEvent}
          state={state}
          onChoiceSelected={handleEventChoice}
          onClose={() => setCurrentEvent(null)}
        />
      )}

      {inventoryFullModal && state && (
        <InventoryFullModal
          isVisible={!!inventoryFullModal}
          item={inventoryFullModal.item}
          state={state}
          onReplace={inventoryFullModal.onReplace}
          onDiscard={inventoryFullModal.onDiscard}
          onClose={() => setInventoryFullModal(null)}
        />
      )}
    </div>
  );
}
