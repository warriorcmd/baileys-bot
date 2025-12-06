# 🚀 WhatsApp Bot con Sistema de Cola

Bot de WhatsApp con Baileys que incluye un **sistema de cola inteligente** para enviar mensajes de forma secuencial con delay automático, evitando bloqueos de WhatsApp.

## ⚡ Problema Resuelto

**ANTES:** 
- Enviabas 5-10 mensajes en menos de 1 minuto
- WhatsApp detectaba spam y te ponía un contador de límite
- Riesgo de bloqueo temporal o permanente

**AHORA:**
- Los mensajes se agregan a una cola
- Se envían uno por uno con 3 segundos de delay
- Sin riesgo de bloqueo
- Reintentos automáticos si falla

## 🎯 Características

✅ Sistema de cola automático  
✅ Delay configurable entre mensajes (default: 3 segundos)  
✅ Reintentos automáticos (hasta 3 intentos)  
✅ Estadísticas en tiempo real  
✅ API REST completa  
✅ Dashboard web interactivo  
✅ Envío de texto, imágenes, videos, documentos  
✅ Soporte para grupos  
✅ Scripts de prueba incluidos  

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd baileys-bot

# Instalar dependencias
npm install

# Iniciar el bot
npm start
```

## 🔐 Autenticación

1. Inicia el bot: `npm start`
2. Abre http://localhost:3001 en tu navegador
3. Escanea el código QR con WhatsApp:
   - WhatsApp → Configuración → Dispositivos vinculados → Vincular dispositivo

## 🚀 Uso Rápido

### Enviar un Mensaje

```bash
curl -X POST http://localhost:3001/api/send-messages \
  -H "Content-Type: application/json" \
  -d '{"number": "51987654321", "message": "Hola desde el bot!"}'
```

### Ver Estado de la Cola

```bash
curl http://localhost:3001/api/queue/stats
```

### Configurar Delay (5 segundos)

```bash
curl -X POST http://localhost:3001/api/queue/set-delay \
  -H "Content-Type: application/json" \
  -d '{"delay": 5000}'
```

## 📡 API Endpoints

### Mensajería

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/send-messages` | Enviar mensaje de texto |
| POST | `/api/send-medias` | Enviar archivo/media |
| POST | `/api/send-group` | Enviar mensaje a grupo |
| GET | `/status` | Estado del bot |

### Gestión de Cola (NUEVO)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/queue/stats` | Estadísticas de la cola |
| POST | `/api/queue/set-delay` | Configurar delay (ms) |
| POST | `/api/queue/clear` | Limpiar cola |

## 🧪 Scripts de Prueba

### Prueba Simple

```bash
node test-queue.js
```

### Prueba con PowerShell (Windows)

```powershell
.\ejemplos-uso.ps1
```

### Envío Masivo Controlado

```bash
# 1. Edita envio-masivo.js y agrega tus contactos
# 2. Ejecuta:
node envio-masivo.js
```

## ⚙️ Configuración del Sistema de Cola

### Configuración Actual

```javascript
{
  delayBetweenMessages: 3000,  // 3 segundos entre mensajes
  maxRetries: 3,                // 3 reintentos si falla
  retryDelay: 5000              // 5 segundos entre reintentos
}
```

### Valores Recomendados

| Velocidad | Delay | Uso |
|-----------|-------|-----|
| 🐢 Muy Seguro | 5-10 segundos | Campañas masivas |
| ⚖️ Balance | **3-5 segundos** | **Recomendado (default)** |
| 🐰 Rápido | 1-2 segundos | Urgente (con riesgo) |

### Modificar Configuración

Edita `src/helpers/messageQueue.js` línea 8-12:

```javascript
this.config = {
    delayBetweenMessages: 3000,  // Cambia esto
    maxRetries: 3,
    retryDelay: 5000
};
```

## 📊 Ejemplo de Envío Masivo

```javascript
const contactos = [
  "51987654321",
  "51987654322",
  "51987654323",
  // ... más números
];

// Enviar a todos (se procesan con cola automática)
for (const numero of contactos) {
  await fetch('http://localhost:3001/api/send-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      number: numero,
      message: "Hola! Este es un mensaje importante."
    })
  });
}

// Resultado:
// - Se agregan a la cola instantáneamente
// - Se envían uno por uno con 3 segundos de delay
// - Tiempo total: 20 mensajes × 3 seg = 60 segundos
```

## 🎯 Flujo del Sistema de Cola

