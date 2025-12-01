# Script PowerShell para configurar git y preparar el commit

# Cambiar al directorio del proyecto
$projectPath = "\\wsl.localhost\Ubuntu\home\pipito\dev\glacial-echo"
Set-Location $projectPath

# Inicializar git si no está inicializado
if (-not (Test-Path .git)) {
    git init
    Write-Host "Git inicializado" -ForegroundColor Green
}

# Configurar la rama principal como main
git branch -M main

# Agregar el remote (si no existe)
$remotes = git remote
if ($remotes -notcontains "origin") {
    git remote add origin https://github.com/fcbarera0210/glacial-echo.git
    Write-Host "Remote 'origin' agregado" -ForegroundColor Green
} else {
    git remote set-url origin https://github.com/fcbarera0210/glacial-echo.git
    Write-Host "Remote 'origin' actualizado" -ForegroundColor Green
}

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Demo del juego GLACIAL_ECHO.EXE y documentación"

Write-Host ""
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host "📝 Commit creado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Para subir los cambios, ejecuta:" -ForegroundColor Yellow
Write-Host "  git push -u origin main" -ForegroundColor Cyan
Write-Host ""

