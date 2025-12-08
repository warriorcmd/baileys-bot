/**
 * Ejemplo de Envío Masivo Controlado
 * Envía mensajes a múltiples contactos usando el sistema de cola
 */

const BASE_URL = 'http://localhost:3001';

// ====================================================
// CONFIGURACIÓN - EDITA ESTO
// ====================================================
const CONTACTOS = [
    { numero: "51987654321", nombre: "Juan" },
    { numero: "51987654322", nombre: "María" },
    { numero: "51987654323", nombre: "Pedro" },
    // Agrega más contactos aquí...
];

const MENSAJE_TEMPLATE = (nombre) => {
    return `Hola ${nombre}! 👋

Este es un mensaje personalizado enviado de forma controlada usando nuestro bot de WhatsApp.

El sistema de cola garantiza que los mensajes se envíen de manera segura, uno por uno, con un delay de 3 segundos entre cada envío.

¡Saludos! 🚀`;
};

const CONFIGURACION = {
    preset: 'seguro',         // 'moderado', 'seguro', 'ultra-seguro'
    pausaEntreLotes: 120000,  // 2 minutos entre lotes de 15 mensajes
    tamañoLote: 15,           // Enviar en lotes de 15 (más seguro)
    patronHumano: true        // Activar pausas aleatorias
};

// ====================================================
// FUNCIONES
// ====================================================

async function verificarConexion() {
    try {
        const res = await fetch(`${BASE_URL}/status`);
        const data = await res.json();
        return data.authenticated;
    } catch (error) {
        console.error('❌ Error al verificar conexión:', error.message);
        return false;
    }
}

async function configurarDelay(preset, patronHumano) {
    try {
        // Configurar preset
        const res1 = await fetch(`${BASE_URL}/api/queue/set-preset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preset })
        });
        const data1 = await res1.json();
        console.log(`✅ ${data1.message}`);
        
        // Configurar patrón humano
        const res2 = await fetch(`${BASE_URL}/api/queue/set-human-pattern`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: patronHumano })
        });
        const data2 = await res2.json();
        console.log(`✅ ${data2.message}`);
    } catch (error) {
        console.error('❌ Error al configurar delay dinámico:', error.message);
    }
}

async function enviarMensaje(numero, mensaje) {
    try {
        const res = await fetch(`${BASE_URL}/api/send-messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: numero, message: mensaje })
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`❌ Error al enviar a ${numero}:`, error.message);
        return { status: false, message: error.message };
    }
}

async function obtenerEstadoCola() {
    try {
        const res = await fetch(`${BASE_URL}/api/queue/stats`);
        const data = await res.json();
        return data;
    } catch (error) {
        return null;
    }
}

