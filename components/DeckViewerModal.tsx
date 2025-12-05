'use client';

import { useState } from 'react';
import { Card } from '@/types/game';

interface DeckViewerModalProps {
  isVisible: boolean;
  allCards: Card[];
  onClose: () => void;
}

export default function DeckViewerModal({
  isVisible,
  allCards,
  onClose
}: DeckViewerModalProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  if (!isVisible) return null;

  const sortedDeck = [...allCards].sort((a, b) => {
    if (a.suit.label !== b.suit.label) {
      return a.suit.label.localeCompare(b.suit.label);
    }
    return 0;
  });

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="deck-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="deck-modal-body">
          <div className="deck-grid">
            {sortedDeck.map(card => (
              <div
                key={card.id}
                className={`card-mini ${card.drawn ? 'used' : ''}`}
                onClick={() => setSelectedCard(card)}
              >
                <div className={`card-mini-symbol ${card.suit.color}`}>
                  {card.suit.symbol}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 'calc(11px * var(--font-size-multiplier))' }}>
                  {card.rank}
                </div>
              </div>
            ))}
          </div>
          <div className="deck-details">
            {selectedCard ? (
              <>
                <div className={`card-suit ${selectedCard.suit.color}`} style={{ fontSize: 'calc(48px * var(--font-size-multiplier))' }}>
                  {selectedCard.suit.symbol}
                </div>
                <div className="card-title" style={{ fontSize: 'calc(16px * var(--font-size-multiplier))' }}>
                  ARCHIVO {selectedCard.rank}
                </div>
                <div style={{ fontSize: 'calc(10px * var(--font-size-multiplier))', color: 'var(--text-dim)' }}>
                  TIPO: {selectedCard.suit.label}
                </div>
                <div className="card-text" style={{ fontStyle: 'italic', marginTop: '12px' }}>
                  "{selectedCard.text}"
                </div>
                <div style={{ marginTop: '16px', fontSize: 'calc(11px * var(--font-size-multiplier))' }}>
                  {selectedCard.drawn ? (
                    <span style={{ color: 'var(--accent-red)' }}>[PROCESADO]</span>
                  ) : (
                    <span style={{ color: 'var(--accent-green)' }}>[DISPONIBLE]</span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.5, color: 'var(--text-dim)' }}>
                SELECCIONA UN BLOQUE DE DATOS
              </div>
            )}
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={onClose}
        >
          CERRAR BASE DE DATOS
        </button>
      </div>
    </div>
  );
}
