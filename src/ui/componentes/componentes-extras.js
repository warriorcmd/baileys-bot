// ============================================
// COMPONENTES EXTRAS - Ejemplos avanzados
// ============================================

// Estos son componentes adicionales que puedes usar
// desde cualquier parte de tu aplicación

// ===== COMPONENTE MODAL =====
export function createModal(title, content) {
    return `
        <div class="modal-overlay" id="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

export function showModal(title, content) {
    // Crear o actualizar modal
    let modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = createModal(title, content);
    
    // Mostrar modal
    setTimeout(() => {
        document.getElementById('modal-overlay').classList.add('active');
    }, 10);
}

export function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            const container = document.getElementById('modal-container');
            if (container) container.remove();
        }, 300);
    }
}

// Exponer función global
window.closeModal = closeModal;

// ===== COMPONENTE TOAST NOTIFICATION =====
export function showToast(message, type = 'info', duration = 3000) {
    // Crear contenedor si no existe
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span style="font-size: 20px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remover después del tiempo especificado
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== COMPONENTE LOADING SPINNER =====
export function showLoading() {
    let spinner = document.getElementById('spinner-overlay');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'spinner-overlay';
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
    }
    spinner.classList.add('active');
}

export function hideLoading() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) {
        spinner.classList.remove('active');
    }
}

// ===== COMPONENTE DROPDOWN =====
export function createDropdown(buttonText, items) {
    const itemsHtml = items.map(item => 
        `<a href="${item.href || '#'}" class="dropdown-item" ${item.onclick ? `onclick="${item.onclick}"` : ''}>${item.label}</a>`
    ).join('');
    
    return `
        <div class="dropdown">
            <button class="dropdown-toggle" onclick="window.toggleDropdown(this)">
                ${buttonText}
                <span>▼</span>
            </button>
            <div class="dropdown-menu">
                ${itemsHtml}
            </div>
        </div>
    `;
}

export function toggleDropdown(button) {
    const dropdown = button.closest('.dropdown');
    const allDropdowns = document.querySelectorAll('.dropdown');
    
    // Cerrar otros dropdowns
    allDropdowns.forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
    });
    
    // Toggle este dropdown
    dropdown.classList.toggle('active');
}

// Cerrar dropdowns al hacer click fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(d => {
            d.classList.remove('active');
        });
    }
});

window.toggleDropdown = toggleDropdown;

// ===== COMPONENTE TABS =====
export function createTabs(tabs) {
    const tabHeaders = tabs.map((tab, index) => 
        `<button class="tab-button ${index === 0 ? 'active' : ''}" onclick="window.switchTabComponent('tab-${index}')">${tab.title}</button>`
    ).join('');
    
    const tabPanels = tabs.map((tab, index) => 
        `<div class="tab-panel ${index === 0 ? 'active' : ''}" id="tab-${index}">${tab.content}</div>`
    ).join('');
    
    return `
        <div class="tabs-wrapper">
            <div class="tabs-header">
                ${tabHeaders}
            </div>
            <div class="tabs-content">
                ${tabPanels}
            </div>
        </div>
    `;
}

export function switchTabComponent(tabId) {
    // Remover active de todos
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Activar el seleccionado
    const button = event.target;
    const panel = document.getElementById(tabId);
    
    button.classList.add('active');
    panel.classList.add('active');
}

window.switchTabComponent = switchTabComponent;

// ===== COMPONENTE ACCORDION =====
export function createAccordion(items) {
    return items.map((item, index) => `
        <div class="accordion-item" id="accordion-${index}">
            <div class="accordion-header" onclick="window.toggleAccordion('accordion-${index}')">
                <span>${item.title}</span>
                <span class="accordion-icon">▼</span>
            </div>
            <div class="accordion-content">
                <div>${item.content}</div>
            </div>
        </div>
    `).join('');
}

export function toggleAccordion(itemId) {
    const item = document.getElementById(itemId);
    item.classList.toggle('active');
}

window.toggleAccordion = toggleAccordion;

// ===== COMPONENTE BADGE =====
export function createBadge(text, type = 'info') {
    return `<span class="badge ${type}">${text}</span>`;
}

// ===== UTILIDAD: Confirmar Acción =====
export async function confirmarAccion(mensaje, tipo = 'warning') {
    return new Promise((resolve) => {
        const content = `
            <p style="margin-bottom: 20px;">${mensaje}</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn" onclick="window.confirmarCancelar()">Cancelar</button>
                <button class="btn btn-danger" onclick="window.confirmarAceptar()">Confirmar</button>
            </div>
        `;
        
        showModal(tipo === 'danger' ? '⚠️ Confirmar Acción' : 'ℹ️ Confirmación', content);
        
        window.confirmarAceptar = () => {
            closeModal();
            resolve(true);
        };
        
        window.confirmarCancelar = () => {
            closeModal();
            resolve(false);
        };
    });
}

// ===== EJEMPLO DE USO =====
/*
// Importar en tu app.js o donde lo necesites:
import { showToast, showModal, showLoading, hideLoading } from './componentes-extras.js';

// Usar:
showToast('¡Operación exitosa!', 'success');
showModal('Título', '<p>Contenido del modal</p>');
showLoading();
setTimeout(() => hideLoading(), 2000);
*/
