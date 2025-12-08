# 🚀 Guía: Sistema de Delay Dinámico Anti-Detección

## ⚠️ Problema Resuelto
WhatsApp detecta cuando envías mensajes con **delays fijos** (siempre el mismo tiempo). Esto llevó a que te pusieran un contador/límite.

## ✅ Solución Implementada
Ahora el sistema usa **delays dinámicos y aleatorios** que simulan comportamiento humano:

- ✅ Tiempo variable entre mensajes (no siempre el mismo)
- ✅ Pausas largas cada 5-7 mensajes (como si te distraes)
- ✅ Micro-variaciones aleatorias (±2 segundos)
- ✅ Presets configurables según tu situación

---

## 📋 Opciones de Configuración

### **Presets Disponibles**

| Preset | Delay Mínimo | Delay Máximo | Cuándo Usar |
|--------|--------------|--------------|-------------|
| `rapido` | 5s | 12s | ⚠️ Riesgoso - Solo si NO tienes límites |
| `moderado` | 8s | 20s | ✅ Uso normal sin límites |
| `seguro` | 15s | 35s | ✅ Tienes advertencia de WhatsApp |
| `ultra-seguro` | 20s | 45s | 🚨 Ya te pusieron contador/límite |

---

## 🎯 ¿Qué Preset Usar?

### 🔴 **Si WhatsApp te puso CONTADOR** (tu caso actual)
```javascript
// Edita envio-masivo.js línea 20:
const CONFIGURACION = {
    preset: 'ultra-seguro',  // ⚠️ CAMBIA A ESTO
    pausaEntreLotes: 180000, // 3 minutos entre lotes
    tamañoLote: 10,          // Solo 10 mensajes por lote
    patronHumano: true
};
```

**Recomendaciones adicionales:**
- Envía máximo 30-40 mensajes por hora
- Haz pausas de 10-15 minutos cada 10 mensajes
- No envíes durante 24-48 horas si te vuelve a limitar

---

### 🟡 **Si tienes advertencia pero sin contador**
```javascript
const CONFIGURACION = {
    preset: 'seguro',        // Balance entre velocidad y seguridad
    pausaEntreLotes: 120000, // 2 minutos entre lotes
    tamañoLote: 15,
    patronHumano: true
};
```

---

### 🟢 **Si NO tienes problemas**
```javascript
const CONFIGURACION = {
    preset: 'moderado',
    pausaEntreLotes: 60000, // 1 minuto entre lotes
    tamañoLote: 20,
    patronHumano: true
};
```

---

## 🛠️ Cómo Usar

### **Método 1: Usando envio-masivo.js (RECOMENDADO)**

1. **Edita la configuración** en `envio-masivo.js`:
```javascript
// Línea 20 - EDITA ESTO SEGÚN TU SITUACIÓN
const CONFIGURACION = {
    preset: 'ultra-seguro',  // ← CAMBIA AQUÍ
    pausaEntreLotes: 180000,
    tamañoLote: 10,
    patronHumano: true
};
```

2. **Agrega tus contactos** (línea 10):
```javascript
const CONTACTOS = [
    { numero: "51987654321", nombre: "Juan" },
    { numero: "51987654322", nombre: "María" },
    // ... más contactos
];
```

3. **Ejecuta el script**:
```powershell
node envio-masivo.js
```

---

### **Método 2: API (Para integrar con tu sistema)**

#### **Configurar Preset**
```javascript
// POST http://localhost:3001/api/queue/set-preset
{
  "preset": "ultra-seguro"
}
```

#### **Activar Patrón Humano**
```javascript
// POST http://localhost:3001/api/queue/set-human-pattern
{
  "enabled": true
}
```

#### **Enviar Mensaje** (funciona igual que antes)
```javascript
// POST http://localhost:3001/api/send-messages
{
  "number": "51987654321",
  "message": "Hola!"
}
```

---

### **Método 3: Configuración Manual**
```javascript
// En ejemplo-delay-dinamico.js
import messageQueue from './src/helpers/messageQueue.js';

// Delays completamente personalizados
messageQueue.setDelay(20000, 45000); // Min 20s, Max 45s
messageQueue.setHumanPattern(true);
```

---

## 📊 Monitorear el Sistema

### **Ver Estadísticas en Tiempo Real**
```javascript
// GET http://localhost:3001/api/queue/stats

// Respuesta:
{
  "totalQueued": 50,
  "totalSent": 23,
  "totalFailed": 1,
  "currentQueueSize": 27,
  "averageDelay": "24.5s",
  "isProcessing": true
}
```

