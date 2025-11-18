const express = require('express');
const conexion = require('./conexion');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Para servir archivos estáticos




app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Inicio_Sesion.html'));
});

app.get('/usuario', (req, res) => {

  conexion.query('SELECT * FROM usuario', (error, results,) => {
    if (error) {
      return res.status(500).send('Error en la consulta de usuarios');
    } else {
      res.json(results);
    }
  });

});

app.post('/usuario', (req, res) => {

  const { id, nombre, contrasena, correo, descripcion, tipo_publicacion, titulo_oferta, fecha_publicacion } = req.body;

  if (!id || !nombre || !contrasena || !correo) {
    return res.status(400).send('Faltan datos');
  }
  const sql = `INSERT INTO usuario (id, nombre, contrasena, correo, descripcion, tipo_publicacion, titulo_oferta, fecha_publicacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  conexion.query(sql, [id, nombre, contrasena, correo, descripcion, tipo_publicacion, titulo_oferta, fecha_publicacion], (error, results) => {
    if (error) {
      return res.status(500).send('Error al insertar usuario');
    } else {
      res.json(results);
    }
  });

});

app.put('/usuario/:id', (req, res) => {


  const { id } = req.params;
  const { nombre, contrasena, correo, descripcion, tipo_publicacion, titulo_oferta, fecha_publicacion } = req.body;

  if (!nombre || !contrasena || !correo || !descripcion || !tipo_publicacion || !titulo_oferta || !fecha_publicacion) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const sql = `UPDATE usuario SET nombre = ?, contrasena = ?, correo = ?, descripcion = ?, tipo_publicacion = ?, titulo_oferta = ?, fecha_publicacion = ? WHERE id = ?`;
  conexion.query(sql, [nombre, contrasena, correo, descripcion, tipo_publicacion, titulo_oferta, fecha_publicacion, id], (error, results) => {
    if (error) {
      console.error("Error al actualizar usuario");
      return res.status(500).send('Error al actualizar usuario');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json({ message: 'Usuario actualizado correctamente' });
  });
});


app.delete('/usuario/:id', (req, res) => {

  const { id } = req.params;

  const sql = `DELETE FROM usuario WHERE id = ?`;
  conexion.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).send('Error al eliminar usuario');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  });
});


// Registro de usuario
app.post('/registro', (req, res) => {
  const { id, nombre, contrasena, correo } = req.body;

  if (!id || !nombre || !contrasena || !correo) {
    return res.status(400).send('Faltan datos');
  }

  const sql = 'INSERT INTO usuario (id, nombre, contrasena,correo, fecha_publicacion) VALUES (?, ?, ?, ?, CURDATE())';
  conexion.query(sql, [id, nombre, contrasena, correo], (error, results) => {
    if (error) {
      console.error('Error al registrar usuario:', error);
      return res.status(500).send('Error al registrar usuario');
    }
    res.send('Registro exitoso');
  });
});

// Inicio de sesión
app.post('/login', (req, res) => {
  const { nombre, contrasena } = req.body;

  if (!nombre || !contrasena) {
    return res.status(400).send('Faltan datos');
  }

  const sql = 'SELECT * FROM usuario WHERE nombre = ? AND contrasena = ?';
  conexion.query(sql, [nombre, contrasena], (error, results) => {
    if (error) {
      console.error('Error al iniciar sesión:', error);
      return res.status(500).send('Error al iniciar sesión');
    }
    if (results.length > 0) {
      // Devolver datos del usuario para sesión
      res.json({
        message: ' Sesión iniciada correctamente',
        usuario: {
          id: results[0].id,
          nombre: results[0].nombre,
          correo: results[0].correo
        }
      });
    } else {
      res.status(401).send(' Usuario o contraseña incorrectos');
    }
  });
});


// cargar ofertas
app.get('/ofertas', (req, res) => {
  const { sector, busqueda } = req.query;
  let sql = 'SELECT * FROM ofertas WHERE activa = TRUE';
  let params = [];

  if (sector) {
    sql += ' AND sector = ?';
    params.push(sector);
  }

  if (busqueda) {
    sql += ' AND (titulo LIKE ? OR descripcion LIKE ? OR empresa LIKE ?)';
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  sql += ' ORDER BY fecha_publicacion DESC';

  conexion.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error al obtener ofertas:', error);
      return res.status(500).json({ error: 'Error al obtener ofertas' });
    }
    res.json(results);
  });
});

// Obtener sectores únicos para filtros
app.get('/sectores', (req, res) => {
  const sql = 'SELECT DISTINCT sector FROM ofertas WHERE activa = TRUE ORDER BY sector';
  conexion.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener sectores:', error);
      return res.status(500).json({ error: 'Error al obtener sectores' });
    }
    res.json(results);
  });
});

// Crear tabla de aplicaciones si no existe
app.post('/aplicar', (req, res) => {
  const { usuario_id, oferta_id } = req.body;

  if (!usuario_id || !oferta_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Crear tabla aplicaciones si no existe
  const sqlCrearTabla = `
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

  conexion.query(sqlCrearTabla, (error) => {
    if (error) {
      console.error('Error al crear tabla aplicaciones:', error);
      return res.status(500).json({ error: 'Error al procesar aplicación' });
    }

    // Insertar la aplicación
    const sqlInsertar = 'INSERT INTO aplicaciones (usuario_id, oferta_id) VALUES (?, ?)';
    conexion.query(sqlInsertar, [usuario_id, oferta_id], (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Ya has aplicado a esta oferta' });
        }
        console.error('Error al aplicar a oferta:', error);
        return res.status(500).json({ error: 'Error al aplicar a oferta' });
      }
      res.json({ message: 'Aplicación enviada exitosamente' });
    });
  });
});

// Actualizar perfil del usuario (completar información)
app.put('/perfil/:id', (req, res) => {
  const { id } = req.params;
  const { descripcion, tipo_publicacion, titulo_oferta } = req.body;

  if (!descripcion || !tipo_publicacion || !titulo_oferta) {
    return res.status(400).json({ error: 'Faltan datos para completar el perfil' });
  }

  const sql = 'UPDATE usuario SET descripcion = ?, tipo_publicacion = ?, titulo_oferta = ? WHERE id = ?';
  conexion.query(sql, [descripcion, tipo_publicacion, titulo_oferta, id], (error, results) => {
    if (error) {
      console.error('Error al actualizar perfil:', error);
      return res.status(500).json({ error: 'Error al actualizar perfil' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: ' Perfil actualizado exitosamente' });
  });
});

app.listen(3000, () => {
  console.log('Corriendo en el puerto 3000');
});