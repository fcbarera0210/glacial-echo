#!/bin/bash
# Script para configurar git y preparar el commit

cd /home/pipito/dev/glacial-echo

# Inicializar git si no está inicializado
if [ ! -d .git ]; then
    git init
    echo "Git inicializado"
fi

# Configurar la rama principal como main
git branch -M main

# Agregar el remote (si no existe)
if ! git remote | grep -q origin; then
    git remote add origin https://github.com/fcbarera0210/glacial-echo.git
    echo "Remote 'origin' agregado"
else
    git remote set-url origin https://github.com/fcbarera0210/glacial-echo.git
    echo "Remote 'origin' actualizado"
fi

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Demo del juego GLACIAL_ECHO.EXE y documentación"

echo ""
echo "✅ Configuración completada!"
echo "📝 Commit creado exitosamente"
echo ""
echo "Para subir los cambios, ejecuta:"
echo "  git push -u origin main"
echo ""

