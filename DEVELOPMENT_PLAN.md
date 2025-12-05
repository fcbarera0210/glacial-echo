# PLAN DE DESARROLLO - GLACIAL_ECHO V2.0

Este documento detalla el plan de implementación de las nuevas mecánicas del juego, organizado en fases y tareas específicas.

---

## ✅ DECISIONES CONFIRMADAS

### 1. Sistema de Inventario
- ✅ **6 espacios base** (expandible a 8 con objeto "Banano")
- ✅ **Objeto "Banano"**: Objeto especial que se encuentra en el mazo
- ✅ **Apilar objetos**: Solo objetos consumibles del mismo tipo
- ✅ Los objetos especiales NO se apilan

### 2. Sistema de Cordura - Umbrales
- ✅ Mental > 80%: +1 dado
- ✅ Mental 60-79%: +0.5 dado (redondea hacia arriba)
- ✅ Mental 40-59%: 0
- ✅ Mental 20-39%: -0.5 dado (redondea hacia abajo)
- ✅ Mental < 20%: -1 dado + riesgo de "Suicidio Accidental"

### 3. Verificación de Estado Real
- ✅ **Usos por día**: 1-2 veces (según estado mental)
- ✅ **Costo**: -5% Mental si falla
- ✅ **Dificultad**: 4+ en 1d6 + Modificador Mental

### 4. Sistema de Cartas por Día
- ✅ **d10** para determinar cartas del día
- ✅ **Barajar mazo**: Se barajan TODAS las cartas
- ✅ **Excepciones**: Objetos especiales ya robados y objetos en inventario NO se vuelven a barajar
- ✅ Las cartas de eventos (anomalías, operaciones) SÍ se vuelven a barajar

### 5. Final S - Ajustes
- ✅ **Porcentajes**: 90% en cada barra (analysis y firewall)
- ✅ **Objetos que facilitan**:
  - "Algoritmo de Optimización": Reduce a 85%
  - "Backup de Datos": Permite redistribuir progreso
  - "Protocolo Maestro": Reduce a 80%

### 6. Sistema de Pity
- ✅ **Cada 10 cartas** sin objeto importante, se garantiza uno
- ✅ Aplica a todos los objetos importantes o de gran impacto

---

## 🗺️ ARQUITECTURA DEL PLAN

El desarrollo se dividirá en **6 FASES PRINCIPALES**, cada una con tareas específicas y verificables.

---

## FASE 1: FUNDACIÓN - TIPOS Y ESTRUCTURAS BASE

**Objetivo**: Crear las estructuras de datos y tipos necesarios para las nuevas mecánicas.

### Tareas:

1. **Actualizar tipos TypeScript** (`types/game.ts`)
   - [ ] Agregar tipo `Item` (objeto de inventario)
   - [ ] Agregar tipo `ItemType` ('supplies' | 'base' | 'threat' | 'operation')
   - [ ] Agregar tipo `ItemRarity` ('common' | 'special')
   - [ ] Agregar tipo `EventType` ('positive' | 'negative' | 'choice')
   - [ ] Actualizar `GameState`:
     - [ ] Cambiar `turn` → `day`
     - [ ] Agregar `rescueTimer: number | null`
     - [ ] Agregar `isAntennaReinforced: boolean`
   - [ ] Agregar `inventory: Item[]` (máximo 6 espacios base, expandible a 8)
   - [ ] Agregar `inventoryMaxSlots: number` (6 base, 8 con "Banano")
   - [ ] Actualizar `Card` para incluir información de objeto
   - [ ] Crear tipo `OperationEvent` para eventos interactivos

2. **Crear constantes de objetos** (`lib/items.ts` - NUEVO)
   - [ ] Definir todos los objetos de Suministros (13 objetos)
   - [ ] Definir todos los objetos de Infraestructura (13 objetos)
   - [ ] Definir eventos de Anomalías (13 eventos)
   - [ ] Definir plantillas de Operaciones (13 eventos)
   - [ ] Crear mapeo de cartas a objetos/eventos

3. **Actualizar constantes existentes** (`lib/constants.ts`)
   - [ ] Cambiar `SUITS` para reflejar nuevos tipos
   - [ ] Actualizar `CARD_TEMPLATES` con nuevos textos narrativos

**Criterios de Éxito**: 
- Todos los tipos compilan sin errores
- Todas las constantes están definidas
- Se puede crear un objeto de inventario y agregarlo al estado

---

## FASE 2: SISTEMA DE INVENTARIO

**Objetivo**: Implementar la gestión completa de inventario.

### Tareas:

