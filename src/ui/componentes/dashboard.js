// Componente Dashboard (Cards de estadísticas)
export function createDashboardCards() {
    return `
        <div class="grid">
            <div class="card">
                <div class="card-header">
                    <div class="card-icon blue">⏱️</div>
                    <div class="card-title">Tiempo Activo</div>
                </div>
                <div class="card-value" id="uptime">00:00:00</div>
                <div class="card-subtitle">Desde el inicio del servicio</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-icon green">📤</div>
                    <div class="card-title">Mensajes Enviados</div>
                </div>
                <div class="card-value" id="messages-sent">0</div>
                <div class="card-subtitle">Total de mensajes procesados</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-icon purple">📥</div>
                    <div class="card-title">Mensajes Recibidos</div>
                </div>
                <div class="card-value" id="messages-received">0</div>
                <div class="card-subtitle">Total de mensajes entrantes</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-icon orange">📊</div>
                    <div class="card-title">Estado del Sistema</div>
                </div>
                <div class="card-value" id="system-status">0%</div>
                <div class="card-subtitle">Operatividad del bot</div>
            </div>
        </div>
    `;
}

// Actualizar estadísticas del dashboard
export function updateDashboardStats(data) {
    document.getElementById('uptime').textContent = data.uptimeFormatted || '00:00:00';
    document.getElementById('messages-sent').textContent = data.messageStats?.sent || 0;
    document.getElementById('messages-received').textContent = data.messageStats?.received || 0;
    document.getElementById('system-status').textContent = data.connectionStatus === 'connected' ? '100%' : '0%';
}
