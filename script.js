// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Funciones de conversión ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches) * 25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639).toFixed(1);

// ====== Animación de valores ======
function animarValor(element, nuevoValor, unidad = "") {
  const valorActual = parseFloat(element.getAttribute("data-valor")) || 0;
  const valorFinal = parseFloat(nuevoValor);
  let start = valorActual;
  const step = (valorFinal - start) / 20;

  let i = 0;
  const anim = setInterval(() => {
    start += step;
    element.textContent = start.toFixed(1) + unidad;
    i++;
    if (i >= 20) {
      element.textContent = valorFinal.toFixed(1) + unidad;
      element.setAttribute("data-valor", valorFinal);
      clearInterval(anim);
    }
  }, 50);
}

// ====== Función principal ======
async function obtenerDatos() {
  try {
    const response = await fetch(url);
    const json = await response.json();

    console.log("Respuesta API:", json); // Para depuración

    // Si no existe json.data → no rompemos la web
    if (!json || !json.data) {
      document.getElementById("description").innerText = "No hay datos disponibles";
      document.getElementById("temp").innerText = "--°C";
      document.getElementById("extraData").innerText = "💧 --%   💨 -- km/h";
      skycons.set("weatherIcon", Skycons.CLEAR_DAY);
      document.body.style.background = "linear-gradient(to top, #4facfe, #00f2fe)";
      return;
    }

    // Extraer datos de forma segura
    const temp = json.data?.outdoor?.temperature?.value ?? "--";
    const humedad = json.data?.outdoor?.humidity?.value ?? "--";
    const viento = json.data?.wind?.speed?.value ?? "--";
    const lluvia = json.data?.rainfall?.rate?.value ?? 0;
    const radiacion = json.data?.solar_and_uvi?.solar?.value ?? 0;

    // Mostrar datos
    document.getElementById("temp").innerText = temp + "°C";
    document.getElementById("extraData").innerText =
      "💧 " + humedad + "%   💨 " + viento + " km/h";

    // Elegir icono y fondo
    const hora = new Date().getHours();
    const esNoche = hora >= 20 || hora <= 6;

    let icono, descripcion, fondo;

    if (lluvia > 0) {
      icono = Skycons.RAIN;
      descripcion = "Lluvia";
      fondo = "linear-gradient(to top, #4e54c8, #8f94fb)";
    } 
    else if (viento > 30) {
      icono = Skycons.WIND;
      descripcion = "Viento fuerte";
      fondo = "linear-gradient(to top, #757f9a, #d7dde8)";
    } 
    else if (esNoche) {
      icono = Skycons.CLEAR_NIGHT;
      descripcion = "Noche despejada";
      fondo = "linear-gradient(to top, #141e30, #243b55)";
    } 
    else if (radiacion > 200) {
      icono = Skycons.CLEAR_DAY;
      descripcion = "Despejado";
      fondo = "linear-gradient(to top, #4facfe, #00f2fe)";
    } 
    else {
      icono = Skycons.PARTLY_CLOUDY_DAY;
      descripcion = "Parcialmente nublado";
      fondo = "linear-gradient(to top, #bdc3c7, #2c3e50)";
    }

    skycons.set("weatherIcon", icono);
    document.getElementById("description").innerText = descripcion;
    document.body.style.background = fondo;

  } catch (error) {
    console.error("Error cargando datos:", error);
    document.getElementById("description").innerText = "Error de conexión";
    document.getElementById("temp").innerText = "--°C";
    document.getElementById("extraData").innerText = "💧 --%   💨 -- km/h";
    skycons.set("weatherIcon", Skycons.CLEAR_DAY);
    document.body.style.background = "linear-gradient(to top, #4facfe, #00f2fe)";
  }
}
































