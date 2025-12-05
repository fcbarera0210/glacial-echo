# Changelog de Balance - Glacial Echo

## Cambios Implementados (Fecha: Última actualización)

### ✅ Cambios Aplicados

1. **Opción 1: Penalizaciones Diarias Reducidas**
   - Mental: -3 a -6% → -2 a -4%
   - Vida: -2 a -5% → -1 a -3%
   - Archivo: `lib/game.ts` - `applyDailyPenalties()`

2. **Opción 2: Recuperación de Objetos Aumentada**
   - Coffee: +10% → +15% mental
   - Medkit: +40% → +50% vida
   - Bandages: +10% → +15% vida
   - Water: +5%/+5% → +8%/+8% (vida/mental)
   - Archivo: `lib/items.ts`

3. **Opción 4: Daño de Anomalías Reducido**
   - Reducción del 25% en el daño base
   - Mental < 20: 15-25 → 11-19 (redondeado)
   - Mental < 40: 10-18 → 8-14 (redondeado)
   - Mental >= 40: 8-15 → 6-11 (redondeado)
   - Archivo: `lib/events.ts` - `generateAnomalyEvent()`

4. **Opción 5: Sistema de Días de Gracia**
   - Días 1-2: Penalizaciones al 50% (días de gracia)
   - Días 3-5: Penalizaciones al 100% (normal)
   - Día 6+: Penalizaciones al 150% (tormenta)
   - Archivo: `lib/game.ts` - `applyDailyPenalties()`

5. **Cambio de d10 a d6**
   - Cartas por día: 1-10 → 1-6
   - Archivo: `lib/game.ts` - `startDay()`

6. **Aumento de Recuperación de Hearts (Introspection)**
   - Recuperación mental: +5 a +15% → +8 a +18%
   - Archivo: `lib/game.ts` - `initDeck()` y `restoreCardEffects()`

7. **Aumento de Recuperación de Hearts (Introspection)**
   - Recuperación mental: +5 a +15% → +8 a +18%
   - Archivo: `lib/game.ts` - `initDeck()` y `restoreCardEffects()`

8. **Mejoras en Simulador**
   - Umbral de medkit: vida < 50% → vida < 70%
   - Umbral de bandages: vida < 70% → vida < 80%
   - Agregado uso de whisky cuando mental < 40% y vida > 20%
   - Archivo: `scripts/simulate-games.ts`

9. **Reducción Adicional de Penalizaciones Base (Mejora 9)**
   - Mental: -2 a -4% → -1 a -3%
   - Vida: -1 a -3% → -1 a -2%
   - Archivo: `lib/game.ts` - `applyDailyPenalties()`

## Resultados de Simulación

### Comparación de las 3 Simulaciones

| Métrica | Inicial | Con Estrategia | Con Todas Mejoras | Mejora Total |
|---------|---------|----------------|-------------------|--------------|
| Días promedio | 4.62 | 4.83 | **8.63** | **+87%** ✅ |
| Mental final | 0.6% | 0.5% | **1.5%** | **+150%** ✅ |
| Partidas completadas | 0% | 0% | 0% | Sin cambio ❌ |
| Muerte por locura | 85% | 86% | **75%** | **-12%** ✅ |
| Firewall promedio | 23.9% | 19.7% | **29.0%** | **+21%** ✅ |
| Análisis promedio | 18.5% | 21.0% | **25.5%** | **+38%** ✅ |

### Análisis

**Mejoras significativas:**
- ✅ Partidas duran casi el doble (8.63 días)
- ✅ Mental mejoró 150% (aunque sigue bajo)
- ✅ Muerte por locura reducida en 12 puntos porcentuales
- ✅ Más progreso en objetivos (Firewall +21%, Análisis +38%)
- ✅ Objetos se usan correctamente (medkit ahora se usa 19%)

**Problema que persiste:**
- ❌ **0% de partidas completadas** - Aunque mejoró mucho, aún no hay partidas que completen objetivos
- ❌ **Mental sigue cayendo a 0** - Con 8.63 días, las penalizaciones se acumulan demasiado
- ❌ **25% se quedan sin mazo** - Las partidas duran tanto que se agota el mazo

## Próximos Ajustes Sugeridos

Si aún no se alcanza ~30-50% de partidas completadas:

1. **Reducir aún más las penalizaciones base**
   - Mental: -2 a -4% → -1 a -3%
   - Vida: -1 a -3% → -1 a -2%

2. **Aumentar más la recuperación de Hearts**
   - +8 a +18% → +10 a +20%

3. **Reducir más el daño de anomalías**
   - 25% → 35% de reducción

