# Análisis de Balance - Glacial Echo

## 📊 Resultados de Simulación (100 partidas)

### Simulación Inicial (Sin uso estratégico de objetos)

**Problemas Críticos Detectados:**

1. **0% de partidas completadas** - Todas las partidas fallan
   - 85% mueren por locura (insanity)
   - 15% se quedan sin mazo (deck_empty)

2. **Mental promedio final: 0.6%** - Extremadamente bajo
   - Las penalizaciones diarias (3-6% mental) son muy altas
   - Con 4.62 días promedio, se pierden ~15-28% solo por penalizaciones

3. **Objetos de consumo directo nunca se usan (0% de uso)**
   - Todos los objetos de consumo tenían 0% de uso

4. **Partidas muy cortas: 4.62 días promedio**

---

### Simulación Mejorada (Con uso estratégico de objetos)

**Mejoras Observadas:**

✅ **Objetos ahora SÍ se usan:**
- `supply_chocolate`: 80.9% de uso (38/47)
- `supply_water`: 74.5% de uso (38/51)
- `supply_coffee`: 71.7% de uso (33/46)
- `base_antenna_kit`: 67.9% de uso (19/28)
- `supply_adrenaline`: 65.9% de uso (27/41)

✅ **Días promedio mejoraron ligeramente:** 4.83 días (vs 4.62)

**Problemas que Persisten:**

❌ **0% de partidas completadas** - Todas las partidas siguen fallando
   - 86% mueren por locura (insanity) - Aumentó 1%
   - 14% se quedan sin mazo (deck_empty)

❌ **Mental promedio final: 0.5%** - Sigue extremadamente bajo
   - A pesar de usar objetos, el mental sigue cayendo a 0
   - Los objetos ayudan pero no son suficientes

❌ **Partidas siguen siendo muy cortas: 4.83 días promedio**
   - No hay tiempo suficiente para completar objetivos
   - El jugador muere antes de alcanzar cualquier final

❌ **Algunos objetos aún no se usan:**
   - `supply_medkit`: 0% usado (38 obtenidos) - **CRÍTICO**
   - `supply_thermal_patch`: 0% usado
   - `base_heating_core`: 0% usado
   - `base_coffee_thermos`: 0% usado

---

### Simulación Final (Con todas las mejoras aplicadas)

**Mejoras Significativas:**

✅ **Días promedio casi duplicados:** 8.63 días (vs 4.83) - **+78% de mejora**
   - Las partidas ahora duran casi el doble
   - Hay más tiempo para completar objetivos

✅ **Muerte por locura reducida:** 75% (vs 86%) - **-11 puntos porcentuales**
   - Las mejoras están funcionando
   - Menos partidas terminan por locura

✅ **Objetos se usan mucho mejor:**
   - `supply_coffee`: 78.7% de uso (37/47)
   - `supply_water`: 77.6% de uso (45/58)
   - `supply_chocolate`: 76.9% de uso (40/52)
   - `supply_adrenaline`: 69.2% de uso (36/52)
   - `supply_medkit`: 19.0% de uso (11/58) - **¡Ahora SÍ se usa!**

✅ **Mental promedio mejoró:** 1.5% (vs 0.5%) - **Triplicado**
   - Aunque sigue bajo, mejoró significativamente
   - Los objetos y penalizaciones reducidas están ayudando

✅ **Progreso mejorado:**
   - Firewall: 29.0% (vs 19.7%) - **+47%**
   - Análisis: 25.5% (vs 21.0%) - **+21%**
   - Más tiempo = más progreso

**Problemas que Persisten:**

❌ **0% de partidas completadas** - Todas las partidas siguen fallando
   - 75% mueren por locura (insanity) - Mejoró pero sigue siendo el problema principal
   - 25% se quedan sin mazo (deck_empty) - Aumentó porque las partidas duran más

❌ **Mental promedio final: 1.5%** - Sigue muy bajo
   - Aunque mejoró, el mental sigue cayendo a 0
   - Con 8.63 días, se acumulan muchas penalizaciones

