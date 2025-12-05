'use client';

import { OperationEvent, EventChoice, GameState, Item } from '@/types/game';
import { useState } from 'react';
import { rollOperation, calculateOperationResult } from '@/lib/operations';

interface EventModalProps {
  isVisible: boolean;
  event: OperationEvent | null;
  state: GameState;
  onChoiceSelected: (
    choice: EventChoice,
    result: { success: boolean; roll: number; difficulty: number },
    message: string
  ) => void;
  onClose: () => void;
}

export default function EventModal({
  isVisible,
  event,
  state,
  onChoiceSelected,
  onClose
}: EventModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<EventChoice | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>('');

  if (!isVisible || !event) return null;

  const handleChoiceClick = async (choice: EventChoice) => {
    setSelectedChoice(choice);
    setRolling(true);
    setRollResult(null);
    setShowResult(false);

    // Verificar si requiere un objeto
    if (choice.requiredItemId) {
      const hasItem = state.inventory?.some(item => item.id === choice.requiredItemId);
      if (!hasItem) {
        setRolling(false);
        onChoiceSelected(
          choice,
          { success: false, roll: 0, difficulty: choice.difficulty || 0 },
          '> ERROR: No tienes el objeto requerido para esta opción.'
        );
        return;
      }
    }

    // Si es éxito automático, no necesita tirada
    if (choice.autoSuccess) {
      // No mostrar animación de dado si es éxito automático
      setRolling(false);
      setShowResult(true);
      setRollResult(6);
      const effectText = getChoiceEffectText(choice, true, false);
      setResultMessage(effectText);
      return;
    }

    // Si no tiene dificultad, es una opción sin tirada (solo penalización)
    if (!choice.difficulty) {
      // No mostrar animación de dado si no hay tirada
      setRolling(false);
      setShowResult(true);
      setRollResult(null);
      const effectText = getChoiceEffectText(choice, undefined, false);
      setResultMessage(effectText);
      return;
    }

    // Realizar tirada
    const mentalModifier = getMentalModifier(state.mental);
    const itemModifier = getItemModifier(choice, state.inventory || []);
    
    // Simular animación de dado (más sutil)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const roll = rollOperation(choice.difficulty, mentalModifier, itemModifier);
    const result = calculateOperationResult(roll, choice.difficulty);
    
    setRollResult(roll);
    setRolling(false);
    setShowResult(true);

    const modifierText = 
      mentalModifier !== 0 || itemModifier !== 0
        ? ` (${roll - mentalModifier - itemModifier} + ${mentalModifier >= 0 ? '+' : ''}${mentalModifier.toFixed(1)}${itemModifier !== 0 ? ` + ${itemModifier}` : ''} = ${roll})`
        : ` [${roll}]`;

    const message = result.success
      ? `> SISTEMA: Éxito. Tirada: ${modifierText}. Dificultad: ${choice.difficulty}+.`
      : `> SISTEMA: Fallo. Tirada: ${modifierText}. Dificultad: ${choice.difficulty}+.`;

    const effectText = getChoiceEffectText(choice, result.success, true);
    setResultMessage(effectText);
  };

  const getMentalModifier = (mental: number): number => {
    if (mental > 80) return 1;
    if (mental >= 60) return 0.5;
    if (mental >= 40) return 0;
    if (mental >= 20) return -0.5;
    return -1;
  };

  const getItemModifier = (choice: EventChoice, inventory: Item[]): number => {
    if (!inventory || inventory.length === 0) return 0;
    
    // Si la opción requiere un objeto específico, verificar si está disponible
    if (choice.requiredItemId) {
      const hasItem = inventory.some(item => item.id === choice.requiredItemId);
      if (!hasItem) return 0;
      
      // Aplicar bonos según el tipo de objeto
      const itemModifiers: Record<string, number> = {
        'supply_tape': 1, // Cinta adhesiva: +1 en reparaciones
        'base_screwdriver': 1, // Destornillador: +1 en reparaciones
        'base_network_cable': 1, // Cable de red: +1 en hackeo
        'base_fuse': 0, // Fusible: éxito automático (no necesita modificador)
        'base_code_manual': 0, // Manual: éxito automático
        'base_access_card': 1, // Tarjeta de acceso: +1 en operaciones de sistema
        'base_flare': 0, // Bengala: éxito automático
      };
      
      return itemModifiers[choice.requiredItemId] || 0;
    }
    
    // Detección automática basada en palabras clave en el texto de la opción
    const choiceText = choice.text.toLowerCase();
    
    // Detectar cinta adhesiva
    if ((choiceText.includes('cinta') || choiceText.includes('adhesiva') || choiceText.includes('aislante')) && 
        inventory.some(item => item.id === 'supply_tape')) {
      return 1;
    }
    
    // Detectar destornillador
    if ((choiceText.includes('reparar') || choiceText.includes('destornillador') || choiceText.includes('herramienta')) && 
        inventory.some(item => item.id === 'base_screwdriver')) {
      return 1;
    }
    
    // Detectar cable de red
    if ((choiceText.includes('hack') || choiceText.includes('cable') || choiceText.includes('red') || choiceText.includes('conexión')) && 
        inventory.some(item => item.id === 'base_network_cable')) {
      return 1;
    }
    
    return 0;
  };
  
  const getRelevantItem = (choice: EventChoice): Item | null => {
    if (!state.inventory || state.inventory.length === 0) return null;
    
    // Si la opción requiere un objeto específico
    if (choice.requiredItemId) {
      return state.inventory.find(item => item.id === choice.requiredItemId) || null;
    }
    
    // Detección automática basada en palabras clave
    const choiceText = choice.text.toLowerCase();
    
    if ((choiceText.includes('cinta') || choiceText.includes('adhesiva') || choiceText.includes('aislante'))) {
      return state.inventory.find(item => item.id === 'supply_tape') || null;
    }
    
    if ((choiceText.includes('reparar') || choiceText.includes('destornillador') || choiceText.includes('herramienta'))) {
      return state.inventory.find(item => item.id === 'base_screwdriver') || null;
    }
    
    if ((choiceText.includes('hack') || choiceText.includes('cable') || choiceText.includes('red') || choiceText.includes('conexión'))) {
      return state.inventory.find(item => item.id === 'base_network_cable') || null;
    }
    
    return null;
  };

  const canUseChoice = (choice: EventChoice): boolean => {
    if (choice.requiredItemId) {
      return state.inventory?.some(item => item.id === choice.requiredItemId) || false;
    }
    return true;
  };

  const getChoiceEffectText = (choice: EventChoice, success?: boolean, showDifficulty: boolean = false): string => {
    const effects: string[] = [];
    
    if (showDifficulty && choice.difficulty) {
      effects.push(`Dado requerido: ${choice.difficulty}+`);
    }
    
    if (success !== undefined) {
      if (success && choice.successReward) {
        const reward = choice.successReward;
        if (reward.type === 'sos') {
          effects.push(`Éxito: +${reward.amount}% SOS`);
        } else if (reward.type === 'firewall') {
          effects.push(`Éxito: +${reward.amount}% Firewall`);
        } else if (reward.type === 'analysis') {
          effects.push(`Éxito: +${reward.amount}% Análisis`);
        } else if (reward.type === 'mental') {
          effects.push(`Éxito: +${reward.amount}% Estabilidad Mental`);
        } else if (reward.type === 'life') {
          effects.push(`Éxito: +${reward.amount}% Integridad Física`);
        }
      } else if (!success && choice.failurePenalty) {
        const penalty = choice.failurePenalty;
        if (penalty.type === 'sos') {
          effects.push(`Fallo: -${penalty.amount}% SOS`);
        } else if (penalty.type === 'firewall') {
          effects.push(`Fallo: -${penalty.amount}% Firewall`);
        } else if (penalty.type === 'analysis') {
          effects.push(`Fallo: -${penalty.amount}% Análisis`);
        } else if (penalty.type === 'mental') {
          effects.push(`Fallo: -${penalty.amount}% Estabilidad Mental`);
        } else if (penalty.type === 'life') {
          effects.push(`Fallo: -${penalty.amount}% Integridad Física`);
        }
      }
    } else {
      // Mostrar ambos efectos si no hay tirada
      if (choice.successReward) {
        const reward = choice.successReward;
        if (reward.type === 'sos') {
          effects.push(`Éxito: +${reward.amount}% SOS`);
        } else if (reward.type === 'firewall') {
          effects.push(`Éxito: +${reward.amount}% Firewall`);
        } else if (reward.type === 'analysis') {
          effects.push(`Éxito: +${reward.amount}% Análisis`);
        } else if (reward.type === 'mental') {
          effects.push(`Éxito: +${reward.amount}% Estabilidad Mental`);
        } else if (reward.type === 'life') {
          effects.push(`Éxito: +${reward.amount}% Integridad Física`);
        }
      }
      if (choice.failurePenalty) {
        const penalty = choice.failurePenalty;
        if (penalty.type === 'sos') {
          effects.push(`Fallo: -${penalty.amount}% SOS`);
        } else if (penalty.type === 'firewall') {
          effects.push(`Fallo: -${penalty.amount}% Firewall`);
        } else if (penalty.type === 'analysis') {
          effects.push(`Fallo: -${penalty.amount}% Análisis`);
        } else if (penalty.type === 'mental') {
          effects.push(`Fallo: -${penalty.amount}% Estabilidad Mental`);
        } else if (penalty.type === 'life') {
          effects.push(`Fallo: -${penalty.amount}% Integridad Física`);
        }
      }
    }
    
    return effects.join(' | ');
  };

  const handleCloseResult = () => {
    if (selectedChoice) {
      const mentalModifier = getMentalModifier(state.mental);
      const itemModifier = getItemModifier(selectedChoice, state.inventory || []);
      
      if (selectedChoice.difficulty && rollResult !== null) {
        const result = calculateOperationResult(rollResult, selectedChoice.difficulty);
        const modifierText = 
          mentalModifier !== 0 || itemModifier !== 0
            ? ` (${rollResult - mentalModifier - itemModifier} + ${mentalModifier >= 0 ? '+' : ''}${mentalModifier.toFixed(1)}${itemModifier !== 0 ? ` + ${itemModifier}` : ''} = ${rollResult})`
            : ` [${rollResult}]`;
        const message = result.success
          ? `> SISTEMA: Éxito. Tirada: ${modifierText}. Dificultad: ${selectedChoice.difficulty}+.`
          : `> SISTEMA: Fallo. Tirada: ${modifierText}. Dificultad: ${selectedChoice.difficulty}+.`;
        onChoiceSelected(selectedChoice, result, message);
      } else if (selectedChoice.autoSuccess) {
        onChoiceSelected(
          selectedChoice,
          { success: true, roll: 6, difficulty: 0 },
          '> SISTEMA: Éxito automático con objeto especial.'
        );
      } else {
        onChoiceSelected(
          selectedChoice,
          { success: false, roll: 0, difficulty: 0 },
          '> SISTEMA: Opción seleccionada.'
        );
      }
    }
    setShowResult(false);
    setSelectedChoice(null);
    setRollResult(null);
    setResultMessage('');
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <h2>{event.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="event-modal-content">
          <p className="event-description">{event.description}</p>
          
          {!showResult && (
            <div className="event-choices">
              {event.choices.map((choice, index) => {
                const canUse = canUseChoice(choice);
                const isSelected = selectedChoice?.id === choice.id;
                const relevantItem = getRelevantItem(choice);
                const itemModifier = getItemModifier(choice, state.inventory || []);
                
                return (
                  <button
                    key={choice.id}
                    className={`event-choice-btn ${isSelected ? 'selected' : ''} ${!canUse ? 'disabled' : ''} ${relevantItem ? 'has-item' : ''}`}
                    onClick={() => canUse && !rolling && handleChoiceClick(choice)}
                    disabled={!canUse || rolling}
                  >
                    <div className="choice-label">
                      {String.fromCharCode(65 + index)}: {choice.text}
                    </div>
                    {relevantItem && (
                      <div className="choice-item-available">
                        ✓ {relevantItem.name} disponible{itemModifier > 0 ? ` (+${itemModifier} dado)` : ''}
                      </div>
                    )}
                    {choice.difficulty && (
                      <div className="choice-difficulty">
                        Dado requerido: {choice.difficulty}+{itemModifier > 0 ? ` (con objeto: ${choice.difficulty - itemModifier}+)` : ''}
                      </div>
                    )}
                    <div className="choice-effect">
                      {getChoiceEffectText(choice)}
                    </div>
                    {choice.autoSuccess && (
                      <div className="choice-auto-success">
                        Éxito Automático
                      </div>
                    )}
                    {choice.requiredItemId && !relevantItem && (
                      <div className="choice-requires-item">
                        Requiere objeto específico
                      </div>
                    )}
                    {!canUse && (
                      <div className="choice-unavailable">
                        Objeto requerido no disponible
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {rolling && selectedChoice && selectedChoice.difficulty && (
            <div className="event-rolling">
              <div className="die-rolling-subtle">
                <div className="die-display-subtle">
                  <span className="die-pulse">●</span>
                </div>
              </div>
              <p>Lanzando dado...</p>
            </div>
          )}

          {showResult && selectedChoice && (
            <div className="event-result">
              <div className={`result-${selectedChoice.difficulty && rollResult !== null && rollResult >= selectedChoice.difficulty ? 'success' : selectedChoice.difficulty ? 'failure' : 'neutral'}`}>
                {selectedChoice.difficulty && rollResult !== null && rollResult >= selectedChoice.difficulty
                  ? '✓ ÉXITO'
                  : selectedChoice.difficulty && rollResult !== null
                  ? '✗ FALLO'
                  : 'OPCIÓN SELECCIONADA'}
              </div>
              {rollResult !== null && (
                <p>Tirada: {rollResult}</p>
              )}
              {selectedChoice.difficulty && (
                <p>Dificultad: {selectedChoice.difficulty}+</p>
              )}
              {resultMessage && (
                <div className="result-effect">
                  {resultMessage}
                </div>
              )}
              <button 
                className="btn-close-result"
                onClick={handleCloseResult}
              >
                CERRAR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