1. **Sistema de Inventario Base** (`lib/inventory.ts` - NUEVO)
   - [ ] Función `canAddItem(inventory: Item[], item: Item): boolean`
   - [ ] Función `addItem(inventory: Item[], item: Item): Item[] | null` (retorna null si está lleno)
   - [ ] Función `removeItem(inventory: Item[], index: number): Item[]`
   - [ ] Función `useItem(inventory: Item[], index: number, state: GameState): { newInventory: Item[], newState: GameState, message: string }`
   - [ ] Función `stackItem(inventory: Item[], item: Item): Item[]` (para objetos apilables)
   - [ ] Función `expandInventory(inventory: Item[], currentMax: number, hasBanano: boolean): number` (para objeto "Banano" - +2 espacios)

2. **Lógica de Objetos** (`lib/items.ts`)
   - [ ] Implementar efectos de todos los objetos de Suministros
   - [ ] Implementar efectos de todos los objetos de Infraestructura
   - [ ] Implementar objetos reutilizables (Termo de Café, etc.)
   - [ ] Implementar objetos especiales con efectos únicos

3. **UI de Inventario** (`components/InventoryPanel.tsx` - NUEVO)
   - [ ] Mostrar slots de inventario (6 base, expandible)
   - [ ] Mostrar objetos con iconos/nombres
   - [ ] Botones "Usar" y "Descartar" por objeto
   - [ ] Indicador visual de objetos apilables
   - [ ] Indicador de objetos especiales

4. **Integración con Game** (`lib/game.ts`)
   - [ ] Modificar `drawCard()` para agregar objetos al inventario
   - [ ] Verificar límite de inventario antes de agregar
   - [ ] Manejar objetos apilables
   - [ ] Manejar inventario lleno (forzar descarte o uso)

**Criterios de Éxito**:
- Se pueden agregar objetos al inventario
- Se respeta el límite de espacios
- Se pueden usar objetos y aplicar sus efectos
- Se pueden descartar objetos
- Los objetos apilables funcionan correctamente

---

## FASE 3: SISTEMA DE CORDURA MEJORADO

**Objetivo**: Implementar el sistema de cordura que afecta el juego.

### Tareas:

1. **Modificadores de Dado** (`lib/game.ts`)
   - [ ] Función `getMentalModifier(mental: number): number`
   - [ ] Implementar umbrales confirmados:
     - Mental > 80%: +1
     - Mental 60-79%: +0.5 (redondear hacia arriba)
     - Mental 40-59%: 0
     - Mental 20-39%: -0.5 (redondear hacia abajo)
     - Mental < 20%: -1
   - [ ] Aplicar modificador en eventos de Operaciones

2. **Sistema de Alucinaciones** (`lib/hallucinations.ts` - NUEVO)
   - [ ] Función `shouldShowHallucination(mental: number): boolean`
   - [ ] Función `generateFakeLog(): string` (genera logs falsos)
   - [ ] Función `shouldGlitchUI(mental: number): boolean`
   - [ ] Función `getGlitchType(): 'button' | 'inventory' | 'sound'`

3. **Sistema de Verificación** (`lib/game.ts`)
   - [ ] Función `verifyReality(mental: number, usesToday: number): { success: boolean, realState: GameState, usesRemaining: number }`
   - [ ] Límite de usos: 1-2 veces por día (según estado mental)
   - [ ] Tirada de dado: 1d6 + modificador mental
   - [ ] Dificultad: 4+
   - [ ] Si éxito: muestra estado real temporalmente
   - [ ] Si fallo: -5% mental (la entidad se resiste)

4. **UI de Alucinaciones** (`components/LogPanel.tsx`, `app/globals.css`)
   - [ ] Estilo visual para logs falsos (texto parpadeante, color diferente)
   - [ ] Animación de glitches de botones
   - [ ] Efecto visual en inventario (texto corrupto)
   - [ ] Botón "VERIFICAR REALIDAD" (con límite de usos por día)

5. **Integración** (`lib/game.ts`)
   - [ ] Generar logs falsos cuando mental < 40%
   - [ ] Aplicar glitches de UI
   - [ ] Integrar verificación de realidad

**Criterios de Éxito**:
- Los modificadores de dado se aplican correctamente
- Los logs falsos aparecen y son visualmente distintos
- Los glitches de UI funcionan
- La verificación de realidad funciona con tirada de dado

---

## FASE 4: SISTEMA DE EVENTOS INTERACTIVOS

**Objetivo**: Convertir las cartas en eventos con decisiones.

### Tareas:

