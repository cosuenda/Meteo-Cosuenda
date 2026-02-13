// ----------------------------
// script.js para GitHub Pages
// ----------------------------

// ⚠️ Sustituye estos valores por los de tu estación Ecowitt
const APP_KEY = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const API_KEY = "adf65434-1ace-43dd-b9a9-27915843d243";
const MAC = "84:CC:A8:B4:B1:F6";

// URL de la API
const url = "https://www.ecowitt.net/home/index?id=61227&app_key=${APP_KEY}&api_key=${API_KEY}&mac=${MAC}&call_back=all`;
async function obtenerDatos() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error en la API: ${response.status}`);

    const json = await response.json();
    console.log(json);

    if (json.data && json.data[MAC] && json.data[MAC].gw) {
      const datos = json.data[MAC].gw;
      document.getElementById("temperatura").textContent = datos.temp + " °C";
      document.getElementById("humedad").textContent = datos.humidity + " %";
      document.getElementById("presion").textContent = datos.bar + " hPa";
      document.getElementById("viento").textContent = datos.wind_spd + " m/s";
    }
  } catch (error) {
    console.error("Error obteniendo los datos:", error);
  }
}

window.addEventListener("load", obtenerDatos);
setInterval(obtenerDatos, 300000);




