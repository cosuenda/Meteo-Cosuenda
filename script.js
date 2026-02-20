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

// ====== GUARDADO DIARIO ======
function actualizarMinMaxHoy(tempActual){
    const hoy = new Date().toDateString();
    let datos = JSON.parse(localStorage.getItem("minmaxHoy")) || {};

    if(datos.fecha !== hoy){
        datos = {
            fecha: hoy,
            min: tempActual,
            max: tempActual
        };
    } else {
        if(tempActual < datos.min) datos.min = tempActual;
        if(tempActual > datos.max) datos.max = tempActual;
    }

    localStorage.setItem("minmaxHoy", JSON.stringify(datos));

    document.getElementById("tempMin").textContent = datos.min.toFixed(1) + " °C";
    document.getElementById("tempMax").textContent = datos.max.toFixed(1) + " °C";
}

// ====== RECORD ABSOLUTO ======
function actualizarRecord(tempActual){
    let record = JSON.parse(localStorage.getItem("recordTemp")) || {
        min: tempActual,
        max: tempActual
    };

    if(tempActual < record.min) record.min = tempActual;
    if(tempActual > record.max) record.max = tempActual;

    localStorage.setItem("recordTemp", JSON.stringify(record));

    document.getElementById("recordMin").textContent = record.min.toFixed(1) + " °C";
    document.getElementById("recordMax").textContent = record.max.toFixed(1) + " °C";
}

// ====== DIRECCIÓN DEL VIENTO ======
function direccionTexto(grados){
    const dirs = ["N","NE","E","SE","S","SW","W","NW"];
    return dirs[Math.round(grados/45)%8];
}

// ====== FUNCIÓN PRINCIPAL ======
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const data = await response.json();

        if(data.code !== 0) return;

        const outdoor = data.data.outdoor;
        const wind = data.data.wind;
        const rainfall = data.data.rainfall;
        const pressure = data.data.pressure;

        const tempC = fToC(outdoor.temperature.value);
        const windKmh = mphToKmh(wind.wind_speed.value);
        const rainMm = inToMm(rainfall.daily.value);
        const pressHpa = inHgToHpa(pressure.relative.value);

        // TEMPERATURA GRANDE
        document.getElementById("tempBig").textContent = tempC.toFixed(1) + " °C";

        // OTROS DATOS
        document.getElementById("hum").textContent = outdoor.humidity.value + " %";
        document.getElementById("wind").textContent = windKmh.toFixed(1) + " km/h";
        document.getElementById("windDir").textContent =
            direccionTexto(wind.wind_direction.value) + " (" +
            wind.wind_direction.value + "°)";
        document.getElementById("rain").textContent = rainMm.toFixed(1) + " mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1) + " hPa";

        // MIN MAX DIARIO
        actualizarMinMaxHoy(tempC);

        // RECORD ABSOLUTO
        actualizarRecord(tempC);

    }catch(error){
        console.error("Error conexión:", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos, 300000);

























