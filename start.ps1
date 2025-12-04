# Script de inicio para Baileys WhatsApp Bot (Windows)
# Uso: .\start.ps1 [comando]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Función para imprimir con color
function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Banner
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🤖 Baileys WhatsApp Bot - Docker   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Print-Error "Docker no está instalado"
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Print-Error "Docker Compose no está instalado"
    exit 1
}

# Funciones
function Start-Bot {
    Print-Info "Iniciando Baileys Bot..."
    docker-compose up -d
    Print-Success "Bot iniciado correctamente"
    Print-Info "Dashboard: http://localhost:3000"
    Write-Host ""
    Print-Info "Ver logs: .\start.ps1 logs"
}

function Stop-Bot {
    Print-Info "Deteniendo Baileys Bot..."
    docker-compose down
    Print-Success "Bot detenido correctamente"
}

function Restart-Bot {
    Print-Info "Reiniciando Baileys Bot..."
    docker-compose restart
    Print-Success "Bot reiniciado correctamente"
}

function Show-Logs {
    Print-Info "Mostrando logs (Ctrl+C para salir)..."
    docker-compose logs -f --tail=100
}

function Show-Status {
    Print-Info "Estado del contenedor:"
    docker-compose ps
    Write-Host ""
    Print-Info "Estadísticas de recursos:"
    docker stats baileys-bot --no-stream
}

function Build-Bot {
    Print-Info "Construyendo imagen..."
    docker-compose build --no-cache
    Print-Success "Imagen construida correctamente"
}

function Update-Bot {
    Print-Info "Actualizando bot..."
    
    # Detener contenedor
    docker-compose down
    
    # Obtener cambios
    Print-Info "Descargando actualizaciones..."
    git pull origin main
    
    # Reconstruir
    Print-Info "Reconstruyendo imagen..."
    docker-compose build --no-cache
    
    # Iniciar
    docker-compose up -d
    
    Print-Success "Bot actualizado correctamente"
}

function Clean-Bot {
    Print-Warning "Esto eliminará el contenedor y la imagen"
    $confirm = Read-Host "¿Continuar? (s/N)"
    if ($confirm -eq "s" -or $confirm -eq "S") {
        Print-Info "Limpiando..."
        docker-compose down -v
        docker rmi baileys-bot 2>$null
        Print-Success "Limpieza completada"
    } else {
        Print-Info "Cancelado"
    }
}

function Backup-Session {
    Print-Info "Creando backup de sesión..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups/session_$timestamp"
    
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    if (Test-Path "session") {
        Copy-Item -Path "session\*" -Destination $backupDir -Recurse
        Print-Success "Backup creado en: $backupDir"
    } else {
        Print-Error "No hay sesión para respaldar"
    }
}

function Restore-Session {
    Print-Info "Backups disponibles:"
    if (Test-Path "backups") {
        Get-ChildItem -Path "backups" -Directory | ForEach-Object { Write-Host $_.Name }
    } else {
        Write-Host "No hay backups"
    }
    Write-Host ""
    
    $backupName = Read-Host "Nombre del backup a restaurar"
    $backupPath = "backups\$backupName"
    
    if (Test-Path $backupPath) {
        Print-Info "Restaurando backup..."
        Remove-Item -Path "session\*" -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -Path "$backupPath\*" -Destination "session" -Recurse
        Print-Success "Backup restaurado correctamente"
        Print-Info "Reinicia el bot para aplicar cambios"
    } else {
        Print-Error "Backup no encontrado"
    }
}

function Enter-Shell {
    Print-Info "Entrando al contenedor..."
    docker-compose exec baileys-bot sh
}

function Show-Help {
    Write-Host "Uso: .\start.ps1 [comando]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  start     - Iniciar el bot"
    Write-Host "  stop      - Detener el bot"
    Write-Host "  restart   - Reiniciar el bot"
    Write-Host "  logs      - Ver logs en tiempo real"
    Write-Host "  status    - Ver estado y recursos"
    Write-Host "  build     - Construir imagen desde cero"
    Write-Host "  update    - Actualizar bot desde Git"
    Write-Host "  clean     - Limpiar contenedor e imagen"
    Write-Host "  backup    - Crear backup de sesión"
    Write-Host "  restore   - Restaurar backup de sesión"
    Write-Host "  shell     - Entrar al contenedor"
    Write-Host "  help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\start.ps1 start"
    Write-Host "  .\start.ps1 logs"
    Write-Host "  .\start.ps1 backup"
}

# Ejecutar comando
switch ($Command.ToLower()) {
    "start"   { Start-Bot }
    "stop"    { Stop-Bot }
    "restart" { Restart-Bot }
    "logs"    { Show-Logs }
    "status"  { Show-Status }
    "build"   { Build-Bot }
    "update"  { Update-Bot }
    "clean"   { Clean-Bot }
    "backup"  { Backup-Session }
    "restore" { Restore-Session }
    "shell"   { Enter-Shell }
    "help"    { Show-Help }
    default   {
        Print-Error "Comando desconocido: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