❌ **Algunos objetos aún no se usan:**
   - `supply_whisky`: 0% usado (59 obtenidos) - Tiene penalización de vida
   - `supply_thermal_patch`: 0% usado
   - `supply_bandages`: 7.7% usado - Umbral muy alto (vida < 70%)
   - Varios objetos base no se usan (hammer, screwdriver, flashlight, etc.)

### Estadísticas Positivas

- **Tasa de éxito en eventos: 54.8%** - Razonable
- **Dificultad promedio: 3.99** - Balanceada
- **Algunos objetos SÍ se usan en eventos:**
  - `supply_tape`: 29.3% de uso
  - `base_access_card`: 29.2% de uso
  - `base_code_manual`: 27.3% de uso

## 🔧 Mejoras Implementadas en el Simulador

### 1. Uso Estratégico de Objetos de Consumo Directo

El simulador ahora usa objetos cuando:
- **Kit de antena**: Antes del día 6 (prioridad máxima)
- **Adrenalina**: Si mental < 60% y no está activa
- **Medkit**: Si vida < 50%
- **Coffee**: Si mental < 50%
- **Bandages**: Si vida < 70%
- **Ration**: Si vida < 80%
- **Water**: Si mental < 70% o vida < 90%
- **Chocolate**: Si mental < 80%

### 2. Uso Preventivo

Los objetos se usan:
- Al inicio de cada día (antes de penalizaciones)
- Después de cada carta si los stats están críticos (< 30%)

## 💡 Mejoras Propuestas para el Balance del Juego

### Opción 1: Reducir Penalizaciones Diarias (Recomendado)

**Problema actual:**
- Mental: -3 a -6% por día
- Vida: -2 a -5% por día
- Con 4.62 días promedio = ~15-28% mental perdido solo por penalizaciones

**Propuesta:**
```typescript
// Actual
const lifePenalty = rand(2, 5);   // -2 a -5%
const mentalPenalty = rand(3, 6); // -3 a -6%

// Propuesto
const lifePenalty = rand(1, 3);   // -1 a -3%
const mentalPenalty = rand(2, 4); // -2 a -4%
```

**Impacto esperado:**
- Partidas más largas (6-8 días promedio)
- Más tiempo para usar objetos y completar objetivos
- Mental promedio final: 20-40% (en lugar de 0.6%)

### Opción 2: Aumentar Recuperación de Objetos

**Problema actual:**
- Coffee: +10% mental
- Medkit: +40% vida
- Bandages: +10% vida

**Propuesta:**
```typescript
// Coffee: +10% → +15% mental
// Medkit: +40% → +50% vida
// Bandages: +10% → +15% vida
// Water: +5% vida, +5% mental → +8% vida, +8% mental
```

### Opción 3: Hacer Objetos Más Visibles/Útiles

**Problema:** Los jugadores no saben cuándo usar objetos

**Propuestas:**
1. **Indicadores visuales:**
   - Mostrar cuando un objeto puede usarse (ej: "Usar café" cuando mental < 50%)
   - Resaltar objetos críticos (kit de antena antes del día 6)

2. **Sugerencias automáticas:**
   - "Tu estabilidad mental está baja. ¿Usar café?"
   - "Día 5: Recuerda usar el Kit Refuerzo Antena antes del Día 6"

3. **Efectos más claros:**
   - Mostrar el efecto exacto antes de usar
   - Comparar estado actual vs estado después de usar

### Opción 4: Ajustar Eventos que Reducen Mental

**Problema:** Los eventos de anomalías reducen mucho mental

**Propuesta:**
- Reducir daño base de anomalías en 20-30%
- O aumentar la recuperación de Hearts (introspection)

### Opción 5: Sistema de "Días de Gracia"

**Propuesta:**
- Primeros 2 días: Penalizaciones reducidas a la mitad
- Días 3-5: Penalizaciones normales
- Día 6+: Penalizaciones aumentadas (tormenta)

## 🎯 Recomendaciones Prioritarias

### Prioridad Alta (Implementar primero)

