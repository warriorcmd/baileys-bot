// ============================================
// UTILIDADES COMUNES
// Funciones helper que puedes usar en tus componentes
// ============================================

// ===== FORMATEO DE DATOS =====

export function formatDate(date, locale = 'es-ES') {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatDateTime(date, locale = 'es-ES') {
    return new Date(date).toLocaleString(locale);
}

export function formatTime(date, locale = 'es-ES') {
    return new Date(date).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

export function formatCurrency(amount, currency = 'PEN') {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatPhone(phone) {
    // Formatea número de teléfono: 51987654321 -> +51 987 654 321
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{3})$/);
    if (match) {
        return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return phone;
}

// ===== VALIDACIONES =====

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 9 && cleaned.length <= 15;
}

export function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

// ===== MANIPULACIÓN DE STRINGS =====

export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str) {
    if (!str) return '';
    return str.split(' ')
        .map(word => capitalize(word))
        .join(' ');
}

export function truncate(str, length = 50, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
}

export function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ===== MANIPULACIÓN DE ARRAYS =====

export function uniqueArray(arr) {
    return [...new Set(arr)];
}

export function groupBy(arr, key) {
    return arr.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

export function sortBy(arr, key, order = 'asc') {
    return [...arr].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

export function chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

// ===== MANIPULACIÓN DE OBJETOS =====

export function pick(obj, keys) {
    return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

export function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}

export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function merge(...objects) {
    return Object.assign({}, ...objects);
}

// ===== UTILIDADES DE TIEMPO =====

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        año: 31536000,
        mes: 2592000,
        semana: 604800,
        día: 86400,
        hora: 3600,
        minuto: 60,
        segundo: 1
    };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return `hace ${interval} ${name}${interval !== 1 ? 's' : ''}`;
        }
    }
    
    return 'hace un momento';
}

// ===== ALMACENAMIENTO LOCAL =====

export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error guardando en localStorage:', e);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error leyendo de localStorage:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error eliminando de localStorage:', e);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error limpiando localStorage:', e);
            return false;
        }
    }
};

// ===== UTILIDADES DOM =====

export function $(selector, context = document) {
    return context.querySelector(selector);
}

export function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on')) {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });
    
    return element;
}

// ===== UTILIDADES DE RED =====

export async function fetchJSON(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en fetchJSON:', error);
        throw error;
    }
}

export function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== UTILIDADES VARIAS =====

export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback para navegadores antiguos
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    }
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

export function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== EJEMPLO DE USO =====
/*
// Importar utilidades en tus componentes:
import { 
    formatDate, 
    formatCurrency, 
    validateEmail,
    capitalize,
    storage,
    fetchJSON
} from './utils/helpers.js';

// Usar:
const fecha = formatDate(new Date());
const precio = formatCurrency(1500);
const esValido = validateEmail('test@example.com');
const nombre = capitalize('juan pérez');

// Guardar en localStorage
storage.set('usuario', { nombre: 'Juan', edad: 30 });
const usuario = storage.get('usuario');

// Hacer petición API
const datos = await fetchJSON('/api/datos');
*/
