const APP_KEY = 26C4D6AD21CF8F8C4F3BA85E1CAF6701;
const API_KEY = adf65434-1ace-43dd-b9a9-27915843d243;
const MAC = 84:CC:A8:B4:B1:F6;

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${APP_KEY}&api_key=${API_KEY}&mac=${MAC}&call_back=all`;

async function obtenerDatos() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    document.getElementById("temp").textContent =
      data.data.outdoor.temperature.value;

    document.getElementById("hum").textContent =
      data.data.outdoor.humidity.value;

    document.getElementById("pres").textContent =
      data.data.pressure.relative.value;

    document.getElementById("estado").textContent =
      "Datos actualizados correctamente";
  } catch (error) {
    document.getElementById("estado").textContent =
      "Error cargando datos";
    console.error(error);
  }
}

obtenerDatos();
setInterval(obtenerDatos, 60000);
