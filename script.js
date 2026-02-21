// ====== CLAVES ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9);
const mphToKmh = mph => (parseFloat(mph) * 1.60934);
const inToMm = inches => (parseFloat(inches) * 25.4);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639);

// ====== DIRECCIÓN VIENTO ======
function gradosADireccion(grados){
  const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE",
              "S","SSO","SO","OSO","O","ONO","NO","NNO"];
  return dirs[Math.round(grados/22.5)%16];
}

// ====== MÍNIMA Y MÁXIMA DIARIA LOCAL ======
let tempMin = null;
let tempMax = null;
let diaActual = new Date().getDate();

// ====== MAPA ======
const map = L.map('map').setView([41.283,-1.299], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap'
}).addTo(map);

L.marker([41.283,-1.299]).addTo(map)
  .bindPopup("Estación Meteo Cosuenda")
  .openPopup();

// ====== FUNCIÓN PRINCIPAL ======
async function obtenerDatos(){
  try{
    const response = await fetch(url);
    const data = await response.json();

    if(data.code !== 0){
      console.error("Error API", data);
      return;
    }

    const outdoor = data.data.outdoor;
    const wind = data.data.wind;
    const rainfall = data.data.rainfall;
    const pressure = data.data.pressure;

    const tempC = fToC(outdoor.temperature.value);

    // Reset diario automático
    const hoy = new Date().getDate();
    if(hoy !== diaActual){
      tempMin = null;
      tempMax = null;
      diaActual = hoy;
    }

    if(tempMin === null || tempC < tempMin) tempMin = tempC;
    if(tempMax === null || tempC > tempMax) tempMax = tempC;

    // Mostrar datos
    document.getElementById("tempBig").textContent = tempC.toFixed(1) + " °C";
    document.getElementById("tempMin").textContent = tempMin.toFixed(1);
    document.getElementById("tempMax").textContent = tempMax.toFixed(1);

    document.getElementById("hum").textContent =
      outdoor.humidity.value + " %";

    document.getElementById("wind").textContent =
      mphToKmh(wind.wind_speed.value).toFixed(1) + " km/h";

    document.getElementById("windDir").textContent =
      gradosADireccion(wind.wind_direction.value);

    document.getElementById("rain").textContent =
      inToMm(rainfall.daily.value).toFixed(1) + " mm";

    document.getElementById("press").textContent =
      inHgToHpa(pressure.relative.value).toFixed(0) + " hPa";

  }catch(error){
    console.error("Error conexión", error);
  }
}

obtenerDatos();
setInterval(obtenerDatos, 300000);






















