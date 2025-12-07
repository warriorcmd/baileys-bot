# 📦 Sistema de Componentes Modulares

Este proyecto ahora utiliza un sistema de componentes modulares con JavaScript ES6 Modules para mejor organización y mantenibilidad del código.

## 📁 Estructura de Componentes

```
src/ui/componentes/
├── app.js          # Archivo principal - coordina todos los componentes
├── sidebar.js      # Componente de navegación lateral
├── header.js       # Componente de encabezado con estado
├── footer.js       # Componente de pie de página
├── dashboard.js    # Componente de tarjetas estadísticas
├── auth.js         # Componente de autenticación (QR)
├── forms.js        # Componente de formularios de mensajes
└── api-docs.js     # Componente de documentación API
```

## 🚀 Cómo Usar los Componentes

### 1. Importar en tu HTML

En el archivo `index.html`, ya está configurado:

```html
<!-- Importar componentes modulares -->
<script type="module" src="componentes/app.js"></script>
```

### 2. Usar un Componente Individual

Si quieres usar un componente específico en otra página:

```javascript
// En tu archivo JavaScript
import { createSidebar, initSidebarEvents } from './componentes/sidebar.js';
import { createHeader, updateHeaderStatus } from './componentes/header.js';

// Renderizar componentes
document.getElementById('sidebar-container').innerHTML = createSidebar();
document.getElementById('header-container').innerHTML = createHeader();

// Inicializar eventos
initSidebarEvents();
```

### 3. Crear un Nuevo Componente

Para crear un nuevo componente, sigue este patrón:

```javascript
// componentes/mi-componente.js

// Función para crear el HTML del componente
export function createMiComponente(datos) {
    return `
        <div class="mi-componente">
            <h2>${datos.titulo}</h2>
            <p>${datos.descripcion}</p>
        </div>
    `;
}

// Función para inicializar eventos del componente
export function initMiComponente() {
    document.querySelector('.mi-componente').addEventListener('click', () => {
        console.log('Componente clickeado');
    });
}

// Función para actualizar el componente
export function updateMiComponente(nuevosDatos) {
    const elemento = document.querySelector('.mi-componente h2');
    elemento.textContent = nuevosDatos.titulo;
}
```

Luego impórtalo en `app.js`:

```javascript
import { createMiComponente, initMiComponente } from './mi-componente.js';
```

## 📋 Componentes Disponibles

### **sidebar.js**
- `createSidebar()` - Retorna HTML del sidebar
- `initSidebarEvents()` - Inicializa navegación del menú

### **header.js**
- `createHeader()` - Retorna HTML del header
- `updateHeaderStatus(isAuthenticated)` - Actualiza el badge de estado

### **footer.js**
- `createFooter()` - Retorna HTML del footer con año actualizado

### **dashboard.js**
- `createDashboardCards()` - Retorna HTML de las tarjetas estadísticas
- `updateDashboardStats(data)` - Actualiza los valores de las estadísticas

### **auth.js**
- `createAuthSection(isAuthenticated)` - Retorna HTML de la sección de autenticación
- `loadQR()` - Carga el código QR desde el servidor
- `actualizarQR()` - Genera un nuevo código QR
- `cerrarSesion()` - Cierra la sesión actual

### **forms.js**
- `createFormSection(isAuthenticated)` - Retorna HTML de los formularios
- `switchTab(tab)` - Cambia entre pestañas de texto/archivo
- `showAlert(message, type)` - Muestra alertas al usuario
- `enviarTexto(e)` - Envía mensaje de texto
- `enviarArchivo(e)` - Envía archivo adjunto

### **api-docs.js**
- `createApiDocs()` - Retorna HTML de la documentación de endpoints

## 🔧 Ventajas del Sistema Modular

✅ **Separación de responsabilidades** - Cada componente maneja su propia lógica
✅ **Reutilización** - Usa los mismos componentes en diferentes páginas
✅ **Mantenibilidad** - Fácil encontrar y modificar código específico
✅ **Testing** - Puedes probar componentes individualmente
✅ **Colaboración** - Múltiples desarrolladores pueden trabajar en diferentes componentes
✅ **Escalabilidad** - Agrega nuevos componentes sin afectar los existentes

## 📝 Ejemplo de Uso Avanzado

### Crear una nueva página usando componentes:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva Página</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="sidebar"></div>
    <div id="content"></div>
    <div id="footer"></div>
    
    <script type="module">
        import { createSidebar, initSidebarEvents } from './componentes/sidebar.js';
        import { createFooter } from './componentes/footer.js';
        
        // Renderizar componentes
        document.getElementById('sidebar').innerHTML = createSidebar();
        document.getElementById('footer').innerHTML = createFooter();
        
        // Inicializar
        initSidebarEvents();
    </script>
</body>
</html>
```

## 🌐 Compatibilidad

Los módulos ES6 son compatibles con:
- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 11+
- ✅ Edge 16+

## 🔍 Debugging

Para depurar componentes:

```javascript
// En componentes/app.js
console.log('Estado actual:', { isAuthenticated });

// En cualquier componente
export function debugComponente() {
    console.log('Debug info:', document.querySelector('.mi-selector'));
}
```

## 📚 Recursos Adicionales

- [MDN - JavaScript Modules](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [ES6 Modules Documentation](https://javascript.info/modules-intro)
