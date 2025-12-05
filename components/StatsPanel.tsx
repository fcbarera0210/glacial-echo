'use client';

import { GameState } from '@/types/game';
import { useEffect, useRef, useState } from 'react';

interface StatsPanelProps {
  state: GameState;
  previousState?: GameState;
  onRealityCheck?: () => void;
  realityCheckUsesRemaining?: number;
  showingRealState?: boolean;
}

export default function StatsPanel({ 
  state, 
  previousState,
  onRealityCheck,
  realityCheckUsesRemaining,
  showingRealState
}: StatsPanelProps) {
  const mentalBarRef = useRef<HTMLDivElement>(null);
  const lifeBarRef = useRef<HTMLDivElement>(null);
  const [prevMental, setPrevMental] = useState(state.mental);
  const [prevLife, setPrevLife] = useState(state.life);

  useEffect(() => {
    // Detectar si mental bajó usando el estado local previo
    if (state.mental < prevMental && mentalBarRef.current) {
      const element = mentalBarRef.current;
      element.classList.remove('damage-pulse', 'heal-pulse');
      // Usar setTimeout para asegurar que el DOM se actualice
      setTimeout(() => {
        element.classList.add('damage-pulse');
        setTimeout(() => {
          element.classList.remove('damage-pulse');
        }, 1000);
      }, 10);
    }
    // Detectar si mental subió
    else if (state.mental > prevMental && mentalBarRef.current) {
      const element = mentalBarRef.current;
      element.classList.remove('damage-pulse', 'heal-pulse');
      // Usar setTimeout para asegurar que el DOM se actualice
      setTimeout(() => {
        element.classList.add('heal-pulse');
        setTimeout(() => {
          element.classList.remove('heal-pulse');
        }, 1000);
      }, 10);
    }
    setPrevMental(state.mental);
    
    // Detectar si life bajó usando el estado local previo
    if (state.life < prevLife && lifeBarRef.current) {
      const element = lifeBarRef.current;
      element.classList.remove('damage-pulse', 'heal-pulse');
      // Usar setTimeout para asegurar que el DOM se actualice
      setTimeout(() => {
        element.classList.add('damage-pulse');
        setTimeout(() => {
          element.classList.remove('damage-pulse');
        }, 1000);
      }, 10);
    }
    // Detectar si life subió
    else if (state.life > prevLife && lifeBarRef.current) {
      const element = lifeBarRef.current;
      element.classList.remove('damage-pulse', 'heal-pulse');
      // Usar setTimeout para asegurar que el DOM se actualice
      setTimeout(() => {
        element.classList.add('heal-pulse');
        setTimeout(() => {
          element.classList.remove('heal-pulse');
        }, 1000);
      }, 10);
    }
    setPrevLife(state.life);
  }, [state.mental, state.life, prevMental, prevLife]);

  return (
    <div className="stats-panel">
      <div className="stat-item">
        <div className="stat-label">
          <span>Estabilidad Mental (Ψ)</span>
          <span className="stat-value">{state.mental}%</span>
        </div>
        <div className="stat-bar-wrapper">
          <div 
            ref={mentalBarRef}
            className={`stat-bar mental ${showingRealState ? 'real-state' : ''}`}
            style={{ width: `${state.mental}%` }}
          />
        </div>
        {state.mental < 40 && onRealityCheck && (
          <div className="reality-check-section">
            <button
              className="btn-reality-check"
              onClick={onRealityCheck}
              disabled={state.gameOver || (realityCheckUsesRemaining !== undefined && realityCheckUsesRemaining <= 0)}
              title={realityCheckUsesRemaining !== undefined && realityCheckUsesRemaining <= 0 
                ? 'Sin usos restantes hoy' 
                : 'Verificar qué es real y qué es alucinación'}
            >
              VERIFICAR REALIDAD
              {realityCheckUsesRemaining !== undefined && realityCheckUsesRemaining > 0 && (
                <span className="reality-check-uses">({realityCheckUsesRemaining})</span>
              )}
            </button>
            {showingRealState && (
              <div className="real-state-indicator">
                ESTADO REAL VISIBLE
              </div>
            )}
          </div>
        )}
      </div>

      <div className="stat-item">
        <div className="stat-label">
          <span>Soporte Vital (O₂)</span>
          <span className="stat-value">{state.life}%</span>
        </div>
        <div className="stat-bar-wrapper">
          <div 
            ref={lifeBarRef}
            className="stat-bar life"
            style={{ width: `${state.life}%` }}
          />
        </div>
      </div>

      {state.adrenalineBoostDays !== undefined && state.adrenalineBoostDays > 0 && (
        <div className="adrenaline-indicator">
          <span className="adrenaline-icon">⚡</span>
          <span className="adrenaline-text">Adrenalina activa: {state.adrenalineBoostDays} día{state.adrenalineBoostDays !== 1 ? 's' : ''} restante{state.adrenalineBoostDays !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="stat-divider" />

      <div className="stat-item">
        <div className="stat-label">
          <span>Señal S.O.S.</span>
          <span className="stat-value" style={
            state.sosLocked 
              ? { color: 'var(--accent-red)' } 
              : {}
          }>
            {state.sosLocked 
              ? 'OFFLINE' 
              : `${state.sos}%`}
          </span>
        </div>
        {state.sosLocked && (
          <div className="stat-locked-label">[DESCONECTADO]</div>
        )}
        {state.isAntennaReinforced && !state.sosLocked && (
          <div className="stat-reinforced-label">[REFORZADA]</div>
        )}
        {state.rescueTimer !== null && state.rescueTimer > 0 && (
          <div className="rescue-timer">
            RESCATE EN CAMINO: {state.rescueTimer} día{state.rescueTimer !== 1 ? 's' : ''}
          </div>
        )}
        {state.rescueTimer === 0 && (
          <div className="rescue-arrived">
            RESCATE LLEGANDO...
          </div>
        )}
        <div className="stat-bar-wrapper">
          <div 
            className={`stat-bar sos ${state.sosLocked ? 'locked' : state.isAntennaReinforced ? 'reinforced' : ''}`}
            style={{ width: state.sosLocked ? '100%' : `${state.sos}%` }}
          />
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">
          <span>Firewall Sistema</span>
          <span className="stat-value">{state.firewall}%</span>
        </div>
        <div className="stat-bar-wrapper">
          <div 
            className="stat-bar firewall"
            style={{ width: `${state.firewall}%` }}
          />
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">
          <span>Análisis de Datos</span>
          <span className="stat-value">{state.analysis}%</span>
        </div>
        <div className="stat-bar-wrapper">
          <div 
            className="stat-bar analysis"
            style={{ width: `${state.analysis}%` }}
          />
        </div>
      </div>
    </div>
  );
}
