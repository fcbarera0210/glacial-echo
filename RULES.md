# REGLAS DEL JUEGO - GLACIAL_ECHO V2.0

Este documento detalla todas las reglas y mecánicas del juego GLACIAL_ECHO.EXE.

---

## 📊 VARIABLES DE ESTADO

### Variables Vitales
- **`mental`** (0-100%): Estabilidad Mental. Afecta la percepción de la UI y los dados.
- **`life`** (0-100%): Integridad Física / Calor Corporal.

### Variables de Progreso
- **`sos`** (0-100%): Señal de Rescate.
- **`firewall`** (0-100%): Contención de la Entidad.
- **`analysis`** (0-100%): Comprensión de la Anomalía.

### Variables de Control
- **`day`**: Día actual.
- **`rescueTimer`**: Contador regresivo para la llegada del helicóptero (null por defecto).
- **`isAntennaReinforced`**: Booleano. Si es `true`, la tormenta del Día 6 no rompe la señal.
- **`inventory`**: Array de objetos (Máximo 6 espacios base, expandible a 8 con objeto "Banano").
- **`inventoryMaxSlots`**: Número máximo de espacios de inventario (6 base, 8 con "Banano").

---

## 🧠 SISTEMA DE CORDURA (SANITY SYSTEM)

### Modificadores de Dado (Suerte Mental)
La concentración del personaje afecta el éxito en las operaciones (Picas).

- **Mental > 80%**: **+1** al resultado del dado (Mente clara).
- **Mental 60-79%**: **+0.5** al resultado del dado (redondea hacia arriba).
- **Mental 40-59%**: **0** (Normal).
- **Mental 20-39%**: **-0.5** al resultado del dado (redondea hacia abajo).
- **Mental < 20%**: **-1** al resultado del dado + riesgo de "Suicidio Accidental".

### Alucinaciones de UI (Mental < 40%)
Cuando la cordura es crítica, la "Entidad" hackea el juego:

1. **Logs Falsos**: Aparecen mensajes en el registro que no ocurrieron realmente.
   - Visualmente distintos: texto parpadeante, color diferente
2. **UI Glitches**:
   - Botones que desaparecen por 2 segundos.
   - Nombres de objetos en el inventario cambian a texto corrupto.
   - Sonidos de interfaz distorsionados.

### Verificación de Realidad
El jugador puede intentar verificar qué es real y qué es alucinación:

- **Usos por día**: 1-2 veces (depende del estado mental)
- **Mecánica**: Tirada de 1d6 + Modificador Mental
- **Dificultad**: 4+
- **Costo**: Si falla, -5% Mental (la entidad se resiste)
- **Éxito**: Muestra el estado real del juego temporalmente (5 segundos)

---

## 🎒 SISTEMA DE INVENTARIO

### Límites
- **Espacios base**: 6
- **Expansión**: Con objeto "Banano", se expande a 8 espacios máximo
- **Apilar Objetos**: Solo objetos consumibles del mismo tipo pueden apilarse
- **Objetos Especiales**: NO se apilan

### Gestión
- El jugador debe "Usar" o "Descartar" si el inventario está lleno
- Los objetos se agregan automáticamente al robar cartas de Suministros (Hearts)
- Los objetos de Infraestructura (Diamonds) se agregan con 60% de probabilidad

---

## 📅 SISTEMA DE DÍAS

### Inicio de Día
- Al inicio de cada día, se lanza un **d10** para determinar cuántas cartas se pueden robar ese día.
- Ejemplo: Si se obtiene un 7, el jugador puede robar 7 cartas antes de que termine el día.

### Penalizaciones Diarias
Al finalizar las cartas del día:
- **Hambre/Frío**: `life - rand(2, 5)`
- **Aislamiento**: `mental - rand(3, 6)`
- **Si Mental < 20%**: Posibilidad de "Suicidio Accidental" (Game Over por locura narrativa).

### Día 6: La Tormenta
Evento scriptado:
- Verifica si el jugador tiene el objeto **Kit Refuerzo Antena** en el inventario.
- **SÍ lo tiene**: "Usas el kit para asegurar los tensores. La antena resiste." (SOS sigue activo). El objeto se consume.
- **NO lo tiene**: "El viento dobla el metal. La señal se pierde." (`sosLocked = true`).

### Barajado del Mazo
- Si se acaban las cartas del mazo, se barajan nuevamente todas las cartas.
- **Excepciones**: 
  - Los objetos especiales (J, Q, K, A) ya robados NO se vuelven a barajar.
  - Los objetos en el inventario del jugador NO se vuelven a barajar.
- El resto de cartas (eventos, objetos comunes, etc.) se vuelven a barajar normalmente.

---

## 🎲 SISTEMA DE EVENTOS INTERACTIVOS

