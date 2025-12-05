'use client';

import { GameState, Item } from '@/types/game';
import { useItem as useInventoryItem, removeItem } from '@/lib/inventory';
import { useState } from 'react';

interface InventoryPanelProps {
  state: GameState;
  onItemUsed: (newState: GameState, message: string) => void;
  onItemRemoved: (newState: GameState) => void;
}

function getItemEffectDescription(item: Item): string {
  // Generar descripción del efecto basado en el objeto
  if (item.specialEffect === 'daily_coffee') {
    return 'Efecto: +2% Estabilidad Mental (1 uso por día, reutilizable)';
  }
  if (item.specialEffect === 'expand_inventory') {
    return 'Efecto: Expande inventario a 8 espacios';
  }
  if (item.specialEffect === 'antenna_reinforcement') {
    return 'Efecto: Evita bloqueo SOS en Día 6 (usar antes del Día 6)';
  }
  if (item.specialEffect === 'final_s_85') {
    return 'Efecto: Reduce requisitos Final S a 85%';
  }
  if (item.specialEffect === 'final_s_80') {
    return 'Efecto: Reduce requisitos Final S a 80%';
  }
  if (item.specialEffect === 'adrenaline_boost') {
    return 'Efecto: Anula penalización de dado por 2 días';
  }
  if (item.specialEffect === 'reduce_cold_penalty') {
    return 'Efecto: Reduce penalización de frío diaria';
  }
  if (item.specialEffect === 'auto_unlock') {
    return 'Efecto: Éxito automático en cerraduras';
  }
  if (item.specialEffect === 'redistribute_progress') {
    return 'Efecto: Permite redistribuir progreso entre barras';
  }
  
  // Efectos directos de objetos comunes
  if (item.id === 'supply_ration') {
    return 'Efecto: +10% Integridad Física';
  }
  if (item.id === 'supply_water') {
    return 'Efecto: +5% Integridad Física, +5% Estabilidad Mental';
  }
  if (item.id === 'supply_coffee') {
    return 'Efecto: +10% Estabilidad Mental';
  }
  if (item.id === 'supply_chocolate') {
    return 'Efecto: +5% Estabilidad Mental';
  }
  if (item.id === 'supply_bandages') {
    return 'Efecto: +10% Integridad Física';
  }
  if (item.id === 'supply_whisky') {
    return 'Efecto: +15% Estabilidad Mental, -5% Integridad Física';
  }
  if (item.id === 'supply_thermal_patch') {
    return 'Efecto: +5% Integridad Física, protección contra frío 1 día';
  }
  if (item.id === 'supply_medkit') {
    return 'Efecto: +40% Integridad Física';
  }
  if (item.id === 'supply_recorder') {
    return 'Efecto: +30% Estabilidad Mental';
  }
  if (item.id === 'supply_adrenaline') {
    return 'Efecto: Anula penalización de dado por 2 días';
  }
  if (item.id === 'supply_photo') {
    return 'Efecto: +50% Estabilidad Mental';
  }
  if (item.id === 'base_code_manual') {
    return 'Efecto: +15% a una barra de progreso aleatoria';
  }
  if (item.id === 'base_flare') {
    return 'Efecto: +10% SOS inmediato';
  }
  if (item.id === 'base_encrypted_drive') {
    return 'Efecto: +25% Análisis';
  }
  if (item.id === 'base_heating_core') {
    return 'Efecto: +30% Integridad Física, reduce penalización de frío';
  }
  if (item.id === 'base_flashlight' || item.id === 'base_screwdriver' || item.id === 'base_network_cable') {
    return 'Efecto: Bono en eventos (ver descripción)';
  }
  
  return 'Efecto: Ver descripción';
}

function getItemDetailedInfo(item: Item): { when: string; effect: string } {
  // Información detallada sobre cuándo y cómo se usa cada objeto
  switch (item.id) {
    case 'base_flashlight':
      return {
        when: 'Eventos de oscuridad o exploración',
        effect: 'Reduce la dificultad del dado en eventos relacionados con oscuridad o exploración de áreas oscuras.'
      };
    case 'base_screwdriver':
      return {
        when: 'Eventos de reparación (infraestructura)',
        effect: 'Bono +1 al dado en eventos de reparación. Facilita reparar sistemas, tuberías, ventanas, etc.'
      };
    case 'base_network_cable':
      return {
        when: 'Eventos de hackeo o conexión de red',
        effect: 'Bono +1 al dado en eventos de hackeo o conexión de sistemas. Útil para operaciones de análisis.'
      };
    case 'base_fuse':
      return {
        when: 'Evento: FALLO DEL GENERADOR',
        effect: 'Permite reparar el generador. Requerido para la opción de reparación. Reduce dificultad de 6 a 5.'
      };
    case 'base_access_card':
      return {
        when: 'Eventos de Firewall o acceso a sistemas',
        effect: 'Reduce la dificultad del dado de 4 a 3 en eventos de firewall. Facilita el acceso a sistemas encriptados.'
      };
    case 'supply_tape':
      return {
        when: 'Eventos de reparación (goteras, ventanas agrietadas)',
        effect: 'Útil para sellar goteras y ventanas agrietadas. Puede reducir la dificultad o garantizar éxito en reparaciones menores.'
      };
    case 'supply_battery':
      return {
        when: 'Eventos de energía o dispositivos',
        effect: 'Útil para eventos que requieren energía. Puede activar sistemas de respaldo o dispositivos portátiles.'
      };
    case 'base_hammer':
      return {
        when: 'Eventos de fuerza bruta o demolición',
        effect: 'Herramienta básica que puede usarse como arma o herramienta. Útil en eventos que requieren fuerza física.'
      };
    default:
      return {
        when: 'Uso general',
        effect: item.description || 'Ver descripción del objeto para más detalles.'
      };
  }
}

