// ====== API ======
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// Conversiones
const fToC = f => ((parseFloat(f)-32)*5/9);
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

// Color dinámico temperatura
function aplicarColorTemp(temp){
    const tempEl = document.getElementById("tempBig");
    tempEl.classList.remove("frio","templado","calor");

    if(temp <= 10) tempEl.classList.add("frio");
    else if(temp <= 25) tempEl.classList.add("templado");
    else tempEl.classList.add("calor");
}

// Fondo día / noche
function actualizarFondo(){
    const hora = new Date().getHours();
    if(hora >= 6 && hora < 18){
        document.body.style.background="linear-gradient(to bottom,#4facfe,#00f2fe)";
    }else{
        document.body.style.background="linear-gradient(to bottom,#0f2027,#203a43,#2c5364)";
    }
}

// PRINCIPAL
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

        const uvIndex = data.data.uv?.value ?? "--";
        const solarRadiation = data.data.solar_radiation?.value ?? "--";

        document.getElementById("tempBig").textContent = tempC.toFixed(1)+" °C";
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        document.getElementById("uv").textContent = uvIndex;
        document.getElementById("solar").textContent = solarRadiation+" W/m²";

        aplicarColorTemp(tempC);
        actualizarFondo();

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
