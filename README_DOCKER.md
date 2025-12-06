# 🐳 WhatsApp Bot con Sistema de Cola - Docker

Bot de WhatsApp con **sistema de cola inteligente** optimizado para Docker. Envía mensajes de forma secuencial con delay automático, evitando bloqueos de WhatsApp.

---

## 🚀 Inicio Rápido (3 comandos)

```bash
# 1. Iniciar el bot
docker-compose up -d

# 2. Ver logs
docker-compose logs -f baileys-bot

# 3. Escanear QR en http://localhost:3000
```

**¡Listo!** Ya puedes enviar mensajes.

---

## ⚡ Comandos Esenciales

### Gestión del Contenedor

```bash
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

### Probar el Sistema

```powershell
# Test interactivo
.\test-cola-docker.ps1

# Monitor en tiempo real
.\monitor-cola-docker.ps1

# Envío masivo
.\envio-masivo-docker.ps1
```

---

## 📤 Enviar Mensajes

### Desde PowerShell

```powershell
# Mensaje simple
$msg = @{ number = "51987654321"; message = "Hola!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/send-messages" -Method Post -Body $msg -ContentType "application/json"
```

### Desde curl

```bash
curl -X POST http://localhost:3000/api/send-messages \
  -H "Content-Type: application/json" \
  -d '{"number": "51987654321", "message": "Hola desde Docker!"}'
```

---

## 📊 API de la Cola

```bash
# Ver estado de la cola
curl http://localhost:3000/api/queue/stats

# Configurar delay (5 segundos)
curl -X POST http://localhost:3000/api/queue/set-delay \
  -H "Content-Type: application/json" \
  -d '{"delay": 5000}'

# Limpiar cola
curl -X POST http://localhost:3000/api/queue/clear
```

---

## 🎯 Cómo Funciona

```
Mensaje 1 → [COLA] → Envío → ⏱️ 3 seg → Mensaje 2 → Envío → ⏱️ 3 seg → Mensaje 3
```

- ✅ Los mensajes se agregan a una cola
- ✅ Se procesan **uno por uno** con delay
- ✅ **3 segundos** de pausa por defecto (configurable)
- ✅ **Reintentos automáticos** si falla
- ✅ **Sin riesgo** de bloqueo de WhatsApp

---

## 📁 Archivos y Scripts

### Documentación

| Archivo | Descripción |
|---------|-------------|
| `INICIO_RAPIDO_DOCKER.md` | Guía de inicio rápido |
| `DOCKER_COLA.md` | Documentación completa Docker + Cola |
| `QUEUE_SYSTEM.md` | Sistema de cola detallado |
| `RESUMEN_COLA.md` | Resumen ejecutivo |

### Scripts PowerShell

| Script | Uso |
|--------|-----|
| `test-cola-docker.ps1` | Probar el sistema de cola |
| `monitor-cola-docker.ps1` | Monitor en tiempo real |
| `envio-masivo-docker.ps1` | Envío masivo controlado |

---

## ⚙️ Configuración

### Delays Recomendados

| Velocidad | Delay | Uso |
|-----------|-------|-----|
| 🐢 Muy Seguro | 5-10 seg | Campañas masivas |
| ⚖️ Balance | **3-5 seg** | **Recomendado** |
| 🐰 Rápido | 1-2 seg | Urgente (con riesgo) |

### Cambiar Delay

```powershell
$body = @{ delay = 5000 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/queue/set-delay" -Method Post -Body $body -ContentType "application/json"
```

---

## 🔍 Monitoreo

### Ver Logs del Bot

```bash
# Tiempo real
docker-compose logs -f baileys-bot

# Últimas 100 líneas
docker-compose logs --tail=100 baileys-bot

# Guardar en archivo
docker-compose logs baileys-bot > logs.txt
```

### Monitor Visual de Cola

```powershell
# Dashboard en PowerShell con auto-refresh
.\monitor-cola-docker.ps1
```

### Verificar Recursos

```bash
# Uso de CPU y memoria
docker stats baileys-bot

# Información del contenedor
docker inspect baileys-bot
```

---

## 📦 Estructura del Proyecto

```
baileys-bot/
├── 🐳 Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── DOCKER.md
│   └── DOCKER_COLA.md
│
├── 📝 Código
│   └── src/
│       ├── index.js
│       ├── controllers/
│       │   └── messageController.js
│       └── helpers/
│           ├── formatter.js
│           └── messageQueue.js ⭐ (Sistema de cola)
│
├── 📊 Scripts
│   ├── test-cola-docker.ps1
│   ├── monitor-cola-docker.ps1
│   └── envio-masivo-docker.ps1
│
└── 📚 Documentación
    ├── INICIO_RAPIDO_DOCKER.md
    ├── QUEUE_SYSTEM.md
    └── RESUMEN_COLA.md
```

---

## 🚨 Solución de Problemas

### El contenedor no inicia

```bash
# Ver el error
docker-compose logs baileys-bot

# Reconstruir
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### No puedo conectar

```bash
# Verificar estado
docker ps | findstr baileys-bot

# Probar conectividad
curl http://localhost:3000/status

# Ver puerto
docker port baileys-bot
```

### WhatsApp se desconectó

```powershell
# Limpiar sesión
Remove-Item -Path ".\session\*" -Force

# Reiniciar
docker-compose restart baileys-bot

# Escanear QR de nuevo
Start-Process "http://localhost:3000"
```

### La cola no funciona

```bash
# Ver logs detallados
docker-compose logs --tail=200 baileys-bot | grep -E "Cola|queue"

# Verificar API
curl http://localhost:3000/api/queue/stats

# Reiniciar
docker-compose restart baileys-bot
```

---

## ⚠️ Importante

### ✅ Persiste (se guarda)
- Sesión de WhatsApp (`./session`)
- Archivos subidos (`./uploads`)
- Configuración

### ❌ NO persiste (se pierde)
- Cola de mensajes en memoria
- Estadísticas de envíos
- Mensajes pendientes en cola

**💡 Recomendación:** No reinicies el contenedor mientras haya mensajes en cola.

---

## 📊 Ejemplo Completo

```powershell
# 1. Iniciar el bot
docker-compose up -d

# 2. Esperar a que inicie
Start-Sleep -Seconds 15

# 3. Verificar conexión
$status = Invoke-RestMethod -Uri "http://localhost:3000/status"
if (-not $status.authenticated) {
    Write-Host "Escanea el QR en http://localhost:3000"
    exit
}

# 4. Configurar delay de 4 segundos
$delay = @{ delay = 4000 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/queue/set-delay" -Method Post -Body $delay -ContentType "application/json"

# 5. Enviar 3 mensajes de prueba
for ($i = 1; $i -le 3; $i++) {
    $msg = @{
        number = "51987654321"
        message = "Mensaje de prueba #$i desde Docker 🐳"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3000/api/send-messages" -Method Post -Body $msg -ContentType "application/json"
}

# 6. Monitorear cola
$stats = Invoke-RestMethod -Uri "http://localhost:3000/api/queue/stats"
Write-Host "Mensajes en cola: $($stats.stats.currentQueueSize)"

# 7. Ver logs
docker-compose logs -f baileys-bot
```

---

## 🎯 Checklist de Implementación

- [ ] Docker y Docker Compose instalados
- [ ] Imagen construida: `docker-compose build`
- [ ] Contenedor corriendo: `docker-compose up -d`
- [ ] Logs visibles: `docker-compose logs -f`
- [ ] Dashboard abierto: http://localhost:3000
- [ ] QR escaneado y autenticado
- [ ] Cola funcionando: `curl http://localhost:3000/api/queue/stats`
- [ ] Test exitoso: `.\test-cola-docker.ps1`

---

## 💡 Tips para Producción

### Límites de Recursos

Edita `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

### Variables de Entorno

Crea `.env`:

```env
PORT=3000
NODE_ENV=production
TZ=America/Lima
```

### Backup Automático

```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_session_$DATE.tar.gz session/
```

---

## 📚 Más Información

- **Inicio Rápido:** `INICIO_RAPIDO_DOCKER.md`
- **Guía Completa:** `DOCKER_COLA.md`
- **Sistema de Cola:** `QUEUE_SYSTEM.md`
- **Docker General:** `DOCKER.md`

---

## 🎉 ¡Todo Listo!

```bash
# Iniciar
docker-compose up -d

# Monitorear
.\monitor-cola-docker.ps1

# Dashboard
http://localhost:3000
```

**Desarrollado con ❤️ usando [Baileys](https://github.com/WhiskeySockets/Baileys) + Docker 🐳**
