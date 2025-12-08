# ============================================================
# Script de Configuración Rápida de Delays Dinámicos
# ============================================================

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 CONFIGURACIÓN DE DELAY DINÁMICO - WhatsApp   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar si el servidor está corriendo
$statusUrl = "http://localhost:3001/status"
try {
    $response = Invoke-RestMethod -Uri $statusUrl -Method Get -ErrorAction Stop
    if ($response.authenticated) {
        Write-Host "✅ Bot conectado y autenticado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Bot no autenticado. Por favor escanea el código QR" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Servidor no está corriendo. Ejecuta 'npm start' primero" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "¿Qué configuración necesitas?" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🟢 Normal (Sin problemas con WhatsApp)" -ForegroundColor Green
Write-Host "   Preset: moderado | 8-20s | Lotes de 20"
Write-Host ""
Write-Host "2. 🟡 Precaución (Advertencia de WhatsApp)" -ForegroundColor Yellow
Write-Host "   Preset: seguro | 15-35s | Lotes de 15"
Write-Host ""
Write-Host "3. 🔴 Emergencia (WhatsApp te puso contador/límite)" -ForegroundColor Red
Write-Host "   Preset: ultra-seguro | 20-45s | Lotes de 10"
Write-Host ""
Write-Host "4. 🚨 Ultra Lento (Recuperación después de límite severo)" -ForegroundColor Magenta
Write-Host "   Delay: 45-90s | Lotes de 5"
Write-Host ""
Write-Host "5. ℹ️  Ver configuración actual" -ForegroundColor Cyan
Write-Host ""
Write-Host "0. Salir" -ForegroundColor Gray
Write-Host ""

$opcion = Read-Host "Selecciona una opción (0-5)"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "⚙️  Aplicando configuración NORMAL..." -ForegroundColor Green
        
        # Configurar preset
        $body = @{ preset = "moderado" } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-preset" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        # Activar patrón humano
        $body = @{ enabled = $true } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-human-pattern" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📊 Configuración aplicada:" -ForegroundColor Cyan
        Write-Host "   • Delay: 8-20 segundos (aleatorio)" -ForegroundColor White
        Write-Host "   • Pausas humanas: Activadas" -ForegroundColor White
        Write-Host "   • Recomendado: Lotes de 20 mensajes" -ForegroundColor White
    }
    
    "2" {
        Write-Host ""
        Write-Host "⚙️  Aplicando configuración SEGURA..." -ForegroundColor Yellow
        
        $body = @{ preset = "seguro" } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-preset" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        $body = @{ enabled = $true } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-human-pattern" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📊 Configuración aplicada:" -ForegroundColor Cyan
        Write-Host "   • Delay: 15-35 segundos (aleatorio)" -ForegroundColor White
        Write-Host "   • Pausas humanas: Activadas" -ForegroundColor White
        Write-Host "   • Recomendado: Lotes de 15 mensajes" -ForegroundColor White
        Write-Host "   • ⚠️  Evita envíos masivos frecuentes" -ForegroundColor Yellow
    }
    
    "3" {
        Write-Host ""
        Write-Host "⚙️  Aplicando configuración ULTRA-SEGURA (EMERGENCIA)..." -ForegroundColor Red
        
        $body = @{ preset = "ultra-seguro" } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-preset" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        $body = @{ enabled = $true } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-human-pattern" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📊 Configuración aplicada:" -ForegroundColor Cyan
        Write-Host "   • Delay: 20-45 segundos (aleatorio)" -ForegroundColor White
        Write-Host "   • Pausas humanas: Activadas" -ForegroundColor White
        Write-Host "   • Recomendado: Lotes de 10 mensajes" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
        Write-Host "   • Envía MÁXIMO 30-40 mensajes por hora" -ForegroundColor Yellow
        Write-Host "   • Haz pausas de 10-15 minutos cada lote" -ForegroundColor Yellow
        Write-Host "   • Si persiste el límite, para 24-48 horas" -ForegroundColor Yellow
    }
    
    "4" {
        Write-Host ""
        Write-Host "⚙️  Aplicando configuración ULTRA LENTA..." -ForegroundColor Magenta
        
        # Configuración manual con delays muy largos
        $body = @{ delay = 45000 } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-delay" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        $body = @{ enabled = $true } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/set-human-pattern" `
                                       -Method Post `
                                       -Body $body `
                                       -ContentType "application/json"
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📊 Configuración aplicada:" -ForegroundColor Cyan
        Write-Host "   • Delay: 45-90 segundos (aleatorio)" -ForegroundColor White
        Write-Host "   • Pausas humanas: Activadas" -ForegroundColor White
        Write-Host "   • Recomendado: Lotes de 5 mensajes" -ForegroundColor White
        Write-Host ""
        Write-Host "🚨 MODO RECUPERACIÓN:" -ForegroundColor Red
        Write-Host "   • Envía MÁXIMO 15-20 mensajes por DÍA" -ForegroundColor Yellow
        Write-Host "   • Usa esto durante 5-7 días" -ForegroundColor Yellow
        Write-Host "   • Luego vuelve a configuración 3" -ForegroundColor Yellow
    }
    
    "5" {
        Write-Host ""
        Write-Host "📊 Consultando configuración actual..." -ForegroundColor Cyan
        
        $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/queue/stats" -Method Get
        
        Write-Host ""
        Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "CONFIGURACIÓN ACTUAL" -ForegroundColor White
        Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
        
        if ($stats.config.minDelay) {
            $minSec = [math]::Round($stats.config.minDelay / 1000, 1)
            $maxSec = [math]::Round($stats.config.maxDelay / 1000, 1)
            Write-Host "Delay mínimo: $minSec segundos" -ForegroundColor White
            Write-Host "Delay máximo: $maxSec segundos" -ForegroundColor White
        }
        
        Write-Host "Patrón humano: $($stats.config.humanPattern)" -ForegroundColor White
        Write-Host "Max reintentos: $($stats.config.maxRetries)" -ForegroundColor White
        
        Write-Host ""
        Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "ESTADÍSTICAS" -ForegroundColor White
        Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "Total en cola: $($stats.totalQueued)" -ForegroundColor White
        Write-Host "Total enviados: $($stats.totalSent)" -ForegroundColor Green
        Write-Host "Total fallidos: $($stats.totalFailed)" -ForegroundColor Red
        Write-Host "En cola ahora: $($stats.currentQueueSize)" -ForegroundColor Yellow
        Write-Host "Procesando: $($stats.isProcessing)" -ForegroundColor White
        
        if ($stats.averageDelay) {
            Write-Host "Delay promedio: $($stats.averageDelay)" -ForegroundColor Cyan
        }
    }
    
    "0" {
        Write-Host ""
        Write-Host "👋 Saliendo..." -ForegroundColor Gray
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✨ Configuración aplicada exitosamente" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes:" -ForegroundColor Cyan
Write-Host "  • Ejecutar: node envio-masivo.js" -ForegroundColor White
Write-Host "  • O usar la API normalmente" -ForegroundColor White
Write-Host ""
Write-Host "Para ver el estado en tiempo real:" -ForegroundColor Cyan
Write-Host "  Invoke-RestMethod -Uri http://localhost:3001/api/queue/stats" -ForegroundColor White
Write-Host ""
