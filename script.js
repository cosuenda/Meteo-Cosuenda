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
    document.getElementById("dew").textConte










