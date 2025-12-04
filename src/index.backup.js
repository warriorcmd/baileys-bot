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
let botInfo = { phoneNumber: null, startTime: new Date() };
let messageStats = { sent: 0, received: 0 };

app.use(express.json());
app.use(express.static("public"));

// Configuración de QRCode para generación rápida
const qrOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    width: 280
};

// Cache de CSS para mejorar rendimiento
const cssStyles = `
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; min-height: 100vh; color: #e2e8f0; padding: 20px; }
.dashboard { max-width: 1200px; margin: 0 auto; }
.header { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
.header-title { display: flex; align-items: center; gap: 15px; }
.logo { width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.title-group h1 { color: white; font-size: 28px; font-weight: 700; margin-bottom: 5px; }
.title-group p { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
.status-badge { padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
.status-badge.connected { background: rgba(255, 255, 255, 0.2); color: white; border: 2px solid white; animation: pulse 2s infinite; }
.status-badge.disconnected { background: rgba(239, 68, 68, 0.2); color: white; border: 2px solid #ef4444; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 24px; }
.card { background: #1e293b; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); border: 1px solid #334155; transition: transform 0.2s; }
.card:hover { transform: translateY(-2px); }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.card-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.card-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
.card-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.card-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.card-title { font-size: 14px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.card-value { font-size: 32px; font-weight: 700; color: white; margin-top: 8px; }
.card-subtitle { color: #64748b; font-size: 13px; margin-top: 8px; }
.qr-section { background: #1e293b; padding: 40px; border-radius: 12px; text-align: center; border: 1px solid #334155; margin-bottom: 24px; }
.qr-container { display: inline-block; padding: 20px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); margin: 20px 0; }
.qr-container img { display: block; width: 280px; height: 280px; border-radius: 8px; }
.qr-instructions { color: #94a3b8; font-size: 15px; line-height: 1.6; max-width: 500px; margin: 20px auto; }
.api-docs { background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; }
.api-title { font-size: 20px; font-weight: 700; color: white; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
.endpoint { background: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #25D366; transition: transform 0.2s; }
.endpoint:hover { transform: translateX(4px); }
.endpoint-method { display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; margin-right: 12px; }
.method-post { background: #3b82f6; color: white; }
.method-get { background: #10b981; color: white; }
.endpoint-path { font-family: 'Courier New', monospace; color: #25D366; font-size: 14px; font-weight: 600; }
.endpoint-desc { color: #94a3b8; font-size: 13px; margin-top: 8px; line-height: 1.5; }
.code-example { background: #0f172a; padding: 16px; border-radius: 6px; margin-top: 12px; overflow-x: auto; }
.code-example code { color: #e2e8f0; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; white-space: pre; }
.btn { background: linear-gradient(135deg, #25D366, #128C7E); color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: transform 0.2s; display: inline-flex; align-items: center; gap: 8px; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4); }
.success-message { background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 16px; border-radius: 8px; margin: 20px 0; display: flex; align-items: center; gap: 12px; font-size: 14px; }
.loading { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 768px) { .header { padding: 20px; text-align: center; justify-content: center; } .header-title { flex-direction: column; text-align: center; } .qr-container img { width: 250px; height: 250px; } .grid { grid-template-columns: 1fr; } }
</style>
`;

