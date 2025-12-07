// Componente de Formularios (Envío de mensajes)
export function createFormSection(isAuthenticated) {
    if (!isAuthenticated) {
        return '';
    }

    return `
        <div class="form-section">
            <div class="form-title"><span>📤</span> Enviar Mensajes</div>
            <div class="tabs">
                <button class="tab active" onclick="window.switchTab('text')">✉️ Mensaje de Texto</button>
                <button class="tab" onclick="window.switchTab('file')">📎 Enviar Archivo</button>
            </div>
            <div id="alert" class="alert"></div>
            <div id="tab-text" class="tab-content active">
                <form onsubmit="window.enviarTexto(event)">
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
                <form onsubmit="window.enviarArchivo(event)">
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
    `;
}

// Función para cambiar pestañas
export function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('alert').classList.remove('show');
}

// Función para mostrar alertas
export function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = 'alert alert-' + type + ' show';
    setTimeout(() => alert.classList.remove('show'), 5000);
}

// Función para enviar texto
export async function enviarTexto(e) {
    e.preventDefault();
    const btn = document.getElementById('text-btn');
    const number = document.getElementById('text-number').value;
    const message = document.getElementById('text-message').value;
    btn.disabled = true;
    btn.textContent = '📤 Enviando...';
    try {
        const r = await fetch('/send-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, message })
        });
        const d = await r.json();
        if (d.success) {
            showAlert('✅ Mensaje enviado exitosamente', 'success');
            document.getElementById('text-message').value = '';
        } else {
            showAlert('❌ Error: ' + d.error, 'error');
        }
    } catch (e) {
        showAlert('❌ Error de conexión: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '📤 Enviar Mensaje';
    }
}

// Función para enviar archivo
export async function enviarArchivo(e) {
    e.preventDefault();
    const btn = document.getElementById('file-btn');
    const number = document.getElementById('file-number').value;
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        showAlert('❌ Selecciona un archivo', 'error');
        return;
    }
    btn.disabled = true;
    btn.textContent = '📎 Enviando...';
    const formData = new FormData();
    formData.append('number', number);
    formData.append('file', file);
    try {
        const r = await fetch('/send-file', {
            method: 'POST',
            body: formData
        });
        const d = await r.json();
        if (d.success) {
            showAlert('✅ Archivo enviado exitosamente', 'success');
            fileInput.value = '';
        } else {
            showAlert('❌ Error: ' + d.error, 'error');
        }
    } catch (e) {
        showAlert('❌ Error de conexión: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '📎 Enviar Archivo';
    }
}
