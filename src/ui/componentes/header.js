// Componente Header
export function createHeader() {
    return `
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
                <div class="status-badge" id="status-badge">
                    <span id="status-icon">○</span>
                    <span id="status-text">Desconectado</span>
                </div>
            </div>
        </div>
    `;
}

// Actualizar estado del header
export function updateHeaderStatus(isAuthenticated) {
    const statusBadge = document.getElementById('status-badge');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');

    if (isAuthenticated) {
        statusBadge.className = 'status-badge connected';
        statusIcon.textContent = '●';
        statusText.textContent = 'Conectado';
    } else {
        statusBadge.className = 'status-badge disconnected';
        statusIcon.textContent = '○';
        statusText.textContent = 'Desconectado';
    }
}
