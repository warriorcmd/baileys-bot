// Componente Footer
export function createFooter() {
    return `
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-title">SDRIMSAC</div>
                    <div class="footer-divider"></div>
                    <p class="footer-copyright">
                        © <span class="footer-year">${new Date().getFullYear()}</span> SDRIMSAC - Todos los derechos reservados
                    </p>
                    <p class="footer-copyright">
                        Desarrollado con <span class="footer-icon"></span> por SDRIMSAC
                    </p>
                </div>

                <div class="footer-links">
                    <a href="#privacy" class="footer-link">Política de Privacidad</a>
                    <a href="#terms" class="footer-link">Términos de Uso</a>
                    <a href="#contact" class="footer-link">Contacto</a>
                    <a href="#about" class="footer-link">Acerca de</a>
                </div>

                <div class="footer-bottom">
                    <p class="footer-tech">
                        Powered by Baileys • Node.js • WhatsApp Web API
                    </p>
                </div>
            </div>
        </footer>
    `;
}
