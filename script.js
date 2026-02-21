// ====== Claves API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Conversiones ======
const fToC = f => ( (parseFloat(f) - 32) * 5 / 9 );
const mphToKmh = mph => ( parseFloat(mph) * 1.60934 );
const inToMm = inches => ( parseFloat(inches) * 25.4 );
const inHgToHpa = inHg => ( parseFloat(inHg) * 33.8639 );

// ====== Gestión Min/Max diaria ======
function actualizarMinMax(clave, valor) {

    const hoy = new Date().toISOString().split("T")[0];
    let datos = JSON.parse(localStorage.getItem("minMaxMeteo")) || {};

    if (!datos[hoy]) {
        datos = {};
        datos[hoy] = {};
    }

    if (!datos[hoy][clave]) {
        datos[hoy][clave] = { min: valor, max: valor };
    } else {
        if (valor < datos[hoy][clave].min) datos[hoy][clave].min = valor;
        if (valor > datos[hoy][clave].max) datos[hoy][clave].max = valor;
    }

    localStorage.setItem("minMaxMeteo", JSON.stringify(datos));

    return datos[hoy][clave];
}

// ====== Función principal ======
async function obtenerDatos() {

    try {

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 0) {
            console.log("Error API");
            return;
        }

        const outdoor = data.data.outdoor;
        const wind = data.data.wind;
        const rainfall = data.data.rainfall;
        const pressure = data.data.pressure;

        const tempC = fToC(outdoor.temperature.value);
        const hum = parseFloat(outdoor.humidity.value);
        const windKmh = mphToKmh(wind.wind_speed.value);
        const rainMm = inToMm(rainfall.daily.value);
        const pressHpa = inHgToHpa(pressure.relative.value);

        // ===== Mostrar valores actuales =====
        document.getElementById("tempBig").textContent = tempC.toFixed(1) + " °C";
        document.getElementById("hum").textContent = hum + " %";
        document.getElementById("wind").textContent = windKmh.toFixed(1) + " km/h";
        document.getElementById("rain").textContent = rainMm.toFixed(1) + " mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1) + " hPa";

        // ===== Calcular Min/Max =====
        const tempMM = actualizarMinMax("temp", tempC);
        const humMM = actualizarMinMax("hum", hum);
        const windMM = actualizarMinMax("wind", windKmh);

        // ===== Mostrar Min/Max =====
        document.getElementById("tempMin").textContent = "Min: " + tempMM.min.toFixed(1) + " °C";
        document.getElementById("tempMax").textContent = "Max: " + tempMM.max.toFixed(1) + " °C";

        document.getElementById("humMax").textContent = "Max: " + humMM.max + " %";
        document.getElementById("windMax").textContent = "Max: " + windMM.max.toFixed(1) + " km/h";

    } catch (error) {
        console.log("Error conexión");
    }
}

// ===== Ejecutar =====
obtenerDatos();
setInterval(obtenerDatos, 300000);




















