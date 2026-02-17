const APP_KEY = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const API_KEY = "adf65434-1ace-43dd-b9a9-27915843d243";
const MAC = "84:CC:A8:B4:B1:F6";

const url = `https://api.allorigins.win/raw?url=` +
            encodeURIComponent(`https://www.ecowitt.net/home/index?id=61227&application_key=${APP_KEY}&api_key=${API_KEY}&mac=${MAC}`);

async function obtenerDatos(){
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Datos recibidos:", data);

    const outdoor = data.data.outdoor;
    const temp = ((parseFloat(outdoor.temperature.value)-32)*5/9).toFixed(1);
    const hum = parseFloat(outdoor.humidity.value);
    const wind = (parseFloat(data.data.wind.wind_speed.value)*1.60934).toFixed(1);
    const press = (parseFloat(data.data.pressure.relative.value)*33.8639).toFixed(1);
    const lluvia = (parseFloat(data.data.rainfall.daily.value)*25.4).toFixed(1);

    document.getElementById("temp").textContent = temp + " °C";
    document.getElementById("hum").textContent = hum + " %";
    document.getElementById("wind").textContent = wind + " km/h";
    document.getElementById("press").textContent = press + " hPa";
    document.getElementById("rain").textContent = lluvia + " mm";
    document.getElementById("update").textContent = "Última actualización: " + new Date().toLocaleString();

  } catch (err) {
    console.error("Error al cargar datos:", err);
  }
}

obtenerDatos();
setInterval(obtenerDatos, 600000);























