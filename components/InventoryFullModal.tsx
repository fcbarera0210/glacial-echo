'use client';

import { Item, GameState } from '@/types/game';

interface InventoryFullModalProps {
  isVisible: boolean;
  item: Item | null;
  state: GameState;
  onReplace: (index: number) => void;
  onDiscard: () => void;
  onClose: () => void;
}

export default function InventoryFullModal({
  isVisible,
  item,
  state,
  onReplace,
  onDiscard,
  onClose
}: InventoryFullModalProps) {
  if (!isVisible || !item) return null;

  const inventory = state.inventory || [];

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="inventory-full-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>INVENTARIO LLENO</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p className="inventory-full-message">
            Has encontrado: <strong>{item.name}</strong>
          </p>
          <p className="inventory-full-description">
            Tu inventario está lleno ({inventory.length}/{state.inventoryMaxSlots}). 
            ¿Qué deseas hacer?
          </p>
          
          <div className="inventory-replace-options">
            <h3>Reemplazar un objeto:</h3>
            <div className="inventory-replace-list">
              {inventory.map((invItem, index) => (
                <button
                  key={index}
                  className="btn-replace-item"
                  onClick={() => {
                    onReplace(index);
                    onClose();
                  }}
                >
                  <div className="replace-item-name">{invItem.name}</div>
                  <div className="replace-item-description">{invItem.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="inventory-full-actions">
            <button
              className="btn-discard-new"
              onClick={() => {
                onDiscard();
                onClose();
              }}
            >
              DESCARTAR NUEVO OBJETO
            </button>
            <button
              className="btn-cancel"
              onClick={onClose}
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

