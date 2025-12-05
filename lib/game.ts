import { GameState, Card, GameOverReason, CardSerializable, Item } from '@/types/game';
import { SUITS, CARD_TEMPLATES, RANKS } from './constants';
import { rand } from './utils';
import { saveGame } from './storage';
import { addItem, canAddItem } from './inventory';
import { getItemByCard, HEARTS_MAPPING, DIAMONDS_MAPPING } from './items';
import { checkForFakeLog, shouldGlitchUI, getGlitchType } from './hallucinations';
import { generateInfrastructureNegativeEvent, generateAnomalyEvent, generateOperationEvent } from './events';
import { OperationEvent, EventChoice } from '@/types/game';

export class Game {
  state: GameState;
  previousState?: GameState;
  deck: Card[];
  allCards: Card[];
  onStateChange?: (state: GameState) => void;
  onLogEntry?: (text: string, type: string) => void;
  onCardDrawn?: (card: Card, effectResult: string) => void;
  onDieRolled?: (roll: number) => void;
  onGameOver?: (reason: GameOverReason, title: string, description: string, titleColor?: string) => void;
  onEventTriggered?: (event: OperationEvent) => void;
  onInventoryFull?: (item: Item) => void;
  
  // Contadores para sistema de cordura
  realityCheckUsesToday: number = 0;
  lastRealityCheckDay: number = 0;
  showingRealState: boolean = false;
  realStateTimer: number | null = null;
  
  // Sistema de Pity para objetos importantes
  cardsDrawnWithoutImportantItem: number = 0;

  constructor(savedGame?: { state: GameState; deck: CardSerializable[]; allCards: CardSerializable[] }) {
    if (savedGame) {
      this.state = { ...savedGame.state };
      // Restaurar funciones de efecto que se perdieron en la serialización
      this.deck = this.restoreCardEffects(savedGame.deck);
      this.allCards = this.restoreCardEffects(savedGame.allCards);
    } else {
      this.state = {
        mental: 100,
        life: 100,
        sos: 0,
        firewall: 0,
        analysis: 0,
        day: 0, // Nuevo sistema de días
        turn: 0, // Mantener para compatibilidad
        gameOver: false,
        cardsPending: 0,
        sosLocked: false,
        rescueTimer: null,
        isAntennaReinforced: false,
        inventory: [],
        inventoryMaxSlots: 6,
        itemsUsedToday: [],
        adrenalineBoostDays: undefined
      };
      this.deck = [];
      this.allCards = [];
      this.initDeck();
    }
    
    // Migrar turn a day si es necesario (compatibilidad con guardados antiguos)
    if (this.state.turn !== undefined && this.state.day === undefined) {
      this.state.day = this.state.turn;
    }
    
    // Inicializar inventario si no existe (compatibilidad)
    if (!this.state.inventory) {
      this.state.inventory = [];
    }
    if (!this.state.inventoryMaxSlots) {
      this.state.inventoryMaxSlots = 6;
    }
    if (this.state.rescueTimer === undefined) {
      this.state.rescueTimer = null;
    }
    if (this.state.isAntennaReinforced === undefined) {
      this.state.isAntennaReinforced = false;
    }
    if (!this.state.itemsUsedToday) {
      this.state.itemsUsedToday = [];
    }
    if (this.state.adrenalineBoostDays === undefined) {
      this.state.adrenalineBoostDays = undefined;
    }
  }

  private restoreCardEffects(cards: CardSerializable[]): Card[] {
    return cards.map(card => {
      // Restaurar la función de efecto basándose en el tipo de palo
      let effectFn: (state: GameState) => string;
      
      if (card.suit.type === 'introspection') {
        effectFn = (s: GameState) => {
          const h = rand(8, 18); // Aumentado de +5-15% a +8-18%
          s.mental = Math.min(100, s.mental + h);
          return `Recuperas ${h}% de Estabilidad Mental.`;
        };
      } else if (card.suit.type === 'base') {
        effectFn = (s: GameState) => {
          const good = Math.random() > 0.4;
          if (good) {
            const h = rand(5, 10);
            s.life = Math.min(100, s.life + h);
            return `Soporte Vital aumenta ${h}%.`;
          } else {
            const d = rand(5, 15);
            s.life = Math.max(0, s.life - d);
            return `Soporte Vital cae ${d}%.`;
          }
        };
      } else if (card.suit.type === 'threat') {
        effectFn = (s: GameState) => {
          const d = rand(8, 20);
          s.mental = Math.max(0, s.mental - d);
          return `Estabilidad Mental cae ${d}%.`;
        };
      } else { // work
        effectFn = (s: GameState) => {
          const r = Math.random();
          const a = rand(10, 20);
          if (r < 0.33) {
            if (s.sosLocked) return `ERROR: Antena destruida. SOS fallido.`;
            s.sos = Math.min(100, s.sos + a);
            return `Progreso SOS: +${a}%.`;
          } else if (r < 0.66) {
            s.firewall = Math.min(100, s.firewall + a);
            return `Progreso Firewall: +${a}%.`;
          } else {
            s.analysis = Math.min(100, s.analysis + a);
            return `Progreso Análisis: +${a}%.`;
          }
        };
      }

      return {
        ...card,
        effect: effectFn
      };
    });
  }

