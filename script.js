// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Funciones de conversión ======
const fToC = f => ((parseFloat(f) - 32) * 5/9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);

// ====== Animación de valor ======
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
    const data = await response.json();

    if (data.code !== 0) {
      console.error("Error API:", data);
      return;
    }

    const outdoor = data.data.outdoor;
    const wind = data.data.wind;
    const pressure = data.data.pressure;
    const solar = data.data.solar_and_uvi.solar;
    const uvi = data.data.solar_and_uvi.uvi;
    const rainfall = data.data.rainfall.daily;

    // ====== Animar valores ======
    animarValor(document.getElementById("temp"), fToC(outdoor.temperature.value), " °C");
    animarValor(document.getElementById("feels"), fToC(outdoor.feels_like.value), " °C");
    animarValor(document.getElementById("dew"), fToC(outdoor.dew_point.value), " °C");
    animarValor(document.getElementById("wind"), mphToKmh(wind.wind_speed.value), " km/h");
    animarValor(document.getElementById("rain"), rainfall.value, " in");

    // Actualizar valores fijos
    document.getElementById("winddir").textContent = wind.wind_direction.value + " º";
    document.getElementById("press").textContent = pressure.relative.value + " inHg";
    document.getElementById("solar").textContent = solar.value + " W/m²";
    document.getElementById("uvi").textContent = uvi.value;

    // ====== Timestamp y fondo dinámico ======
    const timestamp = new Date(data.time * 1000);
    document.getElementById("update").textContent = timestamp.toLocaleString();

    const hour = timestamp.getHours();
    const body = document.body;
    if (hour >= 6 && hour < 18) body.style.background = "linear-gradient(to bottom, #87CEEB, #f0f8ff)";
    else body.style.background = "linear-gradient(to bottom, #001848, #0a1f44)";

    // ====== Colores dinámicos ======
    const tempC = parseFloat(fToC(outdoor.temperature.value));
    const tempEl = document.getElementById("temp");
    if (tempC <= 0) tempEl.style.color = "#00f";
    else if (tempC <= 15) tempEl.style.color = "#0aa";
    else if (tempC <= 25) tempEl.style.color = "#0a0";
    else if (tempC <= 35) tempEl.style.color = "#fa0";
    else tempEl.style.color = "#f00";

    const humVal = parseInt(outdoor.humidity.value);
    const humEl = document.getElementById("hum");
    humEl.style.color = humVal < 50 ? "#0aa" : "#0055aa";

    const windVal = parseFloat(wind.wind_speed.value) * 1.60934;
    const windText = document.getElementById("wind");
    if (windVal < 10) windText.style.color = "#0a0";
    else if (windVal < 30) windText.style.color = "#fa0";
    else windText.style.color = "#f00";

    const rainVal = parseFloat(rainfall.value);
    const rainText = document.getElementById("rain");
    rainText.style.color = rainVal === 0 ? "#555" : "#00f";

    // ====== Giro icono viento ======
    const windIcon = document.querySelector('img[alt="Viento"]');
    if (windIcon) {
      windIcon.style.transform = `rotate(${wind.wind_direction.value}deg)`;
      windIcon.style.transition = "transform 1s ease";
    }

  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

// Carga inicial y actualización cada 10 minutos
obtenerDatos();
setInterval(obtenerDatos, 600000);


























