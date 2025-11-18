#!/bin/bash
echo " Iniciando setup del proyecto..."
echo ""

echo "1️ Instalando/verificando dependencias npm..."
npm install

echo ""
echo "2 Creando tabla de ofertas e insertando datos del Llano..."
node crear_ofertas.js

echo ""
echo "3️ Setup completado"
echo ""
echo "Pasos para ejecutar:"
echo "1. En una terminal: node Server.js"
echo "2. En el navegador: http://localhost:3000"
echo "3. Login: nombre=Juan Perez, contraseña=123456"
echo ""
