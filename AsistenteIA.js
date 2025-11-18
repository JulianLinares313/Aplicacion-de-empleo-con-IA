

class AsistenteIA {
  constructor() {
    // ✔ Reemplazado Gemini por Ollama
    this.model = 'deepseek-r1';
    this.apiUrl = 'http://localhost:11434/api/generate';
  }


  async obtenerContextoOfertas() {
    try {
      const response = await fetch('http://localhost:3000/ofertas');
      const ofertas = await response.json();

      let contexto = 'OFERTAS DE EMPLEO DISPONIBLES EN EL LLANO:\n\n';
      ofertas.forEach((oferta, index) => {
        contexto += `${index + 1}. ${oferta.titulo} - ${oferta.empresa}\n`;
        contexto += `   Sector: ${oferta.sector}\n`;
        contexto += `   Ubicación: ${oferta.ubicacion}\n`;
        contexto += `   Salario: ${oferta.salario}\n`;
        contexto += `   Descripción: ${oferta.descripcion}\n\n`;
      });

      return contexto;
    } catch (error) {
      console.error('Error al obtener ofertas:', error);
      return 'Ofertas no disponibles en este momento.';
    }
  }


  async obtenerRespuesta(mensajeUsuario) {
    try {
      const contexto = await this.obtenerContextoOfertas();

      const systemPrompt = `Eres un asistente especializado de "Empleos del Llano" - una plataforma de empleo para el sector agropecuario, ganadería, agricultura, ecoturismo y conservación en Villavicencio y el Llano.

Tu función es:
1. Ayudar a usuarios a encontrar las mejores ofertas de empleo según sus habilidades
2. Responder preguntas sobre la plataforma y las ofertas disponibles
3. Dar información sobre sectores: Ganadería, Agricultura, Ecoturismo, Conservación, Acuicultura, Educación Ambiental

IMPORTANTE:
- Responde SOLO sobre ofertas de empleo y la plataforma
- Si preguntan sobre otros temas, di: "Disculpa, solo puedo ayudarte con información sobre ofertas de empleo en el Llano"
- Sé breve, amable y natural
- Responde solo en español (no en inglés)  
 no envies mucho texto, solo lo necesario y tampoco escribas lo que analises solo di lo que quiero saber el usuario

CONTEXTO DE OFERTAS:
${contexto}

Pregunta del usuario: ${mensajeUsuario}`;


      const requestBody = {
        model: this.model,
        prompt: systemPrompt,
        stream: false
      };

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Error API Ollama: ${response.status}`);
      }

      const data = await response.json();


      if (data.response) {
        return data.response;
      }

      return 'No pude procesar tu pregunta. Intenta de nuevo.';
    } catch (error) {
      console.error('Error al obtener respuesta de IA:', error);
      return `Error: ${error.message}. Por favor, intenta de nuevo más tarde.`;
    }
  }

  // Sintetizar texto a voz
  hablar(texto) {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier síntesis anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.rate = 1;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    } else {
      console.log('TTS no disponible en este navegador');
    }
  }
}


window.AsistenteIA = AsistenteIA;
