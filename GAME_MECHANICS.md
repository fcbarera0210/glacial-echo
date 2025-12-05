# MECÁNICAS DEL JUEGO - GLACIAL_ECHO.EXE

Este documento detalla todas las mecánicas del juego, incluyendo los efectos de las cartas, condiciones de victoria/derrota, y análisis del balance del juego.

---

## 📊 VARIABLES DE ESTADO

### Variables Vitales (Condiciones de Derrota)
- **`mental`** (0-100%): Estabilidad Mental
  - Si llega a 0 → **GAME OVER: Locura**
- **`life`** (0-100%): Soporte Vital (Calefacción/Comida)
  - Si llega a 0 → **GAME OVER: Congelado**

### Variables de Progreso (Condiciones de Victoria)
- **`sos`** (0-100%): Señal de S.O.S.
  - **IMPORTANTE**: Se bloquea permanentemente en el Ciclo 6 (`sosLocked = true`)
  - Necesario para Final A (RESCATE)
- **`firewall`** (0-100%): Seguridad del sistema
  - Necesario para Final B (HÉROE)
- **`analysis`** (0-100%): Comprensión de datos
  - Necesario para Final C (ERUDITO)

### Variables de Control
- **`turn`**: Contador de ciclos actuales (inicia en 0)
- **`cardsPending`**: Cantidad de cartas que restan por procesar en el ciclo actual
- **`sosLocked`**: Booleano. `true` si la antena ha sido destruida (Ciclo >= 6)
- **`gameOver`**: Booleano. Bloquea interacciones si es `true`

---

## 🎴 EFECTOS DE LAS CARTAS

El juego utiliza una baraja estándar de **52 cartas** (13 cartas × 4 palos). Cada palo tiene un tipo y efecto específico.

### ♥ CORAZONES (Introspección) - Tipo: `'introspection'`

**Efecto**: Recuperación de Estabilidad Mental
- **Rango**: +5% a +15% (aleatorio)
- **Fórmula**: `mental = Math.min(100, mental + rand(5, 15))`
- **Mensaje**: `"Recuperas ${h}% de Estabilidad Mental."`
- **Total de cartas**: 13 (A, 2-10, J, Q, K)

**Análisis**:
- Cartas de recuperación mental
- Útiles para contrarrestar el daño de tréboles y penalizaciones de ciclo
- Valor promedio: +10% por carta
- Máximo posible: +195% si se roban todas (13 × 15%)

---

### ♦ DIAMANTES (La Base Física) - Tipo: `'base'`

**Efecto**: Variable - Puede aumentar o disminuir Soporte Vital
- **Probabilidad**: 60% positivo, 40% negativo
- **Efecto Positivo** (60%):
  - Rango: +5% a +10% (aleatorio)
  - Fórmula: `life = Math.min(100, life + rand(5, 10))`
  - Mensaje: `"Soporte Vital aumenta ${h}%."`
- **Efecto Negativo** (40%):
  - Rango: -5% a -15% (aleatorio)
  - Fórmula: `life = Math.max(0, life - rand(5, 15))`
  - Mensaje: `"Soporte Vital cae ${d}%."`
- **Total de cartas**: 13

**Análisis**:
- Cartas de alto riesgo/recompensa
- Valor esperado por carta: (0.6 × 7.5) - (0.4 × 10) = 4.5 - 4 = **+0.5%** (ligeramente positivo)
- Pueden ser peligrosas si el jugador tiene poco `life`
- Máximo positivo: +130% (13 × 10%)
- Máximo negativo: -195% (13 × 15%)

---

### ♣ TRÉBOLES (La Amenaza/La Señal) - Tipo: `'threat'`

**Efecto**: Daño a Estabilidad Mental
- **Rango**: -8% a -20% (aleatorio)
- **Fórmula**: `mental = Math.max(0, mental - rand(8, 20))`
- **Mensaje**: `"Estabilidad Mental cae ${d}%."`
- **Tipo de log**: `'horror'` (prefijo `>> `)
- **Total de cartas**: 13

**Análisis**:
- Cartas de amenaza - las más peligrosas
- Valor promedio: -14% por carta
- Máximo daño posible: -260% (13 × 20%)
- Pueden causar game over si el jugador tiene poco `mental`
- Requieren cartas de corazones para contrarrestar

---

### ♠ PICAS (El Trabajo/Datos) - Tipo: `'work'`