1. **Reducir penalizaciones diarias** (Opción 1)
   - Impacto inmediato en supervivencia
   - Fácil de implementar
   - No requiere cambios en UI

2. **Mejorar el simulador** (Ya implementado)
   - Usa objetos estratégicamente
   - Permite evaluar mejor el balance

### Prioridad Media

3. **Indicadores visuales para objetos** (Opción 3.1)
   - Mejora la experiencia del jugador
   - Ayuda a entender cuándo usar objetos

4. **Ajustar eventos de anomalías** (Opción 4)
   - Reduce la muerte por locura
   - Mantiene la tensión

### Prioridad Baja

5. **Aumentar recuperación de objetos** (Opción 2)
   - Solo si las otras opciones no son suficientes
   - Puede hacer el juego demasiado fácil

6. **Sistema de días de gracia** (Opción 5)
   - Más complejo de implementar
   - Requiere balance fino

## 📈 Análisis de Resultados - Evolución Completa

### Comparación de las 4 Simulaciones

| Métrica | Inicial | Con Estrategia | Con Todas Mejoras | **Nueva Simulación** | Mejora Total |
|---------|---------|----------------|-------------------|---------------------|--------------|
| Días promedio | 4.62 | 4.83 | 8.63 | **9.08** | **+97%** ✅ |
| Mental final | 0.6% | 0.5% | 1.5% | **0.4%** | **-33%** ❌ |
| Partidas completadas | 0% | 0% | 0% | **0%** | Sin cambio ❌ |
| Muerte por locura | 85% | 86% | 75% | **80%** | **-6%** ⚠️ |
| Muerte por deck_empty | 15% | 14% | 25% | **20%** | +33% (esperado) |
| Firewall promedio | 23.9% | 19.7% | 29.0% | **28.6%** | **+20%** ✅ |
| Análisis promedio | 18.5% | 21.0% | 25.5% | **28.3%** | **+53%** ✅ |
| Uso de objetos | 0% | 65-80% | 70-80% | **65-80%** | ✅ Mejorado |

### Nueva Simulación (Última)

**Mejoras Observadas:**
- ✅ **Días promedio mejoraron ligeramente:** 9.08 días (vs 8.63) - **+5.2%**
- ✅ **Muerte por deck_empty mejoró:** 20% (vs 25%) - **-5 puntos porcentuales**
- ✅ **Análisis mejoró significativamente:** 28.3% (vs 25.5%) - **+11%**
- ✅ **Firewall se mantiene estable:** 28.6% (vs 29.0%) - Similar
- ✅ **Objetos se usan bien:**
  - `supply_coffee`: 79.2% de uso (42/53)
  - `supply_adrenaline`: 71.2% de uso (42/59)
  - `supply_whisky`: 69.2% de uso (36/52) - **¡Ahora SÍ se usa!**
  - `supply_chocolate`: 65.0% de uso (39/60)
  - `supply_medkit`: 19.3% de uso (11/57) - Se usa, pero poco

**Problemas Críticos Detectados:**
- ❌ **Mental empeoró significativamente:** 0.4% (vs 1.5%) - **-73% relativo** ⚠️
- ❌ **Muerte por locura empeoró:** 80% (vs 75%) - **+5 puntos porcentuales**
- ❌ **0% de partidas completadas** - Sigue siendo el problema principal
- ❌ **Objetos sin usar:**
  - `supply_thermal_patch`: 0% usado (56 obtenidos)
  - `supply_recorder`: 0% usado (55 obtenidos)
  - `supply_photo`: 0% usado (59 obtenidos)
  - `base_flashlight`: 0% usado
  - `base_encrypted_drive`: 0% usado
  - `base_coffee_thermos`: 0% usado
  - `base_screwdriver`: 0% usado
  - `base_heating_core`: 0% usado
  - `base_master_key`: 0% usado (39 obtenidos)
  - `base_hammer`: 0% usado
  - `supply_battery`: 0% usado (53 obtenidos)

### Análisis de la Regresión del Mental

