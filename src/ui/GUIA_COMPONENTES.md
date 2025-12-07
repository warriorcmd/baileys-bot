# 📁 Guía Completa: Uso de Componentes desde Diferentes Carpetas

Esta guía te enseña cómo organizar y usar componentes desde diferentes carpetas en tu proyecto.

## 📂 Estructura del Proyecto

```
src/ui/
├── index.html
├── componentes/          # Componentes JavaScript
│   ├── app.js
│   ├── sidebar.js
│   ├── header.js
│   ├── footer.js
│   └── componentes-extras.js
├── css/                  # Estilos compartidos
│   └── componentes-extras.css
├── sidebar/              # Estilos específicos
│   └── sidebar.css
├── header/
│   └── header.css
├── footer/
│   └── footer.css
├── utils/                # Utilidades
│   └── helpers.js
└── ejemplos/             # Ejemplos de uso
    └── demo-componentes.html
```

## 🎯 Métodos de Importación

### 1️⃣ **Importar desde la misma carpeta**

```javascript
// En componentes/app.js
import { createSidebar } from './sidebar.js';
import { createHeader } from './header.js';
```

### 2️⃣ **Importar desde carpeta hermana**

```javascript
// En componentes/app.js importar de utils/
import { formatDate } from '../utils/helpers.js';
```

### 3️⃣ **Importar desde subcarpeta**

```javascript
// Si tienes componentes/auth/login.js
import { login } from './auth/login.js';
```

### 4️⃣ **Importar desde carpeta padre**

```javascript
// En ejemplos/demo.html importar de componentes/
import { showToast } from '../componentes/componentes-extras.js';
```

### 5️⃣ **Importar CSS en HTML**

```html
<!-- Desde la misma carpeta -->
<link rel="stylesheet" href="styles.css">

<!-- Desde carpeta hermana -->
<link rel="stylesheet" href="../css/componentes-extras.css">

<!-- Desde subcarpeta -->
<link rel="stylesheet" href="sidebar/sidebar.css">
```

## 🔧 Ejemplos Prácticos

### Ejemplo 1: Usar Componentes en Nueva Página

Crea `nueva-pagina.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva Página</title>
    
    <!-- Importar estilos desde diferentes carpetas -->
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="css/componentes-extras.css">
    <link rel="stylesheet" href="sidebar/sidebar.css">
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        // Importar componentes desde carpeta componentes/
        import { createSidebar } from './componentes/sidebar.js';
        import { createHeader } from './componentes/header.js';
        import { createFooter } from './componentes/footer.js';
        
        // Importar utilidades desde componentes-extras/
        import { showToast } from './componentes/componentes-extras.js';
        
        // Renderizar
        document.getElementById('app').innerHTML = `
            ${createSidebar()}
            <div class="main-content">
                ${createHeader()}
                <div class="content">
                    <h1>Mi Nueva Página</h1>
                </div>
                ${createFooter()}
            </div>
        `;
        
        // Usar funciones
        showToast('Página cargada correctamente', 'success');
    </script>
</body>
</html>
```

### Ejemplo 2: Crear Módulo de Utilidades

Crea `utils/helpers.js`:

```javascript
// utils/helpers.js
export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES');
}

export function formatNumber(num) {
    return num.toLocaleString('es-ES');
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
```

Úsalo en cualquier componente:

```javascript
// En componentes/dashboard.js
import { formatNumber, formatDate } from '../utils/helpers.js';

export function createDashboard(data) {
    return `
        <div class="dashboard">
            <p>Mensajes: ${formatNumber(data.messages)}</p>
            <p>Fecha: ${formatDate(data.date)}</p>
        </div>
    `;
}
```

### Ejemplo 3: Componente que Usa Múltiples Recursos

```javascript
// componentes/advanced-card.js

// Importar de componentes-extras (misma carpeta)
import { showToast } from './componentes-extras.js';

// Importar de utils (carpeta hermana)
import { formatNumber } from '../utils/helpers.js';

// Importar de subcarpeta
import { validateData } from './validators/data-validator.js';

export function createAdvancedCard(data) {
    // Validar
    if (!validateData(data)) {
        showToast('Datos inválidos', 'error');
        return '';
    }
    
    // Formatear
    const formattedValue = formatNumber(data.value);
    
    // Renderizar
    return `
        <div class="card">
            <h3>${data.title}</h3>
            <p>${formattedValue}</p>
        </div>
    `;
}
```

### Ejemplo 4: Organizar por Características

```
src/ui/
├── features/
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── auth.css
│   ├── dashboard/
│   │   ├── stats.js
│   │   ├── charts.js
│   │   └── dashboard.css
│   └── messages/
│       ├── message-list.js
│       ├── message-form.js
│       └── messages.css
```

