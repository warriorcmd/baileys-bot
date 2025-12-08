import fs from "fs";
import { phoneNumberFormatter } from "../helpers/formatter.js";
import messageQueue from "../helpers/messageQueue.js";

// Referencia al socket de Baileys (debe ser importado desde donde lo inicializas)
let sock = null;

// Función para establecer el socket
export const setSocket = (socket) => {
    sock = socket;
};

// ============================================================
// OBTENER GRUPOS (CHATS)
// ============================================================
export const getChats = async (req, res) => {
    try {
        if (!sock) {
            return res.status(422).json({
                status: false,
                message: "Bot no está conectado"
            });
        }

        // En Baileys, necesitas usar un store para obtener chats
        // Por ahora retornamos un mensaje indicando que necesitas implementar un store
        return res.status(200).json({
            status: true,
            message: "Para obtener chats, debes implementar @whiskeysockets/baileys/store",
            response: []
        });

    } catch (error) {
        console.error("Error en getChats:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// ============================================================
// ENVIAR MENSAJE NORMAL (TEXTO) - CON COLA
// ============================================================
export const sendNormalMessage = async (req, res) => {
    try {
        const { number, message } = req.body;

        if (!sock) {
            return res.status(422).json({
                status: false,
                message: "Bot no está conectado"
            });
        }

        if (!number || !message) {
            return res.status(400).json({
                status: false,
                message: "Faltan parámetros: number, message"
            });
        }

        // Agregar mensaje a la cola en lugar de enviar directamente
        const result = await messageQueue.addToQueue({
            type: 'text',
            sock: sock,
            number: number,
            message: message
        });

        console.log(`✅ Mensaje agregado a la cola para ${number}`);

        return res.status(200).json({
            status: true,
            message: "Mensaje agregado a la cola de envío",
            response: result,
            queueInfo: messageQueue.getQueueInfo()
        });

    } catch (error) {
        console.error("Error en sendNormalMessage:", error);
        return res.status(500).json({
            status: false,
            message: error.message,
            response: error
        });
    }
};

// ============================================================
// ENVIAR ARCHIVO/MEDIA - CON COLA
// ============================================================
export const sendMedia = async (req, res) => {
    try {
        const { number, caption } = req.body;
        const file = req.files?.file;

        if (!sock) {
            return res.status(422).json({
                status: false,
                message: "Bot no está conectado"
            });
        }

        if (!number || !file) {
            return res.status(400).json({
                status: false,
                message: "Faltan parámetros: number, file"
            });
        }

        // Agregar mensaje con archivo a la cola
        const result = await messageQueue.addToQueue({
            type: 'media',
            sock: sock,
            number: number,
            file: file,
            caption: caption || ""
        });

        console.log(`✅ Archivo agregado a la cola para ${number}: ${file.name}`);

        return res.status(200).json({
            status: true,
            message: "Archivo agregado a la cola de envío",
            response: result,
            queueInfo: messageQueue.getQueueInfo()
        });

    } catch (error) {
        console.error("Error en sendMedia:", error);
        return res.status(500).json({
            status: false,
            message: error.message,
            response: error
        });
    }
};

// ============================================================
// MOSTRAR LISTA DE CHATS
// ============================================================
export const showChats = async (req, res) => {
    try {
        if (!sock) {
            return res.status(422).json({
                status: false,
                message: "Bot no está conectado"
            });
        }

        // Para obtener chats en Baileys necesitas implementar un store
        // Aquí te muestro cómo hacerlo cuando implementes el store
        return res.status(200).json({
            status: true,
            message: "Implementa makeInMemoryStore de Baileys para acceder a chats",
            response: []
        });

    } catch (error) {
        console.error("Error en showChats:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// ============================================================
// ENVIAR ARCHIVO A UN CHAT/GRUPO POR NOMBRE
// ============================================================
export const sendFileToChat = async (req, res) => {
    try {
        const { chatName, caption } = req.body;
        const file = req.files?.file;

        if (!sock) {
            return res.status(422).json({
                status: false,
                message: "Bot no está conectado"
            });
        }

        if (!chatName || !file) {
            return res.status(400).json({
                status: false,
                message: "Faltan parámetros: chatName, file"
            });
        }

        // Nota: Para buscar chats por nombre necesitas implementar un store
        // Por ahora retornamos un mensaje de ejemplo
        return res.status(501).json({
            status: false,
            message: "Implementa makeInMemoryStore de Baileys para buscar chats por nombre"
        });

    } catch (error) {
        console.error("Error en sendFileToChat:", error);
        return res.status(500).json({
            status: false,
            message: error.message,
            response: error
        });
    }
};

// ============================================================
// ENVIAR MENSAJE A UN CHAT/GRUPO POR NOMBRE
// ============================================================
export const sendToChat = async (req, res) => {
    try {
        const { chatName, message } = req.body;

        if (!sock) {
            return res.status(422).json({
                status: false,
                message: "Bot no está conectado"
            });
        }

        if (!chatName || !message) {
            return res.status(400).json({
                status: false,
                message: "Faltan parámetros: chatName, message"
            });
        }

        // Nota: Para buscar chats por nombre necesitas implementar un store
        // Por ahora retornamos un mensaje de ejemplo
        return res.status(501).json({
            status: false,
            message: "Implementa makeInMemoryStore de Baileys para buscar chats por nombre"
        });

    } catch (error) {
        console.error("Error en sendToChat:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// ============================================================
// ENVIAR MENSAJE A GRUPO POR JID DIRECTO - CON COLA
// ============================================================
export const sendToGroup = async (req, res) => {
    try {
        const { groupJid, message } = req.body;

        if (!sock) {
            return res.status(422).json({
                status: false,
                message: "Bot no está conectado"
            });
        }

        if (!groupJid || !message) {
            return res.status(400).json({
                status: false,
                message: "Faltan parámetros: groupJid, message"
            });
        }

        // Agregar mensaje de grupo a la cola
        const result = await messageQueue.addToQueue({
            type: 'group',
            sock: sock,
            groupJid: groupJid,
            message: message
        });

        console.log(`✅ Mensaje agregado a la cola para grupo ${groupJid}`);

        return res.status(200).json({
            status: true,
            message: "Mensaje agregado a la cola de envío",
            response: result,
            queueInfo: messageQueue.getQueueInfo()
        });

    } catch (error) {
        console.error("Error en sendToGroup:", error);
        return res.status(500).json({
            status: false,
            message: error.message,
            response: error
        });
    }
};

// ============================================================
// GESTIÓN DE COLA - NUEVAS FUNCIONES
// ============================================================

/**
 * Obtener estadísticas y estado de la cola
 */
export const getQueueStats = async (req, res) => {
    try {
        const stats = messageQueue.getStats();
        const info = messageQueue.getQueueInfo();

        return res.status(200).json({
            status: true,
            stats: stats,
            queueInfo: info
        });

    } catch (error) {
        console.error("Error en getQueueStats:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

/**
 * Configurar el delay entre mensajes (LEGACY - mantener por compatibilidad)
 */
export const setQueueDelay = async (req, res) => {
    try {
        const { delay } = req.body;

        if (!delay || delay < 1000) {
            return res.status(400).json({
                status: false,
                message: "El delay debe ser al menos 1000ms (1 segundo)"
            });
        }

        messageQueue.setDelay(delay, delay * 2);

        return res.status(200).json({
            status: true,
            message: `Delay dinámico configurado: ${delay}ms - ${delay * 2}ms`,
            config: messageQueue.config
        });

    } catch (error) {
        console.error("Error en setQueueDelay:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

/**
 * Configurar preset de delay dinámico
 */
export const setQueuePreset = async (req, res) => {
    try {
        const { preset } = req.body;

        if (!preset) {
            return res.status(400).json({
                status: false,
                message: "Debe proporcionar un preset: rapido, moderado, seguro, ultra-seguro"
            });
        }

        messageQueue.setDelayPreset(preset);

        return res.status(200).json({
            status: true,
            message: `Preset "${preset}" aplicado exitosamente`,
            config: messageQueue.config
        });

    } catch (error) {
        console.error("Error en setQueuePreset:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

/**
 * Activar/desactivar patrón humano
 */
export const setHumanPattern = async (req, res) => {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                status: false,
                message: "Debe proporcionar enabled: true o false"
            });
        }

        messageQueue.setHumanPattern(enabled);

        return res.status(200).json({
            status: true,
            message: `Patrón humano ${enabled ? 'activado' : 'desactivado'}`,
            config: messageQueue.config
        });

    } catch (error) {
        console.error("Error en setHumanPattern:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

/**
 * Limpiar la cola de mensajes pendientes
 */
export const clearQueue = async (req, res) => {
    try {
        const result = messageQueue.clearQueue();

        return res.status(200).json({
            status: true,
            message: "Cola limpiada exitosamente",
            canceled: result.canceled
        });

    } catch (error) {
        console.error("Error en clearQueue:", error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
