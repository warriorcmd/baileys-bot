#!/bin/bash

# Script de mantenimiento y monitoreo para Baileys Bot
# Uso: bash maintenance.sh

BOT_DIR="/opt/baileys-bot"
BACKUP_DIR="/backups/baileys-bot"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       🔧 Herramienta de Mantenimiento Baileys Bot        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Menú
show_menu() {
    echo "Selecciona una opción:"
    echo "1. Ver estado del bot"
    echo "2. Ver logs en tiempo real"
    echo "3. Ver últimos 50 logs"
    echo "4. Reiniciar bot"
    echo "5. Detener bot"
    echo "6. Hacer backup"
    echo "7. Restaurar backup"
    echo "8. Ver uso de recursos"
    echo "9. Limpiar logs antiguos"
    echo "10. Actualizar bot (git pull)"
    echo "11. Reconstruir imagen Docker"
    echo "12. Salir"
    echo ""
}

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Funciones
check_status() {
    echo -e "${YELLOW}Verificando estado...${NC}"
    echo ""
    docker compose -f $BOT_DIR/docker-compose.yml ps
    echo ""
    echo "Estado de la conexión:"
    curl -s http://localhost:3000/status | jq . 2>/dev/null || echo "No se pudo conectar"
}

view_logs_realtime() {
    echo -e "${YELLOW}Mostrando logs en tiempo real (Presiona Ctrl+C para salir)${NC}"
    echo ""
    docker compose -f $BOT_DIR/docker-compose.yml logs -f
}

view_recent_logs() {
    echo -e "${YELLOW}Últimos 50 logs:${NC}"
    echo ""
    docker compose -f $BOT_DIR/docker-compose.yml logs --tail 50
}

restart_bot() {
    echo -e "${YELLOW}Reiniciando bot...${NC}"
    docker compose -f $BOT_DIR/docker-compose.yml restart
    sleep 2
    echo -e "${GREEN}✓ Bot reiniciado${NC}"
}

stop_bot() {
    echo -e "${YELLOW}Deteniendo bot...${NC}"
    docker compose -f $BOT_DIR/docker-compose.yml down
    echo -e "${GREEN}✓ Bot detenido${NC}"
}

make_backup() {
    echo -e "${YELLOW}Creando backup...${NC}"
    mkdir -p $BACKUP_DIR
    
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/baileys-backup-$DATE.tar.gz"
    
    tar -czf $BACKUP_FILE $BOT_DIR/session/ $BOT_DIR/.env 2>/dev/null || true
    
    echo -e "${GREEN}✓ Backup completado: $BACKUP_FILE${NC}"
    echo "Tamaño: $(du -h $BACKUP_FILE | cut -f1)"
    
    # Eliminar backups antiguos (más de 7 días)
    find $BACKUP_DIR -name "baileys-backup-*.tar.gz" -mtime +7 -delete
}

restore_backup() {
    echo -e "${YELLOW}Backups disponibles:${NC}"
    ls -lh $BACKUP_DIR/baileys-backup-*.tar.gz 2>/dev/null || echo "No hay backups"
    
    read -p "Ingresa el nombre del backup (ej: baileys-backup-20250101_120000.tar.gz): " BACKUP_FILE
    
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        echo -e "${YELLOW}Restaurando...${NC}"
        cd $BOT_DIR
        tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C /
        echo -e "${GREEN}✓ Backup restaurado${NC}"
        restart_bot
    else
        echo -e "${RED}✗ Archivo no encontrado${NC}"
    fi
}

view_resources() {
    echo -e "${YELLOW}Uso de recursos del bot:${NC}"
    echo ""
    docker stats --no-stream baileys-bot 2>/dev/null || echo "No hay contenedores activos"
    
    echo ""
    echo -e "${YELLOW}Tamaño de carpetas:${NC}"
    du -sh $BOT_DIR/session/
    du -sh $BOT_DIR/uploads/
    du -sh $BOT_DIR/logs/ 2>/dev/null || echo "Carpeta logs: no existe"
}

clean_old_logs() {
    echo -e "${YELLOW}Limpiando logs antiguos...${NC}"
    
    # Limpiar logs de Docker mayores a 7 días
    if [ -d "/var/lib/docker/containers" ]; then
        find /var/lib/docker/containers -name "*.log" -mtime +7 -delete
        echo -e "${GREEN}✓ Logs de Docker limpiados${NC}"
    fi
    
    # Vaciar logs de la aplicación
    if [ -d "$BOT_DIR/logs" ]; then
        find $BOT_DIR/logs -type f -mtime +7 -delete
        echo -e "${GREEN}✓ Logs de aplicación limpiados${NC}"
    fi
}

update_bot() {
    echo -e "${YELLOW}Actualizando bot...${NC}"
    cd $BOT_DIR
    
    # Hacer backup antes de actualizar
    echo "Haciendo backup..."
    make_backup
    
    # Actualizar código
    git pull
    
    # Reconstruir si hay cambios
    echo "Reconstruyendo imagen..."
    docker compose down
    docker compose up --build -d
    
    sleep 3
    check_status
}

rebuild_docker() {
    echo -e "${YELLOW}Reconstruyendo imagen Docker...${NC}"
    cd $BOT_DIR
    
    docker compose down
    docker image rm baileys-bot-baileys-bot 2>/dev/null || true
    docker compose up --build -d
    
    sleep 3
    check_status
}

# Loop principal
while true; do
    show_menu
    read -p "Opción: " option
    
    case $option in
        1) check_status ;;
        2) view_logs_realtime ;;
        3) view_recent_logs ;;
        4) restart_bot ;;
        5) stop_bot ;;
        6) make_backup ;;
        7) restore_backup ;;
        8) view_resources ;;
        9) clean_old_logs ;;
        10) update_bot ;;
        11) rebuild_docker ;;
        12) 
            echo "Saliendo..."
            exit 0
            ;;
        *)
            echo -e "${RED}Opción inválida${NC}"
            ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done