### Tipos de Cartas

#### ❤️ SUMINISTROS (Hearts)
- Siempre generan objetos
- 9 objetos comunes + 4 especiales (J, Q, K, A) + 1 especial adicional (Banano)

#### ♦️ INFRAESTRUCTURA (Diamonds)
- **60% probabilidad**: Objeto (Positivo)
- **40% probabilidad**: Evento de Daño (Negativo) con opciones

#### ♣️ ANOMALÍAS (Clubs)
- Eventos narrativos de terror
- Si el Mental es bajo, son más graves
- Daño directo a `mental`

#### ♠️ OPERACIONES (Spades)
- Eventos interactivos para subir progreso
- Flujo:
  1. Se presenta un problema
  2. El jugador elige una opción (A, B, o C)
  3. Se lanza 1d6 + Modificador Mental + Modificador de Objeto (si aplica)
  4. Se aplica recompensa o penalización según el resultado

---

## 🏆 CONDICIONES DE VICTORIA

Ya no existe el botón "Finalizar Sesión". El final se dispara por eventos.

### Mecánica de Rescate (El Helicóptero)
Si `sos >= 100%`:
1. Se establece contacto.
2. `rescueTimer = day` (Ej: Si es el día 4, tardan 4 días en llegar).
3. El jugador debe sobrevivir hasta que `rescueTimer == 0`.

### Los 4 Finales

#### 1. FINAL A: RESCATADO (Superviviente)
- **Condición**: `rescueTimer` llega a 0 && `life > 0`.
- **Narrativa**: El helicóptero aterriza. Te vas con vida, pero dejas la base y sus secretos atrás.

#### 2. FINAL B: HÉROE (El Sacrificio)
- **Condición**: `firewall >= 100%`.
- **Efecto**: Inmediato.
- **Narrativa**: Al completar el firewall, activas el protocolo de autodestrucción/sellado para contener a la entidad. Mueres (o quedas atrapado), pero salvas a la humanidad.

#### 3. FINAL D: COMBATIENTE (La Verdad)
- **Condición**: `rescueTimer` llega a 0 && `analysis >= 100%`.
- **Narrativa**: Te rescatan y entregas los datos completos de la anomalía. Eres promovido, pero sabes demasiado.

#### 4. FINAL S: LEYENDA (La Perfección)
- **Condición**: `rescueTimer` llega a 0 && `analysis >= 90%` && `firewall >= 90%`.
- **Requisito extra**: Debes haber evitado el bloqueo de la antena en el Día 6 (`isAntennaReinforced = true`).
- **Narrativa**: Hackeaste el sistema, robaste los datos, pediste ayuda y contuviste a la entidad. Eres el dueño de la situación. Rango S+.

**Objetos que facilitan el Final S**:
- **Algoritmo de Optimización**: Reduce requisitos a 85% en cada barra.
- **Backup de Datos**: Permite redistribuir progreso entre barras.
- **Protocolo Maestro**: Reduce requisitos a 80% en cada barra.

---

## 💀 CONDICIONES DE DERROTA

1. **Congelado (`life <= 0`)**: Tu cuerpo cede al frío.
2. **Locura Total (`mental <= 0`)**: "Sales a caminar a la tormenta sin traje". O te conviertes en parte de la base.
3. **Suicidio Accidental**: Si `mental < 20%` al finalizar un día, hay un 10% de probabilidad de Game Over por locura narrativa.

---

## 🎁 SISTEMA DE PITY

Para asegurar que los jugadores encuentren objetos importantes:

- **Cada 10 cartas** sin objeto importante (especial), se garantiza uno en la siguiente carta de Suministros (Hearts).
- Aplica a todos los objetos importantes o de gran impacto (rarity: 'special' o con specialEffect).
- El contador se resetea cuando se encuentra un objeto importante.

---

## 📝 CONVENCIONES DE MENSAJES

- **`> `**: Mensajes normales del sistema
- **`>> `**: Mensajes de horror/anomalías
- **`> PERSONAL/USUARIO: `**: Entradas del diario del jugador

---

## 🎮 FLUJO DE JUEGO

1. **Inicio de Día**: Se lanza d10 para determinar cartas disponibles
2. **Robar Cartas**: El jugador roba cartas hasta agotar las del día
3. **Eventos**: Algunas cartas generan eventos interactivos con opciones
4. **Inventario**: Los objetos se agregan automáticamente o se descartan
5. **Fin de Día**: Se aplican penalizaciones diarias
6. **Rescate**: Si SOS >= 100%, se activa el timer de rescate
7. **Final**: Se dispara automáticamente cuando se cumplen las condiciones

---

**Última actualización**: Versión 2.0 - Sistema completo de inventario, cordura, eventos interactivos, días y rescate.

