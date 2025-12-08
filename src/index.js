import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import express from "express";
import multer from "multer";
import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { 
    setSocket, 
    sendNormalMessage, 
    sendMedia, 
    sendToGroup, 
    getChats, 
    showChats, 
    sendFileToChat, 
    sendToChat,
    getQueueStats,
    setQueueDelay,
    setQueuePreset,
    setHumanPattern,
    clearQueue
} from "./controllers/messageController.js";

const upload = multer({ dest: "uploads/" });
const app = express();

let sock = null;
let qrCode = null;
let isAuthenticated = false;
let connectionStatus = "disconnected";
let botInfo = { phoneNumber: null, startTime: new Date() };
let messageStats = { sent: 0, received: 0 };

// Middleware para manejar archivos (express-fileupload)
app.use(fileUpload());
app.use(express.json());
app.use(express.static("public"));

// Servir archivos estáticos de la carpeta ui
app.use(express.static(path.join(__dirname, "ui")));

// QR Optimizado para generación rápida
const qrOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.85,
    margin: 1,
    width: 280
};

// ============================================================
// PÁGINA PRINCIPAL - DASHBOARD PROFESIONAL Y RÁPIDO
// ============================================================
app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "ui", "index.html"));
});

// Función auxiliar para formatear uptime
function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

