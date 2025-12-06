# 🐳 Sistema de Cola con Docker - Guía Completa

## 🚀 Inicio Rápido con Docker

### 1. Construir y Ejecutar

```bash
# Construir la imagen
docker-compose build

# Iniciar el contenedor
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f baileys-bot
```

### 2. Acceder al Dashboard

Abre: `http://localhost:3000` y escanea el QR de WhatsApp

---

## 📤 Usar el Sistema de Cola con Docker

### Ver Estado de la Cola

```bash
# Desde el host (Windows PowerShell)
curl http://localhost:3000/api/queue/stats

# O con Invoke-RestMethod
Invoke-RestMethod -Uri "http://localhost:3000/api/queue/stats"
```

### Configurar Delay

```bash
# PowerShell
$body = @{ delay = 5000 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/queue/set-delay" -Method Post -Body $body -ContentType "application/json"

# O con curl
curl -X POST http://localhost:3000/api/queue/set-delay -H "Content-Type: application/json" -d "{\"delay\": 5000}"
```

### Enviar Mensajes

```bash
# PowerShell
$mensaje = @{
    number = "51987654321"
    message = "Hola desde Docker!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/send-messages" -Method Post -Body $mensaje -ContentType "application/json"
```

### Limpiar Cola

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/queue/clear" -Method Post

# O con curl
curl -X POST http://localhost:3000/api/queue/clear
```

---

## 🔧 Comandos Docker Útiles

### Gestión del Contenedor

```bash
# Ver logs del bot (incluye logs de la cola)
docker-compose logs -f baileys-bot

# Ver solo las últimas 50 líneas
docker-compose logs --tail=50 baileys-bot

# Reiniciar el bot (mantiene la sesión)
docker-compose restart baileys-bot

# Detener el bot
docker-compose stop baileys-bot

# Eliminar y recrear (pierde la cola actual, pero mantiene la sesión)
docker-compose down
docker-compose up -d
```

### Ejecutar Scripts dentro del Contenedor

```bash
# Ejecutar test de cola
docker-compose exec baileys-bot node test-queue.js

# Ejecutar envío masivo
docker-compose exec baileys-bot node envio-masivo.js

# Acceder a la shell del contenedor
docker-compose exec baileys-bot sh
```

### Monitorear Recursos

```bash
# Ver uso de CPU y memoria en tiempo real
docker stats baileys-bot

# Ver procesos dentro del contenedor
docker-compose exec baileys-bot ps aux
```

---

## 📊 Monitoreo de la Cola en Docker

### Script PowerShell para Monitoreo

Crea `monitor-cola-docker.ps1`:

```powershell
Write-Host "🐳 Monitoreando cola en Docker..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