**Problema Principal:**
El mental promedio final cayó de 1.5% a 0.4%, una regresión del 73% relativo. Esto es muy preocupante.

**Posibles Causas:**
1. **Partidas más largas (9.08 días vs 8.63):**
   - Más días con penalizaciones aumentadas (día 6+: 150% de penalizaciones)
   - Con 9.08 días promedio, hay más días en la fase de tormenta
   - Cálculo estimado de penalizaciones:
     - Días 1-2: ~1-2% mental (50% de penalizaciones)
     - Días 3-5: ~6-12% mental (100% de penalizaciones)
     - Día 6+: ~4-7% mental (150% de penalizaciones, más días)
     - **Total: ~11-21% mental solo por penalizaciones diarias**

2. **Eventos de anomalías siguen causando mucho daño:**
   - A pesar de la reducción del 25%, el daño acumulado es alto
   - Con partidas más largas, hay más eventos de anomalías

3. **Objetos no son suficientes:**
   - Aunque se usan objetos (coffee 79.2%, chocolate 65%), el mental sigue cayendo
   - Los objetos ayudan pero no compensan el daño acumulado

**Conclusión:**
- ✅ Las partidas duran más (9.08 días), lo cual es positivo
- ✅ El progreso en objetivos mejoró (Análisis +11%)
- ❌ **El mental está cayendo demasiado rápido** - Necesita más ajustes
- ❌ **0% de partidas completadas** - Sigue siendo el problema principal

### Próximos Pasos

1. ✅ **Simulador mejorado** - Completado
2. ✅ **Comparar resultados** - Completado
3. ✅ **Ajustar penalizaciones** - Completado (Opción 1)
4. ✅ **Aumentar recuperación de objetos** - Completado (Opción 2)
5. ✅ **Reducir daño de anomalías** - Completado (Opción 4)
6. ✅ **Sistema de días de gracia** - Completado (Opción 5)
7. ✅ **Cambiar d10 a d6** - Completado
8. ✅ **Ajustar umbrales de uso de medkit** - Completado (vida < 70%)

**Mejoras Adicionales Sugeridas:**

9. ✅ **Reducir aún más las penalizaciones base** - Mental: -2 a -4% → -1 a -3%, Vida: -1 a -3% → -1 a -2% - **COMPLETADO**
10. ✅ **Aumentar recuperación de Hearts (introspection)** - +5 a +15% → +8 a +18% - **COMPLETADO**
11. ✅ **Ajustar umbrales de uso de bandages** - Vida < 70% → Vida < 80% - **COMPLETADO**
12. ✅ **Implementar uso de whisky** - Agregar lógica para usarlo cuando mental < 40% (a pesar de -5% vida) - **COMPLETADO**
13. ⚠️ **Implementar indicadores visuales** - Para ayudar a jugadores reales
14. 🔄 **Iterar** hasta alcanzar ~30-50% de partidas completadas

### ⚠️ Análisis de la Nueva Simulación (Última)

**Resultados de la Nueva Simulación:**
- Días promedio: **9.08** (vs 8.63 anterior) - ✅ Mejoró ligeramente
- Mental final: **0.4%** (vs 1.5% anterior) - ❌ **Empeoró significativamente (-73%)**
- Muerte por locura: **80%** (vs 75% anterior) - ❌ Empeoró
- Muerte por deck_empty: **20%** (vs 25% anterior) - ✅ Mejoró
- Firewall: **28.6%** (vs 29.0% anterior) - Similar
- Análisis: **28.3%** (vs 25.5% anterior) - ✅ Mejoró

**Problemas Detectados:**

1. **Mental cayó demasiado (0.4% vs 1.5%):**
   - Las partidas duran más (9.08 días), lo que significa más días con penalizaciones aumentadas
   - Con 9.08 días promedio, hay ~3-4 días en fase de tormenta (día 6+)
   - Los eventos de anomalías siguen causando mucho daño acumulado
   - Los objetos se usan pero no son suficientes

2. **Objetos sin usar:**
   - Varios objetos nunca se usan (thermal_patch, recorder, photo, etc.)
   - Algunos objetos base no tienen casos de uso claros

