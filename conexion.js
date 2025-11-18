const mysql = require('mysql2');

// Configuración de conexión a MySQL
const conexion = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'empleo',
  port: process.env.MYSQL_PORT || 3306
});


conexion.connect((error) => {
  if (error) {
    console.error('Error al conectar a MySQL:', error);

    setTimeout(() => conexion.connect(), 2000);
  } else {
    console.log(' Conectado a MySQL exitosamente');
  }
});


conexion.on('error', (error) => {
  console.error('Error en la conexión MySQL:', error);
  if (error.code === 'PROTOCOLO DE CONEXION' ) {
    conexion.connect();
  }  
  if (error.code === 'ERROR') {
    setTimeout(() => conexion.connect(), 2000);
  }
  if (error.code === 'ERROR') {
    conexion.connect();
  }
});

module.exports = conexion;
