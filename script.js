const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";


// ===== URL CORRECTA =====
const url = `https://www.ecowitt.net/home/index?id=61227${APP_KEY}&api_key=${API_KEY}&mac=${MAC}&call_back=all`;

async function obtenerDatos() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Datos recibidos:", data);

    if (data.code === 0) {
      const outdoor = data.data.outdoor;

      document.getElementById("temp").textContent = outdoor.temperature.value + " °C";
      document.getElementById("hum").textContent = outdoor.humidity.value + " %";
    } else {
      console.error("Error API:", data);
    }

  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

obtenerDatos();



