/**
 * EJEMPLO DE USO DEL SISTEMA DE DELAY DINÁMICO
 * Para evitar detección de WhatsApp
 */

import messageQueue from './src/helpers/messageQueue.js';

// ============================================
// 1. CONFIGURACIÓN BÁSICA - DELAY DINÁMICO
// ============================================

// Opción A: Usar presets predefinidos (RECOMENDADO)
messageQueue.setDelayPreset('moderado');  // 8-20 segundos (equilibrado)
// messageQueue.setDelayPreset('seguro');    // 15-35 segundos (más seguro)
// messageQueue.setDelayPreset('ultra-seguro'); // 20-45 segundos (máxima seguridad)

// Opción B: Configuración manual personalizada
// messageQueue.setDelay(10000, 25000); // Mínimo 10s, Máximo 25s

// Activar patrón humano (pausas largas cada 5-7 mensajes)
messageQueue.setHumanPattern(true);

console.log('✅ Sistema de delay dinámico configurado');

// ============================================
// 2. ENVIAR MENSAJES (FUNCIONA IGUAL QUE ANTES)
// ============================================

// Ejemplo: Enviar a múltiples contactos
async function enviarMensajesMasivos(sock, numeros, mensaje) {
    console.log(`📤 Enviando ${numeros.length} mensajes con delays dinámicos...`);
    
    const resultados = [];
    
    for (const numero of numeros) {
        try {
            // Agregar a la cola - EL DELAY ES AUTOMÁTICO Y ALEATORIO
            const result = await messageQueue.addToQueue({
                type: 'text',
                sock: sock,
                number: numero,
                message: mensaje
            });
            
            resultados.push({ numero, status: 'enviado', result });
            console.log(`✅ Mensaje a ${numero} agregado (delay aleatorio aplicado)`);
            
        } catch (error) {
            resultados.push({ numero, status: 'error', error: error.message });
            console.error(`❌ Error con ${numero}:`, error.message);
        }
    }
    
    return resultados;
}

// ============================================
// 3. MONITOREAR LA COLA EN TIEMPO REAL
// ============================================

function mostrarEstadoCola() {
    const info = messageQueue.getQueueInfo();
    const stats = messageQueue.getStats();
    
    console.log('\n📊 ESTADO DE LA COLA:');
    console.log(`   Mensajes pendientes: ${info.queueSize}`);
    console.log(`   Procesando: ${info.isProcessing ? 'Sí ✅' : 'No ⏸️'}`);
    console.log(`   Delay promedio: ${info.averageDelay}`);
    console.log(`   Mensajes consecutivos: ${info.consecutiveMessages}`);
    console.log(`   Tiempo estimado: ${info.estimatedWaitTime.minFormatted} - ${info.estimatedWaitTime.maxFormatted}`);
    console.log('\n📈 ESTADÍSTICAS:');
    console.log(`   Total enviados: ${stats.totalSent}`);
    console.log(`   Total fallidos: ${stats.totalFailed}`);
    console.log(`   En cola actual: ${stats.currentQueueSize}`);
}

// Monitorear cada 10 segundos
setInterval(mostrarEstadoCola, 10000);

// ============================================
// 4. EJEMPLO COMPLETO DE USO
// ============================================

export async function ejemploCompleto(sock) {
    // Configurar modo seguro
    messageQueue.setDelayPreset('seguro');
    
    const numeros = [
        '5491112345678',
        '5491187654321',
        '5491198765432'
    ];
    
    const mensaje = '¡Hola! Este es un mensaje enviado con delay dinámico 🚀';
    
    console.log('🚀 Iniciando envío masivo con delays dinámicos...');
    console.log(`📋 Configuración actual:`);
    console.log(`   - Delay mínimo: 15s`);
    console.log(`   - Delay máximo: 35s`);
    console.log(`   - Patrón humano: Activado`);
    console.log(`   - Pausas largas cada: 5-7 mensajes`);
    
    const resultados = await enviarMensajesMasivos(sock, numeros, mensaje);
    
    console.log('\n✨ Proceso completado');
    console.log(`✅ Exitosos: ${resultados.filter(r => r.status === 'enviado').length}`);
    console.log(`❌ Fallidos: ${resultados.filter(r => r.status === 'error').length}`);
}

// ============================================
// 5. AJUSTAR SI WHATSAPP TE PONE LÍMITE
// ============================================

export function modoEmergencia() {
    console.log('🚨 ACTIVANDO MODO EMERGENCIA');
    
    // Delays MUY largos y aleatorios
    messageQueue.setDelay(30000, 60000); // 30-60 segundos
    messageQueue.setHumanPattern(true);
    
    console.log('⚠️ Delays configurados a 30-60 segundos');
    console.log('⚠️ Recomendación: Enviar máximo 10-15 mensajes por hora');
}

// ============================================
// 6. PRESETS SEGÚN TU SITUACIÓN
// ============================================

export const presets = {
    // Si NO tienes límite aún
    normal: () => messageQueue.setDelayPreset('moderado'),
    
    // Si WhatsApp te mostró 1 advertencia
    precaucion: () => messageQueue.setDelayPreset('seguro'),
    
    // Si WhatsApp te puso contador/límite
    emergencia: () => {
        messageQueue.setDelayPreset('ultra-seguro');
        messageQueue.setHumanPattern(true);
    },
    
    // Si necesitas ir ULTRA lento
    ultraLento: () => {
        messageQueue.setDelay(45000, 90000); // 45-90 segundos
        messageQueue.setHumanPattern(true);
    }
};

// USO:
// presets.normal();      // Situación normal
// presets.precaucion();  // Te pusieron advertencia
// presets.emergencia();  // Te pusieron contador ⚠️ <- USA ESTE
// presets.ultraLento();  // Recuperación de límite

console.log('📚 Archivo de ejemplo cargado. Usa las funciones según tu necesidad.');
