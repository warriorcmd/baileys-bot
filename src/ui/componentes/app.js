// Archivo principal que coordina todos los componentes
import { createSidebar, initSidebarEvents } from './sidebar.js';
import { createHeader, updateHeaderStatus } from './header.js';
import { createFooter } from './footer.js';
import { createDashboardCards, updateDashboardStats } from './dashboard.js';
import { createAuthSection, loadQR, actualizarQR, cerrarSesion } from './auth.js';
import { createFormSection, switchTab, enviarTexto, enviarArchivo } from './forms.js';
import { createApiDocs } from './api-docs.js';

// Estado global
let isAuthenticated = false;

// Función para actualizar la UI con los datos del estado
async function updateUI() {
    try {
        const response = await fetch('/status');
        const data = await response.json();

        isAuthenticated = data.authenticated;

        // Actualizar estado del header
        updateHeaderStatus(isAuthenticated);

        // Actualizar estadísticas del dashboard
        updateDashboardStats(data);

        // Renderizar secciones dinámicas
        renderAuthSection();
        renderFormSection();

    } catch (e) {
        console.error('Error updating UI:', e);
    }
}

// Renderizar sección de autenticación
function renderAuthSection() {
    const authSection = document.getElementById('auth-section');
    authSection.innerHTML = createAuthSection(isAuthenticated);
    
    if (!isAuthenticated) {
        loadQR();
    }
}

// Renderizar sección de formularios
function renderFormSection() {
    const formSection = document.getElementById('form-section');
    formSection.innerHTML = createFormSection(isAuthenticated);
}

// Exponer funciones globales necesarias para onclick en HTML
window.actualizarQR = actualizarQR;
window.cerrarSesion = cerrarSesion;
window.switchTab = switchTab;
window.enviarTexto = enviarTexto;
window.enviarArchivo = enviarArchivo;

// Auto-refresh cada 5 segundos
setInterval(() => {
    updateUI();
}, 5000);

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar eventos del sidebar
    initSidebarEvents();
    
    // Actualizar UI inicial
    updateUI();
});
