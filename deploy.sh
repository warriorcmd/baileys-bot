#!/bin/bash

# Script de instalación automática para Baileys Bot en VPS
# Uso: bash deploy.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🤖 Baileys WhatsApp Bot - VPS Auto Deploy Script      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar si es root o tiene sudo
if [[ $EUID -ne 0 ]]; then
   print_error "Este script debe ejecutarse como root o con sudo"
   exit 1
fi

# Paso 1: Actualizar sistema
echo ""
echo -e "${YELLOW}Paso 1: Actualizando sistema...${NC}"
apt update
apt upgrade -y
print_status "Sistema actualizado"

# Paso 2: Instalar Docker
echo ""
echo -e "${YELLOW}Paso 2: Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_status "Docker instalado"
else
    print_status "Docker ya está instalado"
fi

# Paso 3: Instalar Docker Compose
echo ""
echo -e "${YELLOW}Paso 3: Instalando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose instalado"
else
    print_status "Docker Compose ya está instalado"
fi

# Paso 4: Instalar Git
echo ""
echo -e "${YELLOW}Paso 4: Instalando Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install git -y
    print_status "Git instalado"
else
    print_status "Git ya está instalado"
fi

# Paso 5: Clonar repositorio
echo ""
echo -e "${YELLOW}Paso 5: Clonando repositorio...${NC}"
if [ ! -d "/opt/baileys-bot" ]; then
    mkdir -p /opt
    cd /opt
    read -p "Ingresa la URL del repositorio GitHub (ej: https://github.com/tu-usuario/baileys-bot.git): " REPO_URL
    git clone "$REPO_URL" baileys-bot
    cd baileys-bot
    print_status "Repositorio clonado"
else
    print_warning "La carpeta /opt/baileys-bot ya existe"
    cd /opt/baileys-bot
    git pull
    print_status "Repositorio actualizado"
fi

# Paso 6: Crear archivo .env
echo ""
echo -e "${YELLOW}Paso 6: Configurando variables de entorno...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=3000
SESSION_PATH=/usr/src/app/session
LOG_LEVEL=info
EOF
    print_status "Archivo .env creado"
else
    print_warning "El archivo .env ya existe"
fi

# Paso 7: Iniciar Docker daemon
echo ""
echo -e "${YELLOW}Paso 7: Iniciando Docker...${NC}"
systemctl start docker
systemctl enable docker
print_status "Docker iniciado"

# Paso 8: Construir e iniciar contenedor
echo ""
echo -e "${YELLOW}Paso 8: Construyendo e iniciando el bot...${NC}"
docker compose up --build -d
print_status "Bot iniciado en modo daemon"

# Paso 9: Esperar a que esté listo
echo ""
echo -e "${YELLOW}Esperando a que el bot esté listo...${NC}"
sleep 10

# Paso 10: Verificar estado
echo ""
echo -e "${YELLOW}Paso 9: Verificando estado...${NC}"
if docker compose ps | grep -q "baileys-bot"; then
    print_status "Bot está corriendo ✓"
else
    print_error "Error: El bot no está corriendo"
    docker compose logs
    exit 1
fi

# Paso 11: Instalar Nginx (opcional)
echo ""
read -p "¿Deseas instalar Nginx como reverse proxy? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Instalando Nginx...${NC}"
    apt install nginx -y
    
    # Crear configuración
    cat > /etc/nginx/sites-available/baileys-bot << EOF
server {
    listen 80;
    server_name _;

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
    }
}
EOF

    ln -sf /etc/nginx/sites-available/baileys-bot /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
    print_status "Nginx configurado"
fi

# Paso 12: Configurar firewall
echo ""
read -p "¿Deseas configurar UFW firewall? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Configurando firewall...${NC}"
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw status
    print_status "Firewall configurado"
fi

# Resumen final
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Instalación Completada                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Información del VPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Ubicación: /opt/baileys-bot"
echo "🌐 URL: http://$(hostname -I | awk '{print $1}')"
echo "🔌 Puerto: 3000"
echo ""
echo "📋 Comandos útiles:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ver logs:              docker compose -f /opt/baileys-bot/docker-compose.yml logs -f"
echo "Reiniciar bot:         docker compose -f /opt/baileys-bot/docker-compose.yml restart"
echo "Ver estado:            docker compose -f /opt/baileys-bot/docker-compose.yml ps"
echo "Detener:               docker compose -f /opt/baileys-bot/docker-compose.yml down"
echo "Reconstruir:           docker compose -f /opt/baileys-bot/docker-compose.yml up --build -d"
echo ""
echo "🔐 Próximos pasos:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Abre tu navegador: http://$(hostname -I | awk '{print $1}'):3000"
echo "2. Escanea el código QR con tu teléfono"
echo "3. ¡El bot estará listo para usar!"
echo ""
echo "💡 Si tienes un dominio, configura Nginx:"
echo "   - Edita: /etc/nginx/sites-available/baileys-bot"
echo "   - Agrega tu dominio en 'server_name'"
echo "   - Instala SSL: certbot --nginx -d tu-dominio.com"
echo ""
print_status "¡Instalación exitosa! 🎉"
