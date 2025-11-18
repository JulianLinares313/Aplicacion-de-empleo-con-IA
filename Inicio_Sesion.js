async function registroUsuario() {
  try {
    const id = document.getElementById("id_documento").value.trim();
    const nombre = document.getElementById("nombreUsuario").value.trim();
    const correo = document.getElementById("id_Correo").value.trim();
    const contrasena = document.getElementById("contrasenaUsuario").value;

    // Validación cliente
    if (!id || !nombre || !contrasena || !correo) {
      alert("Faltan datos requeridos");
      return;
    }

    if (nombre.length < 3) {
      alert("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (contrasena.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (id.length < 6) {
      alert(" El número de documento debe tener al menos 6 dígitos");
      return;
    }

    const datos = { id, nombre, contrasena, correo };

    const respuesta = await fetch("http://localhost:3000/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const texto = await respuesta.text();

    if (respuesta.ok) {
      alert(texto);
      window.location.href = "Inicio_Sesion.html";
    } else {
      alert("error" + texto);
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    alert("Error en el registro");
  }
}
async function validarUsuario() {
  try {
    const nombre = document.getElementById("nombreUsuario").value;
    const contrasena = document.getElementById("contrasenaUsuario").value;

    const datos = { nombre, contrasena };

    const respuesta = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      // Guardar datos del usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      alert(" Sesión iniciada");
      window.location.href = "Principal.html";
    } else {
      alert(data.error || " Error al iniciar sesión");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert(" Error al iniciar sesión");
  }
}