  initDeck(): void {
    const suits = [
      { 
        s: SUITS.HEARTS, 
        t: CARD_TEMPLATES.HEARTS, 
        eFn: (s: GameState) => { 
          const h = rand(8, 18); // Aumentado de +5-15% a +8-18%
          s.mental = Math.min(100, s.mental + h); 
          return `Recuperas ${h}% de Estabilidad Mental.`; 
        }
      },
      { 
        s: SUITS.DIAMONDS, 
        t: CARD_TEMPLATES.DIAMONDS, 
        eFn: (s: GameState) => { 
          const good = Math.random() > 0.4; 
          if (good) {
            const h = rand(5, 10); 
            s.life = Math.min(100, s.life + h); 
            return `Soporte Vital aumenta ${h}%.`;
          } else {
            const d = rand(5, 15); 
            s.life = Math.max(0, s.life - d); 
            return `Soporte Vital cae ${d}%.`;
          } 
        }
      },
      { 
        s: SUITS.CLUBS, 
        t: CARD_TEMPLATES.CLUBS, 
        eFn: (s: GameState) => { 
          const d = rand(8, 20); 
          s.mental = Math.max(0, s.mental - d); 
          return `Estabilidad Mental cae ${d}%.`; 
        }
      },
      { 
        s: SUITS.SPADES, 
        t: CARD_TEMPLATES.SPADES, 
        eFn: (s: GameState) => {
          const r = Math.random(); 
          const a = rand(10, 20);
          if (r < 0.33) { 
            if (s.sosLocked) return `ERROR: Antena destruida. SOS fallido.`; 
            s.sos = Math.min(100, s.sos + a); 
            return `Progreso SOS: +${a}%.`;
          } else if (r < 0.66) { 
            s.firewall = Math.min(100, s.firewall + a); 
            return `Progreso Firewall: +${a}%.`;
          } else { 
            s.analysis = Math.min(100, s.analysis + a); 
            return `Progreso Análisis: +${a}%.`;
          }
        }
      }
    ];

    let id = 0;
    suits.forEach(group => {
      RANKS.forEach((r, i) => {
        const card: Card = {
          id: id++,
          suit: group.s,
          rank: r,
          text: group.t[i],
          effect: group.eFn,
          drawn: false
        };
        this.deck.push(card);
        this.allCards.push(card);
      });
    });

    // Barajar (Fisher-Yates)
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  nextAction(userText?: string): void {
    if (this.state.gameOver) return;

    if (userText && userText.trim()) {
      this.onLogEntry?.(`> ANALISTA_7: ${userText.trim()}`, 'user');
    }

    if (this.state.cardsPending <= 0) {
      this.startDay();
    } else {
      this.drawCard();
    }
  }

  /**
   * Inicia un nuevo día
   * Lanza d6 para determinar cuántas cartas se pueden robar
   */
  startDay(): void {
    if (this.deck.length === 0) {
      // Intentar barajar el mazo
      this.shuffleDeck();
      if (this.deck.length === 0) {
        this.finishGame("deck_empty");
        return;
      }
    }

    const currentDay = this.state.day || 0;

    // Reducir días de efecto de adrenalina
    if (this.state.adrenalineBoostDays !== undefined && this.state.adrenalineBoostDays > 0) {
      this.state.adrenalineBoostDays--;
      if (this.state.adrenalineBoostDays === 0) {
        this.onLogEntry?.(
          '> SISTEMA: El efecto de adrenalina ha expirado.',
          'system'
        );
      }
    }

    // Aplicar penalizaciones diarias al finalizar el día anterior
    if (currentDay > 0) {
      this.applyDailyPenalties();
      
      if (this.state.mental <= 0) { 
        this.finishGame("insanity"); 
        return; 
      }
      if (this.state.life <= 0) { 
        this.finishGame("frozen"); 
        return; 
      }
    }

    // Incrementar día
    this.state.day = currentDay + 1;
    if (this.state.turn === undefined) {
      this.state.turn = this.state.day; // Mantener compatibilidad
    } else {
      this.state.turn = this.state.day;
    }
    
    // Resetear objetos usados hoy (para límites diarios)
    this.state.itemsUsedToday = [];

    // Lanzar d6 para determinar cartas del día (cambiado de d10 a d6)
    const dayCards = rand(1, 6);
    this.state.cardsPending = dayCards;

    // --- EVENTO ESPECIAL DÍA 6: LA TORMENTA ---
    if (this.state.day === 6) {
      this.handleDay6Storm();
    }

    // Verificar si el rescate ha llegado
    if (this.state.rescueTimer !== null && this.state.rescueTimer > 0) {
      this.state.rescueTimer--;
      if (this.state.rescueTimer === 0) {
        this.checkRescueArrival();
        return;
      }
    }

    this.onDieRolled?.(dayCards);
    this.onLogEntry?.(`> DÍA ${this.state.day} INICIADO. CARTAS DISPONIBLES: [${dayCards}]`, 'dice');
    this.onLogEntry?.(`> Se pueden procesar ${dayCards} bloques de datos hoy...`, 'system');

    this.notifyStateChange();
  }

  /**
   * Aplica las penalizaciones diarias
   * Sistema de "Días de Gracia": Días 1-2: 50%, Días 3-5: 100%, Día 6+: 150%
   */
  private applyDailyPenalties(): void {
    // Verificar si la adrenalina está activa (anula penalizaciones)
    const isAdrenalineActive = this.state.adrenalineBoostDays !== undefined && this.state.adrenalineBoostDays > 0;
    
    if (isAdrenalineActive) {
      this.onLogEntry?.(
        `> FIN DE DÍA ${this.state.day || 0}: El tiempo pasa. [Adrenalina activa: Penalizaciones anuladas]`, 
        'cycle-penalty'
      );
      return; // No aplicar penalizaciones si la adrenalina está activa
    }
    
    const day = this.state.day || 0;
    
    // Sistema de días de gracia
    let penaltyMultiplier = 1.0;
    if (day <= 2) {
      penaltyMultiplier = 0.5; // Primeros 2 días: 50% de penalizaciones
    } else if (day <= 5) {
      penaltyMultiplier = 1.0; // Días 3-5: 100% (normal)
    } else {
      penaltyMultiplier = 1.5; // Día 6+: 150% (tormenta)
    }
    
    // Penalizaciones base reducidas (Opción 1 + Mejora 9)
    const baseLifePenalty = rand(1, 2);   // -1 a -2% (antes: -1 a -3%)
    const baseMentalPenalty = rand(1, 3); // -1 a -3% (antes: -2 a -4%)
    
    // Aplicar multiplicador según el día
    const lifePenalty = Math.round(baseLifePenalty * penaltyMultiplier);
    const mentalPenalty = Math.round(baseMentalPenalty * penaltyMultiplier);
    
    this.state.life = Math.max(0, this.state.life - lifePenalty);
    this.state.mental = Math.max(0, this.state.mental - mentalPenalty);

    let penaltyNote = '';
    if (day <= 2) {
      penaltyNote = ' [Días de gracia: Penalizaciones reducidas]';
    } else if (day >= 6) {
      penaltyNote = ' [Tormenta: Penalizaciones aumentadas]';
    }

    this.onLogEntry?.(
      `> FIN DE DÍA ${day}: El tiempo pasa. Frío: -${lifePenalty}% O₂ | Aislamiento: -${mentalPenalty}% Ψ${penaltyNote}`, 
      'cycle-penalty'
    );

    // Riesgo de "Suicidio Accidental" si mental < 20
    if (this.state.mental < 20 && Math.random() < 0.1) {
      this.onLogEntry?.(
        ">> LA LOCURA TE CONSUME. Sales a caminar a la tormenta sin traje.",
        "horror"
      );
      this.finishGame("insanity");
      return;
    }
  }

  /**
   * Maneja el evento del Día 6: La Tormenta
   */
  private handleDay6Storm(): void {
    // Verificar si la antena ya está reforzada (el objeto fue usado antes del Día 6)
    if (this.state.isAntennaReinforced) {
      this.onLogEntry?.(
        ">> ALERTA DE TORMENTA: Los sensores detectan vientos cataclísmicos.",
        "horror"
      );
      this.onLogEntry?.(
        "> SISTEMA: La antena reforzada resiste la tormenta. Los tensores aguantan.",
        "system"
      );
      this.onLogEntry?.(
        "> SISTEMA: Módulo de Transmisión SOS [ONLINE]. La señal se mantiene estable.",
        "system"
      );
    } else {
      // La antena no está reforzada, se bloquea SOS
      this.state.sosLocked = true;
      this.onLogEntry?.(
        ">> ALERTA DE TORMENTA: Los sensores detectan vientos cataclísmicos. La antena de comunicaciones ha sido arrancada de la base.", 
        "horror"
      );
      this.onLogEntry?.(
        "> SISTEMA: Módulo de Transmisión SOS [OFFLINE]. Ya no es posible pedir ayuda externa.", 
        "system"
      );
      this.onLogEntry?.(
        ">> ADVERTENCIA: RANGO DE EXTRACCIÓN EXCEDIDO. El vehículo de rescate ha abandonado el sector.", 
        "horror"
      );
    }
  }

  drawCard(): void {
    if (this.deck.length === 0) {
      // Intentar barajar el mazo
      this.shuffleDeck();
      if (this.deck.length === 0) {
        this.finishGame("deck_empty");
        return;
      }
    }

    const card = this.deck.pop()!;
    card.drawn = true;
    this.state.cardsPending--;

    const isThreat = card.suit.type === 'threat';
    const isWork = card.suit.type === 'work';
    const isHearts = card.suit.type === 'introspection';
    const isDiamonds = card.suit.type === 'base';

    let effectResult = '';
    let itemAdded = false;
    let eventProcessed = false;

    // Para Diamonds, decidir de una vez si da objeto (60%) o evento negativo (40%)
    const diamondsRoll = isDiamonds ? Math.random() : 1; // Si no es Diamonds, usar 1 para forzar objeto

    // Hearts (Suministros) siempre da objeto, Diamonds 60% objeto, 40% evento negativo
    if (isHearts || (isDiamonds && diamondsRoll > 0.4)) {
      // Intentar dar objeto
      let item = getItemByCard(card.suit.symbol, card.rank);
      
      // Sistema de Pity: cada 10 cartas sin objeto importante, garantizar uno
      if (item) {
        const isImportantItem = item.rarity === 'special' || item.specialEffect !== undefined;
        
        if (!isImportantItem) {
          this.cardsDrawnWithoutImportantItem++;
        } else {
          // Se encontró un objeto importante, resetear contador
          this.cardsDrawnWithoutImportantItem = 0;
        }
        
        // Si han pasado 10 cartas sin objeto importante, forzar uno
        if (this.cardsDrawnWithoutImportantItem >= 10 && !isImportantItem && isHearts) {
          // Garantizar un objeto especial de Hearts
          const specialRanks = ['J', 'Q', 'K', 'A'];
          const specialRank = specialRanks[rand(0, specialRanks.length - 1)];
          item = getItemByCard('♥', specialRank);
          this.cardsDrawnWithoutImportantItem = 0; // Resetear contador
          this.onLogEntry?.(
            `> SISTEMA: [PITY] Objeto importante garantizado después de 10 cartas.`,
            'system'
          );
        }
      } else {
        // Si no hay objeto, incrementar contador de Pity
        this.cardsDrawnWithoutImportantItem++;
      }
      
      if (item) {
        // Intentar agregar al inventario
        if (canAddItem(this.state.inventory, item, this.state.inventoryMaxSlots)) {
          const addResult = addItem(this.state.inventory, item, this.state.inventoryMaxSlots);
          if (addResult) {
            this.state.inventory = addResult.newInventory;
            effectResult = addResult.message;
            itemAdded = true;
            card.item = item; // Asociar objeto con la carta
            
            // Si es objeto importante, resetear contador de Pity
            if (item.rarity === 'special' || item.specialEffect !== undefined) {
              this.cardsDrawnWithoutImportantItem = 0;
            }
          } else {
            // Inventario lleno - mostrar modal para reemplazar/descartar
            effectResult = `${item.name} encontrado, pero el inventario está lleno.`;
            itemAdded = true; // Marcar como procesado para evitar efecto base
            this.onLogEntry?.(
              `> ADVERTENCIA: INVENTARIO LLENO. No se puede agregar ${item.name}.`,
              'system'
            );
            // Disparar callback para mostrar modal de reemplazo
            this.onInventoryFull?.(item);
            card.item = item; // Asociar objeto con la carta para referencia
          }
        } else {
          effectResult = `${item.name} encontrado, pero el inventario está lleno.`;
          itemAdded = true; // Marcar como procesado para evitar efecto base
          this.onInventoryFull?.(item);
          card.item = item; // Asociar objeto con la carta para referencia
        }
      } else if (isDiamonds) {
        // Si es Diamonds y no hay objeto mapeado, generar evento negativo
        const negativeEvent = generateInfrastructureNegativeEvent();
        card.event = negativeEvent;
        this.onEventTriggered?.(negativeEvent);
        effectResult = `> SISTEMA: Evento de infraestructura detectado.`;
        eventProcessed = true;
      }
    } else if (isDiamonds && diamondsRoll <= 0.4) {
      // 40% de Diamonds: Evento negativo interactivo
      const negativeEvent = generateInfrastructureNegativeEvent();
      card.event = negativeEvent;
      this.onEventTriggered?.(negativeEvent);
      effectResult = `> SISTEMA: Evento de infraestructura detectado.`;
      eventProcessed = true;
    } else if (isThreat) {
      // Anomalías: Evento interactivo
      const anomalyEvent = generateAnomalyEvent(this.state.mental);
      card.event = anomalyEvent;
      this.onEventTriggered?.(anomalyEvent);
      effectResult = `>> ANOMALÍA DETECTADA.`;
      eventProcessed = true;
    } else if (isWork) {
      // Operaciones: Evento interactivo
      const operationEvent = generateOperationEvent();
      card.event = operationEvent;
      this.onEventTriggered?.(operationEvent);
      effectResult = `> SISTEMA: Operación disponible.`;
      eventProcessed = true;
    }
    
    // Solo ejecutar efecto base si no se procesó un objeto o evento
    if (!itemAdded && !eventProcessed && !card.event) {
      effectResult = card.effect(this.state);
    }

    // Limpiar prefijo "> SISTEMA: " del mensaje para el recuadro de cartas
    const cleanEffectResult = effectResult.replace(/^> SISTEMA: /, '');
    
    this.onCardDrawn?.(card, cleanEffectResult);
    this.onLogEntry?.(
      `${isThreat ? '>>' : '>'} DATOS ENTRANTES [${card.suit.symbol}${card.rank}]: ${card.text}`, 
      isThreat ? 'horror' : 'system'
    );
    // En el log sí mantener el prefijo
    this.onLogEntry?.(effectResult, 'system');

    // Generar logs falsos si la cordura es baja (mental < 40%)
    if (this.state.mental < 40 && !this.showingRealState) {
      const fakeLog = checkForFakeLog(this.state.mental);
      if (fakeLog && typeof window !== 'undefined') {
        // Agregar log falso con un pequeño delay para que parezca más real
        window.setTimeout(() => {
          this.onLogEntry?.(fakeLog, 'hallucination');
        }, rand(500, 2000));
      }
    }

    // Verificar si se activa el rescate
    if (this.state.sos >= 100 && this.state.rescueTimer === null && !this.state.sosLocked) {
      this.triggerRescue();
    }

    // Verificar Final B (inmediato cuando firewall >= 100%)
    if (this.state.firewall >= 100) {
      this.finishGame("manual");
      return;
    }

    // Auto-guardar después de robar carta (el log se guarda desde useGame)
    saveGame(this.state, this.deck, this.allCards);

    if (this.state.mental <= 0) {
      this.finishGame("insanity");
      return;
    } else if (this.state.life <= 0) {
      this.finishGame("frozen");
      return;
    }
    
    this.notifyStateChange();
  }

  /**
   * Activa el sistema de rescate cuando SOS >= 100%
   */
  private triggerRescue(): void {
    this.state.rescueTimer = this.state.day || 1;
    this.onLogEntry?.(
      `> SISTEMA: SEÑAL SOS COMPLETADA. Contacto establecido con base principal.`,
      "system"
    );
    this.onLogEntry?.(
      `> SISTEMA: Helicóptero de rescate en camino. Tiempo estimado: ${this.state.rescueTimer} día(s).`,
      "system"
    );
  }

  /**
   * Verifica si el rescate ha llegado
   */
  private checkRescueArrival(): void {
    this.onLogEntry?.(
      `> SISTEMA: HELICÓPTERO DE RESCATE DETECTADO. Aterrizando...`,
      "system"
    );
    // El final se disparará automáticamente según las condiciones
    this.checkEndings();
  }

  /**
   * Verifica las condiciones de finalización
   */
  private checkEndings(): void {
    // Final A: Rescatado (Superviviente)
    if (this.state.rescueTimer === 0 && this.state.life > 0) {
      this.finishGame("manual");
      return;
    }

    // Final B: Héroe (El Sacrificio) - Inmediato cuando firewall >= 100%
    if (this.state.firewall >= 100) {
      this.finishGame("manual");
      return;
    }

    // Final D: Combatiente (La Verdad)
    if (this.state.rescueTimer === 0 && this.state.analysis >= 100) {
      this.finishGame("manual");
      return;
    }

    // Final S: Leyenda (La Perfección)
    const finalSThreshold = this.getFinalSThreshold();
    if (this.state.rescueTimer === 0 && 
        this.state.analysis >= finalSThreshold && 
        this.state.firewall >= finalSThreshold &&
        this.state.isAntennaReinforced) {
      this.finishGame("manual");
      return;
    }
  }

  /**
   * Obtiene el umbral del Final S según objetos especiales
   */
  private getFinalSThreshold(): number {
    const hasOptimization = this.state.inventory?.some(item => item.specialEffect === 'final_s_85');
    const hasProtocol = this.state.inventory?.some(item => item.specialEffect === 'final_s_80');
    
    if (hasProtocol) return 80;
    if (hasOptimization) return 85;
    return 90;
  }

  /**
   * Baraja el mazo excluyendo objetos especiales ya robados y objetos en inventario
   */
  private shuffleDeck(): void {
    // Obtener IDs de objetos especiales ya robados (J, Q, K, A)
    const drawnSpecialRanks = ['J', 'Q', 'K', 'A'];
    const drawnSpecialCards = this.allCards.filter(card => 
      card.drawn && drawnSpecialRanks.includes(card.rank)
    );

    // Obtener objetos en el inventario y sus cartas correspondientes
    const inventoryItemIds: number[] = [];
    if (this.state.inventory) {
      this.state.inventory.forEach(item => {
        // Buscar la carta correspondiente al objeto
        const card = this.allCards.find(c => c.item?.id === item.id);
        if (card) {
          inventoryItemIds.push(card.id);
        }
      });
    }

    // Filtrar cartas que NO deben volver a barajarse
    const cardsToShuffle = this.allCards.filter(card => {
      // Excluir objetos especiales ya robados
      if (drawnSpecialRanks.includes(card.rank) && card.drawn) {
        return false;
      }
      // Excluir objetos en inventario
      if (inventoryItemIds.includes(card.id)) {
        return false;
      }
      return true;
    });

    // Resetear estado de cartas a barajar
    cardsToShuffle.forEach(card => {
      card.drawn = false;
    });

    // Barajar (Fisher-Yates)
    for (let i = cardsToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsToShuffle[i], cardsToShuffle[j]] = [cardsToShuffle[j], cardsToShuffle[i]];
    }

    // Actualizar el mazo
    this.deck = cardsToShuffle;
    
    this.onLogEntry?.(
      `> SISTEMA: Mazo barajado. ${this.deck.length} cartas disponibles.`,
      "system"
    );
  }

