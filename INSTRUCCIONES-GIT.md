# Instrucciones para configurar Git y hacer commit

Ejecuta los siguientes comandos en tu terminal (WSL o PowerShell):

## Opción 1: Ejecutar el script automático

```bash
cd /home/pipito/dev/glacial-echo
bash setup-git.sh
```

## Opción 2: Ejecutar comandos manualmente

```bash
cd /home/pipito/dev/glacial-echo

# Inicializar git
git init

# Configurar la rama principal como main
git branch -M main

# Agregar el remote
git remote add origin https://github.com/fcbarera0210/glacial-echo.git

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Demo del juego GLACIAL_ECHO.EXE y documentación"
```

## Después del commit

Para subir los cambios al repositorio remoto, ejecuta:

```bash
git push -u origin main
```

## Archivos incluidos en el commit

- `index.html` - Demo del juego
- `doc.md` - Documentación técnica
- `README.md` - Descripción del proyecto
- `.gitignore` - Archivos a ignorar en git
- `setup-git.sh` - Script de configuración (opcional)

