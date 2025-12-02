# 📦 Archivos Generados para Deployment

Este documento lista todos los archivos y recursos creados para desplegar Baileys Bot en VPS.

## 📁 Estructura del Proyecto Actual

```
baileys-bot/
├── src/
│   ├── index.js          ← Bot con interfaz web QR
│   └── sender.js         ← (Vacío para expansión)
├── session/              ← Credenciales guardadas (NO subir a git)
├── uploads/              ← Archivos temporales
├── Dockerfile            ← Construcción Docker
├── docker-compose.yml    ← Orquestación de contenedores
├── package.json          ← Dependencias Node
├── .env                  ← Variables de entorno
├── .gitignore            ← Archivos ignorados por git
│
├── README.md             ← Documentación principal
├── DEPLOYMENT.md         ← Guía completa de deployment
├── VPS_QUICK_START.md    ← Guía rápida para VPS
│
├── deploy.sh             ← Script de instalación automática
├── setup-nginx.sh        ← Script para Nginx + SSL
└── maintenance.sh        ← Script de mantenimiento

```

---

## 🎯 Scripts de Instalación

### 1. **deploy.sh** - Instalación Automática Completa
**Uso:**
```bash
ssh root@tu-vps
curl -O https://raw.githubusercontent.com/tu-usuario/baileys-bot/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

**Qué hace:**
- ✅ Actualiza el sistema
- ✅ Instala Docker + Docker Compose
- ✅ Clona el repositorio
- ✅ Construye la imagen
- ✅ Inicia el bot
- ✅ (Opcional) Instala Nginx
- ✅ (Opcional) Configura firewall

**Tiempo:** 5-10 minutos

---

### 2. **setup-nginx.sh** - Configurar Dominio + SSL
**Uso:**
```bash
bash setup-nginx.sh
```

**Qué hace:**
- ✅ Instala Nginx
- ✅ Genera certificado SSL (Let's Encrypt)
- ✅ Configura renovación automática
- ✅ Mapea tu dominio al bot

**Requisitos:**
- Dominio apuntando a tu VPS
- Ya tener deploy.sh ejecutado

---

### 3. **maintenance.sh** - Herramienta de Mantenimiento
**Uso:**
```bash
bash maintenance.sh
```

**Menú interactivo con opciones:**
1. Ver estado del bot
2. Ver logs en tiempo real
3. Ver últimos 50 logs
4. Reiniciar bot
5. Detener bot
6. Hacer backup
7. Restaurar backup
8. Ver uso de recursos
9. Limpiar logs antiguos
10. Actualizar bot (git pull)
11. Reconstruir imagen Docker

---

## 📚 Documentación

### 1. **README.md** (Principal)
Características, inicio rápido, endpoints, estructura del proyecto

### 2. **DEPLOYMENT.md** (Completa)
- Instalación manual paso a paso
- Configuración de producción
- Seguridad y backups
- Monitoreo y CI/CD
- Troubleshooting

### 3. **VPS_QUICK_START.md** (Rápida)
- Comandos esenciales
- Instalación automática
- Dominio + SSL
- Solución de problemas
- Proveedores VPS recomendados

---

## 🔐 Seguridad en Producción

### Variables de Entorno (.env)
```env
NODE_ENV=production
PORT=3000
SESSION_PATH=/usr/src/app/session
LOG_LEVEL=info
```

### Firewall
```bash
ufw enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
```

### Backups Automáticos
```bash
# En crontab (cada 3 AM)
0 3 * * * /opt/baileys-bot/backup.sh
```

---

## 📊 Monitoreo

### Ver Logs
```bash
# Tiempo real
docker compose logs -f

# Últimos 50
docker compose logs --tail 50

# Guardar a archivo
docker compose logs > logs.txt
```

### Ver Recursos
```bash
# CPU, RAM, disco
docker stats

