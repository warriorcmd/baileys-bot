// Componente de Autenticación (QR)
export function createAuthSection(isAuthenticated) {
    if (!isAuthenticated) {
        return `
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
                    <button class="btn" onclick="window.actualizarQR()">🔄 Actualizar código</button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="qr-section">
                <div class="success-message">
                    <span style="font-size:24px">✅</span>
                    <div><strong>Bot autenticado y funcionando correctamente</strong><br><small>Sistema operativo y listo para recibir peticiones API</small></div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-danger" onclick="window.cerrarSesion()">🚪 Cerrar Sesión</button>
                </div>
            </div>
        `;
    }
}

// Cargar QR de forma asíncrona
export async function loadQR() {
    try {
        const r = await fetch('/qr');
        const d = await r.json();
        if (d.available && d.qr) {
            document.getElementById('qr-area').innerHTML = '<div class="qr-container"><img src="' + d.qr + '" alt="QR Code" style="opacity:0;transition:opacity 0.3s" onload="this.style.opacity=1"></div>';
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

// Función para actualizar QR (borra sesión)
export async function actualizarQR() {
    if (confirm('¿Deseas generar un nuevo código QR? Esto borrará la sesión actual si existe.')) {
        try {
            const r = await fetch('/logout', { method: 'POST' });
            const d = await r.json();
            if (d.success) {
                setTimeout(() => location.reload(), 1000);
            } else {
                alert('❌ Error: ' + d.error);
                location.reload();
            }
        } catch (e) {
            console.error('Error:', e);
            location.reload();
        }
    }
}

// Función para cerrar sesión
export async function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar la sesión? Deberás escanear el QR nuevamente.')) {
        try {
            const r = await fetch('/logout', { method: 'POST' });
            const d = await r.json();
            if (d.success) {
                alert('✅ Sesión cerrada exitosamente');
                location.reload();
            } else {
                alert('❌ Error: ' + d.error);
            }
        } catch (e) {
            alert('❌ Error al cerrar sesión: ' + e.message);
        }
    }
}