1. **Sistema de Eventos** (`lib/events.ts` - NUEVO)
   - [ ] Tipo `EventChoice` con opciones
   - [ ] Función `generateInfrastructureEvent(): EventChoice` (60% objeto, 40% evento negativo con opciones)
   - [ ] Función `generateAnomalyEvent(mental: number): EventChoice` (más grave si mental bajo)
   - [ ] Función `generateOperationEvent(): EventChoice` (con opciones interactivas)

2. **Sistema de Operaciones** (`lib/operations.ts` - NUEVO)
   - [ ] Función `rollOperation(difficulty: number, mentalModifier: number, itemModifier: number): boolean`
   - [ ] Función `calculateOperationResult(roll: number, difficulty: number): { success: boolean, reward: number, penalty: number }`
   - [ ] Plantillas de eventos de operación con opciones A, B, C

3. **UI de Eventos** (`components/EventModal.tsx` - NUEVO)
   - [ ] Modal para mostrar eventos
   - [ ] Botones para opciones A, B, C
   - [ ] Mostrar dificultad y modificadores
   - [ ] Mostrar objetos disponibles para usar
   - [ ] Animación de tirada de dado
   - [ ] Mostrar resultado (éxito/fallo)

4. **Conversión de Eventos Negativos** (`lib/events.ts`)
   - [ ] Convertir eventos de Infraestructura negativos en eventos con opciones
   - [ ] Ejemplo: "Tubería rota" → Opción A: Reparar (riesgo), Opción B: Ignorar (daño menor)

5. **Integración** (`lib/game.ts`)
   - [ ] Modificar `drawCard()` para generar eventos según tipo
   - [ ] Manejar decisiones del jugador
   - [ ] Aplicar resultados de operaciones

**Criterios de Éxito**:
- Los eventos muestran opciones al jugador
- Las operaciones usan tiradas de dado con modificadores
- Los objetos pueden usarse en eventos
- Los eventos negativos tienen opciones

---

## FASE 5: SISTEMA DE DÍAS Y RESCATE

**Objetivo**: Implementar el sistema de días y rescate con timer.

### Tareas:

1. **Sistema de Días** (`lib/game.ts`)
   - [ ] Cambiar `turn` → `day` en toda la lógica
   - [ ] Implementar `rollDayCards(): number` (d10 para determinar cartas del día)
   - [ ] Implementar `shuffleDeck(deck: Card[], inventory: Item[], drawnSpecialItems: Item[]): Card[]`
     - [ ] Excluir objetos especiales ya robados (en `drawnSpecialItems`)
     - [ ] Excluir objetos en inventario
     - [ ] Barajar TODAS las demás cartas (eventos, objetos comunes, etc.)
   - [ ] Implementar `endDay(state: GameState): GameState`
     - [ ] Aplicar penalizaciones diarias
     - [ ] Verificar riesgo de "Suicidio Accidental" si mental < 20

2. **Sistema de Rescate** (`lib/game.ts`)
   - [ ] Función `checkRescueTrigger(sos: number, day: number): { triggered: boolean, rescueTimer: number | null }`
   - [ ] Si `sos >= 100%`: establecer `rescueTimer = day`
   - [ ] Función `updateRescueTimer(rescueTimer: number | null): number | null`
   - [ ] Función `checkRescueArrival(rescueTimer: number | null, day: number): boolean`

3. **Evento Día 6** (`lib/game.ts`)
   - [ ] Verificar si jugador tiene "Kit Refuerzo Antena" en inventario
   - [ ] Si tiene: consumir objeto, `isAntennaReinforced = true`
   - [ ] Si no tiene: `sosLocked = true`
   - [ ] Mostrar mensajes apropiados

4. **UI de Rescate** (`components/StatsPanel.tsx`)
   - [ ] Mostrar contador de días hasta rescate (si `rescueTimer` está activo)
   - [ ] Indicador visual de "Rescate en camino"
   - [ ] Mostrar día actual

5. **Integración** (`lib/game.ts`)
   - [ ] Actualizar `rollDie()` → `startDay()`
   - [ ] Actualizar lógica de ciclo para usar días
   - [ ] Verificar llegada de rescate al final de cada día

**Criterios de Éxito**:
- El sistema de días funciona correctamente
- El d10 determina cuántas cartas se pueden robar
- El mazo se baraja correctamente (excluyendo objetos especiales e inventario)
- El sistema de rescate se activa cuando SOS >= 100%
- El contador de rescate se muestra y actualiza correctamente

---

## FASE 6: FINALES Y BALANCE

