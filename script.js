const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

const fToC = f => ((parseFloat(f) - 32) * 5/9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);

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

    // Actualiza HTML
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

    // Cambio de color según temperatura
    const tempC = parseFloat(fToC(outdoor.temperature.value));
    if (tempC <= 0) document.getElementById("temp").style.color = "#00f"; // azul frío
    else if (tempC <= 15) document.getElementById("temp").style.color = "#0aa"; // azul claro
    else if (tempC <= 25) document.getElementById("temp").style.color = "#0a0"; // verde
    else if (tempC <= 35) document.getElementById("temp").style.color = "#fa0"; // naranja
    else document.getElementById("temp").style.color = "#f00"; // rojo

    const timestamp = new Date(data.time * 1000);
    document.getElementById("update").textContent = timestamp.toLocaleString();

  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

// Carga inicial y actualización cada 10 minutos
obtenerDatos();
setInterval(obtenerDatos, 600000);

























