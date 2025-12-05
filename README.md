# GLACIAL_ECHO.EXE

Un juego de journaling RPG / Survival Horror / Estrategia desarrollado con Next.js, React y TypeScript.

## Descripción

GLACIAL_ECHO.EXE es un juego de supervivencia y terror cósmico ambientado en una estación de investigación en la Antártida. El jugador encarna al Analista_7, quien debe procesar bloques de datos corruptos, gestionar sistemas vitales y sobrevivir a la "Señal", una entidad de terror cósmico.

## Características

- Interfaz de terminal retro estilo MS-DOS/Windows antigua
- Sistema de juego basado en ciclos y cartas
- Múltiples finales según las decisiones del jugador
- Narrativa inmersiva de survival horror
- Auto-guardado en localStorage
- Recuperación de partida al recargar la página

## Tecnologías

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **CSS puro** (sin frameworks)

## Desarrollo

### Instalación

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Construir para producción

```bash
npm run build
npm start
```

## Despliegue en Vercel

El proyecto está configurado para desplegarse fácilmente en Vercel:

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. El despliegue se realizará automáticamente

O usando la CLI de Vercel:

```bash
npm i -g vercel
vercel
```

## Estructura del Proyecto

```
glacial-echo/
├── app/                 # App Router de Next.js
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página principal del juego
│   └── globals.css     # Estilos globales
├── components/         # Componentes React
│   ├── StatsPanel.tsx
│   ├── LogPanel.tsx
│   ├── CardPanel.tsx
│   ├── GameOverModal.tsx
│   └── DeckViewerModal.tsx
├── hooks/              # Custom hooks
│   └── useGame.ts
├── lib/                # Lógica del juego
│   ├── game.ts        # Clase principal del juego
│   ├── constants.ts   # Constantes y plantillas
│   ├── storage.ts     # Manejo de localStorage
│   └── utils.ts       # Utilidades
└── types/             # Definiciones TypeScript
    └── game.ts
```

## Sistema de Guardado

El juego guarda automáticamente en localStorage cada vez que se roba una carta. Los datos guardados incluyen:

- Estado completo del juego (stats, turno, cartas pendientes)
- Baraja actual (cartas restantes)
- Todas las cartas con su estado (jugadas/no jugadas)

Al recargar la página, el juego se reanuda desde el último punto guardado.

## Cómo Jugar

1. Inicia un nuevo ciclo lanzando el dado
2. Procesa los bloques de datos indicados por el dado
3. Gestiona tus recursos (Estabilidad Mental y Soporte Vital)
4. Trabaja en los objetivos (SOS, Firewall, Análisis)
5. Escribe en tu bitácora para documentar tu experiencia
6. Finaliza la sesión cuando estés listo o cuando cumplas condiciones de victoria

## Finales

- **Superviviente**: SOS > 80% (antes del ciclo 6)
- **El Guardián**: Firewall > 80%
- **El Legado**: Análisis > 80%
- **Rango S+**: Los tres objetivos al máximo
- **Game Over**: Mental o Vida llegan a 0

## Licencia

Proyecto de hobby/demo.
