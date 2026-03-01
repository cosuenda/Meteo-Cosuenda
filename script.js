// ===============================
// CONFIGURACIÓN API ECOWITT
// ===============================

const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;


// ===============================
// CONTROL CAMBIO DE DÍA
// ===============================

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


// ===============================
// CONVERSIONES
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
// CREAR ROSA CON MARCAS CADA 10°
// ===============================

function crearRosa(){
    const rosa = document.getElementById("rosa");

    for(let i=0;i<360;i+=10){
        const marca = document.createElement("div");
        marca.className="marca";
        marca.style.transform=`translateX(-50%) rotate(${i}deg)`;
        rosa.appendChild(marca);
    }

    const cardinales = [
        {letra:"N", x:100, y:10},
        {letra:"S", x:100, y:190},
        {letra:"E", x:190, y:100},
        {letra:"W", x:10, y:100}
    ];

    cardinales.forEach(c=>{
        const el=document.createElement("div");
        el.className="cardinal";
        el.textContent=c.letra;
        el.style.left=c.x+"px";
        el.style.top=c.y+"px";
        rosa.appendChild(el);
    });
}

crearRosa();


// ===============================
// MODO DÍA / NOCHE AUTOMÁTICO
// ===============================

function actualizarModoDiaNoche(hora){
    if(hora>=7 && hora<=20){
        document.body.classList.add("day");
        document.body.classList.remove("night");
    }else{
        document.body.classList.add("night");
        document.body.classList.remove("day");
    }
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

        // ===== RACHA MÁXIMA =====

        let windMax = parseFloat(localStorage.getItem("windMax"));

        if(windGust > windMax){
            windMax = windGust;
            localStorage.setItem("windMax", windMax);
        }

        // ===== ACTUALIZAR HTML =====

        document.getElementById("tempBig").textContent = tempC.toFixed(1)+"°";
        document.getElementById("tempMin").textContent = "Min diaria: " + tempMin.toFixed(1)+"°";
        document.getElementById("tempMax").textContent = "Max diaria: " + tempMax.toFixed(1)+"°";
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("windMax").textContent = windMax.toFixed(1)+" km/h";
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("rainMonth").textContent = lluviaMensual.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        document.getElementById("uv").textContent = uvIndex;
        document.getElementById("solar").textContent = solar+" W/m²";

        // ===== GIRAR FLECHA ROSA =====

        document.getElementById("flechaViento").style.transform =
            `translateX(-50%) rotate(${windDeg}deg)`;

        // ===== HORA Y MODO =====

        const ahora = new Date();
        actualizarModoDiaNoche(ahora.getHours());

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
