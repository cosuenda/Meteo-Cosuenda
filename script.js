// ----------------------------
// script.js final para Meteo-Cosuenda con colores dinámicos
// ----------------------------

const url = "https://meteo-cosuenda-api.luisromea.workers.dev/";

// Conversiones
const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

// Direcciones del viento
function gradosADireccion(g){
    const d = ["N","NE","E","SE","S","SW","W","NW"];
    return d[Math.round(g/45)%8];
}

// Fecha de hoy
function hoyString(){
    const h = new Date();
    return h.getFullYear()+"-"+(h.getMonth()+1)+"-"+h.getDate();
}

// Comprobar cambio de día para máximos y mínimos
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

// 🔹 Funciones de color dinámico
function colorTemp(temp){
    if(temp<=0) return "#00f2ff";
    if(temp<=10) return "#00ffff";
    if(temp<=20) return "#00ff80";
    if(temp<=30) return "#ffff00";
    if(temp<=40) return "#ff8000";
    return "#ff0000";
}

function colorUV(uv){
    if(uv<=2) return "#00ff00";
    if(uv<=5) return "#ffff00";
    if(uv<=7) return "#ff8000";
    if(uv<=10) return "#ff0000";
    return "#800080";
}

function colorHum(hum){
    // De azul a verde según humedad
    if(hum<=30) return "#00f2ff";
    if(hum<=60) return "#00ff80";
    return "#00ff00";
}

function colorViento(v){
    // De azul a rojo según velocidad del viento
    if(v<=5) return "#00f2ff";
    if(v<=15) return "#00ffff";
    if(v<=25) return "#00ff80";
    if(v<=35) return "#ffff00";
    return "#ff8000";
}

function colorLluvia(mm){
    // De azul suave a azul intenso según cantidad
    if(mm<=1) return "#00f2ff";
    if(mm<=5) return "#00ffff";
    if(mm<=10) return "#00ccff";
    return "#0099ff";
}

// Obtener datos desde el Worker
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const data = await response.json();
        if(data.code!==0) return;

        const o = data.data.outdoor;
        const w = data.data.wind;
        const rain = data.data.rainfall;
        const p = data.data.pressure;

        // Temperaturas
        const tempC = fToC(o.temperature.value);
        const feels = o.feels_like ? fToC(o.feels_like.value) : tempC;
        const hum = parseFloat(o.humidity.value);

        // Viento
        const windKm = mphToKmh(w.wind_speed.value);
        const windDeg = parseFloat(w.wind_direction.value);
        const windGust = mphToKmh(w.wind_gust.value ?? 0);

        // Lluvia
        const rainMm = inToMm(rain.daily.value);
        const rainMonthMm = inToMm(rain.monthly?.value ?? 0);

        // Presión
        const pressHpa = inHgToHpa(p.relative.value);

        // UV y radiación solar
        const uvIndex = data.data.solar_and_uvi?.uvi?.value ?? 0;
        const solar = data.data.solar_and_uvi?.solar?.value ?? "--";

        // Máximos y mínimos diarios
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

        // Actualizar HTML con colores dinámicos
        const tempEl = document.getElementById("tempBig");
        tempEl.textContent = tempC.toFixed(1)+"°";
        tempEl.style.color = colorTemp(tempC);

        document.getElementById("sensacion").textContent = "Sensación térmica: "+feels.toFixed(1)+"°";
        document.getElementById("tempMin").textContent = "Mínima diaria: "+tempMin.toFixed(1)+"°";
        document.getElementById("tempMax").textContent = "Máxima diaria: "+tempMax.toFixed(1)+"°";

        const humEl = document.getElementById("hum");
        humEl.textContent = hum+"%";
        humEl.style.color = colorHum(hum);

        const windEl = document.getElementById("windValue");
        windEl.textContent = windKm.toFixed(1);
        windEl.style.color = colorViento(windKm);

        document.getElementById("windMax").textContent = "Racha máxima diaria: "+windMax.toFixed(1);
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);

        const rainEl = document.getElementById("rain");
        rainEl.textContent = rainMm.toFixed(1)+" mm";
        rainEl.style.color = colorLluvia(rainMm);

        document.getElementById("rainMonth").textContent = rainMonthMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";

                const uvEl = document.getElementById("uv");
        uvEl.textContent = uvIndex;
        uvEl.style.color = colorUV(uvIndex);

        document.getElementById("solar").textContent = solar+" W/m²";


        // 🔥 Animaciones elegantes dinámicas

        // Temperatura pulse al actualizar
        tempEl.style.animation = "pulseSoft 0.6s ease";
        setTimeout(() => tempEl.style.animation = "", 600);

        // UV brillo fuerte si es alto
        if(uvIndex >= 7){
            uvEl.style.animation = "glowStrong 1.5s infinite";
        } else {
            uvEl.style.animation = "";
        }

        // Viento vibra si supera 30 km/h
        if(windKm >= 30){
            windEl.style.animation = "windShake 0.4s infinite";
        } else {
            windEl.style.animation = "";
        }

        // Humedad respira si supera 80%
        if(hum >= 80){
            humEl.style.animation = "breathe 2s infinite";
        } else {
            humEl.style.animation = "";
        }

        // Rotar flecha del viento
        document.getElementById("flechaViento").style.transform =
            `translateX(-50%) rotate(${windDeg}deg)`;

        // Rotar flecha del viento
        document.getElementById("flechaViento").style.transform =
            `translateX(-50%) rotate(${windDeg}deg)`;

        // Última actualización
        const ahora = new Date();
        document.getElementById("ultimaActualizacion").textContent =
            "Última actualización: "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

    }catch(error){
        console.log("Error conexión", error);
    }
}

// Ejecutar al cargar y actualizar cada 5 minutos
obtenerDatos();
setInterval(obtenerDatos, 300000);
