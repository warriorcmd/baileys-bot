// Componente Sidebar
export function createSidebar() {
    return `
        <div class="sidebar">
            <div class="sidebar-header">
                <img src="/images/Logo%20sdrimsac%20(2).png" alt="Logo" style="max-width: 150px; height: auto;">
            </div>
            
            <nav class="sidebar-menu">
                <div class="menu-item">
                    <a href="#dashboard" class="active">
                        <span class="menu-icon">📊</span>
                        <span class="menu-text">Dashboard</span>
                    </a>
                </div>
                
                <div class="menu-item">
                    <a href="#endpoints">
                        <span class="menu-icon">🔌</span>
                        <span class="menu-text">Endpoints</span>
                    </a>
                </div>
            </nav>
            
            <div class="sidebar-footer">
                <p>© 2025 Baileys Bot</p>
                <p>v1.0.0</p>
            </div>
        </div>
    `;
}

// Inicializar eventos del sidebar
export function initSidebarEvents() {
    document.querySelectorAll('.menu-item a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            document.querySelectorAll('.menu-item a').forEach(l => {
                l.classList.remove('active');
            });
            
            // Agregar clase active al enlace clickeado
            this.classList.add('active');
            
            // Mostrar/ocultar secciones
            const section = this.getAttribute('href').substring(1);
            
            if (section === 'dashboard') {
                document.querySelector('.dashboard').style.display = 'block';
                document.getElementById('api-docs-section').style.display = 'none';
            } else if (section === 'endpoints') {
                document.querySelector('.dashboard').style.display = 'none';
                document.getElementById('api-docs-section').style.display = 'block';
            }
        });
    });
}