**Recomendaciones Urgentes:**

1. **Reducir penalizaciones en días 6+ (tormenta):**
   - Actualmente: 150% de penalizaciones
   - Propuesta: 125% de penalizaciones (en lugar de 150%)
   - O reducir las penalizaciones base aún más

2. **Aumentar recuperación de objetos de mental:**
   - Coffee: +15% → +20% mental
   - Chocolate: Aumentar recuperación
   - Water: +8% → +10% mental

3. **Reducir daño de anomalías aún más:**
   - Reducción adicional del 10-15% en el daño base

4. **Mejorar uso de objetos:**
   - Usar coffee/chocolate más agresivamente (umbrales más bajos)
   - Usar water más frecuentemente

## 📝 Notas

- El simulador ahora usa objetos estratégicamente, lo que debería mejorar significativamente los resultados
- Las penalizaciones diarias son el problema principal
- Los objetos existen y funcionan, pero no se usan porque el jugador muere antes de necesitarlos
- Con partidas más largas, los objetos tendrán más oportunidad de ser útiles

---

## 🔍 Análisis Detallado - Nueva Simulación (test_log.md)

### 📊 Resumen Ejecutivo

**Fecha:** Última simulación después de todas las mejoras
**Partidas simuladas:** 100
**Resultado general:** ⚠️ **Mezclado** - Mejoras en duración y progreso, pero regresión crítica en mental

### 📈 Comparación con Simulación Anterior

| Métrica | Anterior | Nueva | Cambio | Estado |
|---------|----------|-------|--------|--------|
| **Días promedio** | 8.63 | **9.08** | +5.2% | ✅ Mejoró |
| **Mental final** | 1.5% | **0.4%** | -73% | ❌ **Crítico** |
| **Vida final** | ~85% | **85.5%** | +0.5% | ✅ Similar |
| **Muerte por locura** | 75% | **80%** | +5pp | ❌ Empeoró |
| **Muerte por deck_empty** | 25% | **20%** | -5pp | ✅ Mejoró |
| **Firewall** | 29.0% | **28.6%** | -0.4pp | ✅ Similar |
| **Análisis** | 25.5% | **28.3%** | +11% | ✅ Mejoró |
| **SOS** | ~5% | **5.7%** | +0.7pp | ✅ Similar |

### 🎯 Análisis de Objetos

**Objetos bien utilizados (tasa de uso > 50%):**
- `supply_coffee`: 79.2% (42/53) - ✅ Excelente
- `supply_adrenaline`: 71.2% (42/59) - ✅ Muy bien
- `supply_whisky`: 69.2% (36/52) - ✅ **¡Ahora SÍ se usa!**
- `supply_chocolate`: 65.0% (39/60) - ✅ Bien
- `supply_water`: 64.6% (31/48) - ✅ Bien
- `base_antenna_kit`: 50.0% (21/42) - ✅ Aceptable

**Objetos poco utilizados (tasa de uso < 50%):**
- `supply_bandages`: 41.7% (20/48) - ⚠️ Podría mejorarse
- `supply_ration`: 27.8% (15/54) - ⚠️ Bajo
- `supply_tape`: 26.7% (16/60) - ⚠️ Bajo (pero se usa en eventos)
- `supply_medkit`: 19.3% (11/57) - ⚠️ **Muy bajo** (umbral vida < 70% puede ser muy restrictivo)

**Objetos nunca utilizados (0% de uso):**
- `supply_thermal_patch`: 0% (56 obtenidos) - ❌ **Sin casos de uso**
- `supply_recorder`: 0% (55 obtenidos) - ❌ **Sin casos de uso**
- `supply_photo`: 0% (59 obtenidos) - ❌ **Sin casos de uso**
- `supply_battery`: 0% (53 obtenidos) - ❌ **Sin casos de uso**
- `base_flashlight`: 0% - ❌ **Sin casos de uso**
- `base_encrypted_drive`: 0% - ❌ **Sin casos de uso**
- `base_coffee_thermos`: 0% - ❌ **Sin casos de uso**
- `base_screwdriver`: 0% - ❌ **Sin casos de uso**
- `base_heating_core`: 0% - ❌ **Sin casos de uso**
- `base_master_key`: 0% (39 obtenidos) - ❌ **Sin casos de uso**
- `base_hammer`: 0% - ❌ **Sin casos de uso**