  attemptFinish(): void {
    this.finishGame("manual");
  }

  finishGame(reason: GameOverReason): void {
    this.state.gameOver = true;
    
    let title = "CONEXIÓN PERDIDA";
    let description = "La señal se ha perdido en la estática.";
    let titleColor = "var(--main-color)";

    if (reason === "insanity") {
      title = "ERROR FATAL: MENTE CORRUPTA";
      titleColor = "#ff0000";
      description = "La Señal ha reescrito tus neuronas. Ahora eres parte de la transmisión.<br><br><b>FINAL: PERDIDO EN LA ESTÁTICA</b>";
    } else if (reason === "frozen") {
      title = "SISTEMAS VITALES: OFF";
      titleColor = "#00ffff";
      description = "El frío ganó. Tu cuerpo es encontrado meses después.<br><br><b>FINAL: ESTATUA DE HIELO</b>";
    } else {
      // Nuevos finales según GAME_MECHANICS_V2.md
      
      // Final B: Héroe (El Sacrificio) - Inmediato cuando firewall >= 100%
      // Este final tiene prioridad sobre otros porque es inmediato
      if (this.state.firewall >= 100) {
        title = "PROTOCOLO DE CONTENCIÓN";
        titleColor = "#ff8800";
        description = "Al completar el firewall, activas el protocolo de autodestrucción/sellado para contener a la entidad. Mueres (o quedas atrapado), pero salvas a la humanidad.<br><br><b>FINAL B: EL SACRIFICIO</b>";
      }
      // Final S: Leyenda (La Perfección) - Prioridad sobre Final D y A
      else if (this.state.rescueTimer === 0) {
        const finalSThreshold = this.getFinalSThreshold();
        if (this.state.analysis >= finalSThreshold && 
            this.state.firewall >= finalSThreshold &&
            this.state.isAntennaReinforced) {
          title = "EJECUCIÓN PERFECTA";
          titleColor = "#00ff00";
          description = "Hackeaste el sistema, robaste los datos, pediste ayuda y contuviste a la entidad. Eres el dueño de la situación.<br><br><b>FINAL S: LEYENDA - RANGO S+</b>";
        }
        // Final D: Combatiente (La Verdad)
        else if (this.state.analysis >= 100) {
          title = "TRANSMISIÓN COMPLETADA";
          titleColor = "#aa55ff";
          description = "Te rescatan y entregas los datos completos de la anomalía. Eres promovido, pero sabes demasiado.<br><br><b>FINAL D: COMBATIENTE - LA VERDAD</b>";
        }
        // Final A: Rescatado (Superviviente)
        else if (this.state.life > 0) {
          title = "EXTRACCIÓN CONFIRMADA";
          titleColor = "#00ffff";
          description = "El helicóptero aterriza. Te vas con vida, pero dejas la base y sus secretos atrás.<br><br><b>FINAL A: RESCATADO - SUPERVIVIENTE</b>";
        }
        // Desaparecido
        else {
          title = "MISIÓN FALLIDA";
          titleColor = "#808080";
          description = "Te quedaste sin recursos o datos. Nadie sabrá qué pasó aquí.<br><br><b>FINAL: DESAPARECIDO</b>";
        }
      }
      // Si no hay rescate activo pero se finaliza manualmente
      else {
        const endings: string[] = [];
        if (this.state.sos >= 80 && !this.state.sosLocked) endings.push("RESCATE");
        if (this.state.firewall >= 80) endings.push("HÉROE");
        if (this.state.analysis >= 80) endings.push("ERUDITO");

        if (endings.length === 3) {
          title = "EJECUCIÓN PERFECTA";
          titleColor = "#00ff00";
          description = "Has logrado lo imposible. Señal contenida, datos asegurados, rescate en camino.<br><br><b>RANGO: S+</b>";
        } else if (endings.includes("RESCATE")) {
          title = "EXTRACCIÓN CONFIRMADA";
          description = "El equipo de rescate te saca de allí justo a tiempo.<br><br><b>FINAL A: SUPERVIVIENTE</b>";
        } else if (endings.includes("HÉROE")) {
          title = "PROTOCOLO DE CONTENCIÓN";
          description = "No pudiste pedir ayuda a tiempo, pero el Firewall es impenetrable.<br><br><b>FINAL B: EL GUARDIÁN</b>";
        } else if (endings.includes("ERUDITO")) {
          title = "TRANSMISIÓN COMPLETADA";
          description = "Tu cuerpo falla, pero los datos han sido enviados a la nube.<br><br><b>FINAL C: EL LEGADO</b>";
        } else {
          title = "MISIÓN FALLIDA";
          titleColor = "#808080";
          description = "Te quedaste sin recursos o datos. Nadie sabrá qué pasó aquí.<br><br><b>FINAL: DESAPARECIDO</b>";
        }
      }
    }

    this.onGameOver?.(reason, title, description, titleColor);
    this.notifyStateChange();
  }

