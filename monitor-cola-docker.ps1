# ====================================================
# Monitor de Cola - Docker Version
# Muestra el estado de la cola en tiempo real
# Ejecutar: .\monitor-cola-docker.ps1
# ====================================================

$baseUrl = "http://localhost:3000"

Clear-Host

Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🐳 Monitor de Cola - Docker Container   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verificando conexión..." -ForegroundColor Yellow

# Verificar contenedor
$containerStatus = docker ps --filter "name=baileys-bot" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "❌ Contenedor no está corriendo" -ForegroundColor Red
    Write-Host "Ejecuta: docker-compose up -d" -ForegroundColor Gray
    exit
}

# Verificar API
try {
    $testConnection = Invoke-RestMethod -Uri "$baseUrl/status" -ErrorAction Stop
    Write-Host "✅ Conectado al bot" -ForegroundColor Green
} catch {
    Write-Host "❌ No se puede conectar al bot" -ForegroundColor Red
    Write-Host "Verifica: docker-compose logs baileys-bot" -ForegroundColor Gray
    exit
}

Start-Sleep -Seconds 1

# Loop de monitoreo
$ultimaCola = -1
$ultimosEnviados = -1
$ultimosFallidos = -1

while ($true) {
    try {
        $stats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats" -ErrorAction Stop
        $timestamp = Get-Date -Format "HH:mm:ss"
        
        $colaActual = $stats.stats.currentQueueSize
        $enviadosActual = $stats.stats.totalSent
        $fallidosActual = $stats.stats.totalFailed
        
        # Solo actualizar si cambió algo
        if ($colaActual -ne $ultimaCola -or $enviadosActual -ne $ultimosEnviados -or $fallidosActual -ne $ultimosFallidos) {
            Clear-Host
            
            Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
            Write-Host "║      🐳 MONITOR DE COLA - DOCKER CONTAINER              ║" -ForegroundColor Cyan
            Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
            Write-Host ""
            
            # Estado del contenedor
            $containerInfo = docker ps --filter "name=baileys-bot" --format "{{.Status}}"
            Write-Host "🐳 Contenedor: " -NoNewline -ForegroundColor Yellow
            Write-Host "$containerInfo" -ForegroundColor Green
            Write-Host ""
            
            # Hora
            Write-Host "⏰ Actualizado: " -NoNewline -ForegroundColor Yellow
            Write-Host "$timestamp" -ForegroundColor Cyan
            Write-Host ""
            
            # Estado de la cola
            Write-Host "══════════════════════════════════════" -ForegroundColor Gray
            Write-Host "📊 ESTADO DE LA COLA" -ForegroundColor Yellow
            Write-Host "══════════════════════════════════════" -ForegroundColor Gray
            Write-Host ""
            
            # Cola actual
            $colorCola = if ($colaActual -eq 0) { "Green" } elseif ($colaActual -lt 5) { "Yellow" } else { "Red" }
            Write-Host "   📦 Mensajes en cola: " -NoNewline -ForegroundColor White
            Write-Host "$colaActual" -ForegroundColor $colorCola
            
            # Total enviados
            Write-Host "   ✅ Total enviados:   " -NoNewline -ForegroundColor White
            Write-Host "$enviadosActual" -ForegroundColor Green
            
            # Total fallidos
            $colorFallidos = if ($fallidosActual -eq 0) { "Green" } else { "Red" }
            Write-Host "   ❌ Total fallidos:   " -NoNewline -ForegroundColor White
            Write-Host "$fallidosActual" -ForegroundColor $colorFallidos
            
            # Estado de procesamiento
            $procesando = $stats.stats.isProcessing
            $estadoTexto = if ($procesando) { "Procesando ⚡" } else { "Inactivo 💤" }
            $colorEstado = if ($procesando) { "Green" } else { "Gray" }
            Write-Host "   ⚙️ Estado:           " -NoNewline -ForegroundColor White
            Write-Host "$estadoTexto" -ForegroundColor $colorEstado
            
            Write-Host ""
            
            # Configuración
            Write-Host "══════════════════════════════════════" -ForegroundColor Gray
            Write-Host "⚙️ CONFIGURACIÓN" -ForegroundColor Yellow
            Write-Host "══════════════════════════════════════" -ForegroundColor Gray
            Write-Host ""
            
            Write-Host "   ⏱️ Delay entre mensajes: " -NoNewline -ForegroundColor White
            Write-Host "$($stats.stats.config.delayBetweenMessages)ms" -ForegroundColor Cyan
            
            Write-Host "   🔄 Máximo reintentos:   " -NoNewline -ForegroundColor White
            Write-Host "$($stats.stats.config.maxRetries)" -ForegroundColor Cyan
            
            Write-Host "   ⏳ Delay reintentos:    " -NoNewline -ForegroundColor White
            Write-Host "$($stats.stats.config.retryDelay)ms" -ForegroundColor Cyan
            
            Write-Host ""
            
            # Información adicional
            if ($stats.queueInfo.nextMessage) {
                Write-Host "══════════════════════════════════════" -ForegroundColor Gray
                Write-Host "📋 PRÓXIMO MENSAJE" -ForegroundColor Yellow
                Write-Host "══════════════════════════════════════" -ForegroundColor Gray
                Write-Host ""
                
                Write-Host "   Tipo: $($stats.queueInfo.nextMessage.type)" -ForegroundColor Cyan
                Write-Host "   Posición: $($stats.queueInfo.nextMessage.position)" -ForegroundColor Cyan
                Write-Host "   Reintentos: $($stats.queueInfo.nextMessage.retries)" -ForegroundColor Cyan
                
                Write-Host ""
            }
            
            # Tiempo estimado
            if ($colaActual -gt 0) {
                $tiempoEstimado = [math]::Ceiling($stats.queueInfo.estimatedWaitTime / 1000)
                Write-Host "══════════════════════════════════════" -ForegroundColor Gray
                Write-Host "⏱️ Tiempo estimado: ~$tiempoEstimado segundos" -ForegroundColor Yellow
                Write-Host "══════════════════════════════════════" -ForegroundColor Gray
                Write-Host ""
            }
            
            # Mensajes de estado
            if ($colaActual -eq 0 -and -not $procesando) {
                Write-Host "✨ Cola vacía - Sistema en espera" -ForegroundColor Green
            } elseif ($colaActual -gt 10) {
                Write-Host "⚠️ Cola grande - Puede tomar varios minutos" -ForegroundColor Yellow
            } elseif ($procesando) {
                Write-Host "⚡ Procesando mensajes..." -ForegroundColor Green
            }
            
            Write-Host ""
            Write-Host "══════════════════════════════════════" -ForegroundColor Gray
            Write-Host "Actualización automática cada 2 segundos" -ForegroundColor Gray
            Write-Host "Presiona Ctrl+C para salir" -ForegroundColor Gray
            Write-Host "══════════════════════════════════════" -ForegroundColor Gray
            
            # Guardar valores anteriores
            $ultimaCola = $colaActual
            $ultimosEnviados = $enviadosActual
            $ultimosFallidos = $fallidosActual
        }
        
    } catch {
        Write-Host "❌ Error al conectar: $_" -ForegroundColor Red
        Write-Host "Reintentando en 5 segundos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
    
    Start-Sleep -Seconds 2
}
