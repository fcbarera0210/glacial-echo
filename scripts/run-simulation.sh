#!/bin/bash
# Script para ejecutar la simulación desde WSL/Linux

# Compilar TypeScript
echo "Compilando TypeScript..."
npx tsc --project tsconfig.scripts.json

# Ejecutar el script compilado
echo "Ejecutando simulación..."
node dist-scripts/scripts/simulate-games.js

