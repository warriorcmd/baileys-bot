#!/bin/bash

# Script para configurar Nginx y SSL en el VPS
# Uso: bash setup-nginx.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🔒 Configurar Nginx + SSL Automático             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [[ $EUID -ne 0 ]]; then
   echo "Este script debe ejecutarse como root"
   exit 1
fi

# Obtener dominio
read -p "Ingresa tu dominio (ej: baileys.ejemplo.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "Dominio no puede estar vacío"
    exit 1
fi

# Instalar Nginx y Certbot
echo ""
echo -e "${YELLOW}Instalando Nginx y Certbot...${NC}"
apt install nginx certbot python3-certbot-nginx -y

# Crear configuración Nginx
echo ""
echo -e "${YELLOW}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts para WebSocket
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Limitar tamaño de archivo
    client_max_body_size 50M;
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar configuración
nginx -t
if [ $? -ne 0 ]; then
    echo "Error en configuración de Nginx"
    exit 1
fi

# Iniciar Nginx
systemctl restart nginx
echo -e "${GREEN}[✓]${NC} Nginx configurado"

# Obtener SSL
echo ""
echo -e "${YELLOW}Obteniendo certificado SSL...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m "noreply@$DOMAIN" -n

# Verificar SSL
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[✓]${NC} SSL instalado correctamente"
else
    echo "Error al instalar SSL"
    exit 1
fi

# Renovación automática
systemctl enable certbot.timer
systemctl start certbot.timer

# Resumen
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Configuración Completada                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Tu bot está disponible en:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "🔐 Información SSL:"
certbot certificates -d $DOMAIN
echo ""
echo "🔄 Renovación automática: Habilitada"
echo ""
echo "✅ ¡Listo para producción! 🎉"
