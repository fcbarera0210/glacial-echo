GDD & DOCUMENTACIÓN TÉCNICA: GLACIAL_ECHO.EXE

1. Visión General del Proyecto

Título: GLACIAL_ECHO.EXE
Tipo: Journaling RPG / Survival Horror / Estrategia
Plataforma: Web Monolito (Single HTML file containing CSS/JS)
Estilo: Interfaz de Terminal Retro (CRT, Fósforo Verde, Scanlines).

2. Premisa Narrativa

El jugador encarna al Analista_7, enviado a una estación de investigación en la Antártida que ha quedado en silencio. Al llegar, la base está vacía y fría. El jugador se sienta frente a la terminal central. Su objetivo es procesar los "Bloques de Datos" corruptos, gestionar los sistemas vitales de la base y sobrevivir a la "Señal", una entidad de terror cósmico que habita en la estática y la información, mientras intenta pedir ayuda o desentrañar la verdad.

3. Mecánicas del Sistema (Backend & Logic)

3.1. Variables de Estado (this.state)

El juego gestiona las siguientes variables numéricas (0-100%):

VITALES (Condición de Derrota):

mental: Estabilidad Mental. Si llega a 0 -> GAME OVER (Locura).

life: Soporte Vital (Calefacción/Comida). Si llega a 0 -> GAME OVER (Congelado).

PROGRESO (Condición de Victoria):

sos: Señal de S.O.S. (Necesario para Final A). IMPORTANTE: Se bloquea permanentemente en el Ciclo 6.

firewall: Seguridad del sistema (Necesario para Final B).

analysis: Comprensión de datos (Necesario para Final C).

CONTROL DE FLUJO:

turn: Contador de Ciclos actuales.

cardsPending: Cantidad de cartas que restan por procesar en el ciclo actual (basado en tirada de d6).

sosLocked: Booleano. true si la antena ha sido destruida (Ciclo >= 6).

gameOver: Booleano. Bloquea interacciones si es true.

3.2. El Ciclo de Juego (Game Loop)

El juego no es turno a turno estático, funciona por "Ciclos":

Inicio de Ciclo: El jugador pulsa "INICIAR CICLO".

Tirada de Dado: El sistema lanza un d6 (1-6).

El resultado se almacena en cardsPending.

Penalización por Tiempo: Al iniciar un nuevo ciclo (excepto el primero), se restan puntos aleatorios de mental y life (desgaste por frío/soledad).

Fase de Procesamiento: El botón cambia a "PROCESAR DATO". El jugador debe robar cartas hasta que cardsPending llegue a 0.

El contador visual en el recuadro del dado disminuye (4 -> 3 -> 2...).

Acciones Libres: Cuando cardsPending es 0 (se muestra "-"), el jugador puede:

Escribir en el diario (textarea).

Ver la Base de Datos (Baraja).

Intentar "FINALIZAR SESIÓN" (Si cumple condiciones de victoria).

Iniciar un nuevo ciclo (Vuelve al paso 1).

3.3. Lógica de Cartas (La Baraja)

Baraja estándar de 52 cartas. Cada palo tiene una función mecánica y temática:

♥ CORAZONES (Introspección):

Narrativa: Recuerdos, calma, fotos familiares.

Efecto: Recupera mental (+5 a +15%).

♦ DIAMANTES (La Base Física):

Narrativa: Fallos mecánicos, frío, encontrar comida/café.

Efecto (RNG): Puede subir life (encontrar recursos) O bajar life (roturas/frío).

♣ TRÉBOLES (La Amenaza/La Señal):

Narrativa: Terror cósmico, alucinaciones, la entidad atacando.

Efecto: Daño masivo a mental.

♠ PICAS (El Trabajo/Datos):

Narrativa: Decodificación, hacking, arreglar antenas.

Efecto: Aumenta aleatoriamente una barra de progreso (sos, firewall, o analysis).

Excepción: Si intenta subir sos y sosLocked es true, devuelve un error y no suma nada.

3.4. Eventos Temporales (Scripted Events)

Ciclo 6 - La Tormenta:

Al comenzar el Ciclo 6, se activa sosLocked = true.

Narrativa: "La antena ha sido arrancada".

Visual: La barra de SOS cambia de azul cian a gris oscuro/rayado, el texto cambia a "OFFLINE" en rojo y parpadea.

Mecánica: Ya no se puede ganar mediante el final de Rescate (Final A).

4. Interfaz Gráfica (UI/UX)

4.1. Estilo Visual

CSS Variables: Uso de --main-color (#33ff33) para el verde terminal, --alert-color (#ff3333) para errores y --dim-color para elementos pasivos.

Efectos: crt-overlay (líneas de escaneo estáticas) y screen-flicker (animación de parpadeo).

Layout (Grid CSS):

Izquierda: Panel de Estado. Orden: Mental, Vida, [Separador], SOS, Firewall, Análisis.

Centro: Log del sistema (scrollable) y Input de Diario.

Derecha: Visualizador de carta actual, Dado d6 digital, Botones de Acción.

4.2. Componentes Clave

Log del Sistema: Historial de eventos. Clases CSS para diferenciar: .system (verde), .user (blanco), .horror (rojo), .dice (amarillo), .cycle-penalty (naranja).

Modal Base de Datos ([VER DB]):

Muestra todas las 52 cartas en una rejilla.

Las cartas ya jugadas (card.drawn = true) aparecen tachadas y oscuras.

Al hacer clic en una carta (jugada o no), se muestran sus detalles (texto narrativo y efecto) en un panel lateral dentro del modal.

Barra SOS Offline: Estilo específico .bar-fill.locked que usa un repeating-linear-gradient para simular "ruido" o "desconexión".

5. Condiciones de Finalización

El juego termina cuando el mazo se vacía o el jugador pulsa "FINALIZAR SESIÓN".

Finales Posibles:

Game Over (Locura): mental llega a 0 durante la partida.

Game Over (Congelado): life llega a 0 durante la partida.

Final A (Superviviente): sos > 80% Y sosLocked es false (Debe lograrse antes del Ciclo 6).

Final B (El Guardián): firewall > 80%. (El jugador se encierra o se sacrifica para contener la señal).

Final C (El Legado): analysis > 80%. (El jugador muere o escapa, pero los datos revelan la verdad al mundo).

Final Perfecto (Rango S+): Los tres progresos al máximo (Muy difícil, requiere suerte con las Picas).

Desaparecido (Default): Si se acaban las cartas o se finaliza sesión sin llegar al 80% en nada.

6. Estructura del Código (Para Cursor)

El archivo es un HTML monolítico.

Clase Game: Contiene toda la lógica.

constructor(): Inicializa estado y referencias al DOM.

initDeck(): Genera el array de 52 objetos carta con sus funciones de efecto (closures).

nextAction(): Decide si llamar a rollDie() o drawCard() según cardsPending.

rollDie(): Maneja el inicio de ciclo, penalizaciones y el evento del Ciclo 6.

drawCard(): Saca carta, ejecuta efecto, actualiza UI.

updateUI(): Sincroniza el DOM con this.state. Maneja clases CSS dinámicas (como .locked).

showDeckViewer(): Renderiza el modal de la base de datos.

7. Instrucciones para Continuar el Desarrollo

Si se desea expandir el juego, considerar:

Audio: Implementar API de Audio Web para sonidos de estática o pitidos de terminal.

Persistencia: Guardar this.state y this.deck en localStorage para no perder progreso al recargar.

Más Eventos: Agregar eventos scriptados en otros ciclos (ej: Ciclo 3, fallo de energía momentáneo).