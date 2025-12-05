import { EventChoice, OperationEvent } from '@/types/game';
import { rand } from './utils';

/**
 * Genera un evento de Infraestructura negativo (40% de Diamonds)
 */
export function generateInfrastructureNegativeEvent(): OperationEvent {
  const events: OperationEvent[] = [
    {
      id: 'pipe_burst',
      title: 'SISTEMA: Tubería rota detectada.',
      description: 'Tubería rota en el pasillo B. Agua helada por todas partes.',
      choices: [
        {
          id: 'repair_risky',
          text: 'Opción A: Intentar reparar con riesgo.',
          difficulty: 4,
          successReward: { type: 'life', amount: 5 },
          failurePenalty: { type: 'life', amount: 10 }
        },
        {
          id: 'ignore',
          text: 'Opción B: Ignorar y sellar el sector.',
          failurePenalty: { type: 'life', amount: 5 }
        }
      ]
    },
    {
      id: 'leak',
      title: 'SISTEMA: Gotera detectada.',
      description: 'Gotera en el techo del sector 4. El agua gotea constantemente.',
      choices: [
        {
          id: 'fix',
          text: 'Opción A: Reparar con cinta adhesiva.',
          difficulty: 3,
          requiredItemId: 'supply_tape',
          successReward: { type: 'life', amount: 3 },
          failurePenalty: { type: 'life', amount: 3 }
        },
        {
          id: 'ignore',
          text: 'Opción B: Ignorar. El daño es menor.',
          failurePenalty: { type: 'life', amount: 2 }
        }
      ]
    },
    {
      id: 'short_circuit',
      title: 'SISTEMA: Cortocircuito detectado.',
      description: 'Cortocircuito en el panel de control. Chispas y olor a ozono.',
      choices: [
        {
          id: 'repair',
          text: 'Opción A: Reparar el cortocircuito.',
          difficulty: 5,
          successReward: { type: 'life', amount: 0 },
          failurePenalty: { type: 'mental', amount: 10 }
        },
        {
          id: 'isolate',
          text: 'Opción B: Aislar el sector afectado.',
          failurePenalty: { type: 'life', amount: 8 }
        }
      ]
    },
    {
      id: 'cracked_window',
      title: 'SISTEMA: Ventana agrietada.',
      description: 'Una ventana del sector 4 se agrieta. El frío se cuela.',
      choices: [
        {
          id: 'seal',
          text: 'Opción A: Sellarla con cinta aislante.',
          difficulty: 3,
          requiredItemId: 'supply_tape',
          successReward: { type: 'life', amount: 5 },
          failurePenalty: { type: 'life', amount: 5 }
        },
        {
          id: 'ignore',
          text: 'Opción B: Ignorar. El daño es menor.',
          failurePenalty: { type: 'life', amount: 3 }
        }
      ]
    },
    {
      id: 'generator_failure',
      title: 'SISTEMA: FALLO DEL GENERADOR.',
      description: 'Oscuridad total. El sistema de respaldo no responde.',
      choices: [
        {
          id: 'repair',
          text: 'Opción A: Intentar reparar el generador (requiere Fusible Industrial).',
          difficulty: 6,
          requiredItemId: 'base_fuse',
          successReward: { type: 'life', amount: 10 },
          failurePenalty: { type: 'mental', amount: 15 }
        },
        {
          id: 'wait',
          text: 'Opción B: Esperar a que se reinicie automáticamente.',
          failurePenalty: { type: 'mental', amount: 20 }
        }
      ]
    },
    {
      id: 'kitchen_fire',
      title: 'SISTEMA: INCENDIO EN COCINA.',
      description: 'El humo se propaga por los conductos.',
      choices: [
        {
          id: 'extinguish',
          text: 'Opción A: Intentar apagar el fuego.',
          difficulty: 5,
          successReward: { type: 'life', amount: 0 },
          failurePenalty: { type: 'life', amount: 15 }
        },
        {
          id: 'seal',
          text: 'Opción B: Sellarlo y aislarlo.',
          failurePenalty: { type: 'life', amount: 10 }
        }
      ]
    },
    {
      id: 'gas_leak',
      title: 'SISTEMA: FUGA DE GAS detectada.',
      description: 'El olor es penetrante.',
      choices: [
        {
          id: 'fix',
          text: 'Opción A: Buscar y reparar la fuga.',
          difficulty: 4,
          successReward: { type: 'life', amount: 5 },
          failurePenalty: { type: 'life', amount: 12 }
        },
        {
          id: 'ventilate',
          text: 'Opción B: Ventilar el área (riesgo de frío).',
          failurePenalty: { type: 'life', amount: 8 }
        }
      ]
    }
  ];

  return events[rand(0, events.length - 1)];
}

