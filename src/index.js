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
    const uptime = Math.floor((new Date() - botInfo.startTime) / 1000);
    const uptimeFormatted = formatUptime(uptime);
    
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WhatsApp Bot Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,sans-serif;background:#0a1929;min-height:100vh;color:#e2e8f0;padding:20px}
.dashboard{max-width:1400px;margin:0 auto}
.header{background:linear-gradient(135deg,#073f68,#0a1929);padding:40px 30px;border-radius:20px;box-shadow:0 8px 32px rgba(7,63,104,.6);margin-bottom:24px;position:relative;overflow:hidden}
.header::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:url('/images/Drago%20Whatsap.png') left center no-repeat,url('/images/Logo%20sdrimsac%20(2).png') right center no-repeat;background-size:180px auto,180px auto;opacity:0.15;pointer-events:none}
.header-content{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:30px}
.header-logos{display:flex;align-items:center;gap:30px;flex:1}
.logo-img{height:80px;width:auto;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(255,255,255,.3))}
.header-title{display:flex;flex-direction:column;gap:8px;flex:1;text-align:center}
.header-title h1{color:#fff;font-size:32px;font-weight:700;margin:0;text-shadow:0 2px 8px rgba(0,0,0,.3)}
.header-title p{color:#94e9ff;font-size:15px;font-weight:500;margin:0}
.status-badge{padding:10px 24px;border-radius:25px;font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,.3)}
.status-badge.connected{background:#10b981;color:#fff;border:2px solid #34d399;animation:pulse 2s infinite}
.status-badge.disconnected{background:#ef4444;color:#fff;border:2px solid #f87171}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:24px}
.card{background:linear-gradient(135deg,#1e293b,#0f1e2e);padding:24px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.4);border:1px solid #073f68;transition:all .3s}
.card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(7,63,104,.4);border-color:#0a5a99}
.card-header{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.card-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}
.card-icon.blue{background:linear-gradient(135deg,#073f68,#0a5a99);box-shadow:0 4px 12px rgba(7,63,104,.5)}
.card-icon.green{background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 4px 12px rgba(16,185,129,.5)}
.card-icon.purple{background:linear-gradient(135deg,#073f68,#3b82f6);box-shadow:0 4px 12px rgba(59,130,246,.5)}
.card-icon.orange{background:linear-gradient(135deg,#0a5a99,#3b82f6);box-shadow:0 4px 12px rgba(10,90,153,.5)}
.card-title{font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.card-value{font-size:32px;font-weight:700;color:#fff;margin-top:8px}
.card-subtitle{color:#64748b;font-size:12px;margin-top:8px}
.qr-section{background:linear-gradient(135deg,#1e293b,#0f1e2e);padding:40px;border-radius:12px;text-align:center;border:1px solid #073f68;margin-bottom:24px;box-shadow:0 4px 16px rgba(7,63,104,.3)}
.qr-container{display:inline-block;padding:20px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.3);margin:20px 0}
.qr-container img{display:block;width:280px;height:280px;border-radius:8px}
.qr-instructions{color:#94a3b8;font-size:14px;line-height:1.6;max-width:480px;margin:20px auto}
.api-docs{background:linear-gradient(135deg,#1e293b,#0f1e2e);padding:30px;border-radius:12px;border:1px solid #073f68;box-shadow:0 4px 16px rgba(7,63,104,.3)}
.api-title{font-size:18px;font-weight:700;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:10px}
.endpoint{background:#0f172a;padding:18px;border-radius:8px;margin-bottom:14px;border-left:4px solid #073f68;transition:transform .2s}
.endpoint:hover{transform:translateX(4px)}
.endpoint-method{display:inline-block;padding:4px 12px;border-radius:6px;font-weight:600;font-size:11px;margin-right:10px}
.method-post{background:#3b82f6;color:#fff}
.method-get{background:#10b981;color:#fff}
.endpoint-path{font-family:'Courier New',monospace;color:#073f68;font-size:13px;font-weight:600}
.endpoint-desc{color:#94a3b8;font-size:12px;margin-top:8px}
.code-example{background:#0f172a;padding:14px;border-radius:6px;margin-top:10px;overflow-x:auto}
.code-example code{color:#e2e8f0;font-family:'Courier New',monospace;font-size:11px;line-height:1.5;white-space:pre}
.btn{background:linear-gradient(135deg,#073f68,#051f36);color:#fff;border:none;padding:12px 28px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:transform .2s;display:inline-flex;align-items:center;gap:8px}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(7,63,104,.5)}
.btn:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);margin-left:10px}
.btn-danger:hover{box-shadow:0 8px 20px rgba(239,68,68,.4)}
.btn-group{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:20px}
.success-message{background:rgba(16,185,129,.1);border:1px solid #10b981;color:#10b981;padding:16px;border-radius:8px;margin:20px 0;display:flex;align-items:center;gap:12px;font-size:13px}
.loading{display:inline-block;width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-radius:50%;border-top-color:#fff;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.form-section{background:linear-gradient(135deg,#1e293b,#0f1e2e);padding:30px;border-radius:12px;border:1px solid #073f68;margin-bottom:24px;box-shadow:0 4px 16px rgba(7,63,104,.3)}
.form-title{font-size:18px;font-weight:700;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:10px}
.form-group{margin-bottom:20px}
.form-label{display:block;color:#94a3b8;font-size:14px;font-weight:600;margin-bottom:8px}
.form-input,.form-textarea,.form-file{width:100%;padding:12px;border-radius:8px;border:2px solid #334155;background:#0a1929;color:#e2e8f0;font-size:14px;font-family:'Inter',sans-serif;transition:all .3s}
.form-input:focus,.form-textarea:focus,.form-file:focus{outline:none;border-color:#073f68;box-shadow:0 0 0 3px rgba(7,63,104,.2)}
.form-textarea{min-height:100px;resize:vertical}
.form-file{padding:10px;cursor:pointer}
.form-submit{width:100%;background:linear-gradient(135deg,#073f68,#051f36);color:#fff;border:none;padding:14px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;transition:transform .2s}
.form-submit:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(7,63,104,.5)}
.form-submit:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.alert{padding:14px;border-radius:8px;margin-bottom:16px;font-size:14px;display:none}
.alert.show{display:block}
.alert-success{background:rgba(16,185,129,.1);border:1px solid #10b981;color:#10b981}
.alert-error{background:rgba(239,68,68,.1);border:1px solid #ef4444;color:#ef4444}
.tabs{display:flex;gap:10px;margin-bottom:20px;border-bottom:2px solid #334155}
.tab{padding:12px 24px;background:transparent;border:none;color:#94a3b8;font-size:14px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .2s}
.tab:hover{color:#e2e8f0}
.tab.active{color:#3b9eff;border-bottom-color:#073f68;background:rgba(7,63,104,.1)}
.tab-content{display:none}
.tab-content.active{display:block}
@media (max-width:768px){.header{padding:30px 20px}.header::before{background-size:120px auto,120px auto;opacity:0.1}.header-content{flex-direction:column;text-align:center}.header-logos{flex-direction:column;gap:20px}.logo-img{height:60px}.header-title h1{font-size:24px}.qr-container img{width:240px;height:240px}.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="dashboard">
<div class="header">
<div class="header-content">
<div class="header-logos">
<img src="/images/Logo%20sdrimsac%20(2).png" alt="Logo Sdrimsac" class="logo-img">
</div>
<div class="header-title">
<h1>Sdrimsac WhatsApp Bot</h1>
<p>Panel de Control y Gestión de Mensajes</p>
</div>
<div class="header-logos">
<img src="/images/Drago%20Whatsap.png" alt="WhatsApp Dragon" class="logo-img">
</div>
</div>
<div style="text-align:center;margin-top:20px">
<div class="status-badge ${isAuthenticated ? 'connected' : 'disconnected'}">
<span>${isAuthenticated ? '●' : '○'}</span>
${isAuthenticated ? 'Conectado' : 'Desconectado'}
</div>
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
<h2 style="color:#fff;margin-bottom:10px">🔐 Autenticación Requerida</h2>
<p class="qr-instructions">Escanea el código QR con WhatsApp:<br><strong>WhatsApp › Configuración › Dispositivos vinculados › Vincular dispositivo</strong></p>
<div id="qr-area">
<div style="padding:40px">
<div class="loading"></div>
<p style="color:#94a3b8;margin-top:16px">Generando código QR...</p>
</div>
</div>
<div class="btn-group">
<button class="btn" onclick="location.reload()">🔄 Actualizar código</button>
</div>
</div>
` : `
<div class="qr-section">
<div class="success-message">
<span style="font-size:24px">✅</span>
<div><strong>Bot autenticado y funcionando correctamente</strong><br><small>Sistema operativo y listo para recibir peticiones API</small></div>
</div>
<div class="btn-group">
<button class="btn btn-danger" onclick="cerrarSesion()">🚪 Cerrar Sesión</button>
</div>
</div>
`}
${isAuthenticated ? `
<div class="form-section">
<div class="form-title"><span>📤</span> Enviar Mensajes</div>
<div class="tabs">
<button class="tab active" onclick="switchTab('text')">✉️ Mensaje de Texto</button>
<button class="tab" onclick="switchTab('file')">📎 Enviar Archivo</button>
</div>
<div id="alert" class="alert"></div>
<div id="tab-text" class="tab-content active">
<form onsubmit="enviarTexto(event)">
<div class="form-group">
<label class="form-label">Número de WhatsApp</label>
<input type="text" id="text-number" class="form-input" placeholder="51987654321" required>
<small style="color:#64748b;font-size:12px;margin-top:4px;display:block">Incluye código de país sin +</small>
</div>
<div class="form-group">
<label class="form-label">Mensaje</label>
<textarea id="text-message" class="form-textarea" placeholder="Escribe tu mensaje aquí..." required></textarea>
</div>
<button type="submit" id="text-btn" class="form-submit">📤 Enviar Mensaje</button>
</form>
</div>
<div id="tab-file" class="tab-content">
<form onsubmit="enviarArchivo(event)">
<div class="form-group">
<label class="form-label">Número de WhatsApp</label>
<input type="text" id="file-number" class="form-input" placeholder="51987654321" required>
<small style="color:#64748b;font-size:12px;margin-top:4px;display:block">Incluye código de país sin +</small>
</div>
<div class="form-group">
<label class="form-label">Seleccionar Archivo</label>
<input type="file" id="file-input" class="form-file" required>
<small style="color:#64748b;font-size:12px;margin-top:4px;display:block">PDF, imágenes, videos, documentos</small>
</div>
<button type="submit" id="file-btn" class="form-submit">📎 Enviar Archivo</button>
</form>
</div>
</div>
` : ''}
<div class="api-docs">
<div class="api-title"><span>📡</span> API REST Endpoints</div>
<div class="endpoint">
<span class="endpoint-method method-post">POST</span>
<span class="endpoint-path">/send-text</span>
<p class="endpoint-desc">Envía un mensaje de texto a un número de WhatsApp</p>
<div class="code-example"><code>{ "number": "51987654321", "message": "Hola desde el bot" }</code></div>
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
</div>
</div>
</div>
<script>
// Cargar QR de forma asíncrona (más rápido)
${!isAuthenticated ? `
(async()=>{
try{
const r=await fetch('/qr');
const d=await r.json();
if(d.available&&d.qr){
document.getElementById('qr-area').innerHTML='<div class="qr-container"><img src="'+d.qr+'" alt="QR Code" style="opacity:0;transition:opacity 0.3s" onload="this.style.opacity=1"></div>';
}
}catch(e){console.error('Error:',e)}
})();
` : ''}
// Auto-refresh cada 5 segundos
setInterval(async()=>{
try{
const r=await fetch('/status');
const d=await r.json();
if(d.authenticated!==${isAuthenticated})location.reload();
}catch(e){}
},5000);
// Función para cerrar sesión
async function cerrarSesion(){
if(confirm('¿Estás seguro de que deseas cerrar la sesión? Deberás escanear el QR nuevamente.')){
try{
const r=await fetch('/logout',{method:'POST'});
const d=await r.json();
if(d.success){
alert('✅ Sesión cerrada exitosamente');
location.reload();
}else{
alert('❌ Error: '+d.error);
}
}catch(e){
alert('❌ Error al cerrar sesión: '+e.message);
}
}
}
// Función para cambiar pestañas
function switchTab(tab){
const tabs=document.querySelectorAll('.tab');
const contents=document.querySelectorAll('.tab-content');
tabs.forEach(t=>t.classList.remove('active'));
contents.forEach(c=>c.classList.remove('active'));
event.target.classList.add('active');
document.getElementById('tab-'+tab).classList.add('active');
document.getElementById('alert').classList.remove('show');
}
// Función para mostrar alertas
function showAlert(message,type){
const alert=document.getElementById('alert');
alert.textContent=message;
alert.className='alert alert-'+type+' show';
setTimeout(()=>alert.classList.remove('show'),5000);
}
// Función para enviar texto
async function enviarTexto(e){
e.preventDefault();
const btn=document.getElementById('text-btn');
const number=document.getElementById('text-number').value;
const message=document.getElementById('text-message').value;
btn.disabled=true;
btn.textContent='📤 Enviando...';
try{
const r=await fetch('/send-text',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({number,message})
});
const d=await r.json();
if(d.success){
showAlert('✅ Mensaje enviado exitosamente','success');
document.getElementById('text-message').value='';
}else{
showAlert('❌ Error: '+d.error,'error');
}
}catch(e){
showAlert('❌ Error de conexión: '+e.message,'error');
}finally{
btn.disabled=false;
btn.textContent='📤 Enviar Mensaje';
}
}
// Función para enviar archivo
async function enviarArchivo(e){
e.preventDefault();
const btn=document.getElementById('file-btn');
const number=document.getElementById('file-number').value;
const fileInput=document.getElementById('file-input');
const file=fileInput.files[0];
if(!file){
showAlert('❌ Selecciona un archivo','error');
return;
}
btn.disabled=true;
btn.textContent='📎 Enviando...';
const formData=new FormData();
formData.append('number',number);
formData.append('file',file);
try{
const r=await fetch('/send-file',{
method:'POST',
body:formData
});
const d=await r.json();
if(d.success){
showAlert('✅ Archivo enviado exitosamente','success');
fileInput.value='';
}else{
showAlert('❌ Error: '+d.error,'error');
}
}catch(e){
showAlert('❌ Error de conexión: '+e.message,'error');
}finally{
btn.disabled=false;
btn.textContent='📎 Enviar Archivo';
}
}
</script>
</body>
</html>`);
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
// ENDPOINT - CERRAR SESIÓN Y ELIMINAR ARCHIVOS
// ============================================================
app.post("/logout", async (req, res) => {
    try {
        console.log("🔐 Cerrando sesión...");
        
        // Cerrar socket si está conectado
        if (sock) {
            await sock.logout();
            sock = null;
        }
        
        // Eliminar archivos de sesión
        const sessionPath = "./session";
        if (fs.existsSync(sessionPath)) {
            const files = fs.readdirSync(sessionPath);
            files.forEach(file => {
                const filePath = `${sessionPath}/${file}`;
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(`Error al eliminar ${file}:`, err);
                }
            });
        }
        
        // Resetear variables
        isAuthenticated = false;
        qrCode = null;
        connectionStatus = "disconnected";
        botInfo.phoneNumber = null;
        
        console.log("✅ Sesión cerrada exitosamente");
        
        // Reiniciar bot después de 2 segundos
        setTimeout(() => startBot(), 2000);
        
        res.json({ success: true, message: "Sesión cerrada correctamente" });
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
// INICIAR SERVIDOR
// ============================================================
const PORT = 3000;
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