**Efecto**: Aumenta aleatoriamente una de las tres barras de progreso
- **Distribución**:
  - 33% probabilidad: SOS (+10% a +20%)
  - 33% probabilidad: Firewall (+10% a +20%)
  - 33% probabilidad: Analysis (+10% a +20%)
- **Fórmula**: `rand(10, 20)` para la barra seleccionada
- **Mensajes**:
  - `"Progreso SOS: +${a}%."` (si `r < 0.33` y `!sosLocked`)
  - `"ERROR: Antena destruida. SOS fallido."` (si `r < 0.33` y `sosLocked`)
  - `"Progreso Firewall: +${a}%."` (si `0.33 <= r < 0.66`)
  - `"Progreso Análisis: +${a}%."` (si `r >= 0.66`)
- **Total de cartas**: 13

**Análisis**:
- Cartas de progreso - esenciales para la victoria
- Valor promedio: +15% por carta
- Máximo posible por barra: +260% (13 × 20%), pero distribuido entre 3 barras
- **IMPORTANTE**: Si `sosLocked = true` (Ciclo 6+), las cartas que intenten aumentar SOS fallan
- Distribución esperada: ~4.3 cartas por barra (13 ÷ 3)
- Progreso esperado por barra: ~64.5% (4.3 × 15%)

---

## ⚠️ PENALIZACIONES DEL CICLO

Al iniciar un nuevo ciclo (excepto el primero, `turn > 0`), se aplican penalizaciones automáticas:

- **Estabilidad Mental**: -3% a -6% (aleatorio)
- **Soporte Vital**: -2% a -5% (aleatorio)

**Fórmulas**:
```javascript
mentalPenalty = rand(3, 6)
lifePenalty = rand(2, 5)
mental = Math.max(0, mental - mentalPenalty)
life = Math.max(0, life - lifePenalty)
```

**Análisis**:
- Penalización promedio por ciclo: -4.5% mental, -3.5% life
- En 5 ciclos (antes del Ciclo 6): -22.5% mental, -17.5% life
- Estas penalizaciones son acumulativas y pueden ser mortales si no se contrarrestan

---

## 🌪️ EVENTO ESPECIAL: CICLO 6 (La Tormenta)

Cuando `turn === 6`, ocurre un evento especial:

1. **`sosLocked = true`** (permanente)
2. Se muestran 3 mensajes de log:
   - `">> ALERTA DE TORMENTA: Los sensores detectan vientos cataclísmicos..."`
   - `"> SISTEMA: Módulo de Transmisión SOS [OFFLINE]..."`
   - `">> ADVERTENCIA: RANGO DE EXTRACCIÓN EXCEDIDO..."`

**Consecuencias**:
- **SOS se bloquea permanentemente**
- Ya no es posible alcanzar el Final A (RESCATE) después del Ciclo 6
- Las cartas de picas que intenten aumentar SOS fallan con el mensaje `"ERROR: Antena destruida. SOS fallido."`

**Estrategia**:
- El jugador debe alcanzar SOS >= 80% **antes** del Ciclo 6 para el Final A
- Después del Ciclo 6, solo quedan disponibles los Finales B y C

---

## 🎯 CONDICIONES DE VICTORIA

El juego puede terminar de varias formas. Las condiciones se evalúan cuando:
- El jugador presiona "FINALIZAR SESIÓN" (`attemptFinish()`)
- El mazo se vacía (`deck.length === 0`)

### Condición para Finalizar Sesión

El botón "FINALIZAR SESIÓN" solo está habilitado si se cumple al menos una de estas condiciones:
```javascript
canFinish(): boolean {
  return (sos > 50 && !sosLocked) || 
         firewall > 50 || 
         analysis > 50;
}
```

### Finales Posibles

#### 🏆 FINAL PERFECTO (Rango S+)
- **Condición**: `sos >= 80 && !sosLocked && firewall >= 80 && analysis >= 80`
- **Título**: "EJECUCIÓN PERFECTA"
- **Color**: Verde (`#00ff00`)
- **Descripción**: "Has logrado lo imposible. Señal contenida, datos asegurados, rescate en camino.<br><br><b>RANGO: S+</b>"
- **Dificultad**: ⭐⭐⭐⭐⭐ (Muy difícil - requiere suerte con las picas)