# Tamaño de carpetas
du -sh session/ uploads/ logs/
```

---

## 🔧 Mantenimiento Básico

### Reiniciar Bot
```bash
docker compose restart
```

### Detener Bot
```bash
docker compose down
```

### Reconstruir (después de cambios)
```bash
docker compose down
docker compose up --build -d
```

### Ver Estado
```bash
docker compose ps
curl http://localhost:3000/status
```

---

## 🚀 Flujo de Deployment

```
1. Contrata VPS
   ↓
2. Conecta por SSH
   ↓
3. Ejecuta deploy.sh
   ↓
4. Espera 5-10 minutos
   ↓
5. Accede a http://ip:3000
   ↓
6. Escanea QR con teléfono
   ↓
7. ¡Bot listo!
   ↓
8. (Opcional) Ejecuta setup-nginx.sh para dominio + SSL
   ↓
9. (Recomendado) Ejecuta maintenance.sh para monitoreo
```

---

## 💡 Recomendaciones

### Para Producción
- ✅ Usar SSL/HTTPS
- ✅ Configurar firewall
- ✅ Hacer backups regulares
- ✅ Monitorear recursos
- ✅ Mantener sistema actualizado
- ✅ Usar variables de entorno
- ✅ Habilitar reinicio automático (restart: always)

### Escalabilidad
- Para múltiples bots: Usar múltiples servicios en docker-compose.yml
- Para alta carga: Usar load balancer con Nginx
- Para persistencia: Usar base de datos (PostgreSQL, MongoDB)
- Para logs: Usar servicio de logging (ELK Stack, DataDog)

---

## 📞 Proveedores VPS Recomendados

| Proveedor | Precio | RAM | SSD | Recomendación |
|-----------|--------|-----|-----|---------------|
| DigitalOcean | $5/mes | 1GB | 25GB | ⭐⭐⭐⭐⭐ Mejor |
| Linode | $5/mes | 1GB | 25GB | ⭐⭐⭐⭐⭐ Bueno |
| Vultr | $2.50/mes | 512MB | 10GB | ⭐⭐⭐⭐ Básico |
| AWS EC2 | Gratis 1año | 1GB | 30GB | ⭐⭐⭐⭐ Complejo |
| Contabo | €3/mes | 4GB | 200GB | ⭐⭐⭐⭐ Mejor valor |

---

## 🆘 Soporte

### Si tienes problemas:

1. **Ver logs:**
   ```bash
   docker compose logs -f
   ```

2. **Leer documentación:**
   - DEPLOYMENT.md (completa)
   - VPS_QUICK_START.md (rápida)

3. **Troubleshooting:**
   - Revisa sección de problemas en documentación
   - Verifica firewall
   - Comprueba puerto no está ocupado
   - Intenta reconstruir imagen

4. **Contacto:**
   - Abre issue en GitHub
   - Contacta soporte del VPS
   - Consulta documentación oficial de Docker

---

## ✅ Checklist de Deployment

- [ ] VPS contratado y accesible
- [ ] SSH funcionando
- [ ] deploy.sh ejecutado exitosamente
- [ ] Bot corriendo (docker compose ps)
- [ ] QR visible en http://ip:3000
- [ ] Teléfono emparejado con el QR
- [ ] API funcionando (/status)
- [ ] Nginx instalado (opcional)
- [ ] SSL configurado (opcional)
- [ ] Firewall habilitado
- [ ] Backups configurados
- [ ] Monitoreo activo

---

## 🎉 ¡Listo para Producción!

Tu bot Baileys estará corriendo 24/7 en el VPS. 

**Próximos pasos opcionales:**
- Agregar autenticación a los endpoints
- Implementar webhooks para recibir mensajes
- Conectar a base de datos para historial
- Crear dashboard de administración
- Escalar a múltiples bots

---

**Documentación actualizada:** 30 de noviembre de 2025
**Versión del bot:** 1.0.0
**Node.js:** 20+
**Docker:** Última versión disponible