while ($true) {
    try {
        $stats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats"
        $timestamp = Get-Date -Format "HH:mm:ss"
        
        Clear-Host
        Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║  Monitor de Cola - Docker Container      ║" -ForegroundColor Cyan
        Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⏰ Hora: $timestamp" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📊 Estado de la Cola:" -ForegroundColor Yellow
        Write-Host "   Cola actual: $($stats.stats.currentQueueSize)" -ForegroundColor Cyan
        Write-Host "   Total enviados: $($stats.stats.totalSent)" -ForegroundColor Green
        Write-Host "   Total fallidos: $($stats.stats.totalFailed)" -ForegroundColor Red
        Write-Host "   Procesando: $($stats.stats.isProcessing)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚙️ Configuración:" -ForegroundColor Yellow
        Write-Host "   Delay: $($stats.stats.config.delayBetweenMessages)ms" -ForegroundColor Cyan
        Write-Host "   Max reintentos: $($stats.stats.config.maxRetries)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Presiona Ctrl+C para salir" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Error al conectar con el contenedor" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}
```

Ejecutar:
```bash
.\monitor-cola-docker.ps1
```

---

## 🧪 Probar el Sistema en Docker

### Opción 1: Desde el Host (Recomendado)

```bash
# Edita los scripts y ejecútalos desde Windows
node test-queue.js
```

### Opción 2: Dentro del Contenedor

```bash
# Acceder al contenedor
docker-compose exec baileys-bot sh

# Dentro del contenedor:
node test-queue.js

# Salir
exit
```

### Opción 3: Script PowerShell

```powershell
# Crear test-cola-docker.ps1
$baseUrl = "http://localhost:3000"

Write-Host "🧪 Probando sistema de cola en Docker..." -ForegroundColor Cyan
Write-Host ""

# Verificar conexión
$status = Invoke-RestMethod -Uri "$baseUrl/status"
if (-not $status.authenticated) {
    Write-Host "❌ Bot no autenticado. Escanea el QR en http://localhost:3000" -ForegroundColor Red
    exit
}
Write-Host "✅ Bot conectado" -ForegroundColor Green
Write-Host ""

# Configurar delay
Write-Host "⚙️ Configurando delay a 4 segundos..." -ForegroundColor Yellow
$delayBody = @{ delay = 4000 } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/api/queue/set-delay" -Method Post -Body $delayBody -ContentType "application/json" | Out-Null
Write-Host "✅ Delay configurado" -ForegroundColor Green
Write-Host ""

# Enviar mensajes de prueba
$numeroTest = Read-Host "Ingresa número de prueba (con código país, sin +)"
$cantidad = Read-Host "¿Cuántos mensajes enviar? (1-5)"

Write-Host ""
Write-Host "📤 Enviando $cantidad mensajes..." -ForegroundColor Cyan

for ($i = 1; $i -le [int]$cantidad; $i++) {
    $mensaje = @{
        number = $numeroTest
        message = "Mensaje de prueba #$i desde Docker 🐳 - $(Get-Date -Format 'HH:mm:ss')"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$baseUrl/api/send-messages" -Method Post -Body $mensaje -ContentType "application/json"
    
    if ($result.status) {
        Write-Host "   ✅ Mensaje $i agregado (Cola: $($result.queueInfo.queueSize))" -ForegroundColor Green
    }
    
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "✨ Mensajes agregados. Monitoreando..." -ForegroundColor Yellow
Write-Host ""

# Monitorear
$ultimaCola = -1
$intentos = 0

while ($intentos -lt 60) {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/queue/stats"
    $colaActual = $stats.stats.currentQueueSize
    
    if ($colaActual -ne $ultimaCola) {
        $hora = Get-Date -Format "HH:mm:ss"
        Write-Host "   [$hora] Cola: $colaActual | Enviados: $($stats.stats.totalSent)" -ForegroundColor Cyan
        $ultimaCola = $colaActual
        
        if ($colaActual -eq 0 -and -not $stats.stats.isProcessing) {
            Write-Host ""
            Write-Host "🎉 Todos los mensajes fueron enviados!" -ForegroundColor Green
            break
        }
    }
    
    Start-Sleep -Seconds 1
    $intentos++
}
```

Ejecutar:
```bash
.\test-cola-docker.ps1
```

---

## 📦 Envío Masivo desde Docker

### Método 1: Script en el Host

```bash
# Edita envio-masivo.js con tus contactos
# Cambia BASE_URL si es necesario (ya debería ser localhost:3000)
node envio-masivo.js
```

### Método 2: Script PowerShell Completo

```powershell
# envio-masivo-docker.ps1
$baseUrl = "http://localhost:3000"

# Tus contactos
$contactos = @(
    @{ numero = "51987654321"; nombre = "Juan" },
    @{ numero = "51987654322"; nombre = "María" },
    @{ numero = "51987654323"; nombre = "Pedro" }
    # Agrega más...
)

$mensajeTemplate = {
    param($nombre)
    "Hola $nombre! 👋`n`nMensaje desde Docker container 🐳`n`nSaludos!"
}

Write-Host "🐳 Envío Masivo desde Docker" -ForegroundColor Cyan
Write-Host ""

# Configurar delay
$delayBody = @{ delay = 5000 } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/api/queue/set-delay" -Method Post -Body $delayBody -ContentType "application/json" | Out-Null
Write-Host "✅ Delay configurado a 5 segundos" -ForegroundColor Green
Write-Host ""

Write-Host "📤 Enviando a $($contactos.Count) contactos..." -ForegroundColor Yellow
Write-Host ""

foreach ($contacto in $contactos) {
    $mensaje = & $mensajeTemplate $contacto.nombre
    
    $body = @{
        number = $contacto.numero
        message = $mensaje
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/api/send-messages" -Method Post -Body $body -ContentType "application/json"
        
        if ($result.status) {
            Write-Host "   ✅ $($contacto.nombre) ($($contacto.numero)) - Agregado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($contacto.nombre) - Error" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ $($contacto.nombre) - Error de conexión" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "✨ Proceso completado. Ver logs:" -ForegroundColor Green
Write-Host "   docker-compose logs -f baileys-bot" -ForegroundColor Gray
```

---

## 🔍 Verificar Logs de la Cola

```bash
# Ver logs con timestamps
docker-compose logs -f --timestamps baileys-bot

# Filtrar solo logs de la cola
docker-compose logs -f baileys-bot | grep -E "Cola|queue|Mensaje"

# Ver logs de los últimos 5 minutos
docker-compose logs --since 5m baileys-bot

# Guardar logs en archivo
docker-compose logs baileys-bot > logs-cola.txt
```

---

## ⚠️ Consideraciones Importantes

### Persistencia de Datos

✅ **Persiste (se guarda):**
- Sesión de WhatsApp (`./session`)
- Archivos subidos (`./uploads`)
- Imágenes públicas (`./public`)

❌ **NO persiste (se pierde al reiniciar):**
- Cola de mensajes en memoria
- Estadísticas de envíos
- Mensajes pendientes en cola

### Al Reiniciar el Contenedor

```bash
docker-compose restart baileys-bot
```

- ✅ La sesión de WhatsApp se mantiene
- ❌ Los mensajes en cola se pierden
- ❌ Las estadísticas se resetean

### Solución: Cola con Persistencia (Opcional)

Si necesitas persistencia de cola, puedes agregar Redis:

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:alpine
    container_name: baileys-redis
    restart: unless-stopped
    
  baileys-bot:
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379
```

---

## 🚨 Solución de Problemas

### El contenedor no inicia

```bash
# Ver logs de error
docker-compose logs baileys-bot

# Verificar configuración
docker-compose config

# Reconstruir desde cero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### No puedo acceder al dashboard

```bash
# Verificar que el contenedor esté corriendo
docker-compose ps

# Verificar el puerto
docker-compose port baileys-bot 3000

# Ver logs
docker-compose logs baileys-bot

# Probar desde dentro del contenedor
docker-compose exec baileys-bot wget -O- http://localhost:3000/status
```

### La cola no funciona

```bash
# Ver logs en tiempo real
docker-compose logs -f baileys-bot

# Verificar API
curl http://localhost:3000/api/queue/stats

# Reiniciar el contenedor
docker-compose restart baileys-bot
```

### WhatsApp se desconecta

```bash
# Verificar sesión
ls -la session/

# Ver logs de conexión
docker-compose logs baileys-bot | grep -i "connect\|auth\|qr"

# Limpiar sesión y reconectar
rm -rf session/*
docker-compose restart baileys-bot
# Luego escanea el QR de nuevo
```

---

## 📊 Monitoreo Avanzado

### Dashboard con Portainer (Opcional)

```bash
# Instalar Portainer
docker volume create portainer_data
docker run -d -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce

# Acceder: http://localhost:9000
```

### Logs Centralizados

```bash
# Exportar logs a archivo
docker-compose logs baileys-bot > logs-$(date +%Y%m%d).txt

# Ver en tiempo real con colores
docker-compose logs -f --no-log-prefix baileys-bot
```

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Iniciar
docker-compose up -d

# Logs
docker-compose logs -f baileys-bot

# Estado de cola
curl http://localhost:3000/api/queue/stats

# Reiniciar
docker-compose restart baileys-bot

# Detener
docker-compose down

# Acceder al shell
docker-compose exec baileys-bot sh

# Monitorear recursos
docker stats baileys-bot
```

---

## ✅ Checklist de Implementación

- [ ] Construir imagen: `docker-compose build`
- [ ] Iniciar contenedor: `docker-compose up -d`
- [ ] Verificar logs: `docker-compose logs -f`
- [ ] Abrir dashboard: http://localhost:3000
- [ ] Escanear QR de WhatsApp
- [ ] Probar cola: `curl http://localhost:3000/api/queue/stats`
- [ ] Enviar mensaje de prueba
- [ ] Verificar en logs que se procese con delay
- [ ] Configurar delay según necesidad
- [ ] Probar envío masivo con script

---

## 🎉 ¡Listo!

Tu bot con sistema de cola está corriendo en Docker. Para usarlo:

1. **Ver logs:** `docker-compose logs -f baileys-bot`
2. **Enviar mensajes:** Scripts PowerShell o API REST
3. **Monitorear cola:** `curl http://localhost:3000/api/queue/stats`

**¿Dudas?** Revisa `QUEUE_SYSTEM.md` para más detalles.