**Objetivo**: Implementar los nuevos finales y ajustar el balance.

### Tareas:

1. **Actualizar Finales** (`lib/game.ts`)
   - [ ] Final A: `rescueTimer == 0 && life > 0`
   - [ ] Final B: `firewall >= 100%` (inmediato)
   - [ ] Final D: `rescueTimer == 0 && analysis >= 100%`
   - [ ] Final S: `rescueTimer == 0 && analysis >= 90% && firewall >= 90% && isAntennaReinforced`
     - [ ] Aplicar reducción de requisitos si tiene objetos especiales (85% o 80%)
   - [ ] Eliminar botón "Finalizar Sesión"

2. **Objetos para Final S** (`lib/items.ts`)
   - [ ] Crear objetos especiales que faciliten el Final S:
     - [ ] "Algoritmo de Optimización": Reduce requisitos del Final S a 85% en cada barra
     - [ ] "Backup de Datos": Permite redistribuir progreso entre barras
     - [ ] "Protocolo Maestro": Reduce requisitos del Final S a 80% en cada barra
   - [ ] Agregar objeto "Banano": Expande inventario en +2 espacios (máximo 8)

3. **Sistema de Pity para Objetos Importantes** (`lib/game.ts`)
   - [ ] Implementar contador de cartas robadas sin objeto importante
   - [ ] Si se roban 10 cartas sin objeto importante: garantizar uno en la siguiente
   - [ ] Aplicar a todos los objetos importantes o de gran impacto
   - [ ] Ajustar probabilidad base para no romper dificultad

4. **Ajustes de Balance** (`lib/game.ts`, `lib/items.ts`)
   - [ ] Ajustar valores de objetos según testing
   - [ ] Ajustar dificultades de operaciones
   - [ ] Ajustar penalizaciones diarias
   - [ ] Ajustar modificadores de cordura

5. **Documentación de Reglas** (`RULES.md` - NUEVO)
   - [ ] Documentar todas las reglas del juego
   - [ ] Explicar sistema de inventario
   - [ ] Explicar sistema de cordura
   - [ ] Explicar sistema de eventos
   - [ ] Explicar sistema de rescate
   - [ ] Explicar todos los finales

**Criterios de Éxito**:
- Todos los finales funcionan correctamente
- Los objetos especiales ayudan a lograr el Final S
- El sistema de pity funciona sin romper la dificultad
- La documentación está completa y clara

---

## 📊 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
FASE 1 (Fundación)
    ↓
FASE 2 (Inventario)
    ↓
FASE 3 (Cordura) ──┐
    ↓              │
FASE 4 (Eventos) ──┼── Pueden desarrollarse en paralelo
    ↓              │
FASE 5 (Días/Rescate)
    ↓
FASE 6 (Finales/Balance)
```

---

## 🧪 TESTING PLAN (Futuro)

Una vez implementadas todas las fases:

1. **Testing de Balance**
   - Generar 100 partidas simuladas
   - Medir:
     - Tasa de éxito de cada final
     - Distribución de objetos
     - Tiempo promedio de partida
     - Tasa de game over por locura/congelado
   - Ajustar valores según resultados

2. **Testing de UX**
   - Verificar que los glitches no bloqueen acciones críticas
   - Verificar que los logs falsos sean identificables
   - Verificar que el inventario sea intuitivo
   - Verificar que los eventos sean claros

3. **Testing de Bugs**
   - Probar casos límite (inventario lleno, mental muy bajo, etc.)
   - Probar todos los objetos
   - Probar todos los finales
   - Probar sistema de rescate en diferentes días

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Consideraciones Técnicas

1. **Compatibilidad con Guardado**: Asegurar que el nuevo formato de guardado sea compatible o migrar partidas antiguas
2. **Performance**: Los eventos interactivos pueden requerir más renders, optimizar si es necesario
3. **Accesibilidad**: Los glitches de UI no deben romper la accesibilidad

### Decisiones Pendientes

- [ ] Confirmar detalles de preguntas finales (ver sección arriba)
- [ ] Decidir si migrar partidas guardadas o resetear
- [ ] Decidir si mostrar tutorial para nuevas mecánicas

---

## ✅ CHECKLIST DE INICIO

Antes de comenzar FASE 1, confirmar:

- [x] Todas las preguntas de clarificación están respondidas
- [x] El plan está aprobado
- [x] Se entiende la arquitectura propuesta
- [x] Se tiene claro el orden de implementación
- [x] Todas las decisiones están documentadas

---

**Última actualización**: Todas las decisiones confirmadas. Listo para comenzar desarrollo.

