// 🔑 DATOS REALES ECOWITT COSUENDA
const APP_KEY = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const API_KEY = "adf65434-1ace-43dd-b9a9-27915843d243";
const MAC = "84:CC:A8:B4:B1:F6";

// URL API
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${APP_KEY}&api_key=${API_KEY}&mac=${MAC}&call_back=all`;

// Crear gauge
function crearGauge(ctx, max, color){
    return new Chart(ctx,{
        type:'doughnut',
        data:{
            datasets:[{
                data:[0,max],
                backgroundColor:[color,'#eee'],
                borderWidth:0
            }]
        },
        options:{
            rotation:-90*Math.PI/180,
            circumference:180*Math.PI/180,
            cutout:'75%',
            plugins:{
                legend:{display:false},
                tooltip:{enabled:false}
            }
        }
    });
}

// Crear gauges
const tempGauge = crearGauge(document.getElementById("tempGauge"),50,"#ff5733");
const pressGauge = crearGauge(document.getElementById("pressGauge"),1100,"#3498db");
const windGauge = crearGauge(document.getElementById("windGauge"),100,"#27ae60");

// Actualizar gauge
function actualizarGauge(chart, valor, max){
    if(valor > max) valor = max;
    chart.data.datasets[0].data = [valor, max-valor];
    chart.update();
}

// Guardar histórico
function guardarHistorial(datos){
    let hist = JSON.parse(localStorage.getItem("historial")) || [];
    hist.push(datos);
    if(hist.length > 500) hist.shift();
    localStorage.setItem("historial", JSON.stringify(hist));
}

// Calcular min max
function calcularMinMax(clave){
    let hist = JSON.parse(localStorage.getItem("historial")) || [];
    if(hist.length === 0) return {min:"--",max:"--"};

    let valores = hist.map(e => parseFloat(e[clave])).filter(v => !isNaN(v));

    return {
        min: Math.min(...valores).toFixed(1),
        max: Math.max(...valores).toFixed(1)
    };
}

// Mostrar min max
function mostrarMinMax(id, datos, unidad){
    document.getElementById(id).innerHTML =
        `<span class="min">Min: ${datos.min} ${unidad}</span> |
         <span class="max">Max: ${datos.max} ${unidad}</span>`;
}

// Conversión automática
function fahrenheitACelsius(f){
    return (f - 32) * 5 / 9;
}

function inHgAhPa(inhg){
    return inhg * 33.8639;
}

function mphAKmh(mph){
    return mph * 1.60934;
}

// Obtener datos API
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const data = await response.json();

        if(!data.data) return;

        // 🔥 CONVERSIONES CORRECTAS
        const tempC = fahrenheitACelsius(parseFloat(data.data.outdoor.temperature.value));
        const pressHPa = inHgAhPa(parseFloat(data.data.pressure.relative.value));
        const windKm = mphAKmh(parseFloat(data.data.wind.wind_speed.value));

        const valores = {
            temp: tempC,
            press: pressHPa,
            wind: windKm
        };

        // Mostrar valores actuales
        document.getElementById("tempValor").innerHTML = tempC.toFixed(1) + " °C";
        document.getElementById("pressValor").innerHTML = pressHPa.toFixed(1) + " hPa";
        document.getElementById("windValor").innerHTML = windKm.toFixed(1) + " km/h";

        // Actualizar gauges
        actualizarGauge(tempGauge,tempC,50);
        actualizarGauge(pressGauge,pressHPa,1100);
        actualizarGauge(windGauge,windKm,100);

        // Guardar histórico
        guardarHistorial(valores);

        // Calcular min max
        mostrarMinMax("tempMinMax",calcularMinMax("temp"),"°C");
        mostrarMinMax("pressMinMax",calcularMinMax("press"),"hPa");
        mostrarMinMax("windMinMax",calcularMinMax("wind"),"km/h");

    }catch(error){
        console.error("Error API:",error);
    }
}

// Actualizar cada 2 minutos
obtenerDatos();
setInterval(obtenerDatos,120000);


