### ⚠️ Problema Crítico: Regresión del Mental

**Análisis del problema:**
El mental promedio final cayó de **1.5% a 0.4%**, una regresión del **73% relativo**. Esto es muy preocupante y sugiere que algo está causando más daño mental.

**Cálculo de penalizaciones estimadas (9.08 días promedio):**
- Días 1-2 (2 días, 50% penalizaciones): ~1-2% mental perdido
- Días 3-5 (3 días, 100% penalizaciones): ~6-12% mental perdido
- Día 6+ (~4 días, 150% penalizaciones): ~6-12% mental perdido
- **Total estimado: ~13-26% mental perdido solo por penalizaciones diarias**

**Factores que contribuyen:**
1. **Partidas más largas:** 9.08 días vs 8.63 días = +0.45 días extra
2. **Más días en tormenta:** Con 9.08 días promedio, hay ~4 días en fase de tormenta (día 6+)
3. **Penalizaciones aumentadas:** 150% de penalizaciones en días 6+ es muy alto
4. **Eventos de anomalías:** A pesar de la reducción del 25%, el daño acumulado sigue siendo alto
5. **Objetos no suficientes:** Aunque se usan objetos, no compensan el daño acumulado

### 💡 Recomendaciones Prioritarias

#### Prioridad CRÍTICA (Implementar inmediatamente)

1. **Reducir penalizaciones en días 6+ (tormenta):**
   ```typescript
   // Actual: 150% de penalizaciones en día 6+
   // Propuesto: 125% de penalizaciones en día 6+
   penaltyMultiplier = 1.25; // En lugar de 1.5
   ```
   **Impacto esperado:** Reducir pérdida de mental en ~2-4% en partidas largas

2. **Aumentar recuperación de objetos de mental:**
   ```typescript
   // Coffee: +15% → +20% mental
   // Chocolate: Aumentar de +10% a +15% mental
   // Water: +8% → +10% mental
   ```
   **Impacto esperado:** Mejorar mental final en ~2-5%

3. **Usar objetos más agresivamente:**
   - Coffee: mental < 50% → mental < 60%
   - Chocolate: mental < 80% → mental < 85%
   - Water: Usar más frecuentemente (umbral más bajo)

#### Prioridad ALTA

4. **Reducir daño de anomalías adicional 10-15%:**
   - Ya se redujo 25%, pero puede necesitar más
   - O aumentar recuperación de Hearts (introspection) aún más

5. **Ajustar umbral de medkit:**
   - Actual: vida < 70%
   - Propuesto: vida < 80% (para usarlo más preventivamente)

#### Prioridad MEDIA

6. **Implementar casos de uso para objetos sin usar:**
   - `supply_thermal_patch`: ¿Reducir penalización de frío?
   - `supply_recorder`: ¿Aumentar recuperación de mental?
   - `supply_photo`: ¿Aumentar recuperación de mental?
   - `supply_battery`: ¿Usar en eventos específicos?

### 📊 Estadísticas de Eventos

- **Total de eventos:** 1837
- **Eventos con objetos requeridos:** 616 (33.5%)
- **Eventos sin objetos requeridos:** 1221 (66.5%)
- **Dificultad promedio:** 3.96
- **Tasa de éxito en tiradas:** 52.6% - ✅ Razonable

### 🎯 Objetivo Final

**Meta:** Alcanzar ~30-50% de partidas completadas con:
- Mental final promedio: > 20%
- Días promedio: 8-12 días
- Muerte por locura: < 50%
- Muerte por deck_empty: < 30%

**Estado actual:** 0% de partidas completadas - ❌ **Muy lejos del objetivo**

