# ====================================================
# Test de Cola - Docker Version
# Ejecutar: .\test-cola-docker.ps1
# ====================================================

$baseUrl = "http://localhost:3000"

Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🐳 Test de Cola - Docker Container      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ====================================================
# 1. Verificar que el contenedor esté corriendo
# ====================================================
Write-Host "1. Verificando contenedor Docker..." -ForegroundColor Yellow

$containerStatus = docker ps --filter "name=baileys-bot" --format "{{.Status}}"

if (-not $containerStatus) {
    Write-Host "   ❌ Contenedor no está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Ejecuta primero:" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
    exit
}

Write-Host "   ✅ Contenedor corriendo: $containerStatus" -ForegroundColor Green
Write-Host ""

# ====================================================
# 2. Verificar conexión del bot
# ====================================================
Write-Host "2. Verificando estado del bot..." -ForegroundColor Yellow

try {
    $status = Invoke-RestMethod -Uri "$baseUrl/status" -ErrorAction Stop
    
    if ($status.authenticated) {
        Write-Host "   ✅ Bot autenticado y conectado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Bot no autenticado" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Escanea el QR en: http://localhost:3000" -ForegroundColor Yellow
        Start-Process "http://localhost:3000"
        exit
    }
} catch {
    Write-Host "   ❌ No se pudo conectar al bot" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Verifica los logs:" -ForegroundColor Yellow
    Write-Host "   docker-compose logs -f baileys-bot" -ForegroundColor Gray
    exit
}

Write-Host ""

# ====================================================
# 3. Ver estado inicial de la cola
# ====================================================
Write-Host "3. Estado inicial de la cola:" -ForegroundColor Yellow

try {
    $queueStats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats"
    Write-Host "   Mensajes en cola: $($queueStats.stats.currentQueueSize)" -ForegroundColor Cyan
    Write-Host "   Total enviados: $($queueStats.stats.totalSent)" -ForegroundColor Cyan
    Write-Host "   Total fallidos: $($queueStats.stats.totalFailed)" -ForegroundColor Cyan
    Write-Host "   Delay actual: $($queueStats.stats.config.delayBetweenMessages)ms" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error al obtener estadísticas" -ForegroundColor Red
}

Write-Host ""

# ====================================================
# 4. Configurar delay
# ====================================================
Write-Host "4. Configurando delay..." -ForegroundColor Yellow

$nuevoDelay = 4000
$delayBody = @{ delay = $nuevoDelay } | ConvertTo-Json

try {
    $delayResult = Invoke-RestMethod -Uri "$baseUrl/api/queue/set-delay" -Method Post -Body $delayBody -ContentType "application/json"
    Write-Host "   ✅ Delay configurado a ${nuevoDelay}ms" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ No se pudo cambiar el delay (usando default)" -ForegroundColor Yellow
}

Write-Host ""

# ====================================================
# 5. Enviar mensajes de prueba
# ====================================================
Write-Host "5. Envío de mensajes de prueba" -ForegroundColor Yellow
Write-Host "   ⚠️ Los mensajes se procesarán automáticamente con delay" -ForegroundColor Gray
Write-Host ""

$numeroTest = Read-Host "   Ingresa número de prueba (ej: 51987654321)"
$cantidadMensajes = Read-Host "   ¿Cuántos mensajes enviar? (1-5)"

if ([string]::IsNullOrWhiteSpace($numeroTest)) {
    Write-Host ""
    Write-Host "   ⚠️ No se ingresó número. Finalizando test." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "   📤 Enviando $cantidadMensajes mensajes a $numeroTest..." -ForegroundColor Cyan
Write-Host ""

for ($i = 1; $i -le [int]$cantidadMensajes; $i++) {
    try {
        $mensaje = @{
            number = $numeroTest
            message = "Mensaje de prueba #$i desde Docker 🐳`nHora: $(Get-Date -Format 'HH:mm:ss')`nSistema de cola funcionando correctamente ✅"
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$baseUrl/api/send-messages" -Method Post -Body $mensaje -ContentType "application/json"
        
        if ($result.status) {
            Write-Host "   ✅ Mensaje $i agregado a la cola" -ForegroundColor Green
            Write-Host "      Cola actual: $($result.queueInfo.queueSize) mensajes" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Error al agregar mensaje $i" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 300
    } catch {
        Write-Host "   ❌ Error al enviar mensaje $i : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "   ✨ Todos los mensajes agregados a la cola" -ForegroundColor Green
Write-Host "   ⏳ Se están procesando automáticamente..." -ForegroundColor Yellow
Write-Host ""

# ====================================================
# 6. Monitorear cola en tiempo real
# ====================================================
Write-Host "6. Monitoreando cola en tiempo real..." -ForegroundColor Yellow
Write-Host "   (Presiona Ctrl+C para detener)" -ForegroundColor Gray
Write-Host ""

$ultimaCola = -1
$intentos = 0
$maxIntentos = 120  # 2 minutos

while ($intentos -lt $maxIntentos) {
    try {
        $stats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats"
        $colaActual = $stats.stats.currentQueueSize
        
        if ($colaActual -ne $ultimaCola) {
            $timestamp = Get-Date -Format "HH:mm:ss"
            
            $estadoProceso = if ($stats.stats.isProcessing) { "Procesando ⚡" } else { "Inactivo" }
            
            Write-Host "   [$timestamp] Cola: $colaActual | Enviados: $($stats.stats.totalSent) | Estado: $estadoProceso" -ForegroundColor Cyan
            
            $ultimaCola = $colaActual
            
            # Si la cola está vacía y no está procesando, terminar
            if ($colaActual -eq 0 -and -not $stats.stats.isProcessing) {
                Write-Host ""
                Write-Host "   ✅ Todos los mensajes fueron enviados exitosamente!" -ForegroundColor Green
                break
            }
        }
        
        Start-Sleep -Seconds 1
        $intentos++
    } catch {
        Write-Host "   ⚠️ Error al obtener estadísticas" -ForegroundColor Yellow
        break
    }
}

# ====================================================
# 7. Resumen final
# ====================================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          📊 RESUMEN FINAL                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

try {
    $finalStats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats"
    
    Write-Host "   ✅ Mensajes enviados: $($finalStats.stats.totalSent)" -ForegroundColor Green
    Write-Host "   ❌ Mensajes fallidos: $($finalStats.stats.totalFailed)" -ForegroundColor Red
    Write-Host "   📊 Total procesados: $($finalStats.stats.totalQueued)" -ForegroundColor Yellow
    Write-Host "   ⏱️ Cola actual: $($finalStats.stats.currentQueueSize)" -ForegroundColor Cyan
} catch {
    Write-Host "   ⚠️ No se pudo obtener resumen final" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     🎉 Test completado exitosamente      ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "💡 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   Ver logs del contenedor:" -ForegroundColor Gray
Write-Host "   docker-compose logs -f baileys-bot" -ForegroundColor White
Write-Host ""
Write-Host "   Ver estado de cola:" -ForegroundColor Gray
Write-Host "   curl http://localhost:3000/api/queue/stats" -ForegroundColor White
Write-Host ""
Write-Host "   Dashboard web:" -ForegroundColor Gray
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
