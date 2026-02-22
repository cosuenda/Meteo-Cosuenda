// ====== CLAVES API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9);
const mphToKmh = mph => (parseFloat(mph) * 1.60934);
const inToMm = inches => (parseFloat(inches) * 25.4);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639);

// ====== EXTREMOS DIARIOS ======
function actualizarExtremos(temp, hum, wind){

    const hoy = new Date().toDateString();
    let datos = JSON.parse(localStorage.getItem("extremos"));

    if(!datos || datos.fecha !== hoy){
        datos = {
            fecha: hoy,
            tempMin: temp,
            tempMax: temp,
            humMax: hum,
            windMax: wind
        };
    }else{
        if(temp < datos.tempMin) datos.tempMin = temp;
        if(temp > datos.tempMax) datos.tempMax = temp;
        if(hum > datos.humMax) datos.humMax = hum;
        if(wind > datos.windMax) datos.windMax = wind;
    }

    localStorage.setItem("extremos", JSON.stringify(datos));
    return datos;
}

// ====== LLUVIA MENSUAL Y ANUAL ======
function actualizarLluvia(rainActual){

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    let datos = JSON.parse(localStorage.getItem("lluviaTotal"));

    if(!datos){
        datos = {
            mes: mesActual,
            año: añoActual,
            totalMes: rainActual,
            totalAño: rainActual
        };
    }else{

        if(datos.mes !== mesActual){
            datos.mes = mesActual;
            datos.totalMes = rainActual;
        }else{
            if(rainActual > datos.totalMes){
                datos.totalMes = rainActual;
            }
        }

        if(datos.año !== añoActual){
            datos.año = añoActual;
            datos.totalAño = rainActual;
        }else{
            if(rainActual > datos.totalAño){
                datos.totalAño = rainActual;
            }
        }
    }

    localStorage.setItem("lluviaTotal", JSON.stringify(datos));
    return datos;
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
        const hum = parseFloat(outdoor.humidity.value);
        const windKm = mphToKmh(wind.wind_speed.value);
        const rainMm = inToMm(rainfall.daily.value);
        const pressHpa = inHgToHpa(pressure.relative.value);

        document.getElementById("tempBig").textContent = tempC.toFixed(1)+" °C";
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";

        const extremos = actualizarExtremos(tempC, hum, windKm);

        document.getElementById("tempMin").textContent =
            "Min: "+extremos.tempMin.toFixed(1)+" °C";

        document.getElementById("tempMax").textContent =
            "Max: "+extremos.tempMax.toFixed(1)+" °C";

        document.getElementById("humMax").textContent =
            "Max: "+extremos.humMax+" %";

        document.getElementById("windMax").textContent =
            "Max: "+extremos.windMax.toFixed(1)+" km/h";

        const lluvia = actualizarLluvia(rainMm);

        document.getElementById("rainMonth").textContent =
            "Mes: "+lluvia.totalMes.toFixed(1)+" mm";

        document.getElementById("rainYear").textContent =
            "Año: "+lluvia.totalAño.toFixed(1)+" mm";

        // Fondo día/noche real
        const hora = new Date().getHours();
        if(hora >= 6 && hora < 18){
            document.body.style.background =
            "linear-gradient(to bottom,#87CEEB,#f0f8ff)";
        }else{
            document.body.style.background =
            "linear-gradient(to bottom,#001848,#0a1f44)";
        }

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);



















