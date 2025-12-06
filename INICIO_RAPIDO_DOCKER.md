# 🐳 Inicio Rápido - Docker + Sistema de Cola

## ⚡ 3 Pasos para Empezar

### 1. Iniciar el Bot

```powershell
# Construir y iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f baileys-bot
```

### 2. Autenticar WhatsApp

1. Abre: http://localhost:3000
2. Escanea el código QR con WhatsApp
3. ¡Listo! El bot está conectado

### 3. Probar el Sistema de Cola

```powershell
# Opción A: Script interactivo
.\test-cola-docker.ps1

# Opción B: Comando directo
curl -X POST http://localhost:3000/api/send-messages -H "Content-Type: application/json" -d '{\"number\": \"51987654321\", \"message\": \"Hola desde Docker!\"}'
```

---

## 📊 Monitorear en Tiempo Real

```powershell
# Monitor visual de la cola
.\monitor-cola-docker.ps1
```

---

## 🚀 Comandos Esenciales

### Gestión del Contenedor

```powershell
# Iniciar
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f baileys-bot

# Reiniciar (mantiene sesión)
docker-compose restart baileys-bot

# Detener
docker-compose stop baileys-bot

# Eliminar todo
docker-compose down
```

### API del Bot

```powershell
# Ver estado de la cola
curl http://localhost:3000/api/queue/stats

# Configurar delay (5 segundos)
curl -X POST http://localhost:3000/api/queue/set-delay -H "Content-Type: application/json" -d '{\"delay\": 5000}'

# Limpiar cola
curl -X POST http://localhost:3000/api/queue/clear

# Estado del bot
curl http://localhost:3000/status
```

---

## 📤 Enviar Mensajes

### Texto Simple

```powershell
$mensaje = @{
    number = "51987654321"
    message = "Hola desde el bot!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/send-messages" -Method Post -Body $mensaje -ContentType "application/json"
```

### Envío Masivo

```powershell
# Edita las variables y ejecuta
.\envio-masivo-docker.ps1
```

---

## 🔧 Configuración del Sistema de Cola

### Valores Recomendados

| Uso | Delay | Comando |
|-----|-------|---------|
| **Normal** (Recomendado) | 3-5 seg | `{"delay": 4000}` |
| **Seguro** (Campañas grandes) | 5-10 seg | `{"delay": 7000}` |
| **Rápido** (Con riesgo) | 1-2 seg | `{"delay": 2000}` |

### Cambiar Delay

```powershell
# PowerShell
$body = @{ delay = 5000 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/queue/set-delay" -Method Post -Body $body -ContentType "application/json"
```

---

## 🎯 Ejemplo Completo

```powershell
# 1. Iniciar bot
docker-compose up -d

# 2. Esperar a que inicie (15 segundos)
Start-Sleep -Seconds 15

# 3. Verificar estado
$status = Invoke-RestMethod -Uri "http://localhost:3000/status"
Write-Host "Bot autenticado: $($status.authenticated)"

# 4. Configurar delay de 4 segundos
$delayBody = @{ delay = 4000 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/queue/set-delay" -Method Post -Body $delayBody -ContentType "application/json"

# 5. Enviar mensaje de prueba
$mensaje = @{
    number = "51987654321"
    message = "Hola! Este es un mensaje de prueba con sistema de cola 🚀"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/send-messages" -Method Post -Body $mensaje -ContentType "application/json"

# 6. Ver estado de la cola
$stats = Invoke-RestMethod -Uri "http://localhost:3000/api/queue/stats"
Write-Host "Mensajes en cola: $($stats.stats.currentQueueSize)"

# 7. Ver logs en tiempo real
docker-compose logs -f baileys-bot
```

---

## 📋 Checklist de Verificación

- [ ] Docker y Docker Compose instalados
- [ ] Contenedor corriendo: `docker ps | findstr baileys-bot`
- [ ] Bot accesible: http://localhost:3000
- [ ] QR escaneado y autenticado
- [ ] Cola funcionando: `curl http://localhost:3000/api/queue/stats`
- [ ] Logs visibles: `docker-compose logs baileys-bot`

---

## 🚨 Solución Rápida de Problemas

### El contenedor no inicia

```powershell
# Ver el error
docker-compose logs baileys-bot

# Reconstruir desde cero
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### No puedo conectar

```powershell
# Verificar que está corriendo
docker ps

# Ver el puerto
docker port baileys-bot

# Probar conectividad
curl http://localhost:3000/status
```

### WhatsApp se desconectó

```powershell
# Limpiar sesión y reiniciar
Remove-Item -Path ".\session\*" -Force
docker-compose restart baileys-bot

# Luego escanea el QR de nuevo en http://localhost:3000
```

### La cola no funciona

```powershell
# Ver logs en detalle
docker-compose logs --tail=100 baileys-bot

# Reiniciar el bot
docker-compose restart baileys-bot

# Verificar API
curl http://localhost:3000/api/queue/stats
```

---

## 💡 Tips Importantes

### ✅ Persiste (se guarda al reiniciar)
- Sesión de WhatsApp
- Archivos subidos
- Configuración

### ❌ NO persiste (se pierde al reiniciar)
- Cola de mensajes en memoria
- Estadísticas de envíos
- Mensajes pendientes

**Recomendación:** No reinicies el contenedor mientras haya mensajes en cola.

---

## 📚 Documentación Completa

- **DOCKER_COLA.md** - Guía completa de Docker + Cola
- **QUEUE_SYSTEM.md** - Sistema de cola detallado
- **RESUMEN_COLA.md** - Resumen rápido

---

## 🎉 ¡Todo Listo!

Tu bot está corriendo en Docker con sistema de cola. Para usarlo:

```powershell
# Ver logs
docker-compose logs -f baileys-bot

# Monitorear cola
.\monitor-cola-docker.ps1

# Enviar mensajes
.\test-cola-docker.ps1
```

**Dashboard:** http://localhost:3000

**¿Dudas?** Lee `DOCKER_COLA.md` para más detalles.
