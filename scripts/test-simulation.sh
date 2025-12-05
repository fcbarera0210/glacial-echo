#!/bin/bash
# Script para ejecutar la simulación desde WSL/Linux

echo "Compilando TypeScript..."
npx tsc --project tsconfig.scripts.json

if [ $? -eq 0 ]; then
  echo "Ejecutando simulación..."
  node -r ./scripts/tsconfig-paths-bootstrap.js ./dist-scripts/scripts/simulate-games.js
else
  echo "Error al compilar TypeScript"
  exit 1
fi

