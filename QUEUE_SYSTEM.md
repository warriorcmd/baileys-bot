# Sistema de Cola de Mensajes - WhatsApp Bot

## 📋 Descripción

Este bot ahora implementa un **sistema de cola (queue)** que envía mensajes de forma **secuencial** con un **delay configurable** entre cada mensaje. Esto evita que WhatsApp detecte spam y te bloquee con un contador de límite.

## ⚙️ Configuración Predeterminada

- **Delay entre mensajes**: 3 segundos (3000ms)
- **Reintentos por mensaje**: 3 intentos
- **Delay entre reintentos**: 5 segundos

## 🚀 Cómo Funciona

### Envío Automático con Cola

Cuando envías mensajes, ahora se agregan a una **cola de espera** y se procesan uno por uno:

1. ✅ El mensaje se agrega a la cola
2. ⏳ Espera su turno (si hay otros mensajes)
3. 📤 Se envía el mensaje
4. ⏱️ Espera el delay configurado (3 segundos por defecto)
5. 🔄 Continúa con el siguiente mensaje

### Ejemplo Visual

```
Mensaje 1 → [Cola] → Envío → ⏱️ 3 segundos → Mensaje 2 → Envío → ⏱️ 3 segundos → Mensaje 3
```

## 🔗 Nuevos Endpoints API

### 1. Ver Estado de la Cola

**GET** `/api/queue/stats`

Obtiene estadísticas de la cola y mensajes procesados.

**Respuesta:**
```json
{
  "status": true,
  "stats": {
    "totalQueued": 15,
    "totalSent": 12,
    "totalFailed": 0,
    "currentQueueSize": 3,
    "isProcessing": true,
    "config": {
      "delayBetweenMessages": 3000,
      "maxRetries": 3,
      "retryDelay": 5000
    }
  },
  "queueInfo": {
    "queueSize": 3,
    "isProcessing": true,
    "nextMessage": {
      "position": 1,
      "type": "text",
      "addedAt": "2025-12-06T10:30:00.000Z",
      "retries": 0
    },
    "estimatedWaitTime": 9000
  }
}
```

### 2. Configurar Delay Entre Mensajes

**POST** `/api/queue/set-delay`

Cambia el tiempo de espera entre cada mensaje.

**Body:**
```json
{
  "delay": 5000
}
```

**Valores recomendados:**
- **1000-2000ms**: Rápido (más riesgo de bloqueo)
- **3000-5000ms**: Recomendado (balance)
- **5000-10000ms**: Seguro (más lento pero sin riesgos)

**Respuesta:**
```json
{
  "status": true,
  "message": "Delay configurado a 5000ms",
  "config": {
    "delayBetweenMessages": 5000,
    "maxRetries": 3,
    "retryDelay": 5000
  }
}
```

### 3. Limpiar Cola de Mensajes

**POST** `/api/queue/clear`

Cancela todos los mensajes pendientes en la cola.

**Respuesta:**
```json
{
  "status": true,
  "message": "Cola limpiada exitosamente",
  "canceled": 5
}
```

## 📤 Enviar Mensajes (Ahora con Cola)

Los endpoints existentes ahora usan automáticamente la cola:

### Enviar Mensaje de Texto

**POST** `/api/send-messages`

```json
{
  "number": "51987654321",
  "message": "Hola, este es un mensaje desde el bot"
}
```

**Respuesta:**
```json
{
  "status": true,
  "message": "Mensaje agregado a la cola de envío",
  "response": { ... },
  "queueInfo": {
    "queueSize": 3,
    "isProcessing": true,
    "estimatedWaitTime": 9000
  }
}
```

### Enviar Archivo

**POST** `/api/send-medias`

```
Content-Type: multipart/form-data

number: 51987654321
file: [archivo adjunto]
caption: "Aquí está el documento"
```

### Enviar a Grupo

**POST** `/api/send-group`

```json
{
  "groupJid": "120363391775280682@g.us",
  "message": "Hola grupo!"
}
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Enviar Múltiples Mensajes

```javascript
// Enviar 10 mensajes - se procesarán automáticamente con delay
const numbers = [
  "51987654321",
  "51987654322",
  "51987654323",
  // ... más números
];

