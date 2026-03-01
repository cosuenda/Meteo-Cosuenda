const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

function gradosADireccion(g){
    const d = ["N","NE","E","SE","S","SW","W","NW"];
    return d[Math.round(g/45)%8];
}

function hoyString(){
    const h = new Date();
    return h.getFullYear()+"-"+(h.getMonth()+1)+"-"+h.getDate();
}

function comprobarCambioDia(){
    const hoy = hoyString();
    const guardado = localStorage.getItem("diaActual");

    if(guardado !== hoy){
        localStorage.setItem("diaActual", hoy);
        localStorage.setItem("tempMin", "999");
        localStorage.setItem("tempMax", "-999");
        localStorage.setItem("windMax", "0");
    }
}

comprobarCambioDia();

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
        const feels = o.feels_like ? fToC(o.feels_like.value) : tempC;
        const hum = parseFloat(o.humidity.value);
        const windKm = mphToKmh(w.wind_speed.value);
        const windDeg = parseFloat(w.wind_direction.value);
        const windGust = mphToKmh(w.wind_gust.value ?? 0);
        const rainMm = inToMm(rain.daily.value);
        const rainMonthMm = inToMm(rain.month?.value ?? 0);
        const pressHpa = inHgToHpa(p.relative.value);
        const uvIndex = data.data.uv?.value ?? "--";
        const solar = data.data.solar_radiation?.value ?? "--";

        let tempMin = parseFloat(localStorage.getItem("tempMin"));
        let tempMax = parseFloat(localStorage.getItem("tempMax"));
        let windMax = parseFloat(localStorage.getItem("windMax"));

        if(tempC < tempMin){
            tempMin = tempC;
            localStorage.setItem("tempMin", tempMin);
        }

        if(tempC > tempMax){
            tempMax = tempC;
            localStorage.setItem("tempMax", tempMax);
        }

        if(windGust > windMax){
            windMax = windGust;
            localStorage.setItem("windMax", windMax);
        }

        document.getElementById("tempBig").textContent = tempC.toFixed(1)+"°";
        document.getElementById("sensacion").textContent = "Sensación térmica: "+feels.toFixed(1)+"°";
        document.getElementById("tempMin").textContent = "Mínima diaria: "+tempMin.toFixed(1)+"°";
        document.getElementById("tempMax").textContent = "Máxima diaria: "+tempMax.toFixed(1)+"°";

        document.getElementById("hum").textContent = hum+"%";
        document.getElementById("windValue").textContent = windKm.toFixed(1);
        document.getElementById("windMax").textContent = "Racha máxima diaria: "+windMax.toFixed(1);
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);

        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("rainMonth").textContent = rainMonthMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        document.getElementById("uv").textContent = uvIndex;
        document.getElementById("solar").textContent = solar+" W/m²";

        // ROTAR ROSA
        document.getElementById("flechaViento").style.transform =
            `translateX(-50%) rotate(${windDeg}deg)`;

        const ahora = new Date();
        document.getElementById("ultimaActualizacion").textContent =
            "Última actualización: "+
            ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