### **Ver Info de la Cola**
```javascript
const info = messageQueue.getQueueInfo();
console.log(info);

// Muestra:
// - Mensajes pendientes
// - Tiempo estimado (rango)
// - Delay promedio
// - Mensajes consecutivos enviados
```

---

## 🎨 Ejemplos Prácticos

### **Ejemplo 1: Recuperación después de límite**
```javascript
// Si WhatsApp te limitó hace 1-2 días
const CONFIGURACION = {
    preset: 'ultra-seguro',
    pausaEntreLotes: 300000, // 5 minutos!
    tamañoLote: 5,           // Solo 5 por lote
    patronHumano: true
};

// Envía MÁXIMO 20-30 mensajes al día durante una semana
```

---

### **Ejemplo 2: Envío Normal**
```javascript
// Sin problemas con WhatsApp
const CONFIGURACION = {
    preset: 'moderado',
    pausaEntreLotes: 60000,
    tamañoLote: 20,
    patronHumano: true
};
```

---

### **Ejemplo 3: Modo Emergencia (Límite Activo)**
```javascript
import messageQueue from './src/helpers/messageQueue.js';

// Delays ULTRA largos
messageQueue.setDelay(45000, 90000); // 45-90 segundos
messageQueue.setHumanPattern(true);

// Envía 1 mensaje cada 1-2 minutos
// DETÉN TODO durante 24 horas si persiste el límite
```

---

## 🔍 Cómo Funciona

### **Delay Dinámico**
```javascript
// ANTES (detectado por WhatsApp):
Mensaje 1 → espera 6s → Mensaje 2 → espera 6s → Mensaje 3
//          ^^^^^^^^             ^^^^^^^^
//          Siempre igual = DETECTADO

// AHORA (parece humano):
Mensaje 1 → espera 15s → Mensaje 2 → espera 24s → Mensaje 3 → espera 12s
//          ^^^^^^^^              ^^^^^^^^              ^^^^^^^^
//          Aleatorio y variable = PARECE HUMANO
```

### **Patrón Humano**
```javascript
// Cada 5-7 mensajes, hace una pausa LARGA (25-40 segundos)
Mensaje 1 (delay 15s)
Mensaje 2 (delay 18s)
Mensaje 3 (delay 22s)
Mensaje 4 (delay 14s)
Mensaje 5 (delay 19s)
Mensaje 6 (delay 33s) ← PAUSA LARGA (como si te distraes)
Mensaje 7 (delay 16s)
// ... repite el patrón
```

---

## ⚡ Recomendaciones Importantes

### ✅ **SÍ hacer:**
- Usar preset `ultra-seguro` si tienes límite activo
- Activar `patronHumano: true` siempre
- Hacer pausas de horas/días si te limitan repetidamente
- Enviar lotes pequeños (5-15 mensajes)
- Monitorear las estadísticas

### ❌ **NO hacer:**
- Enviar más de 50 mensajes seguidos si tienes límite
- Usar preset `rapido` si ya te advirtieron
- Desactivar el patrón humano
- Ignorar las advertencias de WhatsApp
- Enviar 24/7 sin pausas

---

## 🆘 Solución de Problemas

### **Problema: WhatsApp sigue detectándome**
**Solución:**
1. Aumenta el preset a `ultra-seguro`
2. Reduce `tamañoLote` a 5-10
3. Aumenta `pausaEntreLotes` a 5-10 minutos
4. Descansa 24-48 horas

### **Problema: Es muy lento**
**Solución:**
- Si NO tienes límites, usa `moderado` o `seguro`
- NO aceleres si tienes límite activo
- La lentitud es necesaria para evitar detección

### **Problema: No puedo enviar ningún mensaje**
**Solución:**
1. Para todo durante 24-48 horas
2. Envía mensajes manualmente (5-10 por día)
3. Después de 3-5 días, intenta con `ultra-seguro`

---

## 📞 Contacto y Soporte

Si tienes dudas o problemas:
1. Revisa los logs en la consola
2. Verifica las estadísticas: `GET /api/queue/stats`
3. Ajusta el preset según tu situación

---

## 🎯 Resumen Rápido

**Para tu caso actual (con contador de WhatsApp):**

```javascript
// envio-masivo.js
const CONFIGURACION = {
    preset: 'ultra-seguro',  // ← USA ESTO
    pausaEntreLotes: 300000, // 5 minutos
    tamañoLote: 5,           // Solo 5 por lote
    patronHumano: true       // ← SIEMPRE true
};

// Y envía MÁXIMO 20-30 mensajes al día
```

**Ejecutar:**
```powershell
node envio-masivo.js
```

¡Listo! El sistema ahora simula comportamiento humano y es mucho más difícil de detectar. 🚀
