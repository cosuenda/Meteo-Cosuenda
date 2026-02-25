// ====== CLAVES API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

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

// ====== EXTREMOS DIARIOS ======
function actualizarExtremos(temp, hum, wind){
    const hoy = new Date().toDateString();
    let datos = JSON.parse(localStorage.getItem("extremos"));
    if(!datos || datos.fecha !== hoy){
        datos = { fecha:hoy, tempMin:temp, tempMax:temp, humMax:hum, windMax:wind };
    }else{
        if(temp < datos.tempMin) datos.tempMin = temp;
        if(temp > datos.tempMax) datos.tempMax = temp;
        if(hum > datos.humMax) datos.humMax = hum;
        if(wind > datos.windMax) datos.windMax = wind;
    }
    localStorage.setItem("extremos", JSON.stringify(datos));
    return datos;
}

// ====== RÉCORD ABSOLUTO ======
function actualizarRecord(temp){
    let record = JSON.parse(localStorage.getItem("recordTemp"));
    if(!record){ record = { max: temp, min: temp }; }
    else{
        if(temp > record.max) record.max = temp;
        if(temp < record.min) record.min = temp;
    }
    localStorage.setItem("recordTemp", JSON.stringify(record));
    return record;
}

// ====== LLUVIA TOTAL ======
function actualizarLluvia(rainActual){
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    let datos = JSON.parse(localStorage.getItem("lluviaTotal"));
    if(!datos){ datos = { mes: mesActual, año: añoActual, totalMes: rainActual, totalAño: rainActual }; }
    else{
        if(datos.mes !== mesActual){ datos.mes = mesActual; datos.totalMes = rainActual; }
        else if(rainActual > datos.totalMes){ datos.totalMes = rainActual; }

        if(datos.año !== añoActual){ datos.año = añoActual; datos.totalAño = rainActual; }
        else if(rainActual > datos.totalAño){ datos.totalAño = rainActual; }
    }
    localStorage.setItem("lluviaTotal", JSON.stringify(datos));
    return datos;
}

// ====== ANIMACIÓN FLECHA ======
function actualizarFlechaModerna(grados){
    const flecha = document.getElementById("flechaModerna");
    let diff = grados - angAnteriorModerna;
    if(diff > 180) diff -= 360;
    if(diff < -180) diff += 360;
    angAnteriorModerna += diff;
    flecha.style.transform = `translateX(-50%) rotate(${angAnteriorModerna}deg)`;
}

// ====== PRINCIPAL ======
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const data = await response.json();

        if(data.code !== 0) {
            console.log("Error API:", data);
            return;
        }

        console.log("DATOS COMPLETOS:", data.data);

        const outdoor = data.data.outdoor || {};
        const wind = data.data.wind || {};
        const rainfall = data.data.rainfall || {};
        const pressure = data.data.pressure || {};

        // === CAMPOS COMPATIBLES UV Y SOLAR ===
        const uvIndex =
            data.data.uv?.value ??
            outdoor.uv?.value ??
            data.data.uvi?.value ??
            null;

        const solarRadiation =
            data.data.solar_radiation?.value ??
            outdoor.solar_radiation?.value ??
            data.data.solar?.value ??
            null;

        const tempC = outdoor.temperature?.value ? fToC(outdoor.temperature.value) : 0;
        const hum = outdoor.humidity?.value ? parseFloat(outdoor.humidity.value) : 0;
        const windKm = wind.wind_speed?.value ? mphToKmh(wind.wind_speed.value) : 0;
        const rainMm = rainfall.daily?.value ? inToMm(rainfall.daily.value) : 0;
        const pressHpa = pressure.relative?.value ? inHgToHpa(pressure.relative.value) : 0;
        const windDeg = wind.wind_direction?.value ? parseFloat(wind.wind_direction.value) : 0;

        document.getElementById("tempBig").textContent = tempC.toFixed(1)+" °C";
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";

        // ===== UV =====
        const uvCard = document.getElementById("uvCard");
        if(uvIndex !== null){
            uvCard.classList.remove("oculto");
            document.getElementById("uv").textContent = parseFloat(uvIndex).toFixed(1);
        } else {
            uvCard.classList.add("oculto");
        }

        // ===== SOLAR =====
        const solarCard = document.getElementById("solarCard");
        if(solarRadiation !== null){
            solarCard.classList.remove("oculto");
            document.getElementById("solar").textContent = parseFloat(solarRadiation).toFixed(0)+" W/m²";
        } else {
            solarCard.classList.add("oculto");
        }

        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);
        actualizarFlechaModerna(windDeg);

        const extremos = actualizarExtremos(tempC, hum, windKm);
        document.getElementById("tempMin").textContent = "Min diaria: "+extremos.tempMin.toFixed(1)+" °C";
        document.getElementById("tempMax").textContent = "Max diaria: "+extremos.tempMax.toFixed(1)+" °C";
        document.getElementById("humMax").textContent = "Max diaria: "+extremos.humMax+" %";
        document.getElementById("windMax").textContent = "Racha máxima diaria: "+extremos.windMax.toFixed(1)+" km/h";

        const record = actualizarRecord(tempC);
        document.getElementById("tempRecordMax").textContent = "🏆 Récord Máx: "+record.max.toFixed(1)+" °C";
        document.getElementByById("tempRecordMin").textContent = "🏆 Récord Mín: "+record.min.toFixed(1)+" °C";

        const lluvia = actualizarLluvia(rainMm);
        document.getElementById("rainMonth").textContent = "Mes: "+lluvia.totalMes.toFixed(1)+" mm";
        document.getElementById("rainYear").textContent = "Año: "+lluvia.totalAño.toFixed(1)+" mm";

        // Fondo día/noche
        const hora = new Date().getHours();
        if(hora >= 6 && hora < 18){
            document.body.style.background = "linear-gradient(to bottom,#87CEEB,#f0f8ff)";
        }else{
            document.body.style.background = "linear-gradient(to bottom,#001848,#0a1f44)";
        }

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);












