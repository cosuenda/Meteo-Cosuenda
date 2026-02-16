const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

// ✅ URL API REAL (no la web)
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

async function obtenerDatos() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Datos recibidos:", data);

    if (data.code === 0) {
      const outdoor = data.data.outdoor;

      document.getElementById("temp").textContent =
        outdoor.temperature.value + " °C";

      document.getElementById("hum").textContent =
        outdoor.humidity.value + " %";
    } else {
      console.error("Error API:", data);
    }

  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

obtenerDatos();




