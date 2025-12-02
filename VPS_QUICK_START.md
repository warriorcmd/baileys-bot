# 🚀 Guía Rápida: Desplegar Baileys Bot en VPS

## ⚡ Instalación Automática (1 Comando)

Si tu VPS es **Ubuntu 20.04+** o **Debian 11+**:

```bash
# Conectate como root
ssh root@tu_ip_vps

# Descarga y ejecuta el script
curl -O https://raw.githubusercontent.com/tu-usuario/baileys-bot/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

El script hará automáticamente:
- ✅ Actualizar el sistema
- ✅ Instalar Docker y Docker Compose
- ✅ Clonar el repositorio
- ✅ Construir y lanzar el bot
- ✅ (Opcional) Instalar Nginx
- ✅ (Opcional) Configurar firewall

**Tiempo estimado: 5-10 minutos**

---

## 🎯 Instalación Manual Rápida (Si prefieres paso a paso)

```bash
# 1. SSH al VPS
ssh root@tu_ip_vps

# 2. Instalar Docker
curl -fsSL https://get.docker.com | sh

# 3. Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Clonar el proyecto
cd /opt
git clone https://github.com/tu-usuario/baileys-bot.git
cd baileys-bot

# 5. Iniciar el bot
docker compose up -d

# 6. Ver que está corriendo
docker compose ps
docker compose logs -f
```

**Accede en:** `http://tu-ip-vps:3000`

---

## 🌐 Configurar Dominio + SSL (Opcional)

Si tienes un dominio y quieres HTTPS:

```bash
# 1. Ejecutar script de Nginx + SSL
bash setup-nginx.sh

# Te pedirá tu dominio (ej: bot.tuempresa.com)
# El script hace todo automáticamente:
# - Instala Nginx
# - Genera certificado SSL automático
# - Configura renovación automática cada 3 meses
```

**Después, accede en:** `https://tu-dominio.com`

---

## 🔧 Comandos Útiles en Producción

```bash
# Ver estado del bot
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver últimos 50 logs
docker compose logs --tail 50

# Reiniciar bot
docker compose restart

# Detener bot
docker compose down

# Reconstruir (después de cambios)
docker compose down && docker compose up --build -d
```

---

## 💾 Backup y Restauración

```bash
# Hacer backup de sesiones y config
tar -czf backup-$(date +%Y%m%d).tar.gz session/ .env

# Restaurar backup
tar -xzf backup-20250101.tar.gz
docker compose restart
```

**O usa el script de mantenimiento:**
```bash
bash maintenance.sh
```

---

## 📊 Monitoreo

```bash
# Ver uso de CPU, RAM, etc.
docker stats

# Ver tamaño de carpetas
du -sh session/ uploads/

# Ver espacio disponible
df -h
```

---

## 🔒 Seguridad (Firewall)

```bash
# Habilitar UFW
ufw enable

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP
ufw allow 80/tcp

# Permitir HTTPS
ufw allow 443/tcp

# Ver estado
ufw status
```

---

## 🆘 Solución de Problemas

### El bot no inicia
```bash
# Ver error detallado
docker compose logs baileys-bot

# Reconstruir
docker compose down
docker image rm baileys-bot-baileys-bot
docker compose up --build -d
```

### Puerto 3000 ya está en uso
```bash
# Ver qué está usando el puerto
lsof -i :3000

# Matar el proceso (PID es el número)
kill -9 PID
```

### Sin conexión a WhatsApp
```bash
# Eliminar sesión antigua
rm -rf session/

# Forzar nuevo escaneo QR
docker compose restart
```

### Problemas de SSL/Nginx
```bash
# Probar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Ver certificado
certbot certificates
```

---

## 📱 Usar la API desde el VPS

### Enviar mensaje
```bash
curl -X POST https://tu-dominio.com/send-text \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "message": "¡Hola desde el VPS!"
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

## 📈 Escalabilidad

### Para múltiples bots (ej: 3 bots)

Edita `docker-compose.yml`:

```yaml
version: "3.8"

services:
  bot1:
    build: .
    container_name: baileys-bot-1
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./session1:/usr/src/app/session
      - ./uploads1:/usr/src/app/uploads

  bot2:
    build: .
    container_name: baileys-bot-2
    restart: always
    ports:
      - "3001:3000"
    volumes:
      - ./session2:/usr/src/app/session
      - ./uploads2:/usr/src/app/uploads

  bot3:
    build: .
    container_name: baileys-bot-3
    restart: always
    ports:
      - "3002:3000"
    volumes:
      - ./session3:/usr/src/app/session
      - ./uploads3:/usr/src/app/uploads
```

Luego:
```bash
docker compose up -d
```

---

## 🔄 Actualizaciones Automáticas (GitHub Actions)

Crea `.github/workflows/deploy.yml` en tu repo:

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/baileys-bot
            git pull
            docker compose up --build -d
```

Agrega en GitHub (Settings > Secrets):
- `VPS_HOST`: IP del VPS
- `VPS_SSH_KEY`: Tu clave SSH privada

---

## 📋 Checklist Pre-Producción

- [ ] VPS contratado (DigitalOcean, AWS, Linode, etc.)
- [ ] IP asignada y SSH funcionando
- [ ] Docker instalado
- [ ] Repositorio clonado
- [ ] Bot lanzado y funcionando
- [ ] QR escaneado desde navegador
- [ ] Nginx instalado (si usas dominio)
- [ ] SSL configurado (si usas dominio)
- [ ] Firewall habilitado
- [ ] Backup configurado
- [ ] Monitoreo activo

---

## 💡 Proveedores VPS Recomendados

- **DigitalOcean**: $5-6/mes (1GB RAM, 25GB SSD)
- **Linode**: $5/mes (1GB RAM, 25GB SSD)
- **Vultr**: $2.50/mes (512MB RAM, 10GB SSD)
- **AWS EC2**: Primer año gratis (t2.micro)
- **Contabo**: €3/mes (4GB RAM, 200GB SSD)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `docker compose logs -f`
2. Consulta DEPLOYMENT.md en el repo
3. Abre un issue en GitHub
4. Contacta al soporte del VPS

---

**¡Tu bot estará en producción en minutos! 🚀**
