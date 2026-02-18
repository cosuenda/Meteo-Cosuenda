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

    console.log("Respuesta completa:", json);

    if (!json.data) {
      document.getElementById("description").innerText = "Error API";
      return;
    }

    const outdoor = json.data.outdoor || {};
    const wind = json.data.wind || {};
    const rainfall = json.data.rainfall || {};
    const solar = json.data.solar_and_uvi || {};

    const temp = outdoor.temperature?.value ?? "--";
    const humedad = outdoor.humidity?.value ?? "--";
    const viento = wind.speed?.value ?? "--";
    const lluvia = rainfall.rate?.value ?? 0;
    const radiacion = solar.solar?.value ?? 0;

    document.getElementById("temp").innerText = temp + "°C";
    document.getElementById("extraData").innerText =
      "💧 " + humedad + "%   💨 " + viento + " km/h";

  } catch (error) {
    console.error("Error cargando datos:", error);
    document.getElementById("description").innerText = "Error conexión";
  }
}






























