// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Funciones de conversión ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches) * 25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639).toFixed(1);

// ====== Función para animar valores ======
function animarValor(element, nuevoValor, unidad = "") {
    const valorActual = parseFloat(element.getAttribute("data-valor")) || 0;
    const valorFinal = parseFloat(nuevoValor);
    let start = valorActual;
    const step = (valorFinal - start) / 20;
    let i = 0;
    const anim = setInterval(() => {
        start += step;
        element.textContent = start.toFixed(1) + unidad;
        i++;
        if (i >= 20) {
            element.textContent = valorFinal.toFixed(1) + unidad;
            element.setAttribute("data-valor", valorFinal);
            clearInterval(anim);
        }
    }, 50);
}

// ====== Función principal ======
async function obtenerDatos() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 0) {
            console.error("Error API:", data);
            return;
        }

        const outdoor = data.data.outdoor;
        const wind = data.data.wind;
        const rainfall = data.data.rainfall;
        const pressure = data.data.pressure;  // ✅ presión correcta

        // ====== Temperatura gigante con icono y color ======
        const tempF = outdoor.temperature.value;
        const tempC = parseFloat(fToC(tempF));
        const tempEl = document.getElementById("tempBig");
        const iconEl = document.getElementById("tempIcon");
        tempEl.textContent = tempC + " °C";

        if(tempC <= 0){ iconEl.textContent="❄️"; tempEl.style.color="#00f"; }
        else if(tempC <= 15){ iconEl.textContent="🌤️"; tempEl.style.color="#0aa"; }
        else if(tempC <= 30){ iconEl.textContent="☀️"; tempEl.style.color="#fa0"; }
        else { iconEl.textContent="🔥"; tempEl.style.color="#f00"; }

        // ====== Animar otros valores ======
        animarValor(document.getElementById("hum"), outdoor.humidity.value, " %");
        animarValor(document.getElementById("wind"), mphToKmh(wind.wind_speed.value), " km/h");
        animarValor(document.getElementById("rain"), inToMm(rainfall.daily.value), " mm");

        // ====== Presión ======
        const pressHpa = inHgToHpa(pressure.relative.value);
        document.getElementById("press").textContent = pressHpa + " hPa";

        // ====== Fondo dinámico día/noche ======
        const hour = new Date().getHours();
        if(hour >= 6 && hour < 18) document.body.style.background = "linear-gradient(to bottom, #87CEEB, #f0f8ff)";
        else document.body.style.background = "linear-gradient(to bottom, #001848, #0a1f44)";

    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// ====== Carga inicial + actualización cada 5 min ======
obtenerDatos();
setInterval(obtenerDatos, 300000);


























