/**
 * Sistema de Cola de Mensajes para evitar límites de WhatsApp
 * Implementa un queue que envía mensajes de forma secuencial con delay
 */

class MessageQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.config = {
            delayBetweenMessages: 10000, // 10 segundos entre mensajes (ajustable)
            maxRetries: 3,
            retryDelay: 10000 // 10 segundos antes de reintentar
        };
        this.stats = {
            totalQueued: 0,
            totalSent: 0,
            totalFailed: 0,
            currentQueueSize: 0
        };
    }

    /**
     * Configurar delays personalizados
     */
    setDelay(milliseconds) {
        this.config.delayBetweenMessages = milliseconds;
        console.log(`⚙️ Delay entre mensajes configurado a ${milliseconds}ms`);
    }

    /**
     * Agregar mensaje a la cola
     */
    async addToQueue(messageData) {
        return new Promise((resolve, reject) => {
            const queueItem = {
                id: Date.now() + Math.random(),
                data: messageData,
                retries: 0,
                addedAt: new Date(),
                resolve,
                reject
            };

            this.queue.push(queueItem);
            this.stats.totalQueued++;
            this.stats.currentQueueSize = this.queue.length;

            console.log(`📥 Mensaje agregado a la cola (Posición: ${this.queue.length})`);

            // Si no se está procesando, iniciar procesamiento
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    /**
     * Procesar la cola de mensajes de forma secuencial
     */
    async processQueue() {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        console.log(`🚀 Iniciando procesamiento de cola (${this.queue.length} mensajes pendientes)`);

        while (this.queue.length > 0) {
            const item = this.queue[0]; // Obtener el primero sin quitarlo aún
            
            try {
                console.log(`⏳ Procesando mensaje ${item.id} (${item.data.type}) a ${item.data.number || item.data.groupJid}`);
                
                // Ejecutar el envío del mensaje
                const result = await this.sendMessage(item);
                
                // Si fue exitoso, resolver la promesa y quitar de la cola
                item.resolve(result);
                this.queue.shift();
                this.stats.totalSent++;
                this.stats.currentQueueSize = this.queue.length;
                
                console.log(`✅ Mensaje enviado exitosamente (${this.queue.length} restantes en cola)`);
                
                // Esperar el delay configurado antes del siguiente mensaje
                if (this.queue.length > 0) {
                    console.log(`⏱️ Esperando ${this.config.delayBetweenMessages}ms antes del siguiente mensaje...`);
                    await this.sleep(this.config.delayBetweenMessages);
                }
                
            } catch (error) {
                console.error(`❌ Error al enviar mensaje ${item.id}:`, error.message);
                
                // Intentar reintentar si no se alcanzó el máximo
                if (item.retries < this.config.maxRetries) {
                    item.retries++;
                    console.log(`🔄 Reintentando mensaje ${item.id} (intento ${item.retries}/${this.config.maxRetries})`);
                    
                    // Mover al final de la cola y esperar antes de reintentar
                    this.queue.shift();
                    this.queue.push(item);
                    await this.sleep(this.config.retryDelay);
                    
                } else {
                    // Si falló definitivamente, rechazar y quitar de la cola
                    console.log(`💀 Mensaje ${item.id} falló después de ${this.config.maxRetries} intentos`);
                    item.reject(error);
                    this.queue.shift();
                    this.stats.totalFailed++;
                    this.stats.currentQueueSize = this.queue.length;
                }
            }
        }

        console.log(`✨ Cola procesada completamente`);
        this.isProcessing = false;
    }

    /**
     * Enviar mensaje según el tipo
     */
    async sendMessage(item) {
        const { sock, data } = item;
        
        switch (data.type) {
            case 'text':
                return await this.sendTextMessage(item);
            
            case 'media':
                return await this.sendMediaMessage(item);
            
            case 'group':
                return await this.sendGroupMessage(item);
            
            default:
                throw new Error(`Tipo de mensaje desconocido: ${data.type}`);
        }
    }

    /**
     * Enviar mensaje de texto
     */
    async sendTextMessage(item) {
        const { data } = item;
        const jid = data.number.includes("@") ? data.number : `${data.number}@c.us`;
        
        const response = await data.sock.sendMessage(jid, { text: data.message });
        
        return {
            status: true,
            response: response,
            data: {
                number: data.number,
                messageLength: data.message.length,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Enviar mensaje con archivo/media
     */
    async sendMediaMessage(item) {
        const { data } = item;
        const jid = data.number.includes("@") ? data.number : `${data.number}@c.us`;
        
        let messageContent = {};
        const file = data.file;
        const mimeType = file.mimetype;
        
        if (mimeType.startsWith("image/")) {
            messageContent = {
                image: file.data,
                caption: data.caption || "",
                mimetype: mimeType
            };
        } else if (mimeType.startsWith("video/")) {
            messageContent = {
                video: file.data,
                caption: data.caption || "",
                mimetype: mimeType
            };
        } else if (mimeType.startsWith("audio/")) {
            messageContent = {
                audio: file.data,
                mimetype: mimeType
            };
        } else {
            messageContent = {
                document: file.data,
                mimetype: mimeType,
                fileName: file.name,
                caption: data.caption || ""
            };
        }
        
        const response = await data.sock.sendMessage(jid, messageContent);
        
        return {
            status: true,
            response: response,
            data: {
                number: data.number,
                fileName: file.name,
                fileSize: file.size,
                fileType: mimeType,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Enviar mensaje a grupo
     */
    async sendGroupMessage(item) {
        const { data } = item;
        const jid = data.groupJid.includes("@") ? data.groupJid : `${data.groupJid}@g.us`;
        
        const response = await data.sock.sendMessage(jid, { text: data.message });
        
        return {
            status: true,
            response: response,
            data: {
                groupJid: jid,
                messageLength: data.message.length,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Función auxiliar para hacer delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtener estadísticas de la cola
     */
    getStats() {
        return {
            ...this.stats,
            isProcessing: this.isProcessing,
            config: this.config
        };
    }

    /**
     * Limpiar cola (cancelar todos los mensajes pendientes)
     */
    clearQueue() {
        const canceledCount = this.queue.length;
        
        // Rechazar todos los mensajes pendientes
        this.queue.forEach(item => {
            item.reject(new Error('Cola cancelada manualmente'));
        });
        
        this.queue = [];
        this.stats.currentQueueSize = 0;
        
        console.log(`🗑️ Cola limpiada (${canceledCount} mensajes cancelados)`);
        
        return { canceled: canceledCount };
    }

    /**
     * Obtener información de la cola actual
     */
    getQueueInfo() {
        return {
            queueSize: this.queue.length,
            isProcessing: this.isProcessing,
            nextMessage: this.queue.length > 0 ? {
                position: 1,
                type: this.queue[0].data.type,
                addedAt: this.queue[0].addedAt,
                retries: this.queue[0].retries
            } : null,
            estimatedWaitTime: this.queue.length * this.config.delayBetweenMessages
        };
    }
}

// Exportar una única instancia (Singleton)
const messageQueue = new MessageQueue();

export default messageQueue;