```
┌─────────────┐
│ Solicitud 1 │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────┐    ┌─────────┐    ┌──────────┐
│ Solicitud 2 │──┼───→│   COLA   │───→│ Envío 1 │───→│ ⏱️ Delay │
└─────────────┘  │    └──────────┘    └─────────┘    └──────────┘
                 │                           ↓              ↓
┌─────────────┐  │                     ┌─────────┐    ┌──────────┐
│ Solicitud 3 │──┘                     │ Envío 2 │───→│ ⏱️ Delay │
└─────────────┘                        └─────────┘    └──────────┘
                                             ↓              ↓
                                       ┌─────────┐         ...
                                       │ Envío 3 │
                                       └─────────┘
```

## 📂 Estructura del Proyecto

```
baileys-bot/
├── src/
│   ├── index.js                      # Servidor principal
│   ├── controllers/
│   │   └── messageController.js      # Controladores (con cola)
│   └── helpers/
│       ├── formatter.js
│       └── messageQueue.js           # ⭐ Sistema de cola (NUEVO)
├── session/                          # Sesión de WhatsApp
├── public/                           # Archivos estáticos
├── uploads/                          # Archivos temporales
├── test-queue.js                     # Script de prueba
├── ejemplos-uso.ps1                  # Ejemplos PowerShell
├── envio-masivo.js                   # Envío masivo controlado
├── QUEUE_SYSTEM.md                   # Documentación completa
├── RESUMEN_COLA.md                   # Resumen rápido
└── package.json
```

## 🔍 Monitoreo

### Ver Logs en Tiempo Real

Al ejecutar `npm start`, verás logs como:

```
📥 Mensaje agregado a la cola (Posición: 3)
🚀 Iniciando procesamiento de cola (3 mensajes pendientes)
⏳ Procesando mensaje 1234567890 (text) a 51987654321
✅ Mensaje enviado exitosamente (2 restantes en cola)
⏱️ Esperando 3000ms antes del siguiente mensaje...
```

### Dashboard Web

Abre http://localhost:3001 para ver:
- Estado de conexión
- Estadísticas de mensajes
- Formularios de envío
- Documentación API

## 🚨 Solución de Problemas

### WhatsApp pone contador de límite

1. **Aumentar delay**: Cambiar a 5-10 segundos
   ```bash
   curl -X POST http://localhost:3001/api/queue/set-delay \
     -H "Content-Type: application/json" \
     -d '{"delay": 8000}'
   ```

2. **Reducir volumen**: Enviar menos mensajes por hora

3. **Limpiar cola**: Si ya hay muchos pendientes
   ```bash
   curl -X POST http://localhost:3001/api/queue/clear
   ```

### Mensajes no se envían

```bash
# 1. Verificar estado del bot
curl http://localhost:3001/status

# 2. Ver estado de la cola
curl http://localhost:3001/api/queue/stats

# 3. Revisar logs en la consola donde corre npm start
```

### Cola se atasca

```bash
# Limpiar la cola y reiniciar
curl -X POST http://localhost:3001/api/queue/clear

# O reiniciar el bot
# Ctrl+C y luego npm start
```

## 📚 Documentación Completa

- **QUEUE_SYSTEM.md** - Documentación detallada del sistema de cola
- **RESUMEN_COLA.md** - Resumen rápido para empezar
- **ejemplos-uso.ps1** - Ejemplos interactivos (PowerShell)
- **test-queue.js** - Script de prueba automatizado
- **envio-masivo.js** - Template para envíos masivos

## 🤝 Contribuir

Si encuentras bugs o tienes sugerencias:

1. Abre un issue
2. Haz un fork del repositorio
3. Crea una rama con tu feature
4. Envía un pull request

## 📝 Notas Importantes

- **Sesión persistente**: La sesión se guarda en `/session`
- **Cola volátil**: Si reinicias el servidor, se pierde la cola actual
- **Límites de WhatsApp**: Respeta los límites para evitar bloqueos
- **Backup**: Haz backup de la carpeta `/session` regularmente

## 🎉 ¡Listo para Usar!

```bash
# 1. Instalar
npm install

# 2. Iniciar
npm start

# 3. Escanear QR en http://localhost:3001

# 4. Enviar mensajes
curl -X POST http://localhost:3001/api/send-messages \
  -H "Content-Type: application/json" \
  -d '{"number": "51987654321", "message": "Funciona! 🚀"}'
```

---

**¿Preguntas?** Revisa la documentación en `QUEUE_SYSTEM.md`

**Desarrollado con ❤️ usando [Baileys](https://github.com/WhiskeySockets/Baileys)**
