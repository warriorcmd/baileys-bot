# ====================================================
# Envío Masivo - Docker Version
# Script para enviar mensajes masivos desde Docker
# Ejecutar: .\envio-masivo-docker.ps1
# ====================================================

$baseUrl = "http://localhost:3000"

# ====================================================
# CONFIGURACIÓN - EDITA AQUÍ TUS CONTACTOS
# ====================================================

$CONTACTOS = @(
    @{ numero = "51987654321"; nombre = "Juan" },
    @{ numero = "51987654322"; nombre = "María" },
    @{ numero = "51987654323"; nombre = "Pedro" }
    # Agrega más contactos aquí...
)

$CONFIGURACION = @{
    delayEntreEnvios = 5000      # 5 segundos entre mensajes
    pausaEntreLotes = 60000      # 1 minuto entre lotes
    tamañoLote = 20              # Enviar en lotes de 20
}

# Plantilla de mensaje (personalizable por nombre)
function Get-MensajePersonalizado {
    param($nombre)
    
    return @"
Hola $nombre! 👋

Este es un mensaje enviado de forma controlada usando nuestro bot de WhatsApp con Docker 🐳

El sistema de cola garantiza que los mensajes se envíen de manera segura, uno por uno, con un delay de $($CONFIGURACION.delayEntreEnvios / 1000) segundos entre cada envío.

¡Saludos! 🚀
"@
}

# ====================================================
# FUNCIONES
# ====================================================

function Test-Conexion {
    try {
        $status = Invoke-RestMethod -Uri "$baseUrl/status" -ErrorAction Stop
        return $status.authenticated
    } catch {
        return $false
    }
}

function Set-DelayQueue {
    param($delay)
    
    try {
        $body = @{ delay = $delay } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/api/queue/set-delay" -Method Post -Body $body -ContentType "application/json"
        return $true
    } catch {
        return $false
    }
}

