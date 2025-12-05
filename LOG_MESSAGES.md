# LISTADO DE MENSAJES DEL LOG - GLACIAL_ECHO.EXE

Este documento lista todos los mensajes que se pueden agregar al log del juego, organizados por tipo y mostrando su estructura.

## ESTRUCTURA GENERAL

Todos los mensajes del log tienen la siguiente estructura:
- **text**: El contenido del mensaje (puede contener HTML como `<br>`)
- **type**: El tipo de mensaje (determina el estilo visual)
- **timestamp**: Timestamp generado automáticamente

## CONVENCIÓN DE PREFIJOS

**TODOS los mensajes siguen una convención de prefijos consistente:**

- **`> `** - Prefijo estándar para todos los mensajes normales (sistema, usuario, dado, etc.)
- **`>> `** - Prefijo para todos los mensajes de tipo `'horror'` (terror/amenaza)

Esta convención asegura una experiencia visual consistente y facilita la identificación rápida del tipo de mensaje.

---

## TIPOS DE MENSAJES

### 1. `'system'` - Mensajes del Sistema (prefijo: `> `)
### 2. `'user'` - Mensajes del Usuario (prefijo: `> PERSONAL/USUARIO: `)
### 3. `'dice'` - Mensajes relacionados con el dado (prefijo: `> `)
### 4. `'cycle-penalty'` - Penalizaciones al finalizar un ciclo (prefijo: `> `)
### 5. `'horror'` - Mensajes de terror/amenaza (prefijo: `>> `)

---

## MENSAJES POR CATEGORÍA

### 📋 MENSAJES INICIALES

#### 1. Mensaje de Inicio del Sistema
- **Tipo**: `'system'`
- **Ubicación**: `hooks/useGame.ts` (línea 104-110)
- **Estructura**:
```
> SISTEMA INICIADO. USUARIO: ANALISTA_7.<br>
> TEMPERATURA EXTERNA: -64°C.<br>
> ESTADO DE LA BASE: CRÍTICO/ABANDONADA.<br>
> INICIANDO PROCESO DE RECUPERACIÓN DE DATOS...<br>
<br>
> ESPERANDO LANZAMIENTO DE DADO PARA CALCULAR ANCHO DE BANDA...
```
- **Prefijo**: `> ` (todos los mensajes del sistema)
- **Nota**: Usa `<br>` para saltos de línea

#### 2. Mensaje de Recuperación de Partida
- **Tipo**: `'system'`
- **Ubicación**: `hooks/useGame.ts` (línea 123-128)
- **Estructura**:
```
> PARTIDA RECUPERADA.<br>
> CICLO ACTUAL: ${newGame.state.turn}<br>
> ESTADO DEL SISTEMA RESTAURADO.<br>
<br>
> CONTINUANDO DESDE EL ÚLTIMO PUNTO DE GUARDADO...
```
- **Prefijo**: `> ` (todos los mensajes del sistema)
- **Nota**: Solo se muestra si no hay log guardado previo

---

### 🎲 MENSAJES DEL DADO Y CICLOS

#### 3. Inicio de Ciclo
- **Tipo**: `'dice'`
- **Ubicación**: `lib/game.ts` (línea 240)
- **Estructura**:
```
> CICLO ${this.state.turn} INICIADO. RESULTADO DADO: [${roll}]
```
- **Prefijo**: `> `
- **Variables**: `turn` (número de ciclo), `roll` (resultado del dado 1-6)

#### 4. Bloque de Datos Pendientes
- **Tipo**: `'system'`
- **Ubicación**: `lib/game.ts` (línea 241)
- **Estructura**:
```
> Se deben procesar ${roll} bloques de datos...
```
- **Prefijo**: `> ` (prefijo de sistema)
- **Variables**: `roll` (cantidad de bloques)

---

### ⚠️ MENSAJES DE PENALIZACIÓN

#### 5. Fin de Ciclo con Penalizaciones
- **Tipo**: `'cycle-penalty'`
- **Ubicación**: `lib/game.ts` (línea 203-205)
- **Estructura**:
```
> FIN DE CICLO ${this.state.turn}: El tiempo pasa. Frío: -${lifePenalty}% O₂ | Aislamiento: -${mentalPenalty}% Ψ
```
- **Prefijo**: `> `
- **Variables**: `turn` (número de ciclo), `lifePenalty` (2-5), `mentalPenalty` (3-6)
- **Nota**: Solo se muestra si `turn > 0` (no en el primer ciclo)

---

### 🎴 MENSAJES DE CARTAS

#### 6. Datos Entrantes (Carta Robada)
- **Tipo**: `'system'` o `'horror'` (depende del tipo de carta)
- **Ubicación**: `lib/game.ts` (línea 259-262)
- **Estructura**:
```
${isThreat ? '>>' : '>'} DATOS ENTRANTES [${card.suit.symbol}${card.rank}]: ${card.text}
```
- **Prefijo**: 
  - `>> ` si es carta de amenaza (tréboles)
  - `> ` para los demás
- **Variables**: 
  - `card.suit.symbol` (♥, ♦, ♣, ♠)
  - `card.rank` (A, 2-10, J, Q, K)
  - `card.text` (texto descriptivo de la carta)
