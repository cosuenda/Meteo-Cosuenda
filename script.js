// ===============================
// CONFIGURACIÓN ECOWITT
// ===============================

const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;


// ===============================
// CREAR ROSA DE LOS VIENTOS
// ===============================

function crearRosa() {
    const rosa = document.getElementById("rosa");

    for (let i = 0; i < 360; i += 10) {
        const marca = document.createElement("div");
        marca.className = "marca";
        marca.style.transform = `translateX(-50%) rotate(${i}deg)`;
        rosa.appendChild(marca);
    }

    const cardinales = [
        { letra: "N", x: 100, y: 10 },
        { letra: "S", x: 100, y: 190 },
        { letra: "E", x: 190, y: 100 },
        { letra: "W", x: 10, y: 100 }
    ];

    cardinales.forEach(c => {
        const el = document.createElement("div");
        el.className = "cardinal";
        el.textContent = c.letra;
        el.style.left = c.x + "px";
        el.style.top = c.y + "px";
        rosa.appendChild(el);
    });
}

crearRosa();


// ===============================
// CONVERSIONES
// ===============================

const fToC = f => (parseFloat(f) - 32) * 5 / 9;
const mphToKmh = mph => parseFloat(mph) * 1.60934;
const inToMm = inches => parseFloat(inches) * 25.4;
const inHgToHpa = inHg => parseFloat(inHg) * 33.8639;

function gradosADireccion(g) {
    const d = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return d[Math.round(g / 45) % 8];
}


// ===============================
// OBTENER DATOS
// ===============================

async function obtenerDatos() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.code !== 0) return;

        // -----------------------
        // DATOS PRINCIPALES
        // -----------------------
        const o = data.data.outdoor;
        const w = data.data.wind;
        const rain = data.data.rainfall;
        const press = data.data.pressure;

        const tempC = fToC(o.temperature.value);
        const hum = parseFloat(o.humidity.value);
        const windKm = mphToKmh(w.wind_speed.value);
        const windDeg = parseFloat(w.wind_direction.value);
        const windGust = mphToKmh(w.wind_gust.value ?? 0);
        const rainMm = inToMm(rain.daily.value);
        const lluviaMensual = inToMm(rain.month?.value ?? 0);
        const pressHpa = inHgToHpa(press.relative?.value ?? 1013);

        // -----------------------
        // SENSACIÓN TÉRMICA (CORREGIDA)
        // -----------------------
        let sensTerm = "--";
        if (o.heat_index?.value != null) {
            sensTerm = fToC(o.heat_index.value).toFixed(1) + "°";
        } else if (o.windchill?.value != null) {
            sensTerm = fToC(o.windchill.value).toFixed(1) + "°";
        } else {
            sensTerm = tempC.toFixed(1) + "°"; // fallback seguro
        }
        document.getElementById("sensacion").textContent = "Sensación térmica: " + sensTerm;

        // -----------------------
        // UV Y RADIACIÓN SOLAR
        // -----------------------
        let uvIndex = "No disponible";
        let solar = "No disponible";

        if (data.data.uv && data.data.uv.value !== undefined) {
            uvIndex = data.data.uv.value;
        }

        if (data.data.solar_radiation && data.data.solar_radiation.value !== undefined) {
            solar = data.data.solar_radiation.value + " W/m²";
        }

        // -----------------------
        // MÍNIMA, MÁXIMA Y RACHA MÁXIMA DIARIA
        // -----------------------
        const hoy = new Date().toISOString().split("T")[0];
        if (localStorage.getItem("diaActual") !== hoy || !localStorage.getItem("tempMin")) {
            localStorage.setItem("diaActual", hoy);
            localStorage.setItem("tempMin", tempC.toFixed(1));
            localStorage.setItem("tempMax", tempC.toFixed(1));
            localStorage.setItem("windMax", windGust.toFixed(1));
        }

        let tempMin = parseFloat(localStorage.getItem("tempMin"));
        let tempMax = parseFloat(localStorage.getItem("tempMax"));
        let windMax = parseFloat(localStorage.getItem("windMax"));

        if (tempC < tempMin) { tempMin = tempC; localStorage.setItem("tempMin", tempMin.toFixed(1)); }
        if (tempC > tempMax) { tempMax = tempC; localStorage.setItem("tempMax", tempMax.toFixed(1)); }
        if (windGust > windMax) { windMax = windGust; localStorage.setItem("windMax", windMax.toFixed(1)); }

        // -----------------------
        // ACTUALIZAR HTML
        // -----------------------
        const tempElement = document.getElementById("tempBig");
        tempElement.textContent = tempC.toFixed(1) + "°";
        tempElement.className = "bigTemp";

        if (tempC <= 5) tempElement.classList.add("frio");
        else if (tempC <= 20) tempElement.classList.add("templado");
        else if (tempC <= 32) tempElement.classList.add("calor");
        else tempElement.classList.add("muyCalor");

        const rosa = document.getElementById("rosa");
        rosa.classList.remove("vientoFuerte", "vientoExtremo");

        if (windGust > 40) rosa.classList.add("vientoExtremo");
        else if (windGust > 25) rosa.classList.add("vientoFuerte");

        document.getElementById("tempMin").textContent = "Min diaria: " + tempMin.toFixed(1) + "°";
        document.getElementById("tempMax").textContent = "Max diaria: " + tempMax.toFixed(1) + "°";
        document.getElementById("hum").textContent = hum + " %";
        document.getElementById("wind").textContent = windKm.toFixed(1) + " km/h";
        document.getElementById("windMax").textContent = "Racha máx: " + windMax.toFixed(1) + " km/h";
        document.getElementById("windDirText").textContent = "Dirección: " + gradosADireccion(windDeg);
        document.getElementById("rain").textContent = rainMm.toFixed(1) + " mm";
        document.getElementById("rainMonth").textContent = "Lluvias mensuales: " + lluviaMensual.toFixed(1) + " mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1) + " hPa";
        document.getElementById("uv").textContent = uvIndex;
        document.getElementById("solar").textContent = solar;

        document.getElementById("flechaViento").style.transform = `translateX(-50%) rotate(${windDeg}deg)`;

        const ahora = new Date();
        document.getElementById("ultimaActualizacion").textContent =
            "Última actualización: " +
            ahora.getHours() + ":" + String(ahora.getMinutes()).padStart(2, "0");

    } catch (error) {
        console.log("Error conexión:", error);
    }
}

// Primera carga
obtenerDatos();

// Actualización cada 5 minutos
setInterval(obtenerDatos, 300000);