Importar:

```javascript
// En index.html o app.js
import { login } from './features/auth/login.js';
import { createStats } from './features/dashboard/stats.js';
import { MessageList } from './features/messages/message-list.js';
```

## 🎨 Importar Estilos en JavaScript

### Opción 1: En el HTML (Recomendado)
```html
<link rel="stylesheet" href="css/componentes-extras.css">
```

### Opción 2: Import dinámico en JavaScript
```javascript
// Crear y agregar elemento link
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '../css/componentes-extras.css';
document.head.appendChild(link);
```

## 📝 Mejores Prácticas

### ✅ DO (Hacer)

```javascript
// ✅ Rutas relativas claras
import { algo } from './mismo-nivel.js';
import { algo } from '../nivel-superior.js';
import { algo } from './subcarpeta/archivo.js';

// ✅ Nombres descriptivos
import { createUserCard } from './user-card.js';
import { validateEmail } from '../utils/validators.js';

// ✅ Exportaciones nombradas
export function createComponent() { }
export function updateComponent() { }

// ✅ Agrupar imports relacionados
import { create, update, delete } from './user-actions.js';
```

### ❌ DON'T (No hacer)

```javascript
// ❌ Rutas absolutas
import { algo } from '/src/ui/componentes/algo.js';

// ❌ Exportaciones por defecto mezcladas
export default function() { }  // Confuso

// ❌ Nombres genéricos
import { func } from './utils.js';
import { data } from './helpers.js';
```

## 🗂️ Patrones de Organización

### Patrón 1: Por Tipo
```
componentes/     # Todos los componentes
estilos/         # Todos los estilos
utilidades/      # Todas las utilidades
```

### Patrón 2: Por Característica (Recomendado)
```
auth/
  ├── auth.js
  ├── auth.css
  └── auth-utils.js
dashboard/
  ├── dashboard.js
  ├── dashboard.css
  └── dashboard-utils.js
```

### Patrón 3: Híbrido
```
componentes/     # Componentes reutilizables
features/        # Características específicas
shared/          # Compartido entre features
```

## 🔍 Debugging de Imports

### Ver qué módulo se está cargando:

```javascript
console.log('Cargando módulo:', import.meta.url);

export function myFunction() {
    console.log('Ejecutando desde:', import.meta.url);
}
```

### Verificar que un módulo se importó correctamente:

```javascript
import * as AuthModule from './auth.js';
console.log('Módulo Auth:', AuthModule);
console.log('Funciones disponibles:', Object.keys(AuthModule));
```

## 🚀 Ejemplo Completo Real

**Estructura:**
```
src/ui/
├── index.html
├── app.js
├── componentes/
│   ├── navbar.js
│   └── footer.js
├── features/
│   └── users/
│       ├── user-list.js
│       └── user-card.js
├── utils/
│   ├── api.js
│   └── formatters.js
└── styles/
    ├── main.css
    └── components.css
```

**app.js:**
```javascript
// Componentes base
import { createNavbar } from './componentes/navbar.js';
import { createFooter } from './componentes/footer.js';

// Features
import { createUserList } from './features/users/user-list.js';

// Utils
import { fetchUsers } from './utils/api.js';

// Inicializar app
async function initApp() {
    // Renderizar estructura
    document.body.innerHTML = `
        ${createNavbar()}
        <main id="content"></main>
        ${createFooter()}
    `;
    
    // Cargar datos
    const users = await fetchUsers();
    
    // Renderizar contenido
    document.getElementById('content').innerHTML = createUserList(users);
}

initApp();
```

**features/users/user-list.js:**
```javascript
// Importar componente hermano
import { createUserCard } from './user-card.js';

// Importar utilidades (2 niveles arriba)
import { formatDate } from '../../utils/formatters.js';

export function createUserList(users) {
    return `
        <div class="user-list">
            ${users.map(user => createUserCard(user)).join('')}
        </div>
    `;
}
```

## 📚 Recursos Adicionales

- **MDN - JavaScript Modules**: https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules
- **Ejemplo de Demo**: Abre `ejemplos/demo-componentes.html` en tu navegador
- **CSS Modules**: Revisa `css/componentes-extras.css` para estilos reutilizables

## 💡 Tips Finales

1. **Mantén las rutas consistentes**: Usa siempre rutas relativas
2. **Organiza por características**: Agrupa código relacionado
3. **Exporta lo mínimo necesario**: Solo exporta lo que otros necesitan
4. **Documenta las dependencias**: Comenta qué módulos usa cada archivo
5. **Usa nombres descriptivos**: Facilita encontrar archivos
