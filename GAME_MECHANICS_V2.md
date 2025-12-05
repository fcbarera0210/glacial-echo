# MECÁNICAS DEL JUEGO - GLACIAL_ECHO (VERSIÓN 2.0)

Este documento detalla la arquitectura de juego actualizada, transformando el sistema de cartas en un RPG de supervivencia con gestión de inventario y horror psicológico.

---

## 📊 VARIABLES DE ESTADO Y SISTEMAS

### Variables Vitales
- **`mental`** (0-100%): Estabilidad Mental. Afecta la percepción de la UI y los dados.
- **`life`** (0-100%): Integridad Física / Calor Corporal.

### Variables de Progreso
- **`sos`** (0-100%): Señal de Rescate.
- **`firewall`** (0-100%): Contención de la Entidad.
- **`analysis`** (0-100%): Comprensión de la Anomalía.

### Variables de Control
- **`day`**: Día actual (anteriormente turnos/ciclos).
- **`rescueTimer`**: Contador regresivo para la llegada del helicóptero (null por defecto).
- **`isAntennaReinforced`**: Booleano. Si es `true`, la tormenta del Día 6 no rompe la señal.
- **`inventory`**: Array de objetos (Máximo 6 espacios base, expandible a 8 con objeto "Banano").
- **`inventoryMaxSlots`**: Número máximo de espacios de inventario (6 base, 8 con "Banano").

---

## 🧠 SISTEMA DE CORDURA (SANITY SYSTEM)

La variable `mental` no es solo una barra de vida, altera la realidad del juego.

### Modificadores de Dado (Suerte Mental)
La concentración del personaje afecta el éxito en las operaciones (Picas).
- **Mental > 80%**: **+1** al resultado del dado (Mente clara).
- **Mental 60-79%**: **+0.5** al resultado del dado (redondea hacia arriba).
- **Mental 40-59%**: **0** (Normal).
- **Mental 20-39%**: **-0.5** al resultado del dado (redondea hacia abajo).
- **Mental < 20%**: **-1** al resultado del dado + riesgo de "Suicidio Accidental".

### Alucinaciones de UI (Mental < 40%)
Cuando la cordura es crítica, la "Entidad" hackea el juego:
1.  **Logs Falsos**: Aparecen mensajes en el registro que no ocurrieron realmente.
    * *Ej: ">> TE VEO DORMIR."*
    * *Ej: ">> SISTEMA: Oxígeno agotado..." (Falso)*
    * *Visualmente distintos: texto parpadeante, color diferente*
2.  **UI Glitches**:
    * Botones que desaparecen por 2 segundos.
    * Nombres de objetos en el inventario cambian a texto corrupto ("Ración" -> "CENIZAS").
    * Sonidos de interfaz distorsionados.

### Verificación de Realidad
El jugador puede intentar verificar qué es real y qué es alucinación:
- **Usos por día**: 1-2 veces (depende del estado mental)
- **Mecánica**: Tirada de 1d6 + Modificador Mental
- **Dificultad**: 4+
- **Costo**: Si falla, -5% Mental (la entidad se resiste)
- **Éxito**: Muestra el estado real del juego temporalmente

---

## 🎒 SISTEMA DE INVENTARIO Y CATEGORÍAS (MAZO)

El mazo de 52 cartas se divide en 4 categorías temáticas.
**Límite de Inventario**: 6 espacios base (expandible a 8 con objeto "Banano").
**Apilar Objetos**: Solo objetos consumibles del mismo tipo pueden apilarse (ej: 2x "Ración Deshidratada").
El jugador debe "Usar" o "Descartar" si el inventario está lleno.

### ❤️ SUMINISTROS (Antiguos Corazones) - Tipo: `'supplies'`
Recursos para recuperar `life` o `mental`.

| Tipo | Cantidad | Nombre del Objeto | Efecto / Uso |
|:----:|:--------:|-------------------|--------------|
| **Común** | 9 | **Ración Deshidratada** | +10% Life |
| | | **Agua Purificada** | +5% Life / +5% Mental |
| | | **Café Caliente** | +10% Mental |
| | | **Barra de Chocolate** | +5% Mental |
| | | **Vendas Estériles** | Detiene sangrado (evento) o +10% Life |
| | | **Batería AA** | Recarga linterna / Uso en eventos |
| | | **Cinta Adhesiva** | Reparación menor (Uso en eventos) |
| | | **Whisky (Culito)** | +15% Mental / -5% Life |
| | | **Parche Térmico** | +5% Life (Evita daño por frío 1 turno) |
| **Especial** | 4 | **Botiquín Militar (J)** | +40% Life |
| | | **Grabadora de Voz (Q)** | +30% Mental (Escuchas una voz familiar) |
| | | **Inyección Adrenalina (K)** | +20% Life, anula penalización de dado por 2 días |
| | | **Foto Arrugada (As)** | +50% Mental (Recuerdo clave) |
| | | **Banano (Especial)** | Expande inventario en +2 espacios (máximo 8) |

### ♦️ INFRAESTRUCTURA (Antiguos Diamantes) - Tipo: `'base'`
**Mecánica**: Al robar, 60% probabilidad de encontrar un OBJETO (Positivo), 40% probabilidad de un EVENTO DE DAÑO (Negativo).