export default function InventoryPanel({
  state,
  onItemUsed,
  onItemRemoved
}: InventoryPanelProps) {
  const inventory = state.inventory || [];
  const maxSlots = state.inventoryMaxSlots || 6;
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleUseItem = (index: number) => {
    const result = useInventoryItem(inventory, index, state, maxSlots);
    if (result) {
      onItemUsed(result.newState, result.message);
    }
  };

  const handleDiscardItem = (index: number) => {
    const newInventory = removeItem(inventory, index);
    const newState = { ...state, inventory: newInventory };
    onItemRemoved(newState);
  };

  // Crear slots (vacíos y ocupados)
  const slots: (Item | null)[] = [];
  for (let i = 0; i < maxSlots; i++) {
    slots.push(inventory[i] || null);
  }

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <h3>INVENTARIO</h3>
        <span className="inventory-count">
          {inventory.length}/{maxSlots}
        </span>
      </div>

      <div className="inventory-grid">
        {slots.map((item, index) => (
          <div
            key={index}
            className={`inventory-slot ${item ? 'filled' : 'empty'} ${
              item?.rarity === 'special' ? 'special' : ''
            }`}
          >
            {item ? (
              <>
                <div className="inventory-item-header">
                  <div className="inventory-item-name">
                    {item.name}
                    {item.quantity && item.quantity > 1 && (
                      <span className="item-quantity">x{item.quantity}</span>
                    )}
                  </div>
                  {item.rarity === 'special' && (
                    <span className="item-special-badge">ESPECIAL</span>
                  )}
                </div>
                <div className="inventory-item-description">
                  {item.description}
                </div>
                <div className="item-effect-info">
                  {!getItemEffectDescription(item).toLowerCase().includes('ver descripción') && (
                    <div className="item-effect-text">
                      {getItemEffectDescription(item)}
                    </div>
                  )}
                  {getItemEffectDescription(item).toLowerCase().includes('ver descripción') && (
                    <button
                      className="btn-view-description"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setShowDescriptionModal(true);
                      }}
                      title="Ver descripción completa"
                    >
                      VER DESCRIPCIÓN
                    </button>
                  )}
                </div>
                <div className="inventory-item-actions">
                  {item.effect && (() => {
                    // Verificar si el objeto tiene límite de uso diario y ya fue usado hoy
                    const hasDailyLimit = item.specialEffect === 'daily_coffee' || item.id === 'base_coffee_thermos';
                    const wasUsedToday = state.itemsUsedToday?.includes(item.id) || false;
                    const isDisabled = state.gameOver || (hasDailyLimit && wasUsedToday);
                    
                    return (
                      <button
                        className="btn-inventory btn-use"
                        onClick={() => handleUseItem(index)}
                        disabled={isDisabled}
                        title={hasDailyLimit && wasUsedToday ? 'Ya usado hoy (1 uso por día)' : undefined}
                      >
                        {hasDailyLimit && wasUsedToday ? 'USADO HOY' : 'USAR'}
                      </button>
                    );
                  })()}
                  <button
                    className="btn-inventory btn-discard"
                    onClick={() => handleDiscardItem(index)}
                    disabled={state.gameOver}
                  >
                    DESCARTAR
                  </button>
                </div>
              </>
            ) : (
              <div className="inventory-slot-empty">
                <span>[VACÍO]</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDescriptionModal && selectedItem && (
        <div className="modal-overlay visible" onClick={() => setShowDescriptionModal(false)}>
          <div className="item-description-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowDescriptionModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="item-description-full">
                <p><strong>Descripción:</strong></p>
                <p>{selectedItem.description}</p>
                {getItemEffectDescription(selectedItem).toLowerCase().includes('ver descripción') ? (
                  <>
                    <p><strong>Cuándo usar:</strong></p>
                    <p>{getItemDetailedInfo(selectedItem).when}</p>
                    <p><strong>Efecto:</strong></p>
                    <p>{getItemDetailedInfo(selectedItem).effect}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Efecto:</strong></p>
                    <p>{getItemEffectDescription(selectedItem)}</p>
                  </>
                )}
              </div>
              <button
                className="btn-close-modal"
                onClick={() => setShowDescriptionModal(false)}
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