  notifyStateChange(): void {
    // Guardar estado anterior antes de notificar el cambio
    if (this.state) {
      this.previousState = { ...this.state };
    }
    this.onStateChange?.(this.state);
  }

  canFinish(): boolean {
    return (this.state.sos > 50 && !this.state.sosLocked) || 
           this.state.firewall > 50 || 
           this.state.analysis > 50;
  }

  /**
   * Obtiene el modificador de dado basado en el estado mental
   * Mental > 80%: +1
   * Mental 60-79%: +0.5 (redondea hacia arriba)
   * Mental 40-59%: 0
   * Mental 20-39%: -0.5 (redondea hacia abajo)
   * Mental < 20%: -1
   */
  getMentalModifier(mental: number): number {
    if (mental > 80) {
      return 1;
    } else if (mental >= 60) {
      return 0.5;
    } else if (mental >= 40) {
      return 0;
    } else if (mental >= 20) {
      return -0.5;
    } else {
      return -1;
    }
  }

  /**
   * Aplica el modificador mental a un resultado de dado
   */
  applyMentalModifier(dieRoll: number, mental: number): number {
    const modifier = this.getMentalModifier(mental);
    let result = dieRoll + modifier;
    
    // Redondear según el modificador
    if (modifier === 0.5) {
      result = Math.ceil(result);
    } else if (modifier === -0.5) {
      result = Math.floor(result);
    } else {
      result = Math.round(result);
    }
    
    return Math.max(1, Math.min(6, result)); // Limitar entre 1 y 6
  }