/**
 * Genera un evento de Anomalía (Threat/Clubs)
 * Más grave si el mental es bajo
 * Nota: Las anomalías son eventos simples sin opciones (solo daño)
 */
export function generateAnomalyEvent(mental: number): OperationEvent {
  // Reducir daño base en 25% (Opción 4)
  const baseDamageRaw = mental < 20 ? rand(15, 25) : mental < 40 ? rand(10, 18) : rand(8, 15);
  const baseDamage = Math.round(baseDamageRaw * 0.75); // Reducir 25%
  
  const commonEvents: OperationEvent[] = [
    {
      id: 'whispers',
      title: '>> ANOMALÍA DETECTADA',
      description: 'Susurros en la ventilación. Algo habla en un idioma que no reconoces.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'shadow',
      title: '>> ANOMALÍA DETECTADA',
      description: 'Una sombra se mueve en el monitor. No hay nada reflejado en la habitación.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'sleep_paralysis',
      title: '>> ANOMALÍA DETECTADA',
      description: 'Parálisis de sueño. No puedes moverte. Algo está en la habitación contigo.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'object_moved',
      title: '>> ANOMALÍA DETECTADA',
      description: 'El objeto se movió solo. Estabas seguro de que estaba en otro lugar.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'static_voice',
      title: '>> ANOMALÍA DETECTADA',
      description: 'Una voz emerge de la estática: "Abre la puerta".',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'reflection',
      title: '>> ANOMALÍA DETECTADA',
      description: 'Tu reflejo en el monitor parpadea. Por un segundo, no eres tú.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'cold_spot',
      title: '>> ANOMALÍA DETECTADA',
      description: 'Un punto de frío extremo. La temperatura no baja, pero sientes que te congela.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'time_skip',
      title: '>> ANOMALÍA DETECTADA',
      description: 'El tiempo salta. No recuerdas qué pasó en los últimos minutos.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    },
    {
      id: 'wrong_geometry',
      title: '>> ANOMALÍA DETECTADA',
      description: 'Las sombras tienen la geometría incorrecta. El espacio no es como debería ser.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: baseDamage }
        }
      ]
    }
  ];

  const specialEvents: OperationEvent[] = [
    {
      id: 'doppelganger',
      title: '>> ANOMALÍA CRÍTICA: EL DOPPELGÄNGER',
      description: 'Te ves a ti mismo afuera, mirándote desde la ventana.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: Math.round(baseDamage * 1.5) }
          // Nota: La pérdida de objeto se maneja en la lógica del juego
        }
      ]
    },
    {
      id: 'the_call',
      title: '>> ANOMALÍA CRÍTICA: LA LLAMADA',
      description: 'Alguien respira al otro lado de la línea. Conoces esa respiración.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: Math.round(baseDamage * 1.5) }
        }
      ]
    },
    {
      id: 'temporal_desync',
      title: '>> ANOMALÍA CRÍTICA: DESINCRONIZACIÓN TEMPORAL',
      description: 'El reloj marca una hora que no existe.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: Math.round(baseDamage * 1.5) }
        }
      ]
    },
    {
      id: 'entity_touch',
      title: '>> ANOMALÍA CRÍTICA',
      description: 'Sientes una mano en tu hombro. No hay nadie detrás de ti.',
      choices: [
        {
          id: 'endure',
          text: 'Soportar la anomalía.',
          failurePenalty: { type: 'mental', amount: Math.round(baseDamage * 1.5) }
        }
      ]
    }
  ];

  // 30% de probabilidad de evento especial si mental < 40%
  const isSpecial = mental < 40 && Math.random() < 0.3;
  const eventPool = isSpecial ? specialEvents : commonEvents;
  
  return eventPool[rand(0, eventPool.length - 1)];
}

/**
 * Genera un evento de Operación (Work/Spades)
 */
