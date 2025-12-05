'use client';

import { Card, GameState } from '@/types/game';
import { useEffect, useState } from 'react';

interface CardPanelProps {
  state: GameState;
  currentCard: Card | null;
  effectResult: string | null;
  deckSize: number;
  dieValue: number | null;
  onNextAction: () => void;
  onFinish: () => void;
}

export default function CardPanel({
  state,
  currentCard,
  effectResult,
  deckSize,
  dieValue,
  onNextAction,
  onFinish
}: CardPanelProps) {
  const [dieActive, setDieActive] = useState(false);

  useEffect(() => {
    if (dieValue !== null) {
      setDieActive(true);
      const timer = setTimeout(() => setDieActive(false), 500);
      return () => clearTimeout(timer);
    }
  }, [dieValue]);

  const displayValue = state.cardsPending > 0 ? state.cardsPending : '-';
  const dieLabel = state.cardsPending > 0 
    ? 'CARTAS PENDIENTES' 
    : 'LANZAR DADO';

  return (
    <div className="action-panel">
      <div className="deck-info">
        BLOQUES DE DATOS: <strong>{deckSize}</strong>
      </div>
      
      <div className="die-section">
        <div className="die-label">{dieLabel}</div>
        <div className={`die-display ${dieActive ? 'active' : ''}`}>
          {displayValue}
        </div>
      </div>

      <div className="card-display">
        {currentCard ? (
          <>
            <div className={`card-suit ${currentCard.suit.color}`}>
              {currentCard.suit.symbol}
            </div>
            <div className={`card-title ${currentCard.suit.color}`}>
              ARCHIVO: {currentCard.rank}
            </div>
            <div className="card-text">{currentCard.text}</div>
            {effectResult && (
              <div className="card-effect">
                EFECTO: {effectResult.replace(/^> SISTEMA: /, '')}
              </div>
            )}
          </>
        ) : (
          <div style={{ opacity: 0.5, color: 'var(--text-dim)' }}>
            SISTEMA EN ESPERA
          </div>
        )}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className={`btn-primary ${state.cardsPending > 0 ? 'processing' : ''}`}
          onClick={onNextAction}
          disabled={state.gameOver}
        >
          {state.cardsPending > 0
            ? `PROCESAR DATO (${state.cardsPending} RESTANTES)`
            : 'INICIAR DÍA (LANZAR D10)'}
        </button>
        {/* Botón de finalizar sesión removido según nuevas mecánicas V2
            Los finales se disparan automáticamente por eventos */}
      </div>
    </div>
  );
}