// ============================================================
// ENDPOINT - ESTADO DE LA CONEXIÓN
// ============================================================
app.get("/status", (req, res) => {
    const uptime = Math.floor((new Date() - botInfo.startTime) / 1000);
    const uptimeFormatted = formatUptime(uptime);
    
    res.json({
        authenticated: isAuthenticated,
        connectionStatus: connectionStatus,
        uptime: uptime,
        uptimeFormatted: uptimeFormatted,
        messageStats: messageStats,
        phoneNumber: botInfo.phoneNumber,
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// ENDPOINT - OBTENER SOLO QR (CARGA RÁPIDA)
// ============================================================
app.get("/qr", (req, res) => {
    if (qrCode && !isAuthenticated) {
        res.json({ qr: qrCode, available: true });
    } else if (isAuthenticated) {
        res.json({ available: false, message: "Ya autenticado" });
    } else {
        res.json({ available: false, message: "Generando QR..." });
    }
});

// ============================================================
// ENDPOINT - CERRAR SESIÓN Y ELIMINAR ARCHIVOS
// ============================================================
app.post("/logout", async (req, res) => {
    try {
        console.log("🔐 Cerrando sesión...");
        
        // Resetear variables primero
        isAuthenticated = false;
        qrCode = null;
        connectionStatus = "disconnected";
        botInfo.phoneNumber = null;
        
        // Cerrar socket si está conectado
        if (sock) {
            try {
                await sock.logout();
            } catch (err) {
                console.log("⚠️  Socket ya cerrado o error al logout:", err.message);
            }
            sock = null;
            setSocket(null);
        }
        
        // Eliminar archivos de sesión
        const sessionPath = "./session";
        if (fs.existsSync(sessionPath)) {
            const files = fs.readdirSync(sessionPath);
            files.forEach(file => {
                const filePath = `${sessionPath}/${file}`;
                try {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️  Eliminado: ${file}`);
                } catch (err) {
                    console.error(`❌ Error al eliminar ${file}:`, err.message);
                }
            });
        }
        
        console.log("✅ Sesión cerrada exitosamente");
        
        // Responder inmediatamente
        res.json({ success: true, message: "Sesión cerrada correctamente" });
        
        // Reiniciar bot después de 2 segundos
        setTimeout(() => {
            console.log("🔄 Reiniciando bot...");
            startBot();
        }, 2000);
        
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// ENVIAR MENSAJE DE TEXTO
// ============================================================
app.post("/send-text", async (req, res) => {
    const { number, message } = req.body;

    if (!isAuthenticated) {
        return res.status(400).json({ success: false, error: "Bot no está autenticado" });
    }

    if (!number || !message) {
        return res.status(400).json({ success: false, error: "Faltan parámetros: number, message" });
    }

    try {
        const jid = number.includes("@") ? number : `${number}@c.us`;
        await sock.sendMessage(jid, { text: message });
        messageStats.sent++;
        console.log(`✅ Mensaje enviado a ${number}`);
        return res.json({ 
            success: true,
            message: "Mensaje enviado correctamente",
            data: { number, messageLength: message.length, timestamp: new Date().toISOString() }
        });
    } catch (e) {
        console.error(`❌ Error: ${e.message}`);
        return res.status(500).json({ success: false, error: e.message });
    }
});

// ============================================================
// ENVIAR ARCHIVO
// ============================================================
app.post("/send-file", upload.single("file"), async (req, res) => {
    const { number } = req.body;
    const filePath = req.file?.path;
    const mimeType = req.file?.mimetype;

    if (!isAuthenticated) {
        return res.status(400).json({ success: false, error: "Bot no está autenticado" });
    }

    if (!number || !filePath) {
        return res.status(400).json({ success: false, error: "Faltan parámetros: number, file" });
    }

    try {
        const fileData = fs.readFileSync(filePath);
        const jid = number.includes("@") ? number : `${number}@c.us`;

        await sock.sendMessage(jid, {
            document: fileData,
            mimetype: mimeType,
            fileName: req.file.originalname
        });

        fs.unlinkSync(filePath);
        messageStats.sent++;
        console.log(`✅ Archivo enviado a ${number}: ${req.file.originalname}`);
        return res.json({ 
            success: true,
            message: "Archivo enviado correctamente",
            data: {
                number,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                timestamp: new Date().toISOString()
            }
        });
    } catch (e) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error(`❌ Error: ${e.message}`);
        return res.status(500).json({ success: false, error: e.message });
    }
});

// ============================================================
// INICIALIZAR BOT
// ============================================================
async function startBot() {
    try {
        console.log("╔════════════════════════════════════════╗");
        console.log("║  🚀 Iniciando WhatsApp Bot v2.0      ║");
        console.log("╚════════════════════════════════════════╝");
        console.log("");
        console.log("🔄 Cargando Baileys...");
        
        const { state, saveCreds } = await useMultiFileAuthState("./session");
        const { version } = await fetchLatestBaileysVersion();

        console.log(`✅ Baileys v${version.join(".")} cargado`);

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            markOnlineOnConnect: true
        });

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log("📱 Generando código QR...");
                const start = Date.now();
                try {
                    qrCode = await QRCode.toDataURL(qr, qrOptions);
                    console.log(`✅ QR generado en ${Date.now() - start}ms`);
                } catch (err) {
                    console.error("❌ Error al generar QR:", err);
                }
            }

            if (connection === "connecting") {
                connectionStatus = "connecting";
                console.log("🔗 Conectando con WhatsApp...");
            }

            if (connection === "open") {
                connectionStatus = "connected";
                isAuthenticated = true;
                qrCode = null;
                if (sock.user) botInfo.phoneNumber = sock.user.id.split(":")[0];
                
                // Actualizar socket en el controlador
                setSocket(sock);
                
                console.log("");
                console.log("╔════════════════════════════════════════╗");
                console.log("║  ✅ BOT CONECTADO EXITOSAMENTE        ║");
                console.log("╚════════════════════════════════════════╝");
                console.log(`📱 Número: ${botInfo.phoneNumber || "N/A"}`);
                console.log(`🌐 Dashboard: http://localhost:${PORT}`);
                console.log("");
            }

            if (connection === "close") {
                connectionStatus = "disconnected";
                isAuthenticated = false;
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                console.log("❌ Conexión cerrada");
                if (shouldReconnect) {
                    console.log("🔄 Reintentando en 3 segundos...");
                    setTimeout(() => startBot(), 3000);
                } else {
                    console.log("⚠️  Sesión eliminada - Escanea nuevo QR");
                }
            }
        });

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("messages.upsert", async (m) => {
            const message = m.messages[0];
            if (!message.key.fromMe && message.message) {
                messageStats.received++;
                const from = message.key.remoteJid;
                const text = message.message.conversation || 
                            message.message.extendedTextMessage?.text || 
                            "[Multimedia]";
                console.log(`📨 ${from}: ${text}`);
            }
        });

    } catch (error) {
        console.error("❌ Error crítico:", error);
        console.log("🔄 Reintentando en 5 segundos...");
        setTimeout(() => startBot(), 5000);
    }
}

// ============================================================
// NUEVAS RUTAS API - CONTROLADORES
// ============================================================

// Enviar mensaje normal (texto)
app.post("/api/send-messages", sendNormalMessage);

// Enviar archivo/media
app.post("/api/send-medias", sendMedia);

// Enviar mensaje a grupo por JID
app.post("/api/send-group", sendToGroup);

// Obtener lista de chats
app.get("/api/chats", getChats);

// Mostrar chats con nombres
app.get("/api/show-chats", showChats);

// Enviar archivo a chat por nombre
app.post("/api/send-file-chat", sendFileToChat);

// Enviar mensaje a chat por nombre
app.post("/api/send-to-chat", sendToChat);

// ============================================================
// NUEVAS RUTAS PARA GESTIÓN DE COLA
// ============================================================

// Obtener estadísticas de la cola
app.get("/api/queue/stats", getQueueStats);

// Configurar delay entre mensajes (en milisegundos) - LEGACY
app.post("/api/queue/set-delay", setQueueDelay);

// Configurar preset de delay dinámico (NUEVO - RECOMENDADO)
app.post("/api/queue/set-preset", setQueuePreset);

// Activar/desactivar patrón humano (NUEVO)
app.post("/api/queue/set-human-pattern", setHumanPattern);

// Limpiar cola de mensajes pendientes
app.post("/api/queue/clear", clearQueue);

// ============================================================
// INICIAR SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("");
    console.log("╔════════════════════════════════════════╗");
    console.log("║  🌐 SERVIDOR EXPRESS INICIADO         ║");
    console.log("╚════════════════════════════════════════╝");
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Dashboard disponible`);
    console.log(`📡 API REST lista`);
    console.log("");
    startBot();
});
