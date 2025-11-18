// Variables globales
let usuarioLogueado = null;
let perfilCompleto = false;
let asistenteIA = null;

// Cargar datos del usuario al iniciar
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar asistente IA
  asistenteIA = new AsistenteIA();
  

  const usuario = localStorage.getItem('usuario');
  
  if (!usuario) {
  
    window.location.href = 'Inicio_Sesion.html';
    return;
  }

  usuarioLogueado = JSON.parse(usuario);
  actualizarPerfilEnUI();
  
  // Cargar ofertas y sectores
  await cargarSectores();
  await cargarOfertas();
});

// Actualizar UI con datos del usuario
function actualizarPerfilEnUI() {
  const perfilNombre = document.querySelector('.perfil-nombre');
  const perfilTitulo = document.querySelector('.perfil-titulo');
  
  if (perfilNombre) {
    perfilNombre.textContent = usuarioLogueado.nombre || 'Tu Nombre';
  }
  
  if (perfilTitulo) {
    perfilTitulo.textContent = usuarioLogueado.titulo_oferta || 'Completa tu perfil';
  }
}

// Cargar sectores disponibles en el filtro
async function cargarSectores() {
  try {
    const response = await fetch('http://localhost:3000/sectores');
    const sectores = await response.json();
    
    const selectSector = document.getElementById('filtroSector');
    if (selectSector) {
      selectSector.innerHTML = '<option value="">Todos los sectores</option>';
      sectores.forEach(item => {
        const option = document.createElement('option');
        option.value = item.sector;
        option.textContent = item.sector;
        selectSector.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error al cargar sectores:', error);
  }
}

// Cargar y mostrar todas las ofertas
async function cargarOfertas() {
  try {
    const sector = document.getElementById('filtroSector')?.value || '';
    const busqueda = document.getElementById('busquedaOferta')?.value || '';
    
    let url = 'http://localhost:3000/ofertas';
    const params = new URLSearchParams();
    
    if (sector) params.append('sector', sector);
    if (busqueda) params.append('busqueda', busqueda);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    const response = await fetch(url);
    const ofertas = await response.json();
    
    mostrarOfertas(ofertas);
  } catch (error) {
    console.error('Error al cargar ofertas:', error);
    alert('Error al cargar ofertas');
  }
}

// Mostrar ofertas en el grid
function mostrarOfertas(ofertas) {
  const gridOfertas = document.getElementById('gridOfertas');
  
  if (!gridOfertas) return;
  
  if (ofertas.length === 0) {
    gridOfertas.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">No hay ofertas disponibles</p>';
    return;
  }

  gridOfertas.innerHTML = ofertas.map(oferta => `
    <div class="tarjeta-oferta">
      <div class="oferta-header">
        <h3>${oferta.titulo}</h3>
        <span class="badge-sector">${oferta.sector}</span>
      </div>
      <p class="oferta-empresa"><strong>${oferta.empresa}</strong></p>
      <p class="oferta-ubicacion">📍 ${oferta.ubicacion}</p>
      <p class="oferta-descripcion">${oferta.descripcion.substring(0, 100)}...</p>
      <p class="oferta-salario"><strong>Salario:</strong> ${oferta.salario}</p>
      <p class="oferta-fecha">Publicado: ${new Date(oferta.fecha_publicacion).toLocaleDateString('es-ES')}</p>
      <button class="btn-aplicar" onclick="abrirModalAplicar(${oferta.id}, '${oferta.titulo}')">
        Aplicar a esta oferta
      </button>
    </div>
  `).join('');
}

// requesito de aplicacion
function abrirModalAplicar(ofertaId, ofertaTitulo) {
  if (!perfilCompleto && (!usuarioLogueado.titulo_oferta || !usuarioLogueado.descripcion)) {
    alert('⚠️ Primero debes completar tu perfil para aplicar a una oferta');
    abrirModalPerfil();
    return;
  }

  const modal = document.getElementById('modalAplicar');
  const contenido = modal.querySelector('.modal-contenido');
  
  contenido.innerHTML = `
    <span class="cerrar" onclick="cerrarModalAplicar()">&times;</span>
    <h2>Aplicar a: ${ofertaTitulo}</h2>
    <p><strong>Usuario:</strong> ${usuarioLogueado.nombre}</p>
    <p><strong>Correo:</strong> ${usuarioLogueado.correo}</p>
    <p><strong>Especialidad:</strong> ${usuarioLogueado.tipo_publicacion || 'No especificada'}</p>
    <div class="modal-acciones">
      <button class="btn-principal" onclick="confirmarAplicacion(${ofertaId})">Confirmar Aplicación</button>
      <button class="btn-secundario" onclick="cerrarModalAplicar()">Cancelar</button>
    </div>
  `;
  
  modal.style.display = 'block';
}

function cerrarModalAplicar() {
  const modal = document.getElementById('modalAplicar');
  if (modal) modal.style.display = 'none';
}

// Confirmar aplicación a oferta
async function confirmarAplicacion(ofertaId) {
  try {
    const response = await fetch('http://localhost:3000/aplicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuarioLogueado.id,
        oferta_id: ofertaId
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      cerrarModalAplicar();
    } else {
      alert(' Error: ' + data.error);
    }
  } catch (error) {
    console.error('Error al aplicar:', error);
    alert('Error al procesar la aplicación');
  }
}

// Modal para completar perfil
function abrirModalPerfil() {
  const modal = document.getElementById('modalPerfil');
  if (modal) modal.style.display = 'block';
}

function cerrarModalPerfil() {
  const modal = document.getElementById('modalPerfil');
  if (modal) modal.style.display = 'none';
}

// Guardar cambios de perfil
async function guardarPerfil() {
  try {
    const descripcion = document.getElementById('descripcionPerfil').value.trim();
    const tipoPublicacion = document.getElementById('tipoPublicacionPerfil').value.trim();
    const tituloOferta = document.getElementById('tituloOfertaPerfil').value.trim();

    if (!descripcion || !tipoPublicacion || !tituloOferta) {
      alert(' Completa todos los campos');
      return;
    }

    const response = await fetch(`http://localhost:3000/perfil/${usuarioLogueado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion,
        tipo_publicacion: tipoPublicacion,
        titulo_oferta: tituloOferta
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Actualizar datos locales
      usuarioLogueado.descripcion = descripcion;
      usuarioLogueado.tipo_publicacion = tipoPublicacion;
      usuarioLogueado.titulo_oferta = tituloOferta;
      
      // Guardar en localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
      
      perfilCompleto = true;
      alert(data.message);
      cerrarModalPerfil();
      actualizarPerfilEnUI();
    } else {
      alert(' ' + data.error);
    }
  } catch (error) {
    console.error('Error al guardar perfil:', error);
    alert('Error al guardar perfil');
  }
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('usuario');
  window.location.href = 'Inicio_Sesion.html';
}

// Event listeners para búsqueda y filtros
document.addEventListener('DOMContentLoaded', () => {
  const filtroSector = document.getElementById('filtroSector');
  const busquedaOferta = document.getElementById('busquedaOferta');
  const btnBuscar = document.getElementById('btnBuscar');

  if (filtroSector) {
    filtroSector.addEventListener('change', cargarOfertas);
  }

  if (busquedaOferta) {
    busquedaOferta.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') cargarOfertas();
    });
  }

  if (btnBuscar) {
    btnBuscar.addEventListener('click', cargarOfertas);
  }

  // Botón para abrir modal de perfil
  const btnEditarPerfil = document.getElementById('btnEditarPerfil');
  if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener('click', abrirModalPerfil);
  }

  // Cerrar modales al hacer click fuera
  const modales = document.querySelectorAll('.modal');
  modales.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Inicializar botón del asistente
  const btnAsistente = document.getElementById('btnAsistente');
  if (btnAsistente) {
    btnAsistente.addEventListener('click', abrirChatAsistente);
  }
});

// ===== FUNCIONES DEL ASISTENTE IA =====

// Abrir chat del asistente
function abrirChatAsistente() {
  const modal = document.getElementById('modalAsistente');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('chatAsistenteArea').innerHTML = '';
    mostrarMensajeAsistente('¡Hola! Soy tu asistente de Empleos del Llano. Puedo ayudarte a encontrar las mejores ofertas según tus habilidades. ¿Qué estás buscando?');
  }
}

// Cerrar chat del asistente
function cerrarChatAsistente() {
  const modal = document.getElementById('modalAsistente');
  if (modal) modal.style.display = 'none';
}

// Mostrar mensaje en el chat
function mostrarMensajeAsistente(mensaje, esUsuario = false) {
  const chatArea = document.getElementById('chatAsistenteArea');
  if (!chatArea) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = esUsuario ? 'mensaje-usuario' : 'mensaje-asistente';
  messageDiv.innerHTML = `
    <span class="prefijo">${esUsuario ? '👤 Tú' : '🤖 Asistente'}:</span>
    <span class="contenido">${mensaje}</span>
  `;

  chatArea.appendChild(messageDiv);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Enviar mensaje al asistente
async function enviarMensajeAsistente() {
  const inputAsistente = document.getElementById('inputAsistente');
  if (!inputAsistente) return;

  const mensaje = inputAsistente.value.trim();
  if (!mensaje) return;

  // Mostrar mensaje del usuario
  mostrarMensajeAsistente(mensaje, true);
  inputAsistente.value = '';

  // Mostrar indicador de "escribiendo"
  const chatArea = document.getElementById('chatAsistenteArea');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'mensaje-escribiendo';
  loadingDiv.innerHTML = '<span class="prefijo">🤖 Asistente:</span><span class="contenido">Escribiendo...</span>';
  chatArea.appendChild(loadingDiv);
  chatArea.scrollTop = chatArea.scrollHeight;

  try {
    // Obtener respuesta de IA
    const respuesta = await asistenteIA.obtenerRespuesta(mensaje);
    
    // Remover indicador de "escribiendo"
    loadingDiv.remove();
    
    // Mostrar respuesta
    mostrarMensajeAsistente(respuesta, false);
    
 
    asistenteIA.hablar(respuesta);
  } catch (error) {
    loadingDiv.remove();
    mostrarMensajeAsistente('Error: No pude procesar tu pregunta. Intenta de nuevo.', false);
  }
}
