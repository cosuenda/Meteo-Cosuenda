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

// ====== DIRECCIÓN DEL VIENTO ======
function direccionViento(grados){
    const dirs = ["N","NE","E","SE","S","SW","W","NW"];
    return dirs[Math.round(grados / 45) % 8];
}

// ====== FECHA ACTUAL ======
function fechaHoy(){
    return new Date().toISOString().split("T")[0];
}

// ====== EXTREMOS DIARIOS ======
function actualizarExtremos(temp, hum, wind){
    const hoy = fechaHoy();
    let datos = JSON.parse(localStorage.getItem("extremosDia"));

    if(!datos || datos.fecha !== hoy){
        datos = {
            fecha: hoy,
            tempMin: temp,
            tempMax: temp,
            humMax: hum,
            windMax: wind
        };
    }else{
        if(temp < datos.tempMin) datos.tempMin = temp;
        if(temp > datos.tempMax) datos.tempMax = temp;
        if(hum > datos.humMax) datos.humMax = hum;
        if(wind > datos.windMax) datos.windMax = wind;
    }

    localStorage.setItem("extremosDia", JSON.stringify(datos));
    return datos;
}

// ====== FONDO AUTOMÁTICO ======
function fondoAutomatico(){
    const hora = new Date().getHours();
    if(hora >= 6 && hora < 18){
        document.body.style.background =
            "linear-gradient(to bottom,#87CEEB,#f0f8ff)";
    }else{
        document.body.style.background =
            "linear-gradient(to bottom,#001848,#0a1f44)";
    }
}

// ====== FUNCIÓN PRINCIPAL ======
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const json = await response.json();

        if(json.code !== 0){
            console.log("Error API");
            return;
        }

        const outdoor = json.data.outdoor;
        const wind = json.data.wind;
        const rainfall = json.data.rainfall;
        const pressure = json.data.pressure;

        const tempC = fToC(outdoor.temperature.value);
        const hum = parseFloat(outdoor.humidity.value);
        const windKmh = mphToKmh(wind.wind_speed.value);
        const windDeg = parseFloat(wind.wind_direction.value);
        const rainMm = inToMm(rainfall.daily.value);
        const pressHpa = inHgToHpa(pressure.relative.value);

        // MOSTRAR ACTUALES
        document.getElementById("tempBig").textContent =
            tempC.toFixed(1) + " °C";

        document.getElementById("hum").textContent =
            hum + " %";

        document.getElementById("wind").textContent =
            windKmh.toFixed(1) + " km/h";

        document.getElementById("windDir").textContent =
            "Dirección: " + direccionViento(windDeg);

        document.getElementById("rain").textContent =
            rainMm.toFixed(1) + " mm";

        document.getElementById("press").textContent =
            pressHpa.toFixed(1) + " hPa";

        // EXTREMOS
        const extremos = actualizarExtremos(tempC, hum, windKmh);

        document.getElementById("tempMin").textContent =
            "Min: " + extremos.tempMin.toFixed(1) + " °C";

        document.getElementById("tempMax").textContent =
            "Max: " + extremos.tempMax.toFixed(1) + " °C";

        document.getElementById("humMax").textContent =
            "Max: " + extremos.humMax + " %";

        document.getElementById("windMax").textContent =
            "Max: " + extremos.windMax.toFixed(1) + " km/h";

        fondoAutomatico();

    }catch(error){
        console.log("Error conexión", error);
    }
}

// INICIO
obtenerDatos();
setInterval(obtenerDatos, 300000);



