#### 🆘 FINAL A: RESCATE (Superviviente)
- **Condición**: `sos >= 80 && !sosLocked`
- **Título**: "EXTRACCIÓN CONFIRMADA"
- **Descripción**: "El equipo de rescate te saca de allí justo a tiempo.<br><br><b>FINAL A: SUPERVIVIENTE</b>"
- **Estrategia**: Debe lograrse **antes del Ciclo 6**
- **Dificultad**: ⭐⭐⭐⭐ (Difícil - requiere ~5-6 cartas de picas en SOS antes del Ciclo 6)

#### 🛡️ FINAL B: EL GUARDIÁN
- **Condición**: `firewall >= 80`
- **Título**: "PROTOCOLO DE CONTENCIÓN"
- **Descripción**: "No pudiste pedir ayuda a tiempo, pero el Firewall es impenetrable.<br><br><b>FINAL B: EL GUARDIÁN</b>"
- **Estrategia**: Puede lograrse en cualquier momento (incluso después del Ciclo 6)
- **Dificultad**: ⭐⭐⭐ (Moderado - requiere ~5-6 cartas de picas en Firewall)

#### 📚 FINAL C: EL LEGADO
- **Condición**: `analysis >= 80`
- **Título**: "TRANSMISIÓN COMPLETADA"
- **Descripción**: "Tu cuerpo falla, pero los datos han sido enviados a la nube.<br><br><b>FINAL C: EL LEGADO</b>"
- **Estrategia**: Puede lograrse en cualquier momento (incluso después del Ciclo 6)
- **Dificultad**: ⭐⭐⭐ (Moderado - requiere ~5-6 cartas de picas en Analysis)

#### ❌ FINAL: DESAPARECIDO (Default)
- **Condición**: Ninguna de las anteriores se cumple
- **Título**: "MISIÓN FALLIDA"
- **Color**: Gris (`#808080`)
- **Descripción**: "Te quedaste sin recursos o datos. Nadie sabrá qué pasó aquí.<br><br><b>FINAL: DESAPARECIDO</b>"
- **Ocurre cuando**: 
  - Se acaban las cartas sin alcanzar 80% en ninguna barra
  - Se finaliza sesión sin cumplir condiciones de victoria

---

## 💀 CONDICIONES DE DERROTA

### 1. Locura (Insanity)
- **Condición**: `mental <= 0`
- **Título**: "ERROR FATAL: MENTE CORRUPTA"
- **Color**: Rojo (`#ff0000`)
- **Descripción**: "La Señal ha reescrito tus neuronas. Ahora eres parte de la transmisión.<br><br><b>FINAL: PERDIDO EN LA ESTÁTICA</b>"
- **Puede ocurrir**:
  - Después de robar una carta de tréboles
  - Después de la penalización de ciclo

### 2. Congelado (Frozen)
- **Condición**: `life <= 0`
- **Título**: "SISTEMAS VITALES: OFF"
- **Color**: Cian (`#00ffff`)
- **Descripción**: "El frío ganó. Tu cuerpo es encontrado meses después.<br><br><b>FINAL: ESTATUA DE HIELO</b>"
- **Puede ocurrir**:
  - Después de robar una carta de diamantes negativa
  - Después de la penalización de ciclo

---

## 📈 ANÁLISIS DE BALANCE

### Recursos Disponibles

**Cartas de Recuperación**:
- 13 Corazones: +65% a +195% mental (promedio: +130%)
- 13 Diamantes: Variable, valor esperado: +6.5% life

**Cartas de Daño**:
- 13 Tréboles: -104% a -260% mental (promedio: -182%)
- Penalizaciones de ciclo (5 ciclos): -22.5% mental, -17.5% life

**Cartas de Progreso**:
- 13 Picas: Distribuidas entre 3 barras (~4.3 cartas por barra)
- Progreso esperado por barra: ~64.5% (4.3 × 15%)

### Balance Mental vs Life

**Mental**:
- Recuperación disponible: +130% (promedio)
- Daño disponible: -182% (promedio) + -22.5% (penalizaciones) = **-204.5%**
- **Balance**: ⚠️ **Negativo** - El jugador necesita suerte o estrategia para sobrevivir

**Life**:
- Recuperación disponible: +6.5% (promedio)
- Daño disponible: -52% (promedio, 40% de 13 diamantes) + -17.5% (penalizaciones) = **-69.5%**
- **Balance**: ⚠️ **Negativo** - Similar a mental, pero menos extremo

### Probabilidad de Victoria

