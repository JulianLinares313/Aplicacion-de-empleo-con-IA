const conexion = require('./conexion');

// Crear tabla usuarios
const sqlCrearTablaUsuario = `
CREATE TABLE IF NOT EXISTS usuario (
  id BIGINT(20) NOT NULL PRIMARY KEY,
  nombre VARCHAR(100),
  contrasena VARCHAR(100),
  correo VARCHAR(100),
  descripcion TEXT,
  tipo_publicacion VARCHAR(20),
  titulo_oferta VARCHAR(150),
  fecha_publicacion DATE
)
`;

// Crear tabla ofertas si no existe
const sqlCrearTablaOfertas = `
CREATE TABLE IF NOT EXISTS ofertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  empresa VARCHAR(100) NOT NULL,
  sector VARCHAR(50),
  salario VARCHAR(50),
  ubicacion VARCHAR(100),
  fecha_publicacion DATE DEFAULT CURRENT_DATE,
  activa BOOLEAN DEFAULT TRUE
)
`;

// Crear tabla aplicaciones
const sqlCrearTablaAplicaciones = `
CREATE TABLE IF NOT EXISTS aplicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  oferta_id INT NOT NULL,
  fecha_aplicacion DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(20) DEFAULT 'Pendiente',
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (oferta_id) REFERENCES ofertas(id),
  UNIQUE KEY unique_aplicacion (usuario_id, oferta_id)
)
`;

// Insertar usuarios de ejemplo
const sqlInsertarUsuarios = `
INSERT IGNORE INTO usuario (id, nombre, contrasena, correo, descripcion, tipo_publicacion, titulo_oferta, fecha_publicacion) VALUES
(123456, 'Juan Pérez', '123456', 'juan@example.com', 'Profesional con 5 años de experiencia en ganadería', 'Ganadero', 'Veterinario Ganadero', CURDATE()),
(234567, 'María García', 'password123', 'maria@example.com', 'Técnica agrícola con experiencia en cultivos', 'Agricultor', 'Técnico en Agricultura', CURDATE())
`;

// Insertar ofertas de ejemplo
const sqlInsertarOfertas = `
INSERT IGNORE INTO ofertas (titulo, descripcion, empresa, sector, salario, ubicacion, fecha_publicacion) VALUES
('Veterinario Ganadero', 'Se busca veterinario con experiencia en ganado de engorde y lechería, manejo sanitario de rebaños', 'Ganadería Los Llanos S.A.', 'Ganadería', '$2000-2800', 'Villavicencio', CURDATE()),
('Técnico en Agricultura de Precisión', 'Especialista en riego, cultivos de maíz y arroz con tecnología moderna', 'Agrofinca El Horizonte', 'Agricultura', '$1800-2400', 'Granada', CURDATE()),
('Guía Turístico Ecoturismo', 'Guía con conocimiento del ecosistema llanero, fauna y flora', 'Ecoturismo Campesino', 'Ecoturismo', '$1200-1600', 'Villavicencio', CURDATE()),
('Administrador de Finca Ganadera', 'Gestor de recursos, personal, producción en hacienda ganadera grande', 'Hacienda Magdalena', 'Ganadería', '$2200-3000', 'San Martín', CURDATE()),
('Especialista en Conservación de Humedales', 'Investigador/técnico en protección de ecosistemas llaneros', 'Fundación Llanos Sostenibles', 'Conservación', '$2000-2600', 'Villavicencio', CURDATE()),
('Capataz de Trabajo en Campo', 'Supervisión de jornaleros, manejo de herramientas, riego y cosecha', 'Cultivos Diversificados S.A.', 'Agricultura', '$1400-1800', 'Acacías', CURDATE()),
('Promotor Ambiental', 'Educación ambiental y sostenibilidad en comunidades llaneras', 'Instituto Amazónico de Investigaciones', 'Educación Ambiental', '$1600-2000', 'Villavicencio', CURDATE()),
('Operador de Maquinaria Agrícola', 'Manejo de tractores, cosechadoras y equipos de riego', 'Agrícola El Llano Verde', 'Agricultura', '$1500-2000', 'Castilla la Nueva', CURDATE()),
('Comerciante de Ganado', 'Buyer/seller de ganado en pie, negociación y logística', 'Comercio Ganadero Llanero', 'Ganadería', '$1800-2400', 'Villavicencio', CURDATE()),
('Monitor de Turismo de Naturaleza', 'Conducción de grupos en experiencias de naturaleza y cabalgata', 'Campamentos Los Llanos', 'Ecoturismo', '$1000-1400', 'Puerto López', CURDATE()),
('Inspector de Calidad Ganadera', 'Control sanitario y calidad de carne/leche en plantas procesadoras', 'Frigorífico Llanero', 'Ganadería', '$1700-2200', 'Villavicencio', CURDATE()),
('Técnico en Acuicultura', 'Crianza de peces en estanques, alimentación y sanidad acuícola', 'Piscifactoría El Caño', 'Acuicultura', '$1500-1900', 'Granada', CURDATE())
`;

console.log(' Iniciando creación de base de datos completa...\n');

// 1. Crear tabla usuario
conexion.query(sqlCrearTablaUsuario, (error) => {
  if (error) {
    console.error(' Error al crear tabla usuario:', error);
    process.exit(1);
  }
  console.log('Tabla usuario creada exitosamente');
  
  // 2. Crear tabla ofertas
  conexion.query(sqlCrearTablaOfertas, (error) => {
    if (error) {
      console.error(' Error al crear tabla ofertas:', error);
      process.exit(1);
    }
    console.log(' Tabla ofertas creada exitosamente');
    
    // 3. Crear tabla aplicaciones
    conexion.query(sqlCrearTablaAplicaciones, (error) => {
      if (error) {
        console.error(' Error al crear tabla aplicaciones:', error);
        process.exit(1);
      }
      console.log('Tabla aplicaciones creada exitosamente');
      
      // 4. Insertar usuarios
      conexion.query(sqlInsertarUsuarios, (error) => {
        if (error) {
          console.error(' Error al insertar usuarios:', error);
          process.exit(1);
        }
        console.log(' Usuarios insertados exitosamente (2 usuarios)');
        
        // 5. Insertar ofertas
        conexion.query(sqlInsertarOfertas, (error) => {
          if (error) {
            console.error(' Error al insertar ofertas:', error);
            process.exit(1);
          }
          console.log(' Ofertas del Llano insertadas exitosamente (12 ofertas)');
          
          console.log('\n' + '='.repeat(50));
          console.log('BASE DE DATOS CREADA COMPLETAMENTE');
          console.log('='.repeat(50));
          console.log('\nTablas creadas:');
          console.log('   - usuario (2 usuarios de ejemplo)');
          console.log('   - ofertas (12 ofertas del Llano)');
          console.log('   - aplicaciones (para registrar aplicaciones)');
          console.log('\n Usuario de prueba:');
          console.log('   Nombre: Juan Pérez');
          console.log('   Contraseña: 123456');
          console.log('   Correo: juan@example.com');
          console.log('\n Siguiente paso: node Server.js');
          console.log('='.repeat(50) + '\n');
          
          process.exit(0);
        });
      });
    });
  });
});