function dividirEnLotes(array, tamaño) {
    const lotes = [];
    for (let i = 0; i < array.length; i += tamaño) {
        lotes.push(array.slice(i, i + tamaño));
    }
    return lotes;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ====================================================
// PROCESO PRINCIPAL
// ====================================================

async function envioMasivo() {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║     📤 ENVÍO MASIVO CONTROLADO - WhatsApp Bot     ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    // 1. Verificar conexión
    console.log('🔍 Verificando conexión del bot...');
    const conectado = await verificarConexion();
    
    if (!conectado) {
        console.log('❌ Bot no está conectado. Por favor:');
        console.log('   1. Ejecuta: npm start');
        console.log('   2. Abre: http://localhost:3001');
        console.log('   3. Escanea el código QR');
        return;
    }
    console.log('✅ Bot conectado\n');

    // 2. Configurar delay dinámico
    console.log(`⚙️ Configurando sistema de delay dinámico (Preset: ${CONFIGURACION.preset})...`);
    await configurarDelay(CONFIGURACION.preset, CONFIGURACION.patronHumano);
    console.log('');

    // 3. Mostrar resumen
    console.log('📊 Resumen del envío:');
    console.log(`   Total de contactos: ${CONTACTOS.length}`);
    console.log(`   Modo: Delay DINÁMICO (Anti-detección)`);
    console.log(`   Preset: ${CONFIGURACION.preset}`);
    console.log(`   Patrón humano: ${CONFIGURACION.patronHumano ? 'Activado ✅' : 'Desactivado'}`);
    console.log(`   Tamaño de lote: ${CONFIGURACION.tamañoLote}`);
    console.log(`   Pausa entre lotes: ${CONFIGURACION.pausaEntreLotes / 1000}s`);
    
    // Tiempo estimado más realista con delays dinámicos
    const delayPromedio = CONFIGURACION.preset === 'moderado' ? 14 : 
                         CONFIGURACION.preset === 'seguro' ? 25 : 32;
    const tiempoEstimado = Math.ceil(
        (CONTACTOS.length * delayPromedio) + 
        (Math.ceil(CONTACTOS.length / CONFIGURACION.tamañoLote) - 1) * (CONFIGURACION.pausaEntreLotes / 1000)
    );
    console.log(`   Tiempo estimado: ~${Math.ceil(tiempoEstimado / 60)} minutos\n`);

    // 4. Confirmar envío
    console.log('⚠️ IMPORTANTE: Revisa que los números sean correctos');
    console.log('   Los mensajes se enviarán automáticamente\n');

    // Esperar 3 segundos para cancelar si es necesario
    console.log('Iniciando en 3 segundos... (Ctrl+C para cancelar)');
    await sleep(3000);

    // 5. Dividir en lotes
    const lotes = dividirEnLotes(CONTACTOS, CONFIGURACION.tamañoLote);
    console.log(`\n📦 Dividido en ${lotes.length} lote(s)\n`);

    // 6. Procesar lotes
    let totalEnviados = 0;
    let totalFallidos = 0;

    for (let i = 0; i < lotes.length; i++) {
        const lote = lotes[i];
        console.log(`\n🔄 Procesando lote ${i + 1}/${lotes.length} (${lote.length} mensajes)...`);

        for (const contacto of lote) {
            const mensaje = MENSAJE_TEMPLATE(contacto.nombre);
            const resultado = await enviarMensaje(contacto.numero, mensaje);

            if (resultado.status) {
                totalEnviados++;
                console.log(`   ✅ ${contacto.nombre} (${contacto.numero}) - En cola`);
            } else {
                totalFallidos++;
                console.log(`   ❌ ${contacto.nombre} (${contacto.numero}) - Error: ${resultado.message}`);
            }

            // Pequeño delay para no saturar el servidor
            await sleep(200);
        }

        console.log(`   ✨ Lote ${i + 1} agregado a la cola`);

        // Pausa entre lotes (excepto en el último)
        if (i < lotes.length - 1) {
            console.log(`   ⏸️ Pausa de ${CONFIGURACION.pausaEntreLotes / 1000}s antes del siguiente lote...`);
            await sleep(CONFIGURACION.pausaEntreLotes);
        }
    }

    // 7. Monitorear hasta que termine
    console.log('\n\n⏳ Monitoreando envío en tiempo real...');
    console.log('   (Esperando que la cola termine de procesarse)\n');

    let ultimaCola = -1;
    let verificaciones = 0;

    while (verificaciones < 300) { // Máximo 5 minutos esperando
        const stats = await obtenerEstadoCola();
        
        if (stats) {
            const colaActual = stats.stats.currentQueueSize;
            
            if (colaActual !== ultimaCola) {
                const hora = new Date().toLocaleTimeString();
                console.log(`   [${hora}] Cola: ${colaActual} | Enviados: ${stats.stats.totalSent} | Procesando: ${stats.stats.isProcessing ? 'Sí ⚡' : 'No'}`);
                ultimaCola = colaActual;

                // Si terminó, salir
                if (colaActual === 0 && !stats.stats.isProcessing) {
                    console.log('\n✨ Todos los mensajes fueron procesados\n');
                    break;
                }
            }
        }

        await sleep(1000);
        verificaciones++;
    }

    // 8. Resumen final
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║            📊 RESUMEN FINAL                       ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    const estadoFinal = await obtenerEstadoCola();
    
    if (estadoFinal) {
        console.log(`✅ Mensajes enviados exitosamente: ${estadoFinal.stats.totalSent}`);
        console.log(`❌ Mensajes fallidos: ${estadoFinal.stats.totalFailed}`);
        console.log(`📊 Total procesados: ${estadoFinal.stats.totalQueued}`);
        console.log(`⏱️ Cola actual: ${estadoFinal.stats.currentQueueSize}`);
    }

    console.log('\n🎉 Proceso completado\n');
    console.log('💡 Puedes ver las estadísticas en: http://localhost:3001/api/queue/stats\n');
}

// Ejecutar
envioMasivo().catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
});
