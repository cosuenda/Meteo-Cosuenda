// ===============================
// GUARDADO DIARIO AUTOMÁTICO
// ===============================

function hoyString(){
    const hoy = new Date();
    return hoy.getFullYear()+"-"+(hoy.getMonth()+1)+"-"+hoy.getDate();
}

function inicializarDia(){
    const hoy = hoyString();
    const diaGuardado = localStorage.getItem("diaActual");

    if(diaGuardado !== hoy){
        localStorage.setItem("diaActual", hoy);
        localStorage.setItem("tempMin", "999");
        localStorage.setItem("tempMax", "-999");
        localStorage.setItem("windMax", "0");
    }
}

inicializarDia();


// ===============================
// API Ecowitt
// ===============================

const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;


// ===============================
// Conversiones
// ===============================

const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

function gradosADireccion(g){
    const d = ["N","NE","E","SE","S","SW","W","NW"];
    return d[Math.round(g/45)%8];
}


// ===============================
// OBTENER DATOS
// ===============================

async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const data = await response.json();
        if(data.code!==0) return;

        const o = data.data.outdoor;
        const w = data.data.wind;
        const rain = data.data.rainfall;
        const p = data.data.pressure;

        const tempC = fToC(o.temperature.value);
        const hum = parseFloat(o.humidity.value);
        const windKm = mphToKmh(w.wind_speed.value);
        const windDeg = parseFloat(w.wind_direction.value);
        const rainMm = inToMm(rain.daily.value);
        const lluviaMensual = inToMm(rain.month?.value ?? 0);
        const pressHpa = inHgToHpa(p.relative.value);
        const uvIndex = data.data.uv?.value ?? "--";
        const solar = data.data.solar_radiation?.value ?? "--";
        const windGust = mphToKmh(w.wind_gust.value ?? 0);

        // ===== MÍNIMA Y MÁXIMA DIARIA =====

        let tempMin = parseFloat(localStorage.getItem("tempMin"));
        let tempMax = parseFloat(localStorage.getItem("tempMax"));

        if(tempC < tempMin){
            tempMin = tempC;
            localStorage.setItem("tempMin", tempMin);
        }

        if(tempC > tempMax){
            tempMax = tempC;
            localStorage.setItem("tempMax", tempMax);
        }

        // ===== RACHA MÁXIMA DIARIA =====

        let windMax = parseFloat(localStorage.getItem("windMax"));

        if(windGust > windMax){
            windMax = windGust;
            localStorage.setItem("windMax", windMax);
        }

        // ===== ACTUALIZAR HTML =====

        document.getElementById("tempBig").textContent = tempC.toFixed(1);
        document.getElementById("tempMin").textContent = "Min diaria: " + tempMin.toFixed(1);
        document.getElementById("tempMax").textContent = "Max diaria: " + tempMax.toFixed(1);
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("windMax").textContent = windMax.toFixed(1)+" km/h";
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("rainMonth").textContent = lluviaMensual.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        document.getElementById("uv").textContent = uvIndex;
        document.getElementById("solar").textContent = solar+" W/m²";

        const ahora = new Date();
        document.getElementById("ultimaActualizacion").textContent =
            "Última actualización: " +
            ahora.getHours()+":"+
            String(ahora.getMinutes()).padStart(2,"0");

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
