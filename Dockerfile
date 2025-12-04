# Usar imagen de Node.js Alpine (más ligera)
FROM node:20-alpine

# Instalar dependencias del sistema para Baileys
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorios necesarios con permisos
RUN mkdir -p session uploads public/images && \
    chmod -R 777 session uploads

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["npm", "start"]
