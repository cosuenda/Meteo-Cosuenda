// ----------------------------
// script.js para GitHub Pages
// ----------------------------

// ⚠️ Sustituye estos valores por los de tu estación Ecowitt
const APP_KEY = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const API_KEY = "adf65434-1ace-43dd-b9a9-27915843d243";
const MAC = "84:CC:A8:B4:B1:F6";

// URL de la API
const url = https://www.ecowitt.net/home/user{26C4D6AD21CF8F8C4F3BA85E1CAF6701}&api_key=${adf65434-1ace-43dd-b9a9-27915843d243}&mac=${84:CC:A8:B4:B1:F6}&call_back=all`;

async function obtenerDatos() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error en la API: ${response.status}`);

    const json = await response.json();
    console.log(json); // para depuración

    if (json.data && json.data[MAC] && json.data[MAC].gw) {
      const datos = json.data[MAC].gw;

      document.getElementById("temperatura").textContent = datos.temp + " °C";
      document.getElementById("humedad").textContent = datos.humidity + " %";
      document.getElementById("presion").textContent = datos.bar + " hPa";
      document.getElementById("viento").textContent = datos.wind_spd + " m/s";
    } else {
      console.warn("No se recibieron datos de la estación");
    }
  } catch (error) {
    console.error("Error obteniendo los datos:", error);
  }
}

// Llamar al cargar la página
window.addEventListener("load", obtenerDatos);

// Actualizar cada 5 minutos
setInterval(obtenerDatos, 300000);



