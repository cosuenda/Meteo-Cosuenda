// ====== CLAVES API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// Inercia flecha
let angAnteriorModerna = 0;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9);
const mphToKmh = mph => (parseFloat(mph) * 1.60934);
const inToMm = inches => (parseFloat(inches) * 25.4);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639);

function gradosADireccion(grados){
    const direcciones = ["N","NE","E","SE","S","SW","W","NW"];
    const index = Math.round(grados / 45) % 8;
    return direcciones[index];
}

// Crea la rosa **después del layout**
function crearRosaModerna() {
    const rosa = document.getElementById("rosaVientoModerna");
    const labelsDiv = rosa.querySelector(".labels");
    labelsDiv.innerHTML = "";

    const rect = rosa.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = rect.width * 0.45;

    for (let deg = 0; deg < 360; deg += 10) {
        const punto = document.createElement("div");
        punto.className = "punto";
        const rad = deg * Math.PI / 180;
        punto.style.left = (cx + r * Math.sin(rad)) + "px";
        punto.style.top = (cy - r * Math.cos(rad)) + "px";
        labelsDiv.appendChild(punto);

        if (deg % 45 === 0) {
            const card = document.createElement("div");
            card.className = "cardinal";
            card.textContent = ["N","NE","E","SE","S","SW","W","NW"][deg/45];
            card.style.left = (cx + (r+18)*Math.sin(rad)) + "px";
            card.style.top = (cy - (r+18)*Math.cos(rad)) + "px";
            labelsDiv.appendChild(card);
        }
    }
}

// Llamamos después de que cargue todo
window.addEventListener('load', () => {
    crearRosaModerna();
});
    
// Recalculamos si se redimensiona
window.addEventListener('resize', () => {
    crearRosaModerna();
});

// Flecha con inercia
function actualizarFlechaModerna(grados){
    const flecha = document.getElementById("flechaModerna");
    let diff = grados - angAnteriorModerna;
    if(diff > 180) diff -= 360;
    if(diff < -180) diff += 360;
    angAnteriorModerna += diff;
    flecha.style.transform = `translateX(-50%) rotate(${angAnteriorModerna}deg)`;
}

// Datos y actualización
async function obtenerDatos(){
    try {
        const response = await fetch(url);
        const data = await response.json();
        if(data.code !== 0) return;

        const outdoor = data.data.outdoor;
        const wind = data.data.wind;
        const rainfall = data.data.rainfall;
        const pressure = data.data.pressure;

        const uvVal = data.data.uv?.value ?? null;
        const solarVal = data.data.solar_radiation?.value ?? null;

        const tempC = fToC(outdoor.temperature.value);
        const hum = parseFloat(outdoor.humidity.value);
        const windKm = mphToKmh(wind.wind_speed.value);
        const rainMm = inToMm(rainfall.daily.value);
        const pressHpa = inHgToHpa(pressure.relative.value);
        const windDeg = parseFloat(wind.wind_direction.value);

        document.getElementById("tempBig").textContent = tempC.toFixed(1)+" °C";
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";

        const uvCard = document.getElementById("uvCard");
        const solarCard = document.getElementById("solarCard");
        if(uvVal !== null){ uvCard.classList.remove("oculto"); document.getElementById("uv").textContent = uvVal.toFixed(1); }
        else{ uvCard.classList.add("oculto"); }
        if(solarVal !== null){ solarCard.classList.remove("oculto"); document.getElementById("solar").textContent = solarVal.toFixed(1)+" W/m²"; }
        else{ solarCard.classList.add("oculto"); }

        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);
        actualizarFlechaModerna(windDeg);

    } catch(error) {
        console.log("Error conexión:", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos, 300000);