  /**
   * Obtiene el número máximo de usos de verificación de realidad por día
   * Basado en el estado mental
   */
  getMaxRealityChecksPerDay(mental: number): number {
    if (mental > 60) {
      return 2;
    } else if (mental > 30) {
      return 1;
    } else {
      return 1; // Mínimo 1 uso, pero con mayor dificultad
    }
  }

  /**
   * Verifica la realidad
   * Tirada: 1d6 + modificador mental
   * Dificultad: 4+
   * Éxito: Muestra estado real temporalmente
   * Fallo: -5% mental
   */
  verifyReality(): { success: boolean; message: string } {
    const currentDay = this.state.day || this.state.turn || 0;
    
    // Resetear contador si es un nuevo día
    if (this.lastRealityCheckDay !== currentDay) {
      this.realityCheckUsesToday = 0;
      this.lastRealityCheckDay = currentDay;
    }

    const maxUses = this.getMaxRealityChecksPerDay(this.state.mental);
    
    // Verificar si se puede usar
    if (this.realityCheckUsesToday >= maxUses) {
      return {
        success: false,
        message: '> SISTEMA: Ya has usado todas las verificaciones de realidad disponibles hoy. Intenta mañana.'
      };
    }

    // Realizar tirada
    const dieRoll = rand(1, 6);
    const mentalModifier = this.getMentalModifier(this.state.mental);
    let total = dieRoll + mentalModifier;
    
    // Redondear si es necesario
    if (mentalModifier === 0.5) {
      total = Math.ceil(total);
    } else if (mentalModifier === -0.5) {
      total = Math.floor(total);
    } else {
      total = Math.round(total);
    }

    const difficulty = 4;
    const success = total >= difficulty;

    this.realityCheckUsesToday++;

    if (success) {
      // Mostrar estado real temporalmente (5 segundos)
      this.showingRealState = true;
      if (this.realStateTimer) {
        clearTimeout(this.realStateTimer);
      }
      if (typeof window !== 'undefined') {
        this.realStateTimer = window.setTimeout(() => {
          this.showingRealState = false;
          this.realStateTimer = null;
          this.notifyStateChange();
        }, 5000);
      }

      this.notifyStateChange();
      
      return {
        success: true,
        message: `> SISTEMA: Verificación exitosa. Tirada: [${dieRoll}] + ${mentalModifier >= 0 ? '+' : ''}${mentalModifier.toFixed(1)} = ${total}. Estado real visible temporalmente.`
      };
    } else {
      // Fallo: -5% mental (la entidad se resiste)
      this.state.mental = Math.max(0, this.state.mental - 5);
      this.onLogEntry?.(
        `>> LA ENTIDAD SE RESISTE. La verificación falla.`,
        'horror'
      );
      
      return {
        success: false,
        message: `> SISTEMA: Verificación fallida. Tirada: [${dieRoll}] + ${mentalModifier >= 0 ? '+' : ''}${mentalModifier.toFixed(1)} = ${total} (requerido: ${difficulty}+). -5% Estabilidad Mental.`
      };
    }
  }

