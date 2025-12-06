/**
 * Script de prueba para el sistema de cola de mensajes
 * Ejecutar: node test-queue.js
 */

const BASE_URL = 'http://localhost:3001';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

async function testQueue() {
    console.log(`${colors.blue}╔═══════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║  Test Sistema de Cola de Mensajes    ║${colors.reset}`);
    console.log(`${colors.blue}╚═══════════════════════════════════════╝${colors.reset}\n`);

    try {
        // 1. Verificar estado del bot
        console.log(`${colors.yellow}📡 Verificando conexión del bot...${colors.reset}`);
        const statusRes = await fetch(`${BASE_URL}/status`);
        const status = await statusRes.json();
        
        if (!status.authenticated) {
            console.log(`${colors.red}❌ Bot no está autenticado. Por favor escanea el QR primero.${colors.reset}`);
            return;
        }
        console.log(`${colors.green}✅ Bot conectado${colors.reset}\n`);

        // 2. Ver estado inicial de la cola
        console.log(`${colors.yellow}📊 Estado inicial de la cola:${colors.reset}`);
        await showQueueStats();

        // 3. Configurar delay (opcional)
        console.log(`\n${colors.yellow}⚙️ Configurando delay a 4 segundos...${colors.reset}`);
        const delayRes = await fetch(`${BASE_URL}/api/queue/set-delay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delay: 4000 })
        });
        const delayData = await delayRes.json();
        console.log(`${colors.green}✅ ${delayData.message}${colors.reset}`);

        // 4. Enviar mensajes de prueba (CAMBIA ESTE NÚMERO POR UNO REAL)
        const testNumber = "51987654321"; // ⚠️ CAMBIA ESTO POR TU NÚMERO
        
        console.log(`\n${colors.yellow}📤 Enviando 3 mensajes de prueba a ${testNumber}...${colors.reset}`);
        console.log(`${colors.red}⚠️ IMPORTANTE: Cambia el número en test-queue.js línea 47${colors.reset}\n`);

        for (let i = 1; i <= 3; i++) {
            const sendRes = await fetch(`${BASE_URL}/api/send-messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: testNumber,
                    message: `Mensaje de prueba #${i} - Sistema de cola funcionando 🚀`
                })
            });
            
            const sendData = await sendRes.json();
            
            if (sendData.status) {
                console.log(`${colors.green}✅ Mensaje ${i} agregado a la cola${colors.reset}`);
                console.log(`   Cola actual: ${sendData.queueInfo.queueSize} mensajes`);
            } else {
                console.log(`${colors.red}❌ Error: ${sendData.message}${colors.reset}`);
            }
            
            // Pequeño delay para ver los logs más claros
            await sleep(500);
        }

        // 5. Monitorear la cola en tiempo real
        console.log(`\n${colors.yellow}👀 Monitoreando cola en tiempo real...${colors.reset}`);
        console.log(`${colors.blue}Presiona Ctrl+C para detener${colors.reset}\n`);
        
        let previousQueue = -1;
        const monitor = setInterval(async () => {
            const statsRes = await fetch(`${BASE_URL}/api/queue/stats`);
            const stats = await statsRes.json();
            
            const currentQueue = stats.stats.currentQueueSize;
            
            // Solo mostrar si cambió
            if (currentQueue !== previousQueue) {
                console.log(`${colors.blue}⏳ Cola: ${currentQueue} | Enviados: ${stats.stats.totalSent} | Procesando: ${stats.stats.isProcessing ? 'Sí' : 'No'}${colors.reset}`);
                previousQueue = currentQueue;
                
                // Si la cola está vacía y no está procesando, terminar
                if (currentQueue === 0 && !stats.stats.isProcessing) {
                    clearInterval(monitor);
                    console.log(`\n${colors.green}✨ Todos los mensajes fueron enviados${colors.reset}`);
                    showFinalStats();
                }
            }
        }, 1000);

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
        console.log(`\n${colors.yellow}💡 Asegúrate de que el bot esté ejecutándose en ${BASE_URL}${colors.reset}`);
    }
}

async function showQueueStats() {
    const res = await fetch(`${BASE_URL}/api/queue/stats`);
    const data = await res.json();
    
    console.log(`   Mensajes en cola: ${data.stats.currentQueueSize}`);
    console.log(`   Total enviados: ${data.stats.totalSent}`);
    console.log(`   Total fallidos: ${data.stats.totalFailed}`);
    console.log(`   Delay configurado: ${data.stats.config.delayBetweenMessages}ms`);
}

async function showFinalStats() {
    console.log(`\n${colors.blue}╔═══════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║        Resumen Final                  ║${colors.reset}`);
    console.log(`${colors.blue}╚═══════════════════════════════════════╝${colors.reset}\n`);
    
    const res = await fetch(`${BASE_URL}/api/queue/stats`);
    const data = await res.json();
    
    console.log(`${colors.green}✅ Mensajes enviados: ${data.stats.totalSent}${colors.reset}`);
    console.log(`${colors.red}❌ Mensajes fallidos: ${data.stats.totalFailed}${colors.reset}`);
    console.log(`${colors.yellow}📊 Total procesados: ${data.stats.totalQueued}${colors.reset}`);
    
    console.log(`\n${colors.green}🎉 Test completado exitosamente${colors.reset}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar test
testQueue();
