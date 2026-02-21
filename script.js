// ====== CLAVES API ======
const appKey = "TU_APP_KEY";
const apiKey = "TU_API_KEY";
const mac = "TU_MAC";

// ====== URL API ======
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9);
const mphToKmh = mph => (parseFloat(mph) * 1.60934);
const inToMm = inches => (parseFloat(inches) * 25.4);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639);

// ====== FUNCIÓN PRINCIPAL ======
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const data = await response.json();

        if(data.code !== 0){
            console.error("Error API:", data);
            return;
        }

        const outdoor = data.data.outdoor;
        const wind = data.data.wind;
        const rainfall = data.data.rainfall;
        const pressure = data.data.pressure;

        // ====== TEMPERATURA ======
        const tempActual = fToC(outdoor.temperature.value);
        const tempMin = fToC(outdoor.temperature.min.value);
        const tempMax = fToC(outdoor.temperature.max.value);

        document.getElementById("tempBig").textContent =
            tempActual.toFixed(1) + " °C";

        document.getElementById("tempMin").textContent =
            tempMin.toFixed(1) + " °C";

        document.getElementById("tempMax").textContent =
            tempMax.toFixed(1) + " °C";

        // ====== HUMEDAD ======
        const humActual = outdoor.humidity.value;
        const humMax = outdoor.humidity.max.value;

        document.getElementById("hum").textContent =
            humActual + " %";

        document.getElementById("humMax").textContent =
            humMax + " %";

        // ====== VIENTO ======
        const windActual = mphToKmh(wind.wind_speed.value);
        const windMax = mphToKmh(wind.wind_gust.value);

        document.getElementById("wind").textContent =
            windActual.toFixed(1) + " km/h";

        document.getElementById("windMax").textContent =
            windMax.toFixed(1) + " km/h";

        // ====== LLUVIA ======
        document.getElementById("rain").textContent =
            inToMm(rainfall.daily.value).toFixed(1) + " mm";

        // ====== PRESIÓN ======
        document.getElementById("press").textContent =
            inHgToHpa(pressure.relative.value).toFixed(1) + " hPa";

    }catch(error){
        console.error("Error conexión:", error);
    }
}

// CARGA INICIAL + REFRESCO
obtenerDatos();
setInterval(obtenerDatos, 300000);





















