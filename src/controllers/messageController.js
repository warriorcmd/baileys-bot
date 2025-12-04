import fs from "fs";
import { phoneNumberFormatter } from "../helpers/formatter.js";

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
// ENVIAR MENSAJE NORMAL (TEXTO)
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

        // Formatear número al formato JID de WhatsApp
        const jid = number.includes("@") ? number : `${number}@c.us`;

        // Enviar mensaje de texto
        const response = await sock.sendMessage(jid, { text: message });

        console.log(`✅ Mensaje enviado a ${number}`);

        return res.status(200).json({
            status: true,
            response: response,
            data: {
                number,
                messageLength: message.length,
                timestamp: new Date().toISOString()
            }
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
// ENVIAR ARCHIVO/MEDIA
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

        // Formatear número al formato JID
        const jid = number.includes("@") ? number : `${number}@c.us`;

        // Obtener extensión del archivo
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const mimeType = file.mimetype;

        // Preparar el mensaje según el tipo de archivo
        let messageContent = {};

        if (mimeType.startsWith("image/")) {
            // Enviar como imagen
            messageContent = {
                image: file.data,
                caption: caption || "",
                mimetype: mimeType
            };
        } else if (mimeType.startsWith("video/")) {
            // Enviar como video
            messageContent = {
                video: file.data,
                caption: caption || "",
                mimetype: mimeType
            };
        } else if (mimeType.startsWith("audio/")) {
            // Enviar como audio
            messageContent = {
                audio: file.data,
                mimetype: mimeType
            };
        } else {
            // Enviar como documento (PDF, Word, Excel, etc.)
            messageContent = {
                document: file.data,
                mimetype: mimeType,
                fileName: file.name,
                caption: caption || ""
            };
        }

        // Enviar el archivo
        const response = await sock.sendMessage(jid, messageContent);

        console.log(`✅ Archivo enviado a ${number}: ${file.name}`);

        return res.status(200).json({
            status: true,
            response: response,
            data: {
                number,
                fileName: file.name,
                fileSize: file.size,
                fileType: mimeType,
                timestamp: new Date().toISOString()
            }
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
// ENVIAR MENSAJE A GRUPO POR JID DIRECTO
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

        // Asegurar que el JID tenga el formato correcto para grupos
        const jid = groupJid.includes("@") ? groupJid : `${groupJid}@g.us`;

        // Enviar mensaje al grupo
        const response = await sock.sendMessage(jid, { text: message });

        console.log(`✅ Mensaje enviado al grupo ${groupJid}`);

        return res.status(200).json({
            status: true,
            response: response,
            data: {
                groupJid: jid,
                messageLength: message.length,
                timestamp: new Date().toISOString()
            }
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
