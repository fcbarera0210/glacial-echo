/**
 * Script de simulación de 100 partidas para analizar el balance del juego
 * 
 * Ejecutar con: npm run simulate
 */

/// <reference path="./global-types.d.ts" />

// Simulación simplificada para Node.js
// Nota: Este script requiere ajustes para funcionar fuera del entorno Next.js

// Importaciones simplificadas (requiere compilación o ejecución con ts-node)
import { Game } from '../lib/game';
import { GameState, GameOverReason, Item, EventChoice, OperationEvent } from '../types/game';
import { rand } from '../lib/utils';
import { useItem } from '../lib/inventory';

// Mock para window y localStorage en Node.js
if (typeof window === 'undefined') {
  (global as any).window = {
    setTimeout: (fn: () => void, delay: number) => {
      // En Node.js, setTimeout devuelve un Timeout, pero necesitamos un number
      // Usamos un contador simple para simular un ID numérico
      const timeoutId = setTimeout(fn, delay);
      return timeoutId as unknown as number;
    }
  };
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
}

interface GameStats {
  gameNumber: number;
  daysSurvived: number;
  endReason: GameOverReason | 'rescue' | 'firewall' | 'analysis' | 'perfect';
  finalState: {
    mental: number;
    life: number;
    sos: number;
    firewall: number;
    analysis: number;
  };
  itemsObtained: string[];
  itemsUsed: string[];
  eventsWithItems: number;
  eventsWithoutItems: number;
  itemUsageRate: number;
  averageDifficulty: number;
  successRate: number;
  totalRolls: number;
  successfulRolls: number;
  cardsDrawn: number;
}

interface SimulationResults {
  totalGames: number;
  gamesCompleted: number;
  gamesFailed: number;
  averageDays: number;
  endReasons: Record<string, number>;
  averageFinalState: {
    mental: number;
    life: number;
    sos: number;
    firewall: number;
    analysis: number;
  };
  itemStats: {
    obtained: Record<string, number>;
    used: Record<string, number>;
    usageRate: Record<string, number>;
  };
  eventStats: {
    totalEvents: number;
    eventsWithItems: number;
    eventsWithoutItems: number;
    averageDifficulty: number;
    successRate: number;
  };
  balanceIssues: string[];
}

class GameSimulator {
  private stats: GameStats[] = [];
  
