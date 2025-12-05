# Script de Simulación de Partidas

Este script simula 100 partidas del juego para analizar el balance, uso de objetos, dificultad y estadísticas generales.

## Ejecución

### Desde WSL/Linux (recomendado):
```bash
npm run simulate
```

### Desde PowerShell/Windows:
Si tienes problemas con rutas UNC, ejecuta desde WSL directamente:
```bash
cd /home/pipito/dev/glacial-echo
npm run simulate
```

### Alternativa con ts-node:
```bash
npm run simulate:ts
```

## Qué analiza

- **Tasa de éxito**: Porcentaje de partidas completadas vs fallidas
- **Días promedio**: Cuántos días sobreviven en promedio
- **Razones de fin**: Distribución de cómo terminan las partidas
- **Estado final promedio**: Valores promedio de mental, vida, SOS, firewall, análisis
- **Uso de objetos**: Qué objetos se obtienen, cuáles se usan, y tasa de uso
- **Eventos**: Estadísticas sobre eventos con/sin objetos requeridos
- **Dificultad**: Dificultad promedio y tasa de éxito en tiradas
- **Problemas de balance**: Detección automática de problemas potenciales

## Salida

El script genera un reporte detallado en la consola con todas las estadísticas recopiladas.

