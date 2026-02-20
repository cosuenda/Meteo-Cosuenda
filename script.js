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

// ====== Animar valores ======
function animarValor(el, nuevo, unidad = "") {
    const valAct = parseFloat(el.getAttribute("data-valor")) || 0;
    const valFin = parseFloat(nuevo);
    let start = valAct;
    const step = (valFin - start) / 20;
    let i = 0;
    const anim = setInterval(() => {
        start += step;
        el.textContent = start.toFixed(1) + unidad;
        i++;
        if (i >= 20) {
            el.textContent = valFin.toFixed(1) + unidad;
            el.setAttribute("data-valor", valFin);
            clearInterval(anim);
        }
    }, 50);
}

// ====== Dirección del viento ======
function dirViento(grados){
    const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    return dirs[Math.round(grados/22.5)%16];
}

// ====== Histórico y min/max ======
function guardarHistorico(ts,temp,hum,wind,rain,press,solar,uvi,windDir){
    let hist=JSON.parse(localStorage.getItem('meteoHist'))||[];
    hist.push({ts,temp,hum,wind,rain,press,solar,uvi,windDir});
    const maxReg=30*24*12; // 30 días aprox.
    if(hist.length>maxReg) hist.shift();
    localStorage.setItem('meteoHist',JSON.stringify(hist));
    return hist;
}

function calcularMinMax(hist){
    if(hist.length===0) return {};
    const campos=["temp","hum","wind","rain","press","solar","uvi"];
    let minmax={};
    campos.forEach(c=>{
        const valores=hist.map(e=>e[c]);
        minmax[c+"Min"]=Math.min(...valores);
        minmax[c+"Max"]=Math.max(...valores);
    });
    return minmax;
}

// ====== Crear gráfica ======
function crearGrafica(ctx,label,color){
    return new Chart(ctx,{
        type:'line',
        data:{labels:[],datasets:[{label:label,data:[],borderColor:color,fill:false}]},
        options:{
            responsive:true,
            plugins:{
                legend:{display:true},
                datalabels:{
                    display:true,
                    align:'top',
                    formatter:(value)=>value.toFixed(1)
                }
            }
        },
        plugins:[ChartDataLabels]
    });
}

// ====== Inicializar gráficas ======
const tempRainChart=new Chart(document.getElementById('tempRainChart').getContext('2d'),{
    type:'bar',
    data:{
        labels:[],
        datasets:[
            {type:'line', label:'Temperatura (°C)', data:[], borderColor:'rgba(255,99,132,1)', yAxisID:'y1', fill:false},
            {type:'bar', label:'Lluvia diaria (mm)', data:[], backgroundColor:'rgba(0,123,255,0.5)', yAxisID:'y2'}
        ]
    },
    options:{
        responsive:true,
        interaction:{mode:'index',intersect:false},
        plugins:{legend:{display:true}},
        scales:{
            y1:{type:'linear',position:'left',title:{display:true,text:'°C'}},
            y2:{type:'linear',position:'right',title:{display:true,text:'mm'},grid:{drawOnChartArea:false}}
        }
    }
});
const humChart=crearGrafica(document.getElementById('humChart').getContext('2d'),'Humedad (%)','rgba(0,200,100,1)');
const windChart=crearGrafica(document.getElementById('windChart').getContext('2d'),'Viento km/h','rgba(255,165,0,1)');
const solarChart=crearGrafica(document.getElementById('solarChart').getContext('2d'),'Radiación (W/m²)','rgba(255,215,0,1)');
const uviChart=crearGrafica(document.getElementById('uviChart').getContext('2d'),'UVI','rgba(255,69,0,1)');

