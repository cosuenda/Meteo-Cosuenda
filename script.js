// ====== DATOS ECOWITT ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9);
const mphToKmh = mph => (parseFloat(mph) * 1.60934);
const inToMm = inches => (parseFloat(inches) * 25.4);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639);

async function obtenerDatos(){
  try{
    const response = await fetch(url);
    const data = await response.json();

    if(data.code !== 0){
      console.log("Error API");
      return;
    }

    const outdoor = data.data.outdoor;
    const wind = data.data.wind;
    const rainfall = data.data.rainfall;
    const pressure = data.data.pressure;
    const today = data.data.today;

    // ====== ACTUALES ======
    const tempC = fToC(outdoor.temperature.value);
    const hum = parseInt(outdoor.humidity.value);
    const windKmH = mphToKmh(wind.wind_speed.value);
    const rainMm = inToMm(rainfall.daily.value);
    const press = inHgToHpa(pressure.relative.value);

    document.getElementById("tempBig").textContent = tempC.toFixed(1) + " °C";
    document.getElementById("hum").textContent = hum + " %";
    document.getElementById("wind").textContent = windKmH.toFixed(1) + " km/h";
    document.getElementById("rain").textContent = rainMm.toFixed(1) + " mm";
    document.getElementById("press").textContent = press.toFixed(1) + " hPa";

    // ====== MÍNIMA Y MÁXIMA OFICIALES ======
    const tempMin = fToC(today.outdoor.temperature.min);
    const tempMax = fToC(today.outdoor.temperature.max);
    const humMax = today.outdoor.humidity.max;
    const windMax = mphToKmh(today.wind.wind_gust.max);

    document.getElementById("tempMin").textContent = tempMin.toFixed(1) + " °C";
    document.getElementById("tempMax").textContent = tempMax.toFixed(1) + " °C";
    document.getElementById("humMax").textContent = humMax + " %";
    document.getElementById("windMax").textContent = windMax.toFixed(1) + " km/h";

  }catch(error){
    console.log("Error conexión", error);
  }
}

// ====== ACTUALIZAR CADA 5 MINUTOS ======
obtenerDatos();
setInterval(obtenerDatos,300000);




