export function generateOperationEvent(): OperationEvent {
  const operations: OperationEvent[] = [
    {
      id: 'corrupted_file',
      title: 'SISTEMA: Archivo Corrupto detectado.',
      description: 'Un archivo crítico está corrupto. Necesitas recuperar los datos.',
      choices: [
        {
          id: 'brute_force',
          text: 'Opción A: Fuerza Bruta.',
          difficulty: 5,
          successReward: { type: 'analysis', amount: 15 },
          failurePenalty: { type: 'mental', amount: 10 }
        },
        {
          id: 'decode',
          text: 'Opción B: Decodificar con calma.',
          difficulty: 3,
          successReward: { type: 'analysis', amount: 10 },
          failurePenalty: { type: 'mental', amount: 0 }
        },
        {
          id: 'use_manual',
          text: 'Opción C: Usar [Manual de Código].',
          requiredItemId: 'base_code_manual',
          autoSuccess: true,
          successReward: { type: 'analysis', amount: 20 }
        }
      ]
    },
    {
      id: 'encrypted_signal',
      title: 'SISTEMA: Señal encriptada detectada.',
      description: 'Una señal de origen desconocido. Necesitas descifrarla.',
      choices: [
        {
          id: 'hack',
          text: 'Opción A: Hackear la señal.',
          difficulty: 6,
          successReward: { type: 'analysis', amount: 20 },
          failurePenalty: { type: 'mental', amount: 15 }
        },
        {
          id: 'analyze',
          text: 'Opción B: Analizar con cuidado.',
          difficulty: 4,
          successReward: { type: 'analysis', amount: 12 },
          failurePenalty: { type: 'mental', amount: 5 }
        },
        {
          id: 'use_cable',
          text: 'Opción C: Usar [Cable de Red] para conexión directa.',
          requiredItemId: 'base_network_cable',
          difficulty: 4,
          successReward: { type: 'analysis', amount: 18 }
        }
      ]
    },
    {
      id: 'firewall_breach',
      title: 'SISTEMA: Brecha en el Firewall detectada.',
      description: 'Algo está intentando entrar. Debes reforzar las defensas.',
      choices: [
        {
          id: 'patch',
          text: 'Opción A: Parchear la brecha rápidamente.',
          difficulty: 5,
          successReward: { type: 'firewall', amount: 18 },
          failurePenalty: { type: 'firewall', amount: 5 }
        },
        {
          id: 'rebuild',
          text: 'Opción B: Reconstruir el sector afectado.',
          difficulty: 4,
          successReward: { type: 'firewall', amount: 15 },
          failurePenalty: { type: 'mental', amount: 8 }
        },
        {
          id: 'use_access',
          text: 'Opción C: Usar [Tarjeta de Acceso Nv1] para acceso privilegiado.',
          requiredItemId: 'base_access_card',
          difficulty: 3,
          successReward: { type: 'firewall', amount: 20 }
        }
      ]
    },
    {
      id: 'sos_signal',
      title: 'SISTEMA: Oportunidad de transmisión SOS.',
      description: 'Una ventana de comunicación se abre. Puedes enviar una señal de rescate.',
      choices: [
        {
          id: 'transmit',
          text: 'Opción A: Transmitir señal completa.',
          difficulty: 4,
          successReward: { type: 'sos', amount: 15 },
          failurePenalty: { type: 'sos', amount: 0 }
        },
        {
          id: 'partial',
          text: 'Opción B: Transmitir señal parcial (más seguro).',
          difficulty: 3,
          successReward: { type: 'sos', amount: 10 },
          failurePenalty: { type: 'sos', amount: 0 }
        },
        {
          id: 'use_flare',
          text: 'Opción C: Usar [Bengala] para señal visual.',
          requiredItemId: 'base_flare',
          autoSuccess: true,
          successReward: { type: 'sos', amount: 10 }
        }
      ]
    },
    {
      id: 'data_recovery',
      title: 'SISTEMA: Datos perdidos detectados.',
      description: 'Hay datos críticos que se pueden recuperar del sistema.',
      choices: [
        {
          id: 'recover',
          text: 'Opción A: Intentar recuperación completa.',
          difficulty: 5,
          successReward: { type: 'analysis', amount: 15 },
          failurePenalty: { type: 'mental', amount: 10 }
        },
        {
          id: 'partial',
          text: 'Opción B: Recuperación parcial (más seguro).',
          difficulty: 3,
          successReward: { type: 'analysis', amount: 10 },
          failurePenalty: { type: 'mental', amount: 5 }
        }
      ]
    },
    {
      id: 'system_optimization',
      title: 'SISTEMA: Optimización de recursos disponible.',
      description: 'Puedes optimizar el sistema para mejorar el rendimiento.',
      choices: [
        {
          id: 'optimize',
          text: 'Opción A: Optimización agresiva.',
          difficulty: 4,
          successReward: { type: 'firewall', amount: 12 },
          failurePenalty: { type: 'life', amount: 5 }
        },
        {
          id: 'conservative',
          text: 'Opción B: Optimización conservadora.',
          difficulty: 2,
          successReward: { type: 'firewall', amount: 8 },
          failurePenalty: { type: 'life', amount: 0 }
        }
      ]
    }
  ];

  return operations[rand(0, operations.length - 1)];
}