  simulateGame(gameNumber: number): GameStats {
    const game = new Game();
    const stats: GameStats = {
      gameNumber,
      daysSurvived: 0,
      endReason: 'deck_empty',
      finalState: {
        mental: 100,
        life: 100,
        sos: 0,
        firewall: 0,
        analysis: 0,
      },
      itemsObtained: [],
      itemsUsed: [],
      eventsWithItems: 0,
      eventsWithoutItems: 0,
      itemUsageRate: 0,
      averageDifficulty: 0,
      successRate: 0,
      totalRolls: 0,
      successfulRolls: 0,
      cardsDrawn: 0,
    };

    let totalDifficulty = 0;
    let difficultyCount = 0;
    let maxDays = 50; // Límite de seguridad para evitar loops infinitos

    // Configurar callbacks para rastrear eventos
    let currentEvent: OperationEvent | null = null;
    let currentChoice: EventChoice | null = null;

    game.onEventTriggered = (event: OperationEvent) => {
      currentEvent = event;
      // Verificar si el evento tiene opciones que requieren objetos
      const hasRequiredItem = event.choices.some(c => c.requiredItemId);
      if (hasRequiredItem) {
        stats.eventsWithItems++;
      } else {
        stats.eventsWithoutItems++;
      }
    };

    game.onCardDrawn = (card, effectResult) => {
      stats.cardsDrawn++;
      // Rastrear objetos obtenidos
      if (card.item) {
        const itemId = card.item.id;
        if (!stats.itemsObtained.includes(itemId)) {
          stats.itemsObtained.push(itemId);
        }
      }
    };

    // Simular decisiones inteligentes para eventos
    const makeChoice = (event: OperationEvent): EventChoice | null => {
      if (!event.choices || event.choices.length === 0) return null;

      // Estrategia: preferir opciones con objetos si están disponibles
      const inventory = game.state.inventory || [];
      
      // Buscar opción con objeto disponible
      for (const choice of event.choices) {
        if (choice.requiredItemId) {
          const hasItem = inventory.some(item => item.id === choice.requiredItemId);
          if (hasItem) {
            // Rastrear uso de objeto
            if (!stats.itemsUsed.includes(choice.requiredItemId)) {
              stats.itemsUsed.push(choice.requiredItemId);
            }
            return choice;
          }
        }
      }

      // Si no hay opción con objeto, elegir la opción con menor dificultad o sin penalización
      let bestChoice = event.choices[0];
      for (const choice of event.choices) {
        if (choice.difficulty) {
          totalDifficulty += choice.difficulty;
          difficultyCount++;
        }
        
        // Preferir opciones sin penalización o con menor dificultad
        if (!choice.failurePenalty && (!bestChoice.difficulty || (choice.difficulty && choice.difficulty < bestChoice.difficulty))) {
          bestChoice = choice;
        }
      }

      return bestChoice;
    };

    // Simular tirada de dado
    const simulateRoll = (difficulty: number, mental: number, itemModifier: number = 0): boolean => {
      stats.totalRolls++;
      const mentalModifier = this.getMentalModifier(mental);
      const roll = rand(1, 6) + mentalModifier + itemModifier;
      const success = roll >= difficulty;
      if (success) {
        stats.successfulRolls++;
      }
      return success;
    };

    // Procesar eventos
    const processEvent = (event: OperationEvent) => {
      const choice = makeChoice(event);
      if (!choice) return;

      if (choice.autoSuccess) {
        stats.successfulRolls++;
        stats.totalRolls++;
      } else if (choice.difficulty) {
        const success = simulateRoll(choice.difficulty, game.state.mental, choice.requiredItemId ? 1 : 0);
        // Aplicar efectos
        if (success && choice.successReward) {
          const reward = choice.successReward;
          if (reward.type === 'sos' && !game.state.sosLocked) {
            game.state.sos = Math.min(100, game.state.sos + reward.amount);
          } else if (reward.type === 'firewall') {
            game.state.firewall = Math.min(100, game.state.firewall + reward.amount);
          } else if (reward.type === 'analysis') {
            game.state.analysis = Math.min(100, game.state.analysis + reward.amount);
          } else if (reward.type === 'mental') {
            game.state.mental = Math.min(100, game.state.mental + reward.amount);
          } else if (reward.type === 'life') {
            game.state.life = Math.min(100, game.state.life + reward.amount);
          }
        } else if (!success && choice.failurePenalty) {
          const penalty = choice.failurePenalty;
          if (penalty.type === 'sos') {
            game.state.sos = Math.max(0, game.state.sos - penalty.amount);
          } else if (penalty.type === 'firewall') {
            game.state.firewall = Math.max(0, game.state.firewall - penalty.amount);
          } else if (penalty.type === 'analysis') {
            game.state.analysis = Math.max(0, game.state.analysis - penalty.amount);
          } else if (penalty.type === 'mental') {
            game.state.mental = Math.max(0, game.state.mental - penalty.amount);
          } else if (penalty.type === 'life') {
            game.state.life = Math.max(0, game.state.life - penalty.amount);
          }
        }
      } else if (choice.failurePenalty) {
        // Opción sin tirada, solo penalización
        const penalty = choice.failurePenalty;
        if (penalty.type === 'sos') {
          game.state.sos = Math.max(0, game.state.sos - penalty.amount);
        } else if (penalty.type === 'firewall') {
          game.state.firewall = Math.max(0, game.state.firewall - penalty.amount);
        } else if (penalty.type === 'analysis') {
          game.state.analysis = Math.max(0, game.state.analysis - penalty.amount);
        } else if (penalty.type === 'mental') {
          game.state.mental = Math.max(0, game.state.mental - penalty.amount);
        } else if (penalty.type === 'life') {
          game.state.life = Math.max(0, game.state.life - penalty.amount);
        }
      }

      // Consumir objeto si se usó (solo si no es reutilizable)
      if (choice.requiredItemId && game.state.inventory) {
        const itemIndex = game.state.inventory.findIndex(item => item.id === choice.requiredItemId);
        if (itemIndex >= 0) {
          const item = game.state.inventory[itemIndex];
          
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
                            item.id === 'base_screwdriver' ||
                            item.id === 'base_network_cable' ||
                            item.id === 'base_access_card' ||
                            item.id === 'base_code_manual';
          
          if (!isReusable) {
            if (item.stackable && item.quantity && item.quantity > 1) {
              game.state.inventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
            } else {
              game.state.inventory = game.state.inventory.filter((_, i) => i !== itemIndex);
            }
          }
        }
      }
    };

    // Función para usar objetos de consumo directo estratégicamente
    const useConsumableItems = () => {
      const inventory = game.state.inventory || [];
      const day = game.state.day || 0;
      
      // Prioridad 1: Usar kit de antena antes del día 6
      if (day < 6 && !game.state.isAntennaReinforced) {
        const antennaKit = inventory.findIndex(item => item.id === 'base_antenna_kit');
        if (antennaKit >= 0) {
          const result = useItem(inventory, antennaKit, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('base_antenna_kit')) {
              stats.itemsUsed.push('base_antenna_kit');
            }
            return;
          }
        }
      }
      
      // Prioridad 2: Usar adrenalina si mental < 60% y no está activa
      if (game.state.mental < 60 && (!game.state.adrenalineBoostDays || game.state.adrenalineBoostDays === 0)) {
        const adrenaline = inventory.findIndex(item => item.id === 'supply_adrenaline');
        if (adrenaline >= 0) {
          const result = useItem(inventory, adrenaline, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_adrenaline')) {
              stats.itemsUsed.push('supply_adrenaline');
            }
            return;
          }
        }
      }
      