- **Tipo condicional**: 
  - `'horror'` si `card.suit.type === 'threat'` (tréboles) → usa prefijo `>> `
  - `'system'` para los demás → usa prefijo `> `

#### 7. Resultado del Efecto de la Carta
- **Tipo**: `'system'`
- **Ubicación**: `lib/game.ts` (línea 263)
- **Estructura**:
```
> SISTEMA: ${effectResult}
```
- **Prefijo**: `> SISTEMA: `
- **Variables**: `effectResult` (mensaje generado por la función `effect` de la carta)
- **Ejemplos de `effectResult`**:
  - `"Recuperas ${h}% de Estabilidad Mental."` (corazones)
  - `"Soporte Vital aumenta ${h}%."` o `"Soporte Vital cae ${d}%."` (diamantes)
  - `"Estabilidad Mental cae ${d}%."` (tréboles)
  - `"S.O.S. aumenta ${a}%."` o `"Firewall aumenta ${a}%."` o `"Análisis aumenta ${a}%."` (picas)

---

### 👤 MENSAJES DEL USUARIO

#### 8. Entrada Personal del Usuario
- **Tipo**: `'user'`
- **Ubicación**: `lib/game.ts` (línea 180)
- **Estructura**:
```
> PERSONAL/USUARIO: ${userText.trim()}
```
- **Prefijo**: `> PERSONAL/USUARIO: `
- **Variables**: `userText` (texto ingresado por el usuario en el textarea)
- **Nota**: El texto es el que el usuario escribe en la bitácora

---

### 🌪️ EVENTO ESPECIAL: CICLO 6 (La Tormenta)

#### 9. Alerta de Tormenta
- **Tipo**: `'horror'`
- **Ubicación**: `lib/game.ts` (línea 225-227)
- **Estructura**:
```
>> ALERTA DE TORMENTA: Los sensores detectan vientos cataclísmicos. La antena de comunicaciones ha sido arrancada de la base.
```
- **Prefijo**: `>> ` (mensaje de horror)
- **Nota**: Se muestra solo cuando `turn === 6`

#### 10. Módulo SOS Offline
- **Tipo**: `'system'`
- **Ubicación**: `lib/game.ts` (línea 229-231)
- **Estructura**:
```
> SISTEMA: Módulo de Transmisión SOS [OFFLINE]. Ya no es posible pedir ayuda externa.
```
- **Prefijo**: `> SISTEMA: `
- **Nota**: Se muestra solo cuando `turn === 6`

#### 11. Advertencia de Rango Excedido
- **Tipo**: `'horror'`
- **Ubicación**: `lib/game.ts` (línea 233-235)
- **Estructura**:
```
>> ADVERTENCIA: RANGO DE EXTRACCIÓN EXCEDIDO. El vehículo de rescate ha abandonado el sector.
```
- **Prefijo**: `>> ADVERTENCIA: `
- **Nota**: Se muestra solo cuando `turn === 6`

---

## RESUMEN DE PREFIJOS UTILIZADOS

| Prefijo | Uso | Ejemplos |
|---------|-----|----------|
| `> ` | Todos los mensajes normales del sistema | "> SISTEMA INICIADO...", "> CICLO 1 INICIADO...", "> Se deben procesar..." |
| `> SISTEMA: ` | Resultados del sistema | "> SISTEMA: Recuperas 10% de Estabilidad Mental." |
| `> PERSONAL/USUARIO: ` | Entradas del usuario | "> PERSONAL/USUARIO: [texto del usuario]" |
| `>> ` | Todos los mensajes de horror/amenaza | ">> ALERTA DE TORMENTA:...", ">> DATOS ENTRANTES [♣]...", ">> ADVERTENCIA:..." |

---

## ANÁLISIS DE CONSISTENCIA

### ✅ ESTRUCTURAS CONSISTENTES (ACTUALIZADO):
1. ✅ **Todos los mensajes normales** usan el prefijo `> ` de forma consistente
2. ✅ **Todos los mensajes de horror** usan el prefijo `>> ` de forma consistente
3. ✅ **Mensajes del usuario** usan `> PERSONAL/USUARIO: ` de forma consistente
4. ✅ **Mensajes del sistema** usan `> SISTEMA: ` de forma consistente
5. ✅ **Mensajes de ciclo** usan `> ` de forma consistente

### ✅ UNIFICACIÓN COMPLETA:

Todos los mensajes han sido unificados siguiendo la convención:
- **`> `** para todos los mensajes normales (sistema, usuario, dado, ciclo)
- **`>> `** para todos los mensajes de horror/amenaza

**Estado**: ✅ **TODOS LOS MENSAJES ESTÁN UNIFICADOS Y CONSISTENTES**

---

## UBICACIONES EN EL CÓDIGO

- **`hooks/useGame.ts`**: Mensajes iniciales (líneas 104-110, 123-128)
- **`lib/game.ts`**: 
  - Mensajes del usuario (línea 180)
  - Mensajes de ciclo y dado (líneas 203-205, 240-241)
  - Mensajes de cartas (líneas 259-263)
  - Evento Ciclo 6 (líneas 225-236)