// ============================================================
// PÁGINA PRINCIPAL - DASHBOARD PROFESIONAL
// ============================================================
app.get("/", async (req, res) => {
    const uptime = Math.floor((new Date() - botInfo.startTime) / 1000);
    const uptimeFormatted = formatUptime(uptime);
    
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WhatsApp Bot Dashboard</title>
${cssStyles}
</head>
<body>
<div class="dashboard">
<div class="header">
<div class="header-title">
<div class="logo">💬</div>
<div class="title-group">
<h1>WhatsApp Bot Dashboard</h1>
<p>Panel de Control Profesional</p>
</div>
</div>
<div class="status-badge ${isAuthenticated ? 'connected' : 'disconnected'}">
<span>${isAuthenticated ? '●' : '○'}</span>
${isAuthenticated ? 'Conectado' : 'Desconectado'}
</div>
</div>
<div class="grid">
<div class="card">
<div class="card-header">
<div class="card-icon blue">⏱️</div>
<div class="card-title">Tiempo Activo</div>
</div>
<div class="card-value">${uptimeFormatted}</div>
<div class="card-subtitle">Desde el inicio del servicio</div>
</div>
<div class="card">
<div class="card-header">
<div class="card-icon green">📤</div>
<div class="card-title">Mensajes Enviados</div>
</div>
<div class="card-value">${messageStats.sent}</div>
<div class="card-subtitle">Total de mensajes procesados</div>
</div>
<div class="card">
<div class="card-header">
<div class="card-icon purple">📥</div>
<div class="card-title">Mensajes Recibidos</div>
</div>
<div class="card-value">${messageStats.received}</div>
<div class="card-subtitle">Total de mensajes entrantes</div>
</div>
<div class="card">
<div class="card-header">
<div class="card-icon orange">📊</div>
<div class="card-title">Estado del Sistema</div>
</div>
<div class="card-value">${connectionStatus === 'connected' ? '100%' : '0%'}</div>
<div class="card-subtitle">Operatividad del bot</div>
</div>
</div>
${!isAuthenticated ? `
<div class="qr-section">
<h2 style="color: white; margin-bottom: 10px;">🔐 Autenticación Requerida</h2>
<p class="qr-instructions">Escanea el código QR con WhatsApp:<br><strong>WhatsApp > Configuración > Dispositivos vinculados > Vincular dispositivo</strong></p>
${qrCode ? `<div class="qr-container"><img src="${qrCode}" alt="QR Code" id="qr-code"></div>` : `<div style="padding: 40px;"><div class="loading"></div><p style="color: #94a3b8; margin-top: 16px;">Generando código QR...</p></div>`}
<button class="btn" onclick="location.reload()">🔄 Actualizar código</button>
</div>
` : `
<div class="qr-section">
<div class="success-message">
<span style="font-size: 24px;">✅</span>
<div><strong>Bot autenticado y funcionando correctamente</strong><br><small>Sistema operativo y listo para recibir peticiones API</small></div>
</div>
</div>
`}
<div class="api-docs">
<div class="api-title"><span>📡</span> Documentación API</div>
<div class="endpoint">
<span class="endpoint-method method-post">POST</span>
<span class="endpoint-path">/send-text</span>
<p class="endpoint-desc">Envía un mensaje de texto a un número de WhatsApp</p>
<div class="code-example"><code>{
  "number": "51987654321",
  "message": "Hola desde el bot"
}</code></div>
</div>
<div class="endpoint">
<span class="endpoint-method method-post">POST</span>
<span class="endpoint-path">/send-file</span>
<p class="endpoint-desc">Envía un archivo (documento, imagen, video) a un contacto</p>
<div class="code-example"><code>Content-Type: multipart/form-data
number: 51987654321
file: [archivo adjunto]</code></div>
</div>
<div class="endpoint">
<span class="endpoint-method method-get">GET</span>
<span class="endpoint-path">/status</span>
<p class="endpoint-desc">Obtiene el estado actual del bot y estadísticas del sistema</p>
<div class="code-example"><code>Response: {
  "authenticated": true,
  "status": "connected",
  "uptime": ${uptime},
  "stats": { "sent": ${messageStats.sent}, "received": ${messageStats.received} }
}</code></div>
</div>
</div>
</div>
<script>
setInterval(async () => {
try {
const response = await fetch('/status');
const data = await response.json();
if (data.authenticated !== ${isAuthenticated}) location.reload();
} catch (error) { console.error('Error:', error); }
}, 5000);
const qrImage = document.getElementById('qr-code');
if (qrImage) {
qrImage.style.opacity = '0';
qrImage.style.transform = 'scale(0.9)';
qrImage.style.transition = 'all 0.3s ease';
setTimeout(() => { qrImage.style.opacity = '1'; qrImage.style.transform = 'scale(1)'; }, 100);
}
</script>
</body>
</html>`;
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #0f172a;
                min-height: 100vh;
                color: #e2e8f0;
                padding: 20px;
            }
            
            .dashboard {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .header {
                background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                padding: 30px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
                margin-bottom: 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .header-title {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .logo {
                width: 50px;
                height: 50px;
                background: white;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
            }
            
            .title-group h1 {
                color: white;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .title-group p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
            }
            
            .status-badge {
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                animation: pulse 2s infinite;
            }
            
            .status-badge.connected {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid white;
            }
            
            .status-badge.disconnected {
                background: rgba(239, 68, 68, 0.2);
                color: white;
                border: 2px solid #ef4444;
                animation: none;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 24px;
            }
            
            .card {
                background: #1e293b;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                border: 1px solid #334155;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
            }
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .card-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .card-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
            .card-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
            .card-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
            .card-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
            
            .card-title {
                font-size: 14px;
                color: #94a3b8;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .card-value {
                font-size: 32px;
                font-weight: 700;
                color: white;
                margin-top: 8px;
            }
            
            .card-subtitle {
                color: #64748b;
                font-size: 13px;
                margin-top: 8px;
            }
            
            .qr-section {
                background: #1e293b;
                padding: 40px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid #334155;
                margin-bottom: 24px;
            }
            
            .qr-container {
                display: inline-block;
                padding: 20px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                margin: 20px 0;
            }
            
            .qr-container img {
                display: block;
                width: 300px;
                height: 300px;
                border-radius: 8px;
            }
            
            .qr-instructions {
                color: #94a3b8;
                font-size: 15px;
                line-height: 1.6;
                max-width: 500px;
                margin: 20px auto;
            }
            
            .api-docs {
                background: #1e293b;
                padding: 30px;
                border-radius: 12px;
                border: 1px solid #334155;
            }
            
            .api-title {
                font-size: 20px;
                font-weight: 700;
                color: white;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .endpoint {
                background: #0f172a;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 16px;
                border-left: 4px solid #25D366;
                transition: transform 0.2s;
            }
            
            .endpoint:hover {
                transform: translateX(4px);
            }
            
            .endpoint-method {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 12px;
                margin-right: 12px;
            }
            
            .method-post { background: #3b82f6; color: white; }
            .method-get { background: #10b981; color: white; }
            
            .endpoint-path {
                font-family: 'Courier New', monospace;
                color: #25D366;
                font-size: 14px;
                font-weight: 600;
            }
            
            .endpoint-desc {
                color: #94a3b8;
                font-size: 13px;
                margin-top: 8px;
                line-height: 1.5;
            }
            
            .code-example {
                background: #0f172a;
                padding: 16px;
                border-radius: 6px;
                margin-top: 12px;
                overflow-x: auto;
            }
            
            .code-example code {
                color: #e2e8f0;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.6;
            }
            
            .btn {
                background: linear-gradient(135deg, #25D366, #128C7E);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: transform 0.2s, box-shadow 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
            }
            
            .success-message {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid #10b981;
                color: #10b981;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
            }
            
            .loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .header {
                    padding: 20px;
                    text-align: center;
                    justify-content: center;
                }
                
                .header-title {
                    flex-direction: column;
                    text-align: center;
                }
                
                .qr-container img {
                    width: 250px;
                    height: 250px;
                }
                
                .grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="dashboard">
            <div class="header">
                <div class="header-title">
                    <div class="logo">💬</div>
                    <div class="title-group">
                        <h1>WhatsApp Bot Dashboard</h1>
                        <p>Panel de Control Profesional</p>
                    </div>
                </div>
                <div class="status-badge ${isAuthenticated ? 'connected' : 'disconnected'}">
                    <span>${isAuthenticated ? '●' : '○'}</span>
                    ${isAuthenticated ? 'Conectado' : 'Desconectado'}
                </div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon blue">⏱️</div>
                        <div class="card-title">Tiempo Activo</div>
                    </div>
                    <div class="card-value">${uptimeFormatted}</div>
                    <div class="card-subtitle">Desde el inicio del servicio</div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon green">📤</div>
                        <div class="card-title">Mensajes Enviados</div>
                    </div>
                    <div class="card-value">${messageStats.sent}</div>
                    <div class="card-subtitle">Total de mensajes procesados</div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon purple">📥</div>
                        <div class="card-title">Mensajes Recibidos</div>
                    </div>
                    <div class="card-value">${messageStats.received}</div>
                    <div class="card-subtitle">Total de mensajes entrantes</div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon orange">📊</div>
                        <div class="card-title">Estado del Sistema</div>
                    </div>
                    <div class="card-value">${connectionStatus === 'connected' ? '100%' : '0%'}</div>
                    <div class="card-subtitle">Operatividad del bot</div>
                </div>
            </div>
            
            ${!isAuthenticated ? `
            <div class="qr-section">
                <h2 style="color: white; margin-bottom: 10px;">🔐 Autenticación Requerida</h2>
                <p class="qr-instructions">
                    Escanea el código QR con WhatsApp en tu teléfono:<br>
                    <strong>WhatsApp > Configuración > Dispositivos vinculados > Vincular dispositivo</strong>
                </p>
                ${qrCode ? `
                    <div class="qr-container">
                        <img src="${qrCode}" alt="QR Code" id="qr-code">
                    </div>
                ` : `
                    <div style="padding: 40px;">
                        <div class="loading"></div>
                        <p style="color: #94a3b8; margin-top: 16px;">Generando código QR...</p>
                    </div>
                `}
                <button class="btn" onclick="location.reload()">
                    🔄 Actualizar código
                </button>
            </div>
            ` : `
            <div class="qr-section">
                <div class="success-message">
                    <span style="font-size: 24px;">✅</span>
                    <div>
                        <strong>Bot autenticado y funcionando correctamente</strong><br>
                        <small>Sistema operativo y listo para recibir peticiones API</small>
                    </div>
                </div>
            </div>
            `}
            
            <div class="api-docs">
                <div class="api-title">
                    <span>📡</span> Documentación API
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-path">/send-text</span>
                    <p class="endpoint-desc">Envía un mensaje de texto a un número de WhatsApp</p>
                    <div class="code-example">
                        <code>{
  "number": "51987654321",
  "message": "Hola desde el bot"
}</code>
                    </div>
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-path">/send-file</span>
                    <p class="endpoint-desc">Envía un archivo (documento, imagen, video) a un contacto</p>
                    <div class="code-example">
                        <code>Content-Type: multipart/form-data
number: 51987654321
file: [archivo adjunto]</code>
                    </div>
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-path">/status</span>
                    <p class="endpoint-desc">Obtiene el estado actual del bot y estadísticas del sistema</p>
                    <div class="code-example">
                        <code>Response: {
  "authenticated": true,
  "status": "connected",
  "uptime": ${uptime},
  "stats": { "sent": ${messageStats.sent}, "received": ${messageStats.received} }
}</code>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            // Auto-refresh del estado cada 5 segundos
            setInterval(async () => {
                try {
                    const response = await fetch('/status');
                    const data = await response.json();
                    if (data.authenticated !== ${isAuthenticated}) {
                        location.reload();
                    }
                } catch (error) {
                    console.error('Error al verificar estado:', error);
                }
            }, 5000);
            
            // Animación suave del QR cuando se carga
            const qrImage = document.getElementById('qr-code');
            if (qrImage) {
                qrImage.style.opacity = '0';
                qrImage.style.transform = 'scale(0.9)';
                qrImage.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    qrImage.style.opacity = '1';
                    qrImage.style.transform = 'scale(1)';
                }, 100);
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Función auxiliar para formatear el uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}


// ============================================================
// ENDPOINT - ESTADO DE LA CONEXIÓN (MEJORADO)
// ============================================================
app.get("/status", (req, res) => {
    const uptime = Math.floor((new Date() - botInfo.startTime) / 1000);
    res.json({
        authenticated: isAuthenticated,
        status: connectionStatus,
        uptime: uptime,
        stats: messageStats,
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
// 1. ENVIAR MENSAJE DE TEXTO (MEJORADO)
// ============================================================
app.post("/send-text", async (req, res) => {
    const { number, message } = req.body;

    if (!isAuthenticated) {
        return res.status(400).json({ 
            success: false,
            error: "Bot no está autenticado" 
        });
    }

    if (!number || !message) {
        return res.status(400).json({ 
            success: false,
            error: "Faltan parámetros requeridos: number, message" 
        });
    }

    try {
        const jid = number.includes("@") ? number : `${number}@c.us`;
        await sock.sendMessage(jid, { text: message });
        
        messageStats.sent++;
        
        console.log(`✅ Mensaje enviado a ${number}`);
        return res.json({ 
            success: true,
            status: "success", 
            message: "Mensaje enviado correctamente",
            data: {
                number,
                messageLength: message.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (e) {
        console.error(`❌ Error al enviar mensaje: ${e.message}`);
        return res.status(500).json({ 
            success: false,
            error: e.message 
        });
    }
});

// ============================================================
// 2. ENVIAR ARCHIVO (PDF / IMAGEN / VIDEO) - MEJORADO
// ============================================================
app.post("/send-file", upload.single("file"), async (req, res) => {
    const { number } = req.body;
    const filePath = req.file?.path;
    const mimeType = req.file?.mimetype;

    if (!isAuthenticated) {
        return res.status(400).json({ 
            success: false,
            error: "Bot no está autenticado" 
        });
    }

    if (!number || !filePath) {
        return res.status(400).json({ 
            success: false,
            error: "Faltan parámetros requeridos: number, file" 
        });
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
            status: "success",
            message: "Archivo enviado correctamente",
            data: {
                number,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: mimeType,
                timestamp: new Date().toISOString()
            }
        });
    } catch (e) {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error(`❌ Error al enviar archivo: ${e.message}`);
        return res.status(500).json({ 
            success: false,
            error: e.message 
        });
    }
});

// ============================================================
// INICIALIZAR BOT (MEJORADO)
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

        // ============================================================
        // EVENTO: Actualización de conexión
        // ============================================================
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log("📱 Código QR generado - Escanea desde la web");
                try {
                    // Generar QR con opciones optimizadas para velocidad
                    qrCode = await QRCode.toDataURL(qr, qrOptions);
                    console.log("✅ QR generado en", Date.now() % 1000, "ms");
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
                
                // Obtener información del número conectado
                if (sock.user) {
                    botInfo.phoneNumber = sock.user.id.split(":")[0];
                }
                
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
                    console.log("🔄 Reintentando conexión en 3 segundos...");
                    setTimeout(() => startBot(), 3000);
                } else {
                    console.log("⚠️  Sesión eliminada - Se requiere nuevo escaneo QR");
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
            if (!message.key.fromMe && message.message) {
                messageStats.received++;
                const from = message.key.remoteJid;
                const text = message.message.conversation || 
                            message.message.extendedTextMessage?.text || 
                            "[Mensaje multimedia]";
                console.log(`📨 Mensaje de ${from}: ${text}`);
            }
        });

    } catch (error) {
        console.error("❌ Error crítico al inicializar bot:", error);
        console.log("🔄 Reintentando en 5 segundos...");
        setTimeout(() => startBot(), 5000);
    }
}


// ============================================================
// INICIAR SERVIDOR EXPRESS
// ============================================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log("");
    console.log("╔════════════════════════════════════════╗");
    console.log("║  🌐 SERVIDOR EXPRESS INICIADO         ║");
    console.log("╚════════════════════════════════════════╝");
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Dashboard disponible en la raíz`);
    console.log(`📡 API REST lista para peticiones`);
    console.log("");
    startBot();
});