  /**
   * Verifica si se debe mostrar el estado real (sin alucinaciones)
   */
  shouldShowRealState(): boolean {
    return this.showingRealState;
  }

  /**
   * Procesa el resultado de una elección de evento
   */
  processEventChoice(
    choice: EventChoice,
    result: { success: boolean; roll: number; difficulty: number }
  ): string {
    const newState = { ...this.state };
    let message = '';

    // Aplicar recompensa o penalización
    if (result.success && choice.successReward) {
      const reward = choice.successReward;
      if (reward.type === 'sos' && !newState.sosLocked) {
        newState.sos = Math.min(100, newState.sos + reward.amount);
        message = `> SISTEMA: +${reward.amount}% SOS.`;
      } else if (reward.type === 'firewall') {
        newState.firewall = Math.min(100, newState.firewall + reward.amount);
        message = `> SISTEMA: +${reward.amount}% Firewall.`;
      } else if (reward.type === 'analysis') {
        newState.analysis = Math.min(100, newState.analysis + reward.amount);
        message = `> SISTEMA: +${reward.amount}% Análisis.`;
      } else if (reward.type === 'mental') {
        newState.mental = Math.min(100, newState.mental + reward.amount);
        message = `> SISTEMA: +${reward.amount}% Estabilidad Mental.`;
      } else if (reward.type === 'life') {
        newState.life = Math.min(100, newState.life + reward.amount);
        message = `> SISTEMA: +${reward.amount}% Integridad Física.`;
      }
    } else if (!result.success && choice.failurePenalty) {
      const penalty = choice.failurePenalty;
      if (penalty.type === 'sos') {
        newState.sos = Math.max(0, newState.sos - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% SOS.`;
      } else if (penalty.type === 'firewall') {
        newState.firewall = Math.max(0, newState.firewall - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Firewall.`;
      } else if (penalty.type === 'analysis') {
        newState.analysis = Math.max(0, newState.analysis - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Análisis.`;
      } else if (penalty.type === 'mental') {
        newState.mental = Math.max(0, newState.mental - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Estabilidad Mental.`;
      } else if (penalty.type === 'life') {
        newState.life = Math.max(0, newState.life - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Integridad Física.`;
      }
    }

    // Si no hay tirada (solo penalización), aplicar siempre
    if (!choice.difficulty && choice.failurePenalty) {
      const penalty = choice.failurePenalty;
      if (penalty.type === 'sos') {
        newState.sos = Math.max(0, newState.sos - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% SOS.`;
      } else if (penalty.type === 'firewall') {
        newState.firewall = Math.max(0, newState.firewall - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Firewall.`;
      } else if (penalty.type === 'analysis') {
        newState.analysis = Math.max(0, newState.analysis - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Análisis.`;
      } else if (penalty.type === 'mental') {
        newState.mental = Math.max(0, newState.mental - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Estabilidad Mental.`;
      } else if (penalty.type === 'life') {
        newState.life = Math.max(0, newState.life - penalty.amount);
        message = `> SISTEMA: -${penalty.amount}% Integridad Física.`;
      }
    }

    // Consumir objeto si se usó (solo si no es reutilizable)
    if (choice.requiredItemId && newState.inventory) {
      const itemIndex = newState.inventory.findIndex(item => item.id === choice.requiredItemId);
      if (itemIndex >= 0) {
        const item = newState.inventory[itemIndex];
        
        // Verificar si el objeto es reutilizable
        const isReusable = item.specialEffect === 'daily_coffee' ||
                          item.specialEffect === 'reduce_cold_penalty' ||
                          item.specialEffect === 'auto_unlock' ||
                          item.specialEffect === 'final_s_85' ||
                          item.specialEffect === 'final_s_80' ||
                          item.specialEffect === 'redistribute_progress' ||
                          item.id === 'base_coffee_thermos' ||
                          item.id === 'base_heating_core' ||
                          item.id === 'base_master_key' ||
                          item.id === 'base_optimization_algorithm' ||
                          item.id === 'base_data_backup' ||
                          item.id === 'base_master_protocol' ||
                          item.id === 'base_screwdriver' || // Destornillador es reutilizable
                          item.id === 'base_network_cable' || // Cable de red es reutilizable
                          item.id === 'base_access_card' || // Tarjeta de acceso es reutilizable
                          item.id === 'base_code_manual'; // Manual es reutilizable
        
        // Si no es reutilizable, consumirlo
        if (!isReusable) {
          // Si es apilable y tiene cantidad > 1, reducir cantidad
          if (item.stackable && item.quantity && item.quantity > 1) {
            const newInventory = [...newState.inventory];
            newInventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
            newState.inventory = newInventory;
          } else {
            // Eliminar el objeto del inventario
            newState.inventory = newState.inventory.filter((_, i) => i !== itemIndex);
          }
        }
      }
    }

    this.state = newState;
    this.notifyStateChange();

    // Verificar Final B después de aplicar efectos (inmediato cuando firewall >= 100%)
    if (this.state.firewall >= 100) {
      this.finishGame("manual");
    }

    return message;
  }
}

