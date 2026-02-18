// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Funciones de conversión ======
const fToC = f => ((parseFloat(f) - 32) * 5/9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);

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

    // ====== Actualizar valores ======
    document.getElementById("temp").textContent = fToC(outdoor.temperature.value) + " °C";
    document.getElementById("feels").textContent = fToC(outdoor.feels_like.value) + " °C";
    document.getElementById("dew").textContent = fToC(outdoor.dew_point.value) + " °C";
    document.getElementById("hum").textContent = outdoor.humidity.value + " %";
    document.getElementById("wind").textContent = mphToKmh(wind.wind_speed.value) + " km/h";
    document.getElementById("winddir").textContent = wind.wind_direction.value + " º";
    document.getElementById("press").textContent = pressure.relative.value + " inHg";
    document.getElementById("solar").textContent = solar.value + " W/m²";
    document.getElementById("uvi").textContent = uvi.value;
    document.getElementById("rain").textContent = rainfall.value + " in";

    // ====== Timestamp y fondo dinámico ======
    const timestamp = new Date(data.time * 1000);
    document.getElementById("update").textContent = timestamp.toLocaleString();

    // Fondo día/noche
    const hour = timestamp.getHours();
    const body = document.body;
    if (hour >= 6 && hour < 18) body.style.background = "linear-gradient(to bottom, #87CEEB, #f0f8ff)"; // día
    else body.style.background = "linear-gradient(to bottom, #001848, #0a1f44)"; // noche

    // ====== Colores dinámicos ======
    // Temperatura
    const tempC = parseFloat(fToC(outdoor.temperature.value));
    const tempEl = document.getElementById("temp");
    if (tempC <= 0) tempEl.style.color = "#00f";
    else if (tempC <= 15) tempEl.style.color = "#0aa";
    else if (tempC <= 25) tempEl.style.color = "#0a0";
    else if (tempC <= 35) tempEl.style.color = "#fa0";
    else tempEl.style.color = "#f00";

    // Humedad
    const humVal = parseInt(outdoor.humidity.value);
    const humEl = document.getElementById("hum");
    humEl.style.color = humVal < 50 ? "#0aa" : "#0055aa";

    // Viento
    const windVal = parseFloat(wind.wind_speed.value) * 1.60934;
    const windEl = document.getElementById("wind");
    if (windVal < 10) windEl.style.color = "#0a0";
    else if (windVal < 30) windEl.style.color = "#fa0";
    else windEl.style.color = "#f00";

    // Lluvia
    const rainVal = parseFloat(rainfall.value);
    const rainEl = document.getElementById("rain");
    rainEl.style.color = rainVal === 0 ? "#555" : "#00f";

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


























