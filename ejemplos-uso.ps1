# ====================================================
# Ejemplos de Uso - Sistema de Cola WhatsApp Bot
# Ejecutar en PowerShell
# ====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WhatsApp Bot - Sistema de Cola" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"

# ====================================================
# 1. Verificar estado del bot
# ====================================================
Write-Host "1. Verificando estado del bot..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/status" -Method Get
    if ($status.authenticated) {
        Write-Host "   ✅ Bot conectado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Bot no autenticado. Escanea el QR primero." -ForegroundColor Red
        Write-Host "   Abre http://localhost:3001 en tu navegador" -ForegroundColor Yellow
        exit
    }
} catch {
    Write-Host "   ❌ No se pudo conectar al bot. Asegúrate de que esté corriendo." -ForegroundColor Red
    Write-Host "   Ejecuta: npm start" -ForegroundColor Yellow
    exit
}

Write-Host ""

# ====================================================
# 2. Ver estado de la cola
# ====================================================
Write-Host "2. Estado actual de la cola:" -ForegroundColor Yellow
try {
    $queueStats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats" -Method Get
    Write-Host "   Mensajes en cola: $($queueStats.stats.currentQueueSize)" -ForegroundColor Cyan
    Write-Host "   Total enviados: $($queueStats.stats.totalSent)" -ForegroundColor Cyan
    Write-Host "   Total fallidos: $($queueStats.stats.totalFailed)" -ForegroundColor Cyan
    Write-Host "   Delay configurado: $($queueStats.stats.config.delayBetweenMessages)ms" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error al obtener estadísticas" -ForegroundColor Red
}

Write-Host ""

# ====================================================
# 3. Configurar delay (OPCIONAL)
# ====================================================
Write-Host "3. ¿Deseas cambiar el delay entre mensajes? (actual: 3000ms)" -ForegroundColor Yellow
Write-Host "   Recomendado: 3000-5000ms para evitar bloqueos" -ForegroundColor Gray
$cambiarDelay = Read-Host "   ¿Cambiar delay? (S/N)"

if ($cambiarDelay -eq "S" -or $cambiarDelay -eq "s") {
    $nuevoDelay = Read-Host "   Ingresa el nuevo delay en milisegundos (ej: 4000)"
    
    try {
        $delayBody = @{ delay = [int]$nuevoDelay } | ConvertTo-Json
        $delayResult = Invoke-RestMethod -Uri "$baseUrl/api/queue/set-delay" -Method Post -Body $delayBody -ContentType "application/json"
        Write-Host "   ✅ $($delayResult.message)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error al configurar delay" -ForegroundColor Red
    }
}

Write-Host ""

# ====================================================
# 4. Enviar mensajes de prueba
# ====================================================
Write-Host "4. Enviar mensajes de prueba" -ForegroundColor Yellow
Write-Host "   ⚠️ Los mensajes se agregarán a la cola y se enviarán automáticamente" -ForegroundColor Gray
Write-Host ""

$enviarMensajes = Read-Host "   ¿Deseas enviar mensajes de prueba? (S/N)"

if ($enviarMensajes -eq "S" -or $enviarMensajes -eq "s") {
    $numero = Read-Host "   Ingresa el número (con código de país, sin +): "
    $cantidadMensajes = Read-Host "   ¿Cuántos mensajes enviar? (1-10): "
    
    Write-Host ""
    Write-Host "   📤 Enviando $cantidadMensajes mensajes a $numero..." -ForegroundColor Cyan
    
    for ($i = 1; $i -le [int]$cantidadMensajes; $i++) {
        try {
            $body = @{
                number = $numero
                message = "Mensaje de prueba #$i - Sistema de cola 🚀 $(Get-Date -Format 'HH:mm:ss')"
            } | ConvertTo-Json
            
            $result = Invoke-RestMethod -Uri "$baseUrl/api/send-messages" -Method Post -Body $body -ContentType "application/json"
            
            if ($result.status) {
                Write-Host "   ✅ Mensaje $i agregado a la cola (Cola: $($result.queueInfo.queueSize))" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Error al agregar mensaje $i" -ForegroundColor Red
            }
            
            Start-Sleep -Milliseconds 300
        } catch {
            Write-Host "   ❌ Error al enviar mensaje $i : $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "   ✨ Todos los mensajes fueron agregados a la cola" -ForegroundColor Green
    Write-Host "   ⏳ Se están enviando automáticamente con delay..." -ForegroundColor Yellow
    Write-Host ""
    
    # ====================================================
    # 5. Monitorear cola en tiempo real
    # ====================================================
    Write-Host "5. Monitoreando cola en tiempo real..." -ForegroundColor Yellow
    Write-Host "   (Esperando que se procesen todos los mensajes)" -ForegroundColor Gray
    Write-Host ""
    
    $ultimaCola = -1
    $intentos = 0
    $maxIntentos = 120  # 2 minutos máximo
    
    while ($intentos -lt $maxIntentos) {
        try {
            $stats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats" -Method Get
            $colaActual = $stats.stats.currentQueueSize
            
            if ($colaActual -ne $ultimaCola) {
                $timestamp = Get-Date -Format "HH:mm:ss"
                Write-Host "   [$timestamp] Cola: $colaActual | Enviados: $($stats.stats.totalSent) | Procesando: $($stats.stats.isProcessing)" -ForegroundColor Cyan
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
    # 6. Resumen final
    # ====================================================
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Resumen Final" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    try {
        $finalStats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats" -Method Get
        Write-Host "   ✅ Mensajes enviados: $($finalStats.stats.totalSent)" -ForegroundColor Green
        Write-Host "   ❌ Mensajes fallidos: $($finalStats.stats.totalFailed)" -ForegroundColor Red
        Write-Host "   📊 Total procesados: $($finalStats.stats.totalQueued)" -ForegroundColor Yellow
    } catch {
        Write-Host "   ⚠️ No se pudo obtener resumen final" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 Proceso completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   Ver estado de cola: " -NoNewline; Write-Host "curl http://localhost:3001/api/queue/stats" -ForegroundColor Gray
Write-Host "   Limpiar cola: " -NoNewline; Write-Host "curl -X POST http://localhost:3001/api/queue/clear" -ForegroundColor Gray
Write-Host "   Dashboard web: " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor Gray
Write-Host ""
