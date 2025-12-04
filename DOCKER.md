# 🐳 Docker - Baileys WhatsApp Bot

Guía completa para desplegar el bot con Docker.

---

## 🚀 Inicio Rápido

### 1. **Construir y ejecutar con Docker Compose**

```bash
# Construir la imagen
docker-compose build

# Iniciar el contenedor
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 2. **Acceder al Dashboard**
Abre tu navegador en: `http://localhost:3000`

### 3. **Escanear QR**
El código QR aparecerá en el dashboard para autenticar tu WhatsApp.

---

## 📦 Comandos Docker Útiles

### Gestión del Contenedor

```bash
# Iniciar el bot
docker-compose up -d

# Detener el bot
docker-compose down

# Reiniciar el bot
docker-compose restart

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Acceder al contenedor
docker-compose exec baileys-bot sh
```

### Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen de sesión
docker volume inspect baileys-bot_session

# Limpiar volúmenes no usados
docker volume prune
```

### Reconstruir después de cambios

```bash
# Reconstruir la imagen
docker-compose build --no-cache

# Recrear contenedor
docker-compose up -d --force-recreate
```

---

## 🔧 Configuración Personalizada

### Cambiar Puerto

Edita `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Puerto_Host:Puerto_Contenedor
```

### Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
PORT=3000
NODE_ENV=production
```

Luego actualiza `docker-compose.yml`:

```yaml
services:
  baileys-bot:
    env_file:
      - .env
```

---

## 📂 Volúmenes Persistentes

Los datos importantes se guardan en volúmenes:

```yaml
volumes:
  - ./session:/usr/src/app/session   # Sesión de WhatsApp
  - ./uploads:/usr/src/app/uploads   # Archivos temporales
```

**Importante:** 
- `session/` contiene las credenciales de WhatsApp
- **NO** subas `session/` a GitHub
- Si pierdes `session/`, deberás escanear el QR nuevamente

---

## 🔄 Actualizar el Bot

```bash
# 1. Detener el contenedor
docker-compose down

# 2. Obtener cambios del repositorio
git pull origin main

# 3. Reconstruir la imagen
docker-compose build

# 4. Iniciar nuevamente
docker-compose up -d
```

---

## 🐛 Solución de Problemas

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs baileys-bot

# Verificar que el puerto esté libre
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Linux/Mac
```

### Permisos de archivos (Linux)

```bash
# Dar permisos a las carpetas
chmod -R 777 session uploads
```

### Error "Cannot find module"

```bash
# Reconstruir sin caché
docker-compose build --no-cache
docker-compose up -d
```

### Limpiar y empezar de nuevo

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker rmi baileys-bot

# Reconstruir desde cero
docker-compose up -d --build
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Estadísticas en tiempo real
docker stats baileys-bot

# Inspeccionar contenedor
docker inspect baileys-bot
```

### Logs por fecha

```bash
# Últimas 100 líneas
docker-compose logs --tail=100

# Logs desde hace 1 hora
docker-compose logs --since 1h
```

---

## 🌐 Despliegue en Producción

### Con Nginx como Reverse Proxy

```nginx
server {
    listen 80;
    server_name bot.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Con SSL (Certbot)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d bot.tudominio.com
```

---

## 🔐 Seguridad

### Buenas prácticas

1. **No exponer el puerto directamente** - Usa un reverse proxy
2. **Implementa autenticación** - Protege el dashboard con usuario/contraseña
3. **Usa HTTPS** - Siempre en producción
4. **Backups** - Respalda la carpeta `session/` regularmente
5. **Actualiza dependencias** - Mantén Node.js y paquetes actualizados

### Backup de sesión

```bash
# Crear backup
docker cp baileys-bot:/usr/src/app/session ./session-backup

# Restaurar backup
docker cp ./session-backup/. baileys-bot:/usr/src/app/session
docker-compose restart
```

---

## 📝 Docker Compose Avanzado

Archivo `docker-compose.prod.yml` para producción:

```yaml
services:
  baileys-bot:
    build: .
    container_name: baileys-bot
    restart: always
    environment:
      - NODE_ENV=production
    volumes:
      - ./session:/usr/src/app/session
      - ./uploads:/usr/src/app/uploads
    ports:
      - "127.0.0.1:3000:3000"  # Solo localhost
    networks:
      - bot-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  bot-network:
    driver: bridge
```

Usar configuración de producción:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Multi-Stage Build (Optimizado)

Dockerfile optimizado:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN mkdir -p session uploads && \
    chown -R node:node session uploads
USER node
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 💡 Tips Adicionales

1. **Desarrollo Local**: Monta el código como volumen
   ```yaml
   volumes:
     - .:/usr/src/app
     - /usr/src/app/node_modules
   ```

2. **Variables de entorno sensibles**: Usa Docker Secrets
3. **Healthcheck**: Añade verificación de salud
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/status"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

---

¿Necesitas ayuda? Revisa los logs con:
```bash
docker-compose logs -f baileys-bot
```