#### Si es Positivo (Objetos de Base):
| Tipo | Cantidad | Nombre del Objeto | Efecto / Uso |
|:----:|:--------:|-------------------|--------------|
| **Común** | 9 | **Linterna Táctica** | Bono en eventos de oscuridad |
| | | **Destornillador** | Herramienta (Bono +1 dado en reparaciones) |
| | | **Cable de Red** | Herramienta (Bono +1 dado en hackeo) |
| | | **Fusible Industrial** | Repara generador (Evento) |
| | | **Manual de Código** | Consumible: +15% a una barra de progreso aleatoria |
| | | **Tarjeta de Acceso Nv1** | Abre archivos encriptados fáciles |
| | | **Martillo** | Herramienta / Arma básica |
| | | **Bengala** | Uso único: +10% SOS inmediato |
| | | **Termo de Café** | Objeto reutilizable (1 uso por día): +2% Mental |
| **Especial** | 4 | **Kit Refuerzo Antena (J)** | **CRÍTICO**: Si se tiene en Día 6, evita bloqueo SOS |
| | | **Disco Duro Encriptado (Q)** | +25% Analysis al desencriptar |
| | | **Llave Maestra (K)** | Éxito automático en cualquier evento de "Puerta/Cerradura" |
| | | **Núcleo de Calefacción (As)** | +30% Life, reduce penalización de frío diaria |
| | | **Algoritmo de Optimización (Especial)** | Reduce requisitos del Final S a 85% en cada barra |
| | | **Backup de Datos (Especial)** | Permite redistribuir progreso entre barras |
| | | **Protocolo Maestro (Especial)** | Reduce requisitos del Final S a 80% en cada barra |

#### Si es Negativo (Catástrofes de Base):
Eventos con opciones (convertidos de eventos inmediatos).
- **Comunes**: Tubería rota (Opción A: Reparar con riesgo, Opción B: Ignorar con daño menor), Gotera, Cortocircuito, Ventana agrietada.
- **Especiales**: Fallo del Generador (Oscuridad total - requiere decisión), Incendio en cocina, Fuga de gas.

### ♣️ ANOMALÍAS (Antiguos Tréboles) - Tipo: `'threat'`
Eventos narrativos de terror. Si el Mental es bajo, son más graves.

- **Comunes (9)**: "Susurros en la ventilación", "Sombra en el monitor", "Parálisis de sueño", "El objeto se movió solo".
    - *Efecto*: Daño directo a `mental`.
- **Especiales (4)**: "El Doppelgänger (Te ves a ti mismo afuera)", "La Llamada (Alguien respira al otro lado)", "Desincronización temporal".
    - *Efecto*: Daño masivo a `mental` y posible pérdida de un objeto (te lo roban).

### ♠️ OPERACIONES (Antiguas Picas) - Tipo: `'operation'`
Eventos interactivos para subir progreso.
**Flujo**:
1. Se presenta un problema (ej: "Señal encriptada detectada").
2. El jugador elige una opción.
3. Se lanza 1d6 + Modificador Mental + Modificador de Objeto (si aplica).

**Ejemplo de Evento:**
> **SISTEMA: Archivo Corrupto detectado.**
> *Opción A: Fuerza Bruta.* (Dificultad 5+. Éxito: +15% Analysis. Fallo: -10% Mental).
> *Opción B: Decodificar con calma.* (Dificultad 3+. Éxito: +10% Analysis. Fallo: Nada).
> *Opción C: Usar [Manual de Código].* (Éxito Automático: +20% Analysis. Gasta el objeto).

---

## 📅 CICLO DE DÍA Y PENALIZACIONES

### Día 6: La Tormenta
Evento scriptado.
- Verifica si el jugador tiene el objeto **Kit Refuerzo Antena** en el inventario.
- **SÍ lo tiene**: "Usas el kit para asegurar los tensores. La antena resiste." (SOS sigue activo). El objeto se consume.
- **NO lo tiene**: "El viento dobla el metal. La señal se pierde." (`sosLocked = true`).

### Sistema de Cartas por Día
- Al inicio de cada día, se lanza un **d10** para determinar cuántas cartas se pueden robar ese día.
- Ejemplo: Si se obtiene un 7, el jugador puede robar 7 cartas antes de que termine el día.
- Al finalizar las cartas del día, se aplican las penalizaciones diarias.

### Penalizaciones Diarias
Al finalizar las cartas del día:
- **Hambre/Frío**: `life - rand(2, 5)`
- **Aislamiento**: `mental - rand(3, 6)`
- *Si Mental < 20*: Posibilidad de "Suicidio Accidental" (Game Over por locura narrativa).

### Barajado del Mazo
- Si se acaban las cartas del mazo, se barajan nuevamente todas las cartas.
- **Excepciones**: Los objetos especiales (J, Q, K, A) ya robados y los objetos en el inventario del jugador NO se vuelven a barajar.
- El resto de cartas (eventos, objetos comunes, etc.) se vuelven a barajar normalmente.

---

## 🏆 CONDICIONES DE VICTORIA (AJUSTADAS)

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
- **Requisito extra**: Debes haber evitado el bloqueo de la antena en el Día 6.
- **Narrativa**: Hackeaste el sistema, robaste los datos, pediste ayuda y contuviste a la entidad. Eres el dueño de la situación. Rango S+.
- **Objetos que facilitan el Final S**:
  - **Algoritmo de Optimización**: Reduce requisitos a 85% en cada barra.
  - **Backup de Datos**: Permite redistribuir progreso entre barras.
  - **Protocolo Maestro**: Reduce requisitos a 80% en cada barra.

---

## 💀 CONDICIONES DE DERROTA

1.  **Congelado (`life <= 0`)**: Tu cuerpo cede al frío.
2.  **Locura Total (`mental <= 0`)**: "Sales a caminar a la tormenta sin traje". O te conviertes en parte de la base.