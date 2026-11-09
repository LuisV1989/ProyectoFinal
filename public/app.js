// ==========================================
// CONEXIÓN SOCKET.IO
// ==========================================

const socket = io();

const estadoConexion =
    document.getElementById('estadoConexion');


// ==========================================
// ESTADO DE CONEXIÓN
// ==========================================

socket.on('connect', () => {

    estadoConexion.textContent = 'Conectado';

    estadoConexion.className =
        'badge text-bg-success';

});


socket.on('disconnect', () => {

    estadoConexion.textContent = 'Desconectado';

    estadoConexion.className =
        'badge text-bg-danger';

});


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Limitar los porcentajes entre 0 y 100
function obtenerPorcentaje(valor) {

    const numero = Number.parseFloat(valor);

    if (!Number.isFinite(numero)) {

        return 0;

    }

    return Math.min(100, Math.max(0, numero));

}


// Actualizar una barra de progreso
function actualizarBarra(idBarra, porcentaje) {

    const barra = document.getElementById(idBarra);

    barra.style.width = porcentaje + '%';

    barra.setAttribute(
        'aria-valuenow',
        porcentaje
    );

}


// ==========================================
// ACTUALIZAR PROCESADOR
// ==========================================

function actualizarCPU(cpu) {

    document.getElementById('cpuModelo').textContent =
        cpu.modelo;

    document.getElementById('cpuFabricante').textContent =
        'Fabricante: ' + cpu.fabricante;

    document.getElementById('cpuNucleos').textContent =
        'Núcleos: ' + cpu.nucleos;

    document.getElementById('cpuTemperatura').textContent =
        cpu.temperatura;

}


// ==========================================
// ACTUALIZAR MEMORIA RAM
// ==========================================

function actualizarRAM(memoria) {

    document.getElementById('ramTotal').textContent =
        memoria.total;

    document.getElementById('ramUsada').textContent =
        memoria.usado;

    document.getElementById('ramLibre').textContent =
        memoria.libre;


    const totalRAM =
        Number.parseFloat(memoria.total);

    const usadaRAM =
        Number.parseFloat(memoria.usado);

    let porcentajeRAM = 0;

    if (totalRAM > 0) {

        porcentajeRAM =
            (usadaRAM / totalRAM) * 100;

    }

    porcentajeRAM = obtenerPorcentaje(porcentajeRAM);

    actualizarBarra('ramBarra', porcentajeRAM);

    document.getElementById('ramPorcentaje').textContent =
        porcentajeRAM.toFixed(2) + '% utilizado';

}


// ==========================================
// ACTUALIZAR PARTICIÓN PRINCIPAL
// ==========================================

function actualizarDisco(disco) {

    if (disco) {

        document.getElementById('discoPrincipal').textContent =
            disco.puntoMontaje;

        document.getElementById('discoPrincipalFS').textContent =
            'Filesystem: ' + disco.filesystem;

        document.getElementById('discoPrincipalTotal').textContent =
            'Tamaño: ' + disco.tamaño;

        document.getElementById('discoPrincipalUsado').textContent =
            'Utilizado: ' + disco.usado;

        document.getElementById('discoPrincipalLibre').textContent =
            'Libre: ' + disco.libre;


        const porcentajeDisco =
            obtenerPorcentaje(disco.usoPorcentaje);

        actualizarBarra(
            'discoPrincipalBarra',
            porcentajeDisco
        );

        document.getElementById(
            'discoPrincipalPorcentaje'
        ).textContent = porcentajeDisco + '% utilizado';

    } else {

        document.getElementById('discoPrincipal').textContent =
            'No disponible';

        document.getElementById('discoPrincipalFS').textContent = '';

        document.getElementById('discoPrincipalTotal').textContent = '';

        document.getElementById('discoPrincipalUsado').textContent = '';

        document.getElementById('discoPrincipalLibre').textContent = '';

        document.getElementById('discoPrincipalPorcentaje').textContent = '';

        actualizarBarra('discoPrincipalBarra', 0);

    }

}


