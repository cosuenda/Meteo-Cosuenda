// CONFIGURACIÓN ECOWITT
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// CONVERSIONES
const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;
function gradosADireccion(g){const d=["N","NE","E","SE","S","SW","W","NW"]; return d[Math.round(g/45)%8];}

// MIN, MAX, RACHA DIARIA
function inicializarDia(){
    const hoy = new Date().toISOString().split("T")[0];
    if(localStorage.getItem("diaActual")!==hoy){
        localStorage.setItem("diaActual",hoy);
        localStorage.setItem("tempMin","999");
        localStorage.setItem("tempMax","-999");
        localStorage.setItem("windMax","0");
    }
}
inicializarDia();

// OBTENER DATOS
async function obtenerDatos(){
    try{
        const resp = await fetch(url);
        const data = await resp.json();
        if(data.code!==0) return;

        const o = data.data.outdoor;
        const w = data.data.wind;
        const r = data.data.rainfall;
        const p = data.data.pressure;

        const tempC = fToC(o.temperature.value);
        const hum = o.humidity.value;
        const windKm = mphToKmh(w.wind_speed.value);
        const windDeg = w.wind_direction.value;
        const windGust = mphToKmh(w.wind_gust.value ?? 0);
        const rainMm = inToMm(r.daily.value);
        const rainMonth = inToMm(r.month?.value ?? 0);
        const pressHpa = inHgToHpa(p.relative?.value ?? 1013);

        // Sensación térmica
        let sensTerm = tempC.toFixed(1)+"°";
        if(o.heat_index?.value != null) sensTerm = fToC(o.heat_index.value).toFixed(1)+"°";
        else if(o.windchill?.value != null) sensTerm = fToC(o.windchill.value).toFixed(1)+"°";

        // UV y Solar
        let uv = data.data.uv?.value ?? "--";
        let solar = data.data.solar_radiation?.value ? data.data.solar_radiation.value+" W/m²" : "--";

        // Min/Max/Racha
        let tempMin = parseFloat(localStorage.getItem("tempMin"));
        let tempMax = parseFloat(localStorage.getItem("tempMax"));
        let windMax = parseFloat(localStorage.getItem("windMax"));

        if(tempC<tempMin){ tempMin=tempC; localStorage.setItem("tempMin",tempMin.toFixed(1)); }
        if(tempC>tempMax){ tempMax=tempC; localStorage.setItem("tempMax",tempMax.toFixed(1)); }
        if(windGust>windMax){ windMax=windGust; localStorage.setItem("windMax",windMax.toFixed(1)); }

        // Actualizar HTML
        const tEl = document.getElementById("tempBig");
        tEl.textContent = tempC.toFixed(1)+"°";
        tEl.style.color = tempC<=10 ? "#00bfff" : tempC>=25 ? "#ff4c4c" : "#00eaff";

        document.getElementById("tempMin").textContent = "Min diaria: "+tempMin.toFixed(1)+"°";
        document.getElementById("tempMax").textContent = "Max diaria: "+tempMax.toFixed(1)+"°";
        document.getElementById("sensacion").textContent = "Sensación térmica: "+sensTerm;

        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("windMax").textContent = windMax.toFixed(1)+" km/h";
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);

        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("rainMonth").textContent = rainMonth.toFixed(1)+" mm";

        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        document.getElementById("uv").textContent = uv;
        document.getElementById("solar").textContent = solar;

        document.getElementById("flechaViento").style.transform = `translateX(-50%) rotate(${windDeg}deg)`;

        // Racha fuerte efecto rojo
        const windMaxEl = document.getElementById("windMax");
        windMaxEl.style.textShadow = windGust>=50 ?
            "0 0 10px #ff0000,0 0 20px #ff0000,0 0 30px #ff0000" :
            "0 0 5px #00bfff,0 0 10px #00bfff,0 0 20px #00bfff";

        // Gráfica de temperatura
        if(window.tempChart){
            window.tempChart.data.datasets[0].data.push(tempC);
            if(window.tempChart.data.datasets[0].data.length>24) window.tempChart.data.datasets[0].data.shift();
            window.tempChart.update();
        }

        // Última actualización
        const ahora = new Date();
        document.getElementById("ultimaActualizacion").textContent =
            "Última actualización: "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

    }catch(e){
        console.log("Error conexión:",e);
    }
}

// Inicializar gráfica de temperatura
const ctx = document.getElementById('tempChart').getContext('2d');
window.tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(24).fill(''),
        datasets: [{
            label: 'Temp (°C)',
            data: [],
            borderColor: '#ff4c4c',
            backgroundColor: 'rgba(255,76,76,0.2)',
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false } }
    }
});

// Primera carga y actualización cada 5 min
obtenerDatos();
setInterval(obtenerDatos,300000);