for (const number of numbers) {
  await fetch('http://localhost:3001/api/send-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      number: number,
      message: "Mensaje masivo controlado"
    })
  });
}

// Todos se agregarán a la cola y se enviarán uno por uno con delay de 3 segundos
```

### Ejemplo 2: Configurar Delay para Campaña Masiva

```javascript
// Configurar delay de 5 segundos para envío más seguro
await fetch('http://localhost:3001/api/queue/set-delay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ delay: 5000 })
});

// Ahora enviar mensajes masivos
// Se enviarán con 5 segundos de diferencia
```

### Ejemplo 3: Monitorear Cola en Tiempo Real

```javascript
// Función para monitorear la cola
setInterval(async () => {
  const response = await fetch('http://localhost:3001/api/queue/stats');
  const data = await response.json();
  
  console.log(`Cola: ${data.stats.currentQueueSize} mensajes`);
  console.log(`Enviados: ${data.stats.totalSent}`);
  console.log(`Procesando: ${data.stats.isProcessing}`);
}, 2000); // Cada 2 segundos
```

### Ejemplo 4: Cancelar Envíos Pendientes

```javascript
// Si necesitas cancelar todos los mensajes en cola
await fetch('http://localhost:3001/api/queue/clear', {
  method: 'POST'
});

console.log('Todos los mensajes pendientes fueron cancelados');
```

## 🔧 Configuración Avanzada

### Modificar Configuración Directamente

Si necesitas cambiar otros parámetros, edita el archivo:
`src/helpers/messageQueue.js`

```javascript
this.config = {
    delayBetweenMessages: 3000,  // Delay entre mensajes
    maxRetries: 3,                // Reintentos por mensaje
    retryDelay: 5000              // Delay entre reintentos
};
```

## 📊 Logs en Consola

El sistema muestra logs detallados:

```
📥 Mensaje agregado a la cola (Posición: 3)
🚀 Iniciando procesamiento de cola (3 mensajes pendientes)
⏳ Procesando mensaje 1234567890.123 (text) a 51987654321
✅ Mensaje enviado exitosamente (2 restantes en cola)
⏱️ Esperando 3000ms antes del siguiente mensaje...
```

## 🎯 Recomendaciones

### Para Evitar Bloqueos de WhatsApp

1. **Delay recomendado**: 3-5 segundos entre mensajes
2. **Máximo por hora**: No más de 60-100 mensajes/hora
3. **Horarios**: Enviar en horarios naturales (9am - 9pm)
4. **Contenido**: Evitar mensajes idénticos a muchos contactos

### Para Campañas Masivas

```javascript
// 1. Configurar delay más largo
await setDelay(5000); // 5 segundos

// 2. Enviar en lotes pequeños
const lotes = dividirEnLotes(contactos, 50); // 50 por lote

for (const lote of lotes) {
  await enviarLote(lote);
  await esperarTiempo(300000); // Esperar 5 minutos entre lotes
}
```

## ⚠️ Importante

- Los mensajes en cola se **procesan automáticamente**
- Si reinicias el servidor, se **perderá la cola actual**
- Los mensajes se reintentan **hasta 3 veces** en caso de error
- El delay mínimo es **1000ms (1 segundo)**

## 🔍 Solución de Problemas

### Si WhatsApp te pone contador

1. **Aumentar delay**: Cambiar a 5-10 segundos
2. **Reducir volumen**: Enviar menos mensajes por hora
3. **Limpiar cola**: Si ya hay muchos mensajes pendientes
4. **Esperar**: Dejar pasar unas horas antes de continuar

### Si los mensajes no se envían

```bash
# Verificar estado de la cola
curl http://localhost:3001/api/queue/stats

# Verificar que el bot esté conectado
curl http://localhost:3001/status
```

## 📞 Soporte

Si tienes problemas, verifica los logs del servidor:

```bash
npm start
# Observa los logs en consola para ver el procesamiento de la cola
```

---

✅ **Sistema de cola implementado exitosamente**
🚀 **Envíos seguros y controlados**
⏱️ **Sin riesgo de bloqueo por spam**