// ==========================================
// ACTUALIZAR MEMORIA SWAP
// ==========================================

function actualizarSwap(swap) {

    if (swap) {

        document.getElementById('swapNombre').textContent =
            swap.puntoMontaje;

        document.getElementById('swapFS').textContent =
            'Filesystem: ' + swap.filesystem;

        document.getElementById('swapTotal').textContent =
            'Tamaño: ' + swap.tamaño;

        document.getElementById('swapUsado').textContent =
            'Utilizado: ' + swap.usado;

        document.getElementById('swapLibre').textContent =
            'Libre: ' + swap.libre;


        const porcentajeSwap =
            obtenerPorcentaje(swap.usoPorcentaje);

        actualizarBarra('swapBarra', porcentajeSwap);

        document.getElementById('swapPorcentaje').textContent =
            porcentajeSwap + '% utilizado';

    } else {

        document.getElementById('swapNombre').textContent =
            'No disponible';

        document.getElementById('swapFS').textContent =
            'El sistema no tiene memoria SWAP configurada';

        document.getElementById('swapTotal').textContent = '';

        document.getElementById('swapUsado').textContent = '';

        document.getElementById('swapLibre').textContent = '';

        document.getElementById('swapPorcentaje').textContent = '';

        actualizarBarra('swapBarra', 0);

    }

}


// ==========================================
// ACTUALIZAR INTERFACES DE RED
// ==========================================

function actualizarRed(red) {

    const contenedorRed =
        document.getElementById('contenedorRed');

    contenedorRed.innerHTML = '';


    if (red && red.length > 0) {

        red.forEach((interfaz) => {

            const tarjeta = document.createElement('div');

            tarjeta.className = 'col-md-6 col-lg-4';


            const contenido = document.createElement('div');

            contenido.className =
                'card shadow-sm h-100';


            const encabezado = document.createElement('div');

            encabezado.className =
                'card-header bg-info text-dark';

            encabezado.textContent = interfaz.interfaz;


            const cuerpo = document.createElement('div');

            cuerpo.className = 'card-body';


            const ip = document.createElement('p');

            ip.textContent =
                'Dirección IP: ' + interfaz.ip4;


            const mac = document.createElement('p');

            mac.textContent =
                'MAC: ' + interfaz.mac;


            const recibido = document.createElement('p');

            recibido.textContent =
                'Recibido: ' + interfaz.recibidoMB + ' MB';


            const enviado = document.createElement('p');

            enviado.textContent =
                'Enviado: ' + interfaz.enviadoMB + ' MB';


            cuerpo.append(
                ip,
                mac,
                recibido,
                enviado
            );


            contenido.append(
                encabezado,
                cuerpo
            );


            tarjeta.appendChild(contenido);

            contenedorRed.appendChild(tarjeta);

        });

    } else {

        contenedorRed.innerHTML =
            '<div class="col-12">' +
            '<div class="alert alert-warning">' +
            'No se encontraron interfaces de red.' +
            '</div></div>';

    }

}


// ==========================================
// RECIBIR DATOS DEL SERVIDOR
// ==========================================

socket.on('datosSistema', (datos) => {


    // PROCESADOR
    actualizarCPU(datos.cpu);


    // MEMORIA RAM
    actualizarRAM(datos.memoria);


    // PARTICIÓN PRINCIPAL
    actualizarDisco(datos.particiones.sda1);


    // MEMORIA SWAP
    actualizarSwap(datos.particiones.sda5);


    // INTERFACES DE RED
    actualizarRed(datos.red);


    // FECHA DE ACTUALIZACIÓN

    const fecha = new Date(datos.timestamp);

    document.getElementById(
        'ultimaActualizacion'
    ).textContent =
        'Última actualización: ' + fecha.toLocaleString();


    // INFORMACIÓN COMPLETA DE LA API

    document.getElementById('infoCompleta').textContent =
        JSON.stringify(datos, null, 2);

});