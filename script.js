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

    // ====== Convertir unidades ======
    const tempC = parseFloat(fToC(outdoor.temperature.value));
    const feelsC = parseFloat(fToC(outdoor.feels_like.value));
    const dewC = parseFloat(fToC(outdoor.dew_point.value));
    const humVal = parseInt(outdoor.humidity.value);
    const windKm = parseFloat(mphToKmh(wind.wind_speed.value));
    const rainMm = parseFloat(inToMm(rainfall.value));
    const pressHpa = parseFloat(inHgToHpa(pressure.relative.value));

    // ====== Animar valores ======
    animarValor(document.getElementById("temp"), tempC, " °C");
    animarValor(document.getElementById("feels"), feelsC, " °C");
    animarValor(document.getElementById("dew"), dewC, " °C");
    animarValor(document.getElementById("hum"), humVal, " %");
    animarValor(document.getElementById("wind"), windKm, " km/h");
    animarValor(document.getElementById("rain"), rainMm, " mm");

    // ====== Valores fijos ======
    document.getElementById("winddir").textContent = wind.wind_direction.value + " º";
    document.getElementById("press").textContent = pressHpa + " hPa";
    document.getElementById("solar").textContent = solar.value + " W/m²";
    document.getElementById("uvi").textContent = uvi.value;

    // ====== Timestamp y fondo dinámico ======
    const timestamp = new Date(data.time * 1000);
    document.getElementById("update").textContent = timestamp.toLocaleString();

    const hour = timestamp.getHours();
    const body = document.body;
    body.style.background = hour >= 6 && hour < 18 
      ? "linear-gradient(to bottom, #87CEEB, #f0f8ff)" 
      : "linear-gradient(to bottom, #001848, #0a1f44)";

    // ====== Colores dinámicos ======
    const tempEl = document.getElementById("temp");
    tempEl.style.color = tempC <= 0 ? "#00f" :
                          tempC <= 15 ? "#0aa" :
                          tempC <= 25 ? "#0a0" :
                          tempC <= 35 ? "#fa0" : "#f00";

    const humEl = document.getElementById("hum");
    humEl.style.color = humVal < 50 ? "#0aa" : "#0055aa";

    const windText = document.getElementById("wind");
    windText.style.color = windKm < 10 ? "#0a0" : windKm < 30 ? "#fa0" : "#f00";

    const rainText = document.getElementById("rain");
    rainText.style.color = rainMm === 0 ? "#555" : "#00f";

    // ====== Giro icono viento ======
    const windIcon = document.querySelector('img[alt="Viento"]');
    if (windIcon) {
      windIcon.style.transform = `rotate(${wind.wind_direction.value}deg)`;
      windIcon.style.transition = "transform 1s ease";
    }

    // ====== Guardar máximos y mínimos en localStorage ======
    const stats = JSON.parse(localStorage.getItem("stats") || "{}");

    // Temperatura
    stats.tempMax = Math.max(stats.tempMax || tempC, tempC);
    stats.tempMin = stats.tempMin === undefined ? tempC : Math.min(stats.tempMin, tempC);

    // Humedad
    stats.humMax = Math.max(stats.humMax || humVal, humVal);
    stats.humMin = stats.humMin === undefined ? humVal : Math.min(stats.humMin, humVal);

    // Lluvia acumulada
    stats.rainMax = Math.max(stats.rainMax || rainMm, rainMm);
    stats.rainMin = stats.rainMin === undefined ? rainMm : Math.min(stats.rainMin, rainMm);

    localStorage.setItem("stats", JSON.stringify(stats));

    // Mostrar máximos y mínimos
    document.getElementById("tempMax").textContent = stats.tempMax + " °C";
    document.getElementById("tempMin").textContent = stats.tempMin + " °C";
    document.getElementById("humMax").textContent = stats.humMax + " %";
    document.getElementById("humMin").textContent = stats.humMin + " %";
    document.getElementById("rainMax").textContent = stats.rainMax + " mm";
    document.getElementById("rainMin").textContent = stats.rainMin + " mm";

    // ====== Icono dinámico de clima ======
    const weatherIcon = document.getElementById("weather-icon");
    const weatherText = document.getElementById("weather-text");

    let iconUrl = "https://img.icons8.com/color/48/000000/temperature.png";
    let text = "Desconocido";

    if (rainMm > 0.5) {
      iconUrl = "https://img.icons8.com/color/48/000000/rain.png";
      text = "Lluvia";
    } else if (tempC <= 0 && rainMm > 0) {
      iconUrl = "https://img.icons8.com/color/48/000000/snow.png";
      text = "Nieve";
    } else if (solar.value > 400) {
      iconUrl = "https://img.icons8.com/color/48/000000/sun.png";
      text = "Soleado";
    } else if (solar.value > 100) {
      iconUrl = "https://img.icons8.com/color/48/000000/partly-cloudy-day.png";
      text = "Parcialmente nublado";
    } else {
      iconUrl = "https://img.icons8.com/color/48/000000/cloud.png";
      text = "Nublado";
    }

    weatherIcon.src = iconUrl;
    weatherText.textContent = text;

  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

// ====== Carga inicial y actualización cada 10 minutos ======
obtenerDatos();
setInterval(obtenerDatos, 600000);


