// ====== Mapa ======
const map=L.map('map').setView([41.3,-1.3],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const marker=L.marker([41.3,-1.3]).addTo(map).bindPopup('Estación Meteo Cosuenda').openPopup();

// ====== Actualizar gráficos ======
function actualizarGraf(hist){
    const dias=parseInt(document.getElementById('rangeSelect').value);
    const fil=hist.slice(-dias*24*12);
    // Temp / lluvia
    tempRainChart.data.labels=fil.map(e=>e.ts);
    tempRainChart.data.datasets[0].data=fil.map(e=>e.temp);
    tempRainChart.data.datasets[1].data=fil.map(e=>e.rain);
    tempRainChart.update();
    // Humedad
    humChart.data.labels=fil.map(e=>e.ts);
    humChart.data.datasets[0].data=fil.map(e=>e.hum);
    humChart.update();
    // Viento
    windChart.data.labels=fil.map(e=>e.ts);
    windChart.data.datasets[0].data=fil.map(e=>e.wind);
    windChart.update();
    // Solar
    solarChart.data.labels=fil.map(e=>e.ts);
    solarChart.data.datasets[0].data=fil.map(e=>e.solar);
    solarChart.update();
    // UVI
    uviChart.data.labels=fil.map(e=>e.ts);
    uviChart.data.datasets[0].data=fil.map(e=>e.uvi);
    uviChart.update();
}

// ====== Función principal ======
async function obtenerDatos(){
    try{
        const response=await fetch(url);
        const data=await response.json();
        if(data.code!==0){ console.error("Error API:",data); return; }

        const outdoor=data.data.outdoor;
        const wind=data.data.wind;
        const rainfall=data.data.rainfall;
        const pressure=data.data.pressure;
        const solarVal=data.data.solar_and_uvi.solar.value;
        const uviVal=data.data.solar_and_uvi.uvi.value;

        const tempC=parseFloat(fToC(outdoor.temperature.value));
        const windKmH=parseFloat(mphToKmh(wind.wind_speed.value));
        const rainMm=parseFloat(inToMm(rainfall.daily.value));
        const pressHpa=parseFloat(inHgToHpa(pressure.relative.value));
        const hum=parseInt(outdoor.humidity.value);
        const windDirText=dirViento(parseFloat(wind.wind_direction.value));

        // Animar valores actuales
        animarValor(document.getElementById("tempBig"),tempC," °C");
        document.getElementById("tempIcon").textContent = (tempC<=0?"❄️":tempC<=15?"🌤️":tempC<=30?"☀️":"🔥");
        animarValor(document.getElementById("hum"),hum,"%");
        animarValor(document.getElementById("wind"),windKmH," km/h");
        document.getElementById("windDir").textContent = windDirText;
        animarValor(document.getElementById("rain"),rainMm," mm");
        animarValor(document.getElementById("press"),pressHpa," hPa");
        animarValor(document.getElementById("solar"),solarVal," W/m²");
        animarValor(document.getElementById("uvi"),uviVal,"");

        // Fondo dinámico
        const hour=new Date().getHours();
        document.body.style.background=(hour>=6 && hour<18)?"linear-gradient(to bottom,#87CEEB,#f0f8ff)":"linear-gradient(to bottom,#001848,#0a1f44)";

        // Guardar histórico y calcular min/max
        const ts=new Date().toLocaleTimeString();
        const hist=guardarHistorico(ts,tempC,hum,windKmH,rainMm,pressHpa,solarVal,uviVal,windDirText);
        const mm=calcularMinMax(hist);

        // Mostrar min/max en tarjetas
        document.getElementById("tempMin").textContent = mm.tempMin?.toFixed(1) || "--";
        document.getElementById("tempMax").textContent = mm.tempMax?.toFixed(1) || "--";
        document.getElementById("humMin").textContent = mm.humMin?.toFixed(0) || "--";
        document.getElementById("humMax").textContent = mm.humMax?.toFixed(0) || "--";
        document.getElementById("windMin").textContent = mm.windMin?.toFixed(1) || "--";
        document.getElementById("windMax").textContent = mm.windMax?.toFixed(1) || "--";
        document.getElementById("rainMin").textContent = mm.rainMin?.toFixed(1) || "--";
        document.getElementById("rainMax").textContent = mm.rainMax?.toFixed(1) || "--";
        document.getElementById("pressMin").textContent = mm.pressMin?.toFixed(1) || "--";
        document.getElementById("pressMax").textContent = mm.pressMax?.toFixed(1) || "--";
        document.getElementById("solarMin").textContent = mm.solarMin?.toFixed(1) || "--";
        document.getElementById("solarMax").textContent = mm.solarMax?.toFixed(1) || "--";
        document.getElementById("uviMin").textContent = mm.uviMin?.toFixed(0) || "--";
        document.getElementById("uviMax").textContent = mm.uviMax?.toFixed(0) || "--";

        // Actualizar gráficas
        actualizarGraf(hist);

        // Actualizar popup del mapa
        marker.setPopupContent(`Estación Meteo Cosuenda<br>Temp: ${tempC} °C<br>Humedad: ${hum}%<br>Viento: ${windDirText}`).openPopup();

    }catch(err){console.error("Error de conexión:",err);}
}

// Selector de rango
document.getElementById('rangeSelect').addEventListener('change',()=>{
    const hist=JSON.parse(localStorage.getItem('meteoHist'))||[];
    actualizarGraf(hist);
});

// Carga inicial y actualización cada 5 min
obtenerDatos();
setInterval(obtenerDatos,300000);


























