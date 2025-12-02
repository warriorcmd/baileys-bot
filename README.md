# 🤖 Baileys WhatsApp Bot

Un bot de WhatsApp construido con Node.js usando Baileys, Express y Docker. Permite enviar mensajes de texto y archivos a través de una interfaz web con escaneo de código QR.

## ✨ Características

- ✅ **Autenticación por QR**: Escanea un código QR desde la interfaz web
- ✅ **Interfaz Web Moderna**: Panel de control elegante y responsivo
- ✅ **Sesiones Persistentes**: Las credenciales se guardan automáticamente
- ✅ **API REST**: Endpoints para enviar mensajes y archivos
- ✅ **Containerizado con Docker**: Fácil de desplegar
- ✅ **Estado en Tiempo Real**: Monitorea la conexión del bot

## 🚀 Inicio Rápido

### Con Docker (Recomendado)

```bash
# 1. Navega al directorio del proyecto
cd baileys-bot

# 2. Construye y levanta los contenedores
docker compose up --build

# 3. Abre tu navegador en http://localhost:3000
```

### Sin Docker (Local)

```bash
# 1. Instala las dependencias
npm install

# 2. Inicia el bot
npm start

# 3. Abre tu navegador en http://localhost:3000
```

## 📱 Cómo Usar

1. **Accede a la interfaz web**: Abre `http://localhost:3000` en tu navegador
2. **Escanea el código QR**: Si no estás autenticado, aparecerá un código QR
3. **Abre WhatsApp en tu teléfono**: Ve a Configuración > Dispositivos Vinculados
4. **Escanea con tu teléfono**: Apunta la cámara al código QR en la pantalla
5. **Listo**: El bot se conectará automáticamente

## 🔌 Endpoints de la API

### GET `/` 
Interfaz web principal con código QR

**Respuesta**: Página HTML con el estado del bot y código QR

---

### GET `/status`
Obtiene el estado actual de la conexión

**Respuesta**:
```json
{
  "authenticated": true,
  "status": "connected",
  "timestamp": "2025-11-30T14:41:33.637Z"
}
```

---

### POST `/send-text`
Envía un mensaje de texto

**Body**:
```json
{
  "number": "573001234567",
  "message": "Hola, este es un mensaje de prueba"
}
```

**Respuesta**:
```json
{
  "status": "success",
  "message": "Mensaje enviado",
  "number": "573001234567",
  "timestamp": "2025-11-30T14:41:33.637Z"
}
```

---

### POST `/send-file`
Envía un archivo (PDF, imagen, video, etc.)

**Form Data**:
- `number`: Número de teléfono (ej: 573001234567)
- `file`: Archivo a enviar

**Respuesta**:
```json
{
  "status": "success",
  "message": "Archivo enviado",
  "number": "573001234567",
  "fileName": "documento.pdf",
  "timestamp": "2025-11-30T14:41:33.637Z"
}
```

## 📁 Estructura del Proyecto

```
baileys-bot/
├── src/
│   ├── index.js          # Aplicación principal con servidor Express
│   └── sender.js         # (Vacío - para extensión futura)
├── session/              # Archivos de sesión/credenciales (auto-generado)
├── uploads/              # Archivos temporales de carga (auto-generado)
├── public/               # Archivos estáticos (si necesitas agregar)
├── Dockerfile            # Configuración del contenedor
├── docker-compose.yml    # Orquestación de contenedores
├── package.json          # Dependencias del proyecto
└── README.md             # Este archivo
```

## 🛠️ Configuración

### Variables de Entorno (Opcional)

Puedes agregar un archivo `.env` para personalizar:

```env
PORT=3000
NODE_ENV=production
SESSION_PATH=./session
```

## 📦 Dependencias Principales

- **@whiskeysockets/baileys**: Cliente WhatsApp Web API
- **express**: Framework web
- **multer**: Manejo de carga de archivos
- **qrcode**: Generación de códigos QR
- **axios**: Cliente HTTP

## 🔒 Seguridad

- Las sesiones se guardan en la carpeta `session/` (incluye en `.gitignore`)
- Los archivos temporales se limpian automáticamente
- No compartas la carpeta `session/` públicamente
- Usa variables de entorno para datos sensibles

## 🐳 Docker

### Ver logs del contenedor
```bash
docker compose logs -f
```

### Detener el contenedor
```bash
docker compose down
```

### Reconstruir la imagen
```bash
docker compose up --build
```

## 🔄 Manejo de Sesiones

Las credenciales se guardan automáticamente en `./session/` después del primer escaneo QR. Esto permite:

- **Reconexión automática**: Si el contenedor se reinicia, usa la sesión guardada
- **Persistencia**: La sesión se mantiene entre reinicios
- **Privacidad**: Solo el contenedor tiene acceso a las credenciales

### Limpiar sesiones
Para forzar un nuevo escaneo QR, elimina la carpeta `session/`:

```bash
rm -rf session/
docker compose restart
```

## 🐛 Solución de Problemas

### El QR no aparece
- Verifica que Docker esté corriendo: `docker ps`
- Revisa los logs: `docker compose logs -f`
- Intenta actualizar la página: `Ctrl+F5`

### Error de autenticación
- Elimina la carpeta `session/` y reinicia
- Asegúrate de que WhatsApp esté actualizado en tu teléfono
- Intenta de nuevo en 30 segundos

### El bot se desconecta
- Verifica que tu teléfono tenga conexión a internet
- Es normal que se desconecte si cierras la sesión de WhatsApp Web
- El bot se reconectará automáticamente si la sesión es válida

## 📖 Ejemplos de Uso

### Con cURL

**Enviar mensaje:**
```bash
curl -X POST http://localhost:3000/send-text \
  -H "Content-Type: application/json" \
  -d '{"number":"573001234567","message":"Hola!"}'
```

**Verificar estado:**
```bash
curl http://localhost:3000/status
```

**Enviar archivo:**
```bash
curl -X POST http://localhost:3000/send-file \
  -F "number=573001234567" \
  -F "file=@documento.pdf"
```

### Con JavaScript (Fetch)

```javascript
// Enviar mensaje
fetch('http://localhost:3000/send-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: '573001234567',
    message: 'Mensaje desde JavaScript'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de abrir un issue o hacer un pull request.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## ⚠️ Disclaimer

Este bot es solo para propósitos educativos. Úsalo responsablemente y respeta los términos de servicio de WhatsApp.

---

**¿Preguntas?** Abre un issue en el repositorio. 🎉