**Final A (RESCATE)**:
- Requiere: ~5-6 cartas de picas en SOS antes del Ciclo 6
- Probabilidad: ~33% de que una pica aumente SOS
- Probabilidad esperada: ~1.4 cartas de SOS en las primeras 5-6 picas
- **Dificultad**: ⭐⭐⭐⭐ (Requiere suerte significativa)

**Final B o C**:
- Requiere: ~5-6 cartas de picas en una barra específica
- Probabilidad: ~33% por carta
- Probabilidad esperada: ~1.4 cartas por barra en las primeras 5-6 picas
- **Dificultad**: ⭐⭐⭐ (Moderado, pero requiere suerte)

**Final Perfecto**:
- Requiere: ~5-6 cartas en cada una de las 3 barras
- Probabilidad: Muy baja (~0.5% si se distribuyen perfectamente)
- **Dificultad**: ⭐⭐⭐⭐⭐ (Extremadamente difícil)

### Estrategias Recomendadas

1. **Priorizar Corazones**: Las cartas de corazones son esenciales para contrarrestar el daño de tréboles
2. **Gestionar Diamantes con Cuidado**: Las cartas de diamantes pueden ser peligrosas si el jugador tiene poco `life`
3. **Enfocarse en un Final**: Intentar alcanzar 80% en una sola barra es más realista que intentar el Final Perfecto
4. **Final A antes del Ciclo 6**: Si se busca el Final A, debe lograrse antes del Ciclo 6
5. **Final B o C después del Ciclo 6**: Después del Ciclo 6, enfocarse en Firewall o Analysis

---

## 🎲 CICLO DE JUEGO

### Flujo de un Ciclo

1. **Inicio de Ciclo**:
   - Jugador presiona "INICIAR CICLO" o "LANZAR DADO"
   - Si `turn > 0`: Se aplican penalizaciones de ciclo
   - Se lanza un d6 (1-6)
   - `cardsPending = roll`
   - `turn++`

2. **Fase de Procesamiento**:
   - Jugador presiona "PROCESAR DATO" o "ROBAR CARTA"
   - Se roba una carta del mazo
   - Se aplica el efecto de la carta
   - `cardsPending--`
   - Se verifica si `mental <= 0` o `life <= 0` (game over)

3. **Fin de Ciclo**:
   - Cuando `cardsPending === 0`, el jugador puede:
     - Escribir en el diario
     - Ver la Base de Datos
     - Intentar "FINALIZAR SESIÓN" (si `canFinish()`)
     - Iniciar un nuevo ciclo

### Eventos Especiales

- **Ciclo 6**: La Tormenta (SOS se bloquea)
- **Mazo vacío**: El juego termina automáticamente

---

## 📝 NOTAS DE DISEÑO

### Decisiones de Balance

1. **Penalizaciones de Ciclo**: Aseguran que el juego no dure indefinidamente
2. **Ciclo 6**: Crea urgencia y limita el tiempo para el Final A
3. **Distribución de Picas**: 33% por barra asegura que ninguna estrategia sea demasiado fácil
4. **Diamantes Variables**: Añaden riesgo/recompensa y tensión
5. **Tréboles Peligrosos**: Crean amenaza constante y necesidad de gestionar recursos

### Posibles Mejoras

1. **Balance Mental**: El daño disponible (-204.5%) supera la recuperación (+130%). Considerar:
   - Reducir el daño de tréboles
   - Aumentar la recuperación de corazones
   - Reducir las penalizaciones de ciclo

2. **Distribución de Picas**: La distribución aleatoria puede ser frustrante. Considerar:
   - Sistema de "pity" que garantice al menos una carta por barra cada X cartas
   - Opción de elegir qué barra aumentar (con costo)

3. **Final Perfecto**: Extremadamente difícil. Considerar:
   - Reducir el requisito a 70% en cada barra
   - Añadir bonificaciones especiales

---

## 📊 RESUMEN DE ESTADÍSTICAS

| Recurso | Cantidad | Valor Promedio | Valor Máximo | Valor Mínimo |
|---------|----------|----------------|--------------|--------------|
| Corazones | 13 | +130% mental | +195% | +65% |
| Diamantes | 13 | +6.5% life | +130% | -195% |
| Tréboles | 13 | -182% mental | -104% | -260% |
| Picas | 13 | +195% (distribuido) | +260% | +130% |
| Penalizaciones (5 ciclos) | 5 | -22.5% mental, -17.5% life | -30% mental, -25% life | -15% mental, -10% life |

---

**Última actualización**: Basado en el código actual del juego (Next.js/TypeScript)

