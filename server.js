// ==========================================
// IMPORTAR DEPENDENCIAS
// ==========================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const si = require('systeminformation');
const cors = require('cors');
const path = require('path');


// ==========================================
// CONFIGURACIÓN DE EXPRESS
// ==========================================

const app = express();

app.use(cors());

// Publicar el directorio public para servir el frontend
app.use(express.static(path.join(__dirname, 'public')));


// ==========================================
// CONFIGURACIÓN DEL SERVIDOR HTTP Y SOCKET.IO
// ==========================================

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Convertir bytes a GB
function bytesToGB(bytes) {
    return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
}


// ==========================================
// OBTENER INFORMACIÓN DEL SISTEMA
// ==========================================

async function obtenerDatosSistema() {

    try {

        // Obtener información de los distintos recursos
        const [
            memoria,
            cpu,
            cpuTemp,
            discos,
            interfaces
        ] = await Promise.all([
            si.mem(),
            si.cpu(),
            si.cpuTemperature(),
            si.fsSize(),
            si.networkInterfaces()
        ]);

// ==========================================
// PARTICIÓN PRINCIPAL
// ==========================================

let particionRaiz = null;

if (process.platform === 'win32') {

    const unidadSistema = process.env.SystemDrive;

    particionRaiz = discos.find(disco =>
        disco.mount?.toUpperCase() ===
        unidadSistema?.toUpperCase()
    ) || null;

} else {

    particionRaiz =
        discos.find(disco => disco.mount === '/') || null;

}

        // ==========================================
        // MEMORIA SWAP
        // ==========================================

        let swap = null;

        if (memoria.swaptotal > 0) {

            swap = {
                fs: 'SWAP',
                size: memoria.swaptotal,
                used: memoria.swapused,
                mount: '[SWAP]',
                use: (
                    (memoria.swapused / memoria.swaptotal) * 100
                ).toFixed(2) + '%'
            };

        }


        // ==========================================
        // INTERFACES DE RED
        // ==========================================

        const red = await Promise.all(

            interfaces.map(async (iface) => {

                const stats = await si.networkStats(iface.iface);

                const s = stats[0] || {};

                return {

                    interfaz: iface.iface,

                    ip4: iface.ip4,

                    mac: iface.mac,

                    recibidoMB: s.rx_bytes
                        ? (s.rx_bytes / (1024 * 1024)).toFixed(2)
                        : '0.00',

                    enviadoMB: s.tx_bytes
                        ? (s.tx_bytes / (1024 * 1024)).toFixed(2)
                        : '0.00'

                };

            })

        );


        // ==========================================
        // DEVOLVER INFORMACIÓN DEL SISTEMA
        // ==========================================

        return {

            timestamp: new Date().toISOString(),

            cpu: {

                fabricante: cpu.manufacturer || 'Desconocido',

                modelo: cpu.brand || 'Desconocido',

                nucleos: cpu.cores,

                temperatura: cpuTemp.main
                    ? `${cpuTemp.main} °C`
                    : 'N/D'

            },


            memoria: {

                total: bytesToGB(memoria.total),

                libre: bytesToGB(memoria.available),

                usado: bytesToGB(
                    memoria.total - memoria.available
                )

            },


            particiones: {

                // Se conserva el nombre sda1 para mantener
                // compatibilidad con la versión actual de la API.

                sda1: particionRaiz ? {

                    filesystem: particionRaiz.fs,

                    tamaño: bytesToGB(particionRaiz.size),

                    usado: bytesToGB(particionRaiz.used),

                    libre: bytesToGB(
                        particionRaiz.size - particionRaiz.used
                    ),

                    usoPorcentaje: particionRaiz.use + '%',

                    puntoMontaje: particionRaiz.mount

                } : null,


                // Se conserva sda5 por compatibilidad.
                // Si no existe SWAP, su valor será null.

                sda5: swap ? {

                    filesystem: swap.fs,

                    tamaño: bytesToGB(swap.size),

                    usado: bytesToGB(swap.used),

                    libre: bytesToGB(
                        swap.size - swap.used
                    ),

                    usoPorcentaje: swap.use,

                    puntoMontaje: swap.mount,

                    esSwap: true

                } : null

            },


            red

        };

    } catch (error) {

        console.error(
            'Error al obtener datos del sistema:',
            error
        );

        throw error;

    }

}


// ==========================================
// API REST
// ==========================================

app.get('/api/sistema', async (req, res) => {

    try {

        const datos = await obtenerDatosSistema();

        res.json(datos);

    } catch (error) {

        res.status(500).json({
            error: 'Error al obtener datos del sistema'
        });

    }

});


// ==========================================
// WEBSOCKET - SOCKET.IO
// ==========================================

io.on('connection', async (socket) => {

    console.log('Cliente conectado');


    // Enviar datos inmediatamente al conectarse
    try {

        const datos = await obtenerDatosSistema();

        socket.emit('datosSistema', datos);

    } catch (error) {

        console.error('Error inicial en WebSocket:', error);

    }


    // Actualizar información cada 5 segundos
    const intervalo = setInterval(async () => {

        try {

            const datos = await obtenerDatosSistema();

            socket.emit('datosSistema', datos);

        } catch (error) {

            console.error('Error en WebSocket:', error);

        }

    }, 5000);


    // Detener el intervalo al desconectarse
    socket.on('disconnect', () => {

        clearInterval(intervalo);

        console.log('Cliente desconectado');

    });

});


// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {

    console.log(
        `Servidor corriendo en http://localhost:${PORT}`
    );

});