function Send-Mensaje {
    param($numero, $mensaje)
    
    try {
        $body = @{
            number = $numero
            message = $mensaje
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$baseUrl/api/send-messages" -Method Post -Body $body -ContentType "application/json"
        return $result
    } catch {
        return @{ status = $false; message = $_.Exception.Message }
    }
}

function Get-EstadoCola {
    try {
        $stats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats"
        return $stats
    } catch {
        return $null
    }
}

# ====================================================
# PROCESO PRINCIPAL
# ====================================================

Clear-Host

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   📤 ENVÍO MASIVO CONTROLADO - Docker Container      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar contenedor
Write-Host "🐳 Verificando contenedor Docker..." -ForegroundColor Yellow

$containerStatus = docker ps --filter "name=baileys-bot" --format "{{.Status}}"

if (-not $containerStatus) {
    Write-Host "   ❌ Contenedor no está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Ejecuta: docker-compose up -d" -ForegroundColor Gray
    exit
}

Write-Host "   ✅ Contenedor activo: $containerStatus" -ForegroundColor Green
Write-Host ""

# 2. Verificar conexión del bot
Write-Host "🔍 Verificando conexión del bot..." -ForegroundColor Yellow

$conectado = Test-Conexion

if (-not $conectado) {
    Write-Host "   ❌ Bot no está conectado o no autenticado" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Pasos:" -ForegroundColor Yellow
    Write-Host "   1. Abre: http://localhost:3000" -ForegroundColor Gray
    Write-Host "   2. Escanea el código QR con WhatsApp" -ForegroundColor Gray
    Write-Host "   3. Vuelve a ejecutar este script" -ForegroundColor Gray
    exit
}

Write-Host "   ✅ Bot conectado y autenticado" -ForegroundColor Green
Write-Host ""

# 3. Mostrar configuración
Write-Host "📋 Configuración del envío:" -ForegroundColor Yellow
Write-Host "   Total de contactos: $($CONTACTOS.Count)" -ForegroundColor Cyan
Write-Host "   Delay entre mensajes: $($CONFIGURACION.delayEntreEnvios)ms ($($CONFIGURACION.delayEntreEnvios / 1000) segundos)" -ForegroundColor Cyan
Write-Host "   Tamaño de lote: $($CONFIGURACION.tamañoLote)" -ForegroundColor Cyan

$numLotes = [Math]::Ceiling($CONTACTOS.Count / $CONFIGURACION.tamañoLote)
Write-Host "   Lotes a procesar: $numLotes" -ForegroundColor Cyan

$tiempoEstimado = [Math]::Ceiling(
    ($CONTACTOS.Count * $CONFIGURACION.delayEntreEnvios / 1000) +
    (($numLotes - 1) * $CONFIGURACION.pausaEntreLotes / 1000)
)
Write-Host "   Tiempo estimado: ~$([Math]::Ceiling($tiempoEstimado / 60)) minutos" -ForegroundColor Cyan
Write-Host ""

# 4. Confirmar envío
Write-Host "⚠️ IMPORTANTE:" -ForegroundColor Red
Write-Host "   - Revisa que los números sean correctos" -ForegroundColor Yellow
Write-Host "   - Los mensajes se enviarán automáticamente" -ForegroundColor Yellow
Write-Host "   - No reinicies el contenedor durante el proceso" -ForegroundColor Yellow
Write-Host ""

$confirmar = Read-Host "¿Continuar con el envío? (S/N)"

if ($confirmar -ne "S" -and $confirmar -ne "s") {
    Write-Host ""
    Write-Host "❌ Envío cancelado" -ForegroundColor Red
    exit
}

Write-Host ""

# 5. Configurar delay
Write-Host "⚙️ Configurando delay a $($CONFIGURACION.delayEntreEnvios)ms..." -ForegroundColor Yellow

$delayOk = Set-DelayQueue -delay $CONFIGURACION.delayEntreEnvios

if ($delayOk) {
    Write-Host "   ✅ Delay configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ No se pudo configurar delay (usando default)" -ForegroundColor Yellow
}

Write-Host ""

# 6. Dividir en lotes
$lotes = @()
for ($i = 0; $i -lt $CONTACTOS.Count; $i += $CONFIGURACION.tamañoLote) {
    $fin = [Math]::Min($i + $CONFIGURACION.tamañoLote - 1, $CONTACTOS.Count - 1)
    $lotes += ,@($CONTACTOS[$i..$fin])
}

Write-Host "📦 Procesando $($lotes.Count) lote(s)..." -ForegroundColor Yellow
Write-Host ""

# 7. Procesar lotes
$totalEnviados = 0
$totalFallidos = 0
$tiempoInicio = Get-Date

for ($i = 0; $i -lt $lotes.Count; $i++) {
    $lote = $lotes[$i]
    $numeroLote = $i + 1
    
    Write-Host "🔄 Lote $numeroLote/$($lotes.Count) ($($lote.Count) mensajes)" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════════════" -ForegroundColor Gray
    
    foreach ($contacto in $lote) {
        $mensaje = Get-MensajePersonalizado -nombre $contacto.nombre
        $resultado = Send-Mensaje -numero $contacto.numero -mensaje $mensaje
        
        if ($resultado.status) {
            $totalEnviados++
            Write-Host "   ✅ $($contacto.nombre) ($($contacto.numero))" -ForegroundColor Green
        } else {
            $totalFallidos++
            Write-Host "   ❌ $($contacto.nombre) ($($contacto.numero)) - $($resultado.message)" -ForegroundColor Red
        }
        
        # Pequeño delay para no saturar
        Start-Sleep -Milliseconds 200
    }
    
    Write-Host ""
    Write-Host "   ✨ Lote $numeroLote completado" -ForegroundColor Green
    
    # Pausa entre lotes (excepto en el último)
    if ($i -lt ($lotes.Count - 1)) {
        $pausaSegundos = $CONFIGURACION.pausaEntreLotes / 1000
        Write-Host "   ⏸️ Pausa de $pausaSegundos segundos antes del siguiente lote..." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Milliseconds $CONFIGURACION.pausaEntreLotes
    }
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✨ TODOS LOS MENSAJES AGREGADOS A LA COLA" -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# 8. Monitorear hasta que termine
Write-Host "⏳ Monitoreando envío en tiempo real..." -ForegroundColor Yellow
Write-Host "   (Esperando que la cola termine de procesarse)" -ForegroundColor Gray
Write-Host ""

$ultimaCola = -1
$verificaciones = 0
$maxVerificaciones = 600  # 10 minutos máximo

while ($verificaciones -lt $maxVerificaciones) {
    $stats = Get-EstadoCola
    
    if ($stats) {
        $colaActual = $stats.stats.currentQueueSize
        
        if ($colaActual -ne $ultimaCola) {
            $hora = Get-Date -Format "HH:mm:ss"
            $procesando = if ($stats.stats.isProcessing) { "Sí ⚡" } else { "No" }
            
            Write-Host "   [$hora] Cola: $colaActual | Enviados: $($stats.stats.totalSent) | Procesando: $procesando" -ForegroundColor Cyan
            
            $ultimaCola = $colaActual
            
            # Si terminó, salir
            if ($colaActual -eq 0 -and -not $stats.stats.isProcessing) {
                Write-Host ""
                Write-Host "   ✅ Todos los mensajes fueron procesados" -ForegroundColor Green
                break
            }
        }
    }
    
    Start-Sleep -Seconds 1
    $verificaciones++
}

$tiempoFin = Get-Date
$duracionTotal = ($tiempoFin - $tiempoInicio).TotalSeconds

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              📊 RESUMEN FINAL                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$estadoFinal = Get-EstadoCola

if ($estadoFinal) {
    Write-Host "✅ Mensajes enviados exitosamente: $($estadoFinal.stats.totalSent)" -ForegroundColor Green
    Write-Host "❌ Mensajes fallidos: $($estadoFinal.stats.totalFailed)" -ForegroundColor Red
    Write-Host "📊 Total procesados: $($estadoFinal.stats.totalQueued)" -ForegroundColor Yellow
    Write-Host "⏱️ Duración total: $([Math]::Round($duracionTotal / 60, 2)) minutos" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          🎉 Proceso completado exitosamente          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "💡 Puedes ver los detalles en:" -ForegroundColor Yellow
Write-Host "   Dashboard: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Logs: docker-compose logs -f baileys-bot" -ForegroundColor Gray
Write-Host "   Cola: curl http://localhost:3000/api/queue/stats" -ForegroundColor Gray
Write-Host ""
