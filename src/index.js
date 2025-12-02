import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import express from "express";
import multer from "multer";
import fs from "fs";
import QRCode from "qrcode";

const upload = multer({ dest: "uploads/" });
const app = express();

let sock = null;
let qrCode = null;
let isAuthenticated = false;
let connectionStatus = "disconnected";

app.use(express.json());

// Servir archivos estáticos (incluyendo sesiones guardadas)
app.use(express.static("public"));

// ============================================================
// PÁGINA PRINCIPAL - ESCANEAR QR
// ============================================================
app.get("/", async (req, res) => {
    const statusClass = isAuthenticated ? "connected" : "disconnected";
    const statusText = isAuthenticated ? "✅ Conectado" : "❌ Desconectado";
    
    let qrDisplay = "";
    if (qrCode && !isAuthenticated) {
        qrDisplay = `<div class="qr-container"><img id="qr-image" src="${qrCode}" alt="QR Code"></div>`;
    }
    
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Baileys WhatsApp Bot</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 600px;
                width: 100%;
                padding: 40px;
                text-align: center;
            }
            
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 28px;
            }
            
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 14px;
            }
            
            .status {
                display: inline-block;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: bold;
                margin-bottom: 30px;
                font-size: 14px;
            }
            
            .status.connected {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .status.disconnected {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .qr-container {
                margin: 30px 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .qr-container img {
                max-width: 400px;
                width: 100%;
                border: 2px solid #667eea;
                border-radius: 10px;
                padding: 10px;
                background: #f9f9f9;
            }
            
            .waiting-message {
                color: #667eea;
                font-size: 16px;
                margin: 20px 0;
                font-weight: 500;
            }
            
            .endpoints {
                background: #f5f5f5;
                border-radius: 10px;
                padding: 20px;
                margin-top: 30px;
                text-align: left;
            }
            
            .endpoints h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 16px;
                text-align: center;
            }
            
            .endpoint {
                background: white;
                padding: 12px;
                margin: 8px 0;
                border-radius: 5px;
                border-left: 4px solid #667eea;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #333;
                word-break: break-all;
            }
            
            .refresh-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                margin-top: 20px;
                transition: background 0.3s;
            }
            
            .refresh-btn:hover {
                background: #5568d3;
            }
            
            @media (max-width: 600px) {
                .container {
                    padding: 20px;
                }
                
                h1 {
                    font-size: 24px;
                }
                
                .qr-container img {
                    max-width: 300px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Baileys WhatsApp Bot</h1>
            <p class="subtitle">Gestor de WhatsApp con Node.js</p>
            
            <div class="status ${statusClass}">${statusText}</div>
            
            ${qrDisplay}
            
            ${!isAuthenticated ? '<p class="waiting-message">📱 Escanea el código QR con tu teléfono para autenticarte...</p>' : '<p class="waiting-message">✨ Bot listo para usar</p>'}
            
            <button class="refresh-btn" onclick="location.reload()">🔄 Actualizar</button>
            
            <div class="endpoints">
                <h3>📡 Endpoints disponibles:</h3>
                <div class="endpoint">POST /send-text</div>
                <div class="endpoint">POST /send-file</div>
                <div class="endpoint">GET /status</div>
            </div>
        </div>
        
        <script>
            // Auto-actualizar cada 5 segundos para capturar cambios
            setTimeout(() => {
                fetch('/status')
                    .then(r => r.json())
                    .then(data => {
                        if (data.authenticated && !${String(isAuthenticated)}) {
                            location.reload();
                        }
                    });
            }, 5000);
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// ============================================================
// ENDPOINT - ESTADO DE LA CONEXIÓN
// ============================================================
app.get("/status", (req, res) => {
    res.json({
        authenticated: isAuthenticated,
        status: connectionStatus,
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// 1. ENVIAR MENSAJE DE TEXTO
// ============================================================
app.post("/send-text", async (req, res) => {
    const { number, message } = req.body;

    if (!isAuthenticated) {
        return res.status(400).json({ error: "Bot no está autenticado" });
    }

    if (!number || !message) {
        return res.status(400).json({ error: "Faltan parámetros: number, message" });
    }

    try {
        const jid = number.includes("@") ? number : `${number}@c.us`;
        await sock.sendMessage(jid, { text: message });
        return res.json({ 
            status: "success", 
            message: "Mensaje enviado",
            number,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// ============================================================
// 2. ENVIAR ARCHIVO (PDF / IMAGEN / VIDEO)
// ============================================================
app.post("/send-file", upload.single("file"), async (req, res) => {
    const { number } = req.body;
    const filePath = req.file?.path;
    const mimeType = req.file?.mimetype;

    if (!isAuthenticated) {
        return res.status(400).json({ error: "Bot no está autenticado" });
    }

    if (!number || !filePath) {
        return res.status(400).json({ error: "Faltan parámetros: number, file" });
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
        return res.json({ 
            status: "success",
            message: "Archivo enviado",
            number,
            fileName: req.file.originalname,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return res.status(500).json({ error: e.message });
    }
});

// ============================================================
// INICIALIZAR BOT
// ============================================================
async function startBot() {
    try {
        console.log("🔄 Inicializando Baileys...");
        
        const { state, saveCreds } = await useMultiFileAuthState("./session");
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false, // Desactivar QR en terminal
            markOnlineOnConnect: true
        });

        // ============================================================
        // EVENTO: Generar QR
        // ============================================================
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log("📱 Generando código QR...");
                try {
                    qrCode = await QRCode.toDataURL(qr);
                    console.log("✅ QR generado exitosamente");
                } catch (err) {
                    console.error("❌ Error al generar QR:", err);
                }
            }

            if (connection === "connecting") {
                connectionStatus = "connecting";
                console.log("🔗 Conectando...");
            }

            if (connection === "open") {
                connectionStatus = "connected";
                isAuthenticated = true;
                qrCode = null;
                console.log("✅ Bot autenticado y conectado");
            }

            if (connection === "close") {
                connectionStatus = "disconnected";
                isAuthenticated = false;
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                console.log("❌ Desconectado. Reintentando...");
                
                if (shouldReconnect) {
                    setTimeout(() => startBot(), 3000);
                }
            }
        });

        // ============================================================
        // EVENTO: Guardar credenciales
        // ============================================================
        sock.ev.on("creds.update", saveCreds);

        // ============================================================
        // EVENTO: Recibir mensajes
        // ============================================================
        sock.ev.on("messages.upsert", async (m) => {
            const message = m.messages[0];
            if (!message.key.fromMe && message.body) {
                console.log(`📨 Mensaje de ${message.key.remoteJid}: ${message.body}`);
            }
        });

        console.log("🚀 Bot iniciado. Esperando escaneo de QR...");

    } catch (error) {
        console.error("❌ Error al inicializar bot:", error);
        setTimeout(() => startBot(), 5000);
    }
}

// ============================================================
// INICIAR SERVIDOR EXPRESS
// ============================================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🌐 Servidor Express corriendo en http://localhost:${PORT}`);
    startBot();
});
