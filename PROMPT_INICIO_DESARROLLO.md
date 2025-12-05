# PROMPT PARA INICIAR DESARROLLO - GLACIAL_ECHO V2.0

Copia y pega el siguiente prompt en una nueva conversación para comenzar el desarrollo:

---

Hola, necesito implementar nuevas mecánicas en mi juego GLACIAL_ECHO.EXE. El proyecto es un juego web desarrollado con Next.js 14, React 18, TypeScript y CSS puro, desplegado en Vercel.

## CONTEXTO DEL PROYECTO

El juego actual es un survival horror/journaling RPG donde el jugador es un analista en una base antártica abandonada. El sistema actual usa cartas de una baraja de 52 cartas que afectan directamente las estadísticas del jugador.

## OBJETIVO

Necesito transformar el juego de un sistema de cartas simple a un RPG de supervivencia con:
- Sistema de inventario (6 espacios, expandible a 8)
- Sistema de cordura mejorado (afecta UI y modificadores de dado)
- Eventos interactivos con decisiones
- Sistema de días y rescate con timer
- Nuevos finales

## DOCUMENTOS DE REFERENCIA

He preparado dos documentos clave que debes leer primero:

1. **`GAME_MECHANICS_V2.md`**: Contiene todas las nuevas mecánicas detalladas:
   - Sistema de inventario y objetos
   - Sistema de cordura con umbrales
   - Eventos interactivos
   - Sistema de días y rescate
   - Condiciones de victoria/derrota actualizadas

2. **`DEVELOPMENT_PLAN.md`**: Contiene el plan de desarrollo completo:
   - 6 fases de implementación
   - Tareas específicas por fase
   - Decisiones confirmadas
   - Criterios de éxito

## ESTADO ACTUAL DEL CÓDIGO

El código actual está en:
- `lib/game.ts`: Clase Game con lógica del juego
- `types/game.ts`: Tipos TypeScript
- `lib/constants.ts`: Constantes del juego
- `hooks/useGame.ts`: Hook principal de React
- `components/`: Componentes React (StatsPanel, LogPanel, CardPanel, etc.)

## INSTRUCCIONES

1. **Lee primero** `GAME_MECHANICS_V2.md` y `DEVELOPMENT_PLAN.md` para entender completamente las nuevas mecánicas.

2. **Comienza con FASE 1** del plan de desarrollo:
   - Actualizar tipos TypeScript en `types/game.ts`
   - Crear `lib/items.ts` con todas las constantes de objetos
   - Actualizar `lib/constants.ts`

3. **Sigue el orden del plan**: FASE 1 → FASE 2 → FASE 3 → etc.

4. **Importante**:
   - Mantén compatibilidad con el sistema de guardado actual (localStorage)
   - Usa TypeScript estricto
   - Mantén el estilo visual actual (MS-DOS/terminal retro)
   - Todos los mensajes del log deben seguir la convención de prefijos (`> ` para normales, `>> ` para horror)

5. **No implementes todo de una vez**: Trabaja fase por fase, verifica que cada fase funcione antes de continuar.

6. **Pregunta si algo no está claro**: Si hay ambigüedades en los documentos, pregunta antes de implementar.

## ARCHIVOS CLAVE A REVISAR

- `GAME_MECHANICS_V2.md`: Mecánicas completas
- `DEVELOPMENT_PLAN.md`: Plan de desarrollo
- `lib/game.ts`: Lógica actual del juego
- `types/game.ts`: Tipos actuales
- `hooks/useGame.ts`: Hook principal

## NOTAS TÉCNICAS

- El proyecto usa Next.js 14 con App Router
- TypeScript estricto
- CSS puro (sin frameworks)
- LocalStorage para guardado
- El juego debe seguir siendo responsive (móvil y desktop)

¿Estás listo para comenzar? Empieza leyendo los documentos y luego comienza con la FASE 1 del plan de desarrollo.

---

