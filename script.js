// ====== CONFIGURACIÓN ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9);
const mphToKmh = mph => (parseFloat(mph) * 1.60934);
const inToMm = inches => (parseFloat(inches) * 25.4);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639);

// ====== MÍNIMAS Y MÁXIMAS ======
let stats = {
    tempMin: null, tempMax: null,
    windMin: null, windMax: null,
    pressMin: null, pressMax: null,
    humMin: null, humMax: null,
    rainMax: 0
};

function actualizarMinMax(valor, minKey, maxKey) {
    if (stats[minKey] === null || valor < stats[minKey]) stats[minKey] = valor;
    if (stats[maxKey] === null || valor > stats[maxKey]) stats[maxKey] = valor;
}

// ====== FUNCIÓN PRINCIPAL ======
async function obtenerDatos() {
    try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.code !== 0) {
            console.error("Error API:", json);
            return;
        }

        const data = json.data;

        // ====== EXTRAER DATOS ======
        const tempC = fToC(data.outdoor.temperature.value);
        const windKmh = mphToKmh(data.wind.wind_speed.value);
        const pressureHpa = inHgToHpa(data.pressure.relative.value);
        const humidity = parseFloat(data.outdoor.humidity.value);
        const rainMm = inToMm(data.rainfall.daily.value);
        const solar = parseFloat(data.solar_and_uvi.solar.value);
        const uvi = parseFloat(data.solar_and_uvi.uvi.value);

        // ====== ACTUALIZAR VALORES ======
        document.getElementById("tempValor").textContent = tempC.toFixed(1) + " °C";
        document.getElementById("windValor").textContent = windKmh.toFixed(1) + " km/h";
        document.getElementById("pressValor").textContent = pressureHpa.toFixed(1) + " hPa";
        document.getElementById("humValor").textContent = humidity + " %";
        document.getElementById("rainValor").textContent = rainMm.toFixed(1) + " mm";
        document.getElementById("solarValor").textContent = solar + " W/m²";
        document.getElementById("uviValor").textContent = uvi;

        // ====== MÍNIMAS Y MÁXIMAS ======
        actualizarMinMax(tempC, "tempMin", "tempMax");
        actualizarMinMax(windKmh, "windMin", "windMax");
        actualizarMinMax(pressureHpa, "pressMin", "pressMax");
        actualizarMinMax(humidity, "humMin", "humMax");
        if (rainMm > stats.rainMax) stats.rainMax = rainMm;

        document.getElementById("tempMinMax").innerHTML =
            `<span class="min">Min: ${stats.tempMin.toFixed(1)}°C</span> | 
             <span class="max">Max: ${stats.tempMax.toFixed(1)}°C</span>`;

        document.getElementById("windMinMax").innerHTML =
            `<span class="min">Min: ${stats.windMin.toFixed(1)} km/h</span> | 
             <span class="max">Max: ${stats.windMax.toFixed(1)} km/h</span>`;

        document.getElementById("pressMinMax").innerHTML =
            `<span class="min">Min: ${stats.pressMin.toFixed(1)} hPa</span> | 
             <span class="max">Max: ${stats.pressMax.toFixed(1)} hPa</span>`;

        document.getElementById("humMinMax").innerHTML =
            `<span class="min">Min: ${stats.humMin}%</span> | 
             <span class="max">Max: ${stats.humMax}%</span>`;

        document.getElementById("rainMinMax").innerHTML =
            `<span class="max">Hoy: ${stats.rainMax.toFixed(1)} mm</span>`;

    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// ====== ACTUALIZACIÓN ======
obtenerDatos();
setInterval(obtenerDatos, 300000); // cada 5 minutos

































