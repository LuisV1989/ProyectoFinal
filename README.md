# Tp Final Integrador
Este proyecto se basa en desarrollar una aplicacion servidor para monitorear los recursos que obtenga información de los recursos de hardware de un servidor GNU/Linux, la exponga mediante
una API y permita visualizarla desde una aplicación frontend web y móvil.

# Tecnologias utilizadas 

Frontend: css, js, html, boostrap5 

backend: node, js, pnpm, socket.io, Express, CORS, systeminformation 

# Funcionalidades
Esta aplicacion permite revisar en tiempo real distintos datos relacionados al hardware del servidor donde se encuentra activa 

Tales como:
-Cpu: Fabricante, modelo, nucleos, temperatura

-Memoria ram: Total, libre, usada

-Disco Duro: Particiones, total, usado, disponible, porsentajes y graficas 

-Red: nombre de la interfaz, ip, mac

# Estructura del proyecto 
ProyectoFinal/

│

├── public/

│   ├── index.html

│   ├── estilos.css

│   └── app.js

│

├── server.js

│

├── package.json

├── pnpm-lock.yaml

├── .gitignore

├── README.md

# Requisitos
node.js

npm

pnpm

# Instalacion

1.Descargar el proyecto de github

2.Crear carpetas del proyecto mv /Descargas/ProyectoFinal /var/www/html/

3.Acceder a su direcctorio del proyecto con cd /var/www/html/ProyectoFinal 

4.instalar las dependecias utilizando pnpm: pnpm install

5