      // Prioridad 3: Usar medkit si vida < 70% (ajustado para que se use más)
      if (game.state.life < 70) {
        const medkit = inventory.findIndex(item => item.id === 'supply_medkit');
        if (medkit >= 0) {
          const result = useItem(inventory, medkit, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_medkit')) {
              stats.itemsUsed.push('supply_medkit');
            }
            return;
          }
        }
      }
      
      // Prioridad 4: Usar coffee si mental < 50%
      if (game.state.mental < 50) {
        const coffee = inventory.findIndex(item => item.id === 'supply_coffee');
        if (coffee >= 0) {
          const result = useItem(inventory, coffee, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_coffee')) {
              stats.itemsUsed.push('supply_coffee');
            }
            return;
          }
        }
      }
      
      // Prioridad 5: Usar bandages si vida < 80% (ajustado para que se use más)
      if (game.state.life < 80) {
        const bandages = inventory.findIndex(item => item.id === 'supply_bandages');
        if (bandages >= 0) {
          const result = useItem(inventory, bandages, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_bandages')) {
              stats.itemsUsed.push('supply_bandages');
            }
            return;
          }
        }
      }
      
      // Prioridad 6: Usar ration si vida < 80%
      if (game.state.life < 80) {
        const ration = inventory.findIndex(item => item.id === 'supply_ration');
        if (ration >= 0) {
          const result = useItem(inventory, ration, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_ration')) {
              stats.itemsUsed.push('supply_ration');
            }
            return;
          }
        }
      }
      
      // Prioridad 7: Usar water si mental < 70% o vida < 90%
      if (game.state.mental < 70 || game.state.life < 90) {
        const water = inventory.findIndex(item => item.id === 'supply_water');
        if (water >= 0) {
          const result = useItem(inventory, water, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_water')) {
              stats.itemsUsed.push('supply_water');
            }
            return;
          }
        }
      }
      
      // Prioridad 8: Usar chocolate si mental < 80%
      if (game.state.mental < 80) {
        const chocolate = inventory.findIndex(item => item.id === 'supply_chocolate');
        if (chocolate >= 0) {
          const result = useItem(inventory, chocolate, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_chocolate')) {
              stats.itemsUsed.push('supply_chocolate');
            }
            return;
          }
        }
      }
      
      // Prioridad 9: Usar whisky si mental < 40% (a pesar de -5% vida)
      if (game.state.mental < 40 && game.state.life > 20) {
        const whisky = inventory.findIndex(item => item.id === 'supply_whisky');
        if (whisky >= 0) {
          const result = useItem(inventory, whisky, game.state, game.state.inventoryMaxSlots);
          if (result) {
            game.state = result.newState;
            if (!stats.itemsUsed.includes('supply_whisky')) {
              stats.itemsUsed.push('supply_whisky');
            }
            return;
          }
        }
      }
    };

    // Simular partida
    try {
      while (!game.state.gameOver && stats.daysSurvived < maxDays) {
        // Iniciar día
        game.startDay();
        stats.daysSurvived = game.state.day || 0;
        
        // Usar objetos estratégicamente al inicio del día (antes de las penalizaciones)
        useConsumableItems();

        // Determinar cuántas cartas se pueden robar este día (ahora d6 en lugar de d10)
        const cardsThisDay = game.state.cardsPending || rand(1, 6);
        
        // Robar cartas del día
        for (let i = 0; i < cardsThisDay && !game.state.gameOver; i++) {
          if (game.deck.length === 0) {
            game.initDeck();
          }
          
          game.drawCard();
          
          // Procesar eventos si hay alguno pendiente
          // (En la implementación real, esto se maneja en el modal, pero aquí lo simulamos)
          if (currentEvent) {
            processEvent(currentEvent);
            currentEvent = null;
          }
          
          // Usar objetos si los stats están críticos después de cada carta
          if (game.state.mental < 30 || game.state.life < 30) {
            useConsumableItems();
          }

          // Verificar condiciones de fin
          if (game.state.mental <= 0) {
            stats.endReason = 'insanity';
            game.state.gameOver = true;
            break;
          }
          if (game.state.life <= 0) {
            stats.endReason = 'frozen';
            game.state.gameOver = true;
            break;
          }
          if (game.state.firewall >= 100) {
            stats.endReason = 'firewall';
            game.state.gameOver = true;
            break;
          }
          if (game.state.rescueTimer !== null && game.state.rescueTimer <= 0 && game.state.life > 0) {
            if (game.state.analysis >= 100 && game.state.firewall >= 90) {
              stats.endReason = 'perfect';
            } else if (game.state.analysis >= 100) {
              stats.endReason = 'analysis';
            } else {
              stats.endReason = 'rescue';
            }
            game.state.gameOver = true;
            break;
          }
        }

        // Las penalizaciones se aplican al inicio del siguiente día en startDay()
        // No necesitamos llamar a endDay() porque no existe
      }
    } catch (error) {
      console.error(`Error en partida ${gameNumber}:`, error);
    }

    // Calcular estadísticas finales
    stats.finalState = {
      mental: game.state.mental,
      life: game.state.life,
      sos: game.state.sos,
      firewall: game.state.firewall,
      analysis: game.state.analysis,
    };

    stats.averageDifficulty = difficultyCount > 0 ? totalDifficulty / difficultyCount : 0;
    stats.successRate = stats.totalRolls > 0 ? stats.successfulRolls / stats.totalRolls : 0;
    stats.itemUsageRate = stats.itemsObtained.length > 0 ? stats.itemsUsed.length / stats.itemsObtained.length : 0;

    return stats;
  }

  private getMentalModifier(mental: number): number {
    if (mental > 80) return 1;
    if (mental >= 60) return 0.5;
    if (mental >= 40) return 0;
    if (mental >= 20) return -0.5;
    return -1;
  }

  runSimulation(numGames: number = 100): SimulationResults {
    console.log(`Iniciando simulación de ${numGames} partidas...\n`);
    
    for (let i = 1; i <= numGames; i++) {
      const stats = this.simulateGame(i);
      this.stats.push(stats);
      
      if (i % 10 === 0) {
        console.log(`Progreso: ${i}/${numGames} partidas simuladas...`);
      }
    }

    return this.analyzeResults();
  }

  private analyzeResults(): SimulationResults {
    const results: SimulationResults = {
      totalGames: this.stats.length,
      gamesCompleted: 0,
      gamesFailed: 0,
      averageDays: 0,
      endReasons: {},
      averageFinalState: {
        mental: 0,
        life: 0,
        sos: 0,
        firewall: 0,
        analysis: 0,
      },
      itemStats: {
        obtained: {},
        used: {},
        usageRate: {},
      },
      eventStats: {
        totalEvents: 0,
        eventsWithItems: 0,
        eventsWithoutItems: 0,
        averageDifficulty: 0,
        successRate: 0,
      },
      balanceIssues: [],
    };

    let totalDays = 0;
    let totalDifficulty = 0;
    let totalRolls = 0;
    let totalSuccessfulRolls = 0;

    // Analizar cada partida
    for (const stat of this.stats) {
      totalDays += stat.daysSurvived;
      
      // Contar razones de fin
      results.endReasons[stat.endReason] = (results.endReasons[stat.endReason] || 0) + 1;
      
      if (stat.endReason === 'insanity' || stat.endReason === 'frozen' || stat.endReason === 'deck_empty') {
        results.gamesFailed++;
      } else {
        results.gamesCompleted++;
      }

      // Acumular estados finales
      results.averageFinalState.mental += stat.finalState.mental;
      results.averageFinalState.life += stat.finalState.life;
      results.averageFinalState.sos += stat.finalState.sos;
      results.averageFinalState.firewall += stat.finalState.firewall;
      results.averageFinalState.analysis += stat.finalState.analysis;

      // Estadísticas de objetos
      for (const itemId of stat.itemsObtained) {
        results.itemStats.obtained[itemId] = (results.itemStats.obtained[itemId] || 0) + 1;
      }
      for (const itemId of stat.itemsUsed) {
        results.itemStats.used[itemId] = (results.itemStats.used[itemId] || 0) + 1;
      }

      // Estadísticas de eventos
      results.eventStats.eventsWithItems += stat.eventsWithItems;
      results.eventStats.eventsWithoutItems += stat.eventsWithoutItems;
      totalDifficulty += stat.averageDifficulty;
      totalRolls += stat.totalRolls;
      totalSuccessfulRolls += stat.successfulRolls;
    }

    // Calcular promedios
    results.averageDays = totalDays / this.stats.length;
    results.averageFinalState.mental /= this.stats.length;
    results.averageFinalState.life /= this.stats.length;
    results.averageFinalState.sos /= this.stats.length;
    results.averageFinalState.firewall /= this.stats.length;
    results.averageFinalState.analysis /= this.stats.length;

    results.eventStats.totalEvents = results.eventStats.eventsWithItems + results.eventStats.eventsWithoutItems;
    results.eventStats.averageDifficulty = totalDifficulty / this.stats.length;
    results.eventStats.successRate = totalRolls > 0 ? totalSuccessfulRolls / totalRolls : 0;

    // Calcular tasas de uso de objetos
    for (const itemId in results.itemStats.obtained) {
      const obtained = results.itemStats.obtained[itemId];
      const used = results.itemStats.used[itemId] || 0;
      results.itemStats.usageRate[itemId] = obtained > 0 ? used / obtained : 0;
    }

    // Detectar problemas de balance
    if (results.gamesCompleted / results.totalGames < 0.3) {
      results.balanceIssues.push('⚠️ Tasa de éxito muy baja: menos del 30% de partidas completadas');
    }
    if (results.averageDays < 5) {
      results.balanceIssues.push('⚠️ Partidas muy cortas: promedio de días menor a 5');
    }
    if (results.averageFinalState.mental < 20) {
      results.balanceIssues.push('⚠️ Mental promedio muy bajo al final: menos de 20%');
    }
    if (results.averageFinalState.life < 20) {
      results.balanceIssues.push('⚠️ Vida promedio muy baja al final: menos de 20%');
    }
    if (results.eventStats.successRate < 0.4) {
      results.balanceIssues.push('⚠️ Tasa de éxito en eventos muy baja: menos del 40%');
    }
    if (results.eventStats.successRate > 0.8) {
      results.balanceIssues.push('⚠️ Tasa de éxito en eventos muy alta: más del 80%');
    }

    // Verificar objetos no utilizados
    for (const itemId in results.itemStats.obtained) {
      const usageRate = results.itemStats.usageRate[itemId];
      if (usageRate < 0.1 && results.itemStats.obtained[itemId] > 10) {
        results.balanceIssues.push(`⚠️ Objeto "${itemId}" raramente usado: ${(usageRate * 100).toFixed(1)}% de uso`);
      }
    }

    return results;
  }

  printReport(results: SimulationResults): void {
    console.log('\n' + '='.repeat(80));
    console.log('REPORTE DE SIMULACIÓN - 100 PARTIDAS');
    console.log('='.repeat(80) + '\n');

    console.log('📊 RESUMEN GENERAL');
    console.log('-'.repeat(80));
    console.log(`Total de partidas: ${results.totalGames}`);
    console.log(`Partidas completadas: ${results.gamesCompleted} (${(results.gamesCompleted / results.totalGames * 100).toFixed(1)}%)`);
    console.log(`Partidas fallidas: ${results.gamesFailed} (${(results.gamesFailed / results.totalGames * 100).toFixed(1)}%)`);
    console.log(`Días promedio sobrevividos: ${results.averageDays.toFixed(2)}`);
    console.log('');

    console.log('🏁 RAZONES DE FIN DE PARTIDA');
    console.log('-'.repeat(80));
    for (const [reason, count] of Object.entries(results.endReasons)) {
      const percentage = (count / results.totalGames * 100).toFixed(1);
      console.log(`  ${reason}: ${count} (${percentage}%)`);
    }
    console.log('');

    console.log('📈 ESTADO FINAL PROMEDIO');
    console.log('-'.repeat(80));
    console.log(`  Mental: ${results.averageFinalState.mental.toFixed(1)}%`);
    console.log(`  Vida: ${results.averageFinalState.life.toFixed(1)}%`);
    console.log(`  SOS: ${results.averageFinalState.sos.toFixed(1)}%`);
    console.log(`  Firewall: ${results.averageFinalState.firewall.toFixed(1)}%`);
    console.log(`  Análisis: ${results.averageFinalState.analysis.toFixed(1)}%`);
    console.log('');

    console.log('🎒 ESTADÍSTICAS DE OBJETOS');
    console.log('-'.repeat(80));
    console.log('Objetos obtenidos:');
    const sortedObtained = Object.entries(results.itemStats.obtained)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    for (const [itemId, count] of sortedObtained) {
      const percentage = (count / results.totalGames * 100).toFixed(1);
      console.log(`  ${itemId}: ${count} veces (${percentage}%)`);
    }
    console.log('');
    console.log('Objetos utilizados:');
    const sortedUsed = Object.entries(results.itemStats.used)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    for (const [itemId, count] of sortedUsed) {
      const percentage = (count / results.totalGames * 100).toFixed(1);
      console.log(`  ${itemId}: ${count} veces (${percentage}%)`);
    }
    console.log('');
    console.log('Tasa de uso de objetos (objetos usados / obtenidos):');
    const sortedUsage = Object.entries(results.itemStats.usageRate)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    for (const [itemId, rate] of sortedUsage) {
      const obtained = results.itemStats.obtained[itemId] || 0;
      if (obtained > 0) {
        console.log(`  ${itemId}: ${(rate * 100).toFixed(1)}% (${results.itemStats.used[itemId] || 0}/${obtained})`);
      }
    }
    console.log('');

    console.log('🎲 ESTADÍSTICAS DE EVENTOS');
    console.log('-'.repeat(80));
    console.log(`Total de eventos: ${results.eventStats.totalEvents}`);
    console.log(`Eventos con objetos requeridos: ${results.eventStats.eventsWithItems}`);
    console.log(`Eventos sin objetos requeridos: ${results.eventStats.eventsWithoutItems}`);
    console.log(`Dificultad promedio: ${results.eventStats.averageDifficulty.toFixed(2)}`);
    console.log(`Tasa de éxito en tiradas: ${(results.eventStats.successRate * 100).toFixed(1)}%`);
    console.log('');

    if (results.balanceIssues.length > 0) {
      console.log('⚠️ PROBLEMAS DE BALANCE DETECTADOS');
      console.log('-'.repeat(80));
      for (const issue of results.balanceIssues) {
        console.log(`  ${issue}`);
      }
      console.log('');
    } else {
      console.log('✅ No se detectaron problemas de balance significativos.');
      console.log('');
    }

    console.log('='.repeat(80));
  }
}

// Ejecutar simulación
const simulator = new GameSimulator();
const results = simulator.runSimulation(100);
simulator.printReport(results);

export { GameSimulator };
export type { SimulationResults, GameStats };
