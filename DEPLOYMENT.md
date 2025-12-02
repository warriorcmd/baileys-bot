# 🚀 Guía de Deployment en VPS

Guía completa para desplegar **Baileys WhatsApp Bot** en un servidor VPS (DigitalOcean, Linode, AWS EC2, Vultr, etc.).

## 📋 Requisitos Previos

- VPS con Ubuntu 20.04+ o Debian 11+
- Acceso SSH al servidor
- Dominio (opcional, pero recomendado)
- 1GB RAM mínimo
- 10GB almacenamiento mínimo

## 🔧 Instalación Rápida (Script Automático)

### Opción 1: Con Script Automático (Recomendado)

```bash
# Conectate al VPS
ssh root@tu_ip_vps

# Descarga el script
curl -O https://raw.githubusercontent.com/tu-usuario/baileys-bot/main/deploy.sh

# Dale permisos
chmod +x deploy.sh

# Ejecuta
./deploy.sh
```

### Opción 2: Instalación Manual Paso a Paso

#### Paso 1: Actualiza el Sistema
```bash
sudo apt update
sudo apt upgrade -y
```

#### Paso 2: Instala Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agrega tu usuario al grupo docker (opcional)
sudo usermod -aG docker $USER
newgrp docker
```

#### Paso 3: Instala Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

#### Paso 4: Clona el Repositorio
```bash
cd /opt
sudo git clone https://github.com/tu-usuario/baileys-bot.git
cd baileys-bot
sudo chown -R $USER:$USER .
```

#### Paso 5: Configura Nginx como Reverse Proxy (Opcional)

Instala Nginx:
```bash
sudo apt install nginx -y
```

Crea configuración:
```bash
sudo nano /etc/nginx/sites-available/baileys-bot
```

Pega esto:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activa:
```bash
sudo ln -s /etc/nginx/sites-available/baileys-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Paso 6: Configura SSL con Certbot (Recomendado)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

#### Paso 7: Inicia el Bot
```bash
cd /opt/baileys-bot
docker compose up -d
```

#### Paso 8: Verifica que está corriendo
```bash
docker compose logs -f
docker compose ps
```

---

## 📊 Configuración de Producción

### Environment Variables (.env)
Crea archivo `.env`:
```bash
nano .env
```

Contenido:
```env
PORT=3000
NODE_ENV=production
SESSION_PATH=/data/session
LOG_LEVEL=info
```

### Actualiza docker-compose.yml para producción

Reemplaza `docker-compose.yml` con esta configuración:

```yaml
version: "3.8"

services:
  baileys-bot:
    build: .
    container_name: baileys-bot
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./session:/usr/src/app/session
      - ./uploads:/usr/src/app/uploads
      - ./logs:/usr/src/app/logs
    ports:
      - "3000:3000"
    networks:
      - baileys-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  baileys-network:
    driver: bridge
```

---

## 🔐 Seguridad en Producción

### 1. Firewall (UFW)
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 2. Copia de Seguridad Automática
Crea script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/baileys-backup-$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# Backup de sesiones
tar -czf $BACKUP_FILE /opt/baileys-bot/session/ \
                       /opt/baileys-bot/.env

echo "Backup completado: $BACKUP_FILE"

# Elimina backups más antiguos de 7 días
find $BACKUP_DIR -name "baileys-backup-*.tar.gz" -mtime +7 -delete
```

Dale permisos:
```bash
chmod +x backup.sh
```

Agrega al crontab:
```bash
crontab -e

# Agrega esta línea (backup diario a las 3 AM)
0 3 * * * /opt/baileys-bot/backup.sh
```

### 3. Monitoreo y Logs
```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de último error
docker compose logs --tail 100

# Guardar logs
docker compose logs > logs.txt
```

---

## 🔄 Comandos Útiles en Producción

### Ver estado
```bash
docker compose ps
docker compose logs
```

### Reiniciar bot
```bash
docker compose restart
```

### Detener
```bash
docker compose down
```

### Reconstruir (después de cambios)
```bash
docker compose down
docker compose up --build -d
```

### Ejecutar comandos dentro del contenedor
```bash
docker compose exec baileys-bot npm start
docker compose exec baileys-bot node --version
```

---

## 📱 Acceder al Bot en VPS

### Por IP
```
http://tu-ip-vps:3000
```

### Por Dominio (si configuraste Nginx)
```
https://tu-dominio.com
```

---

## 🔌 Usar la API desde el VPS

### Enviar mensaje
```bash
curl -X POST https://tu-dominio.com/send-text \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "message": "Mensaje desde el VPS"
  }'
```

### Enviar archivo
```bash
curl -X POST https://tu-dominio.com/send-file \
  -F "number=573001234567" \
  -F "file=@documento.pdf"
```

### Ver estado
```bash
curl https://tu-dominio.com/status
```

---

## 🛠️ Solución de Problemas

### Bot no inicia
```bash
# Ver error
docker compose logs baileys-bot

# Reconstruir
docker compose down
docker compose up --build -d
```

### Puerto en uso
```bash
# Si el puerto 3000 está en uso
sudo lsof -i :3000
sudo kill -9 PID
```

### Problemas con sesión
```bash
# Eliminar sesión y forzar nuevo QR
rm -rf session/
docker compose restart
```

### Sin conexión a internet
```bash
# Verifica conectividad
docker compose exec baileys-bot ping -c 1 google.com

# Revisa DNS
docker compose exec baileys-bot cat /etc/resolv.conf
```

---

## 📈 Escalabilidad

### Para múltiples bots
Crea múltiples servicios en `docker-compose.yml`:

```yaml
services:
  baileys-bot-1:
    build: .
    container_name: baileys-bot-1
    ports:
      - "3000:3000"
    volumes:
      - ./session1:/usr/src/app/session

  baileys-bot-2:
    build: .
    container_name: baileys-bot-2
    ports:
      - "3001:3000"
    volumes:
      - ./session2:/usr/src/app/session
```

---

## 📊 Estadísticas del VPS

### Monitor de recursos
```bash
# Ver uso de CPU, RAM, disco
docker stats

# Ver logs tamaño
du -sh /opt/baileys-bot/
```

---

## 🚀 CI/CD con GitHub Actions (Opcional)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/baileys-bot
            git pull
            docker compose down
            docker compose up --build -d
            docker compose logs
```

Agrega secrets en GitHub:
- `VPS_HOST`: IP del VPS
- `VPS_SSH_KEY`: Clave SSH privada

---

## ✅ Checklist Final

- [ ] VPS con Ubuntu/Debian
- [ ] Docker y Docker Compose instalados
- [ ] Repositorio clonado
- [ ] `.env` configurado
- [ ] Docker iniciado
- [ ] Nginx configurado (si aplica)
- [ ] SSL configurado (si aplica)
- [ ] Firewall habilitado
- [ ] Backup automatizado
- [ ] Bot accesible desde navegador
- [ ] QR escaneado y bot autenticado
- [ ] API funcionando

---

**¿Preguntas?** Abre un issue o contacta al soporte. 🎉
