<script>
// ====== Claves API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Conversiones ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches) * 25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639).toFixed(1);

// ====== Animar valores ======
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
    }, 40);
}

// ====== Gráfica de mín y máx ======
const tempChartCtx = document.createElement('canvas');
tempChartCtx.id = "tempMinMaxChart";
tempChartCtx.style.maxWidth = "600px";
tempChartCtx.style.margin = "20px auto";
document.getElementById('charts').prepend(tempChartCtx);

const tempChart = new Chart(tempChartCtx.getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Temp Mín (°C)', data: [], borderColor: 'blue', fill: false },
            { label: 'Temp Máx (°C)', data: [], borderColor: 'red', fill: false }
        ]
    },
    options: { responsive: true }
});

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
        const pressure = data.data.pressure;

        // ===== TEMPERATURA ACTUAL =====
        const tempC = parseFloat(fToC(outdoor.temperature.value));
        document.getElementById("tempBig").textContent = tempC + " °C";

        // ===== MIN Y MAX DIARIAS =====
        let tempMin = tempC;
        let tempMax = tempC;

        if(outdoor.temperature.min) tempMin = parseFloat(fToC(outdoor.temperature.min));
        if(outdoor.temperature.max) tempMax = parseFloat(fToC(outdoor.temperature.max));

        document.getElementById("tempMin").textContent = tempMin + " °C";
        document.getElementById("tempMax").textContent = tempMax + " °C";

        // ===== Animar otros valores =====
        animarValor(document.getElementById("hum"), outdoor.humidity.value, "%");
        animarValor(document.getElementById("wind"), mphToKmh(wind.wind_speed.value), " km/h");
        animarValor(document.getElementById("rain"), inToMm(rainfall.daily.value), " mm");
        animarValor(document.getElementById("press"), inHgToHpa(pressure.relative.value), " hPa");

        // ===== FONDO DIA / NOCHE =====
        const hour = new Date().getHours();
        document.body.style.background = (hour>=6 && hour<18)
            ? "linear-gradient(to bottom, #87CEEB, #f0f8ff)"
            : "linear-gradient(to bottom, #001848, #0a1f44)";

        // ===== Actualizar gráfica mín/max =====
        const ts = new Date().toLocaleTimeString();
        tempChart.data.labels.push(ts);
        tempChart.data.datasets[0].data.push(tempMin);
        tempChart.data.datasets[1].data.push(tempMax);

        // Mantener máximo 24 valores
        if(tempChart.data.labels.length > 24){
            tempChart.data.labels.shift();
            tempChart.data.datasets[0].data.shift();
            tempChart.data.datasets[1].data.shift();
        }

        tempChart.update();

    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// ====== Actualizar cada 5 min ======
obtenerDatos();
setInterval(obtenerDatos, 300000);
</script>























