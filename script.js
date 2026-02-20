// ====== CONFIGURACIÓN ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9);
const mphToKmh = mph => (parseFloat(mph) * 1.60934);
const inToMm = inches => (parseFloat(inches) * 25.4);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639);

// ====== FECHA ACTUAL ======
const hoy = new Date().toISOString().split("T")[0];

// ====== CARGAR STATS DEL LOCALSTORAGE ======
let stats = JSON.parse(localStorage.getItem("meteoStats")) || {};
if(!stats.fecha || stats.fecha !== hoy){
    stats = {
        fecha: hoy,
        tempMin: null, tempMax: null,
        windMin: null, windMax: null,
        pressMin: null, pressMax: null,
        humMin: null, humMax: null,
        rainMax: 0
    };
}

// ====== HISTÓRICO 24H ======
let historyData = JSON.parse(localStorage.getItem("meteoHistory")) || {labels: [], temp: [], press: [], wind: []};

// ====== GUARDAR STATS ======
function guardarStats(){ localStorage.setItem("meteoStats", JSON.stringify(stats)); }
function actualizarMinMax(valor,minKey,maxKey){ if(stats[minKey]===null||valor<stats[minKey]) stats[minKey]=valor; if(stats[maxKey]===null||valor>stats[maxKey]) stats[maxKey]=valor; }

// ====== GUARDAR HISTORIAL ======
function guardarHistorial(temp,press,wind){
    const hora = new Date().toLocaleTimeString().slice(0,5);
    historyData.labels.push(hora);
    historyData.temp.push(temp);
    historyData.press.push(press);
    historyData.wind.push(wind);
    if(historyData.labels.length>288){ historyData.labels.shift(); historyData.temp.shift(); historyData.press.shift(); historyData.wind.shift(); }
    localStorage.setItem("meteoHistory",JSON.stringify(historyData));
    actualizarGraficas();
}

// ====== CREAR GRÁFICAS ======
let chartTemp, chartPress, chartWind;
function crearGraficas(){
    chartTemp = new Chart(document.getElementById("chartTemp"),{type:"line",data:{labels:historyData.labels,datasets:[{label:"°C",data:historyData.temp,borderColor:"red",tension:0.3}]}});
    chartPress = new Chart(document.getElementById("chartPress"),{type:"line",data:{labels:historyData.labels,datasets:[{label:"hPa",data:historyData.press,borderColor:"blue",tension:0.3}]}});
    chartWind = new Chart(document.getElementById("chartWind"),{type:"line",data:{labels:historyData.labels,datasets:[{label:"km/h",data:historyData.wind,borderColor:"green",tension:0.3}]});
}
function actualizarGraficas(){
    chartTemp.data.labels=historyData.labels; chartTemp.data.datasets[0].data=historyData.temp; chartTemp.update();
    chartPress.data.labels=historyData.labels; chartPress.data.datasets[0].data=historyData.press; chartPress.update();
    chartWind.data.labels=historyData.labels; chartWind.data.datasets[0].data=historyData.wind; chartWind.update();
}
crearGraficas();

// ====== FUNCION PRINCIPAL ======
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const json = await response.json();
        if(json.code!==0){console.error("Error API:",json); return;}

        const data=json.data;
        const tempC=fToC(data.outdoor.temperature.value);
        const windKmh=mphToKmh(data.wind.wind_speed.value);
        const pressureHpa=inHgToHpa(data.pressure.relative.value);
        const humidity=parseFloat(data.outdoor.humidity.value);
        const rainMm=inToMm(data.rainfall.daily.value);
        const solar=parseFloat(data.solar_and_uvi.solar.value);
        const uvi=parseFloat(data.solar_and_uvi.uvi.value);

        // ====== ACTUALIZAR VALORES ======
        document.getElementById("tempValor").textContent=tempC.toFixed(1)+" °C";
        document.getElementById("windValor").textContent=windKmh.toFixed(1)+" km/h";
        document.getElementById("pressValor").textContent=pressureHpa.toFixed(1)+" hPa";
        document.getElementById("humValor").textContent=humidity+" %";
        document.getElementById("rainValor").textContent=rainMm.toFixed(1)+" mm";
        document.getElementById("solarValor").textContent=solar+" W/m²";
        document.getElementById("uviValor").textContent=uvi;

        // ====== MIN/MAX ======
        actualizarMinMax(tempC,"tempMin","tempMax");
        actualizarMinMax(windKmh,"windMin","windMax");
        actualizarMinMax(pressureHpa,"pressMin","pressMax");
        actualizarMinMax(humidity,"humMin","humMax");
        if(rainMm>stats.rainMax) stats.rainMax=rainMm;
        guardarStats();

        document.getElementById("tempMinMax").innerHTML=`<span class="min">Min: ${stats.tempMin.toFixed(1)}°C</span> | <span class="max">Max: ${stats.tempMax.toFixed(1)}°C</span>`;
        document.getElementById("windMinMax").innerHTML=`<span class="min">Min: ${stats.windMin.toFixed(1)} km/h</span> | <span class="max">Max: ${stats.windMax.toFixed(1)} km/h</span>`;
        document.getElementById("pressMinMax").innerHTML=`<span class="min">Min: ${stats.pressMin.toFixed(1)} hPa</span> | <span class="max">Max: ${stats.pressMax.toFixed(1)} hPa</span>`;
        document.getElementById("humMinMax").innerHTML=`<span class="min">Min: ${stats.humMin}%</span> | <span class="max">Max: ${stats.humMax}%</span>`;
        document.getElementById("rainMinMax").innerHTML=`<span class="max">Hoy: ${stats.rainMax.toFixed(1)} mm</span>`;

        // ====== GUARDAR HISTORIAL ======
        guardarHistorial(tempC,pressureHpa,windKmh);

        // ====== FONDO DÍA/NOCHE ======
        const hour=new Date().getHours();
        const body=document.body;
        if(hour>=6 && hour<18) body.style.background="linear-gradient(to bottom, #87CEEB, #f0f8ff)";
        else body.style.background="linear-gradient(to bottom, #001848, #0a1f44)";

        // ====== ICONOS SKYCONS ======
        const skycons=new Skycons({"color":"#ffcc00"});
        skycons.add("iconTemp", hour>=6 && hour<18 ? Skycons.CLEAR_DAY : Skycons.CLEAR_NIGHT);
        skycons.add("iconWind", Skycons.WIND);
        skycons.play();

        // ====== COLORES DINÁMICOS ======
        const tempEl=document.getElementById("tempValor");
        if(tempC<=0) tempEl.style.color="#00f";
        else if(tempC<=15) tempEl.style.color="#0aa";
        else if(tempC<=25) tempEl.style.color="#0a0";
        else if(tempC<=35) tempEl.style.color="#fa0";
        else tempEl.style.color="#f00";

        const windEl=document.getElementById("windValor");
        if(windKmh<10) windEl.style.color="#0a0";
        else if(windKmh<30) windEl.style.color="#fa0";
        else windEl.style.color="#f00";

        const humEl=document.getElementById("humValor");
        humEl.style.color=humidity<50?"#0aa":"#0055aa";

    }catch(error){
        console.error("Error conexión:",error);
    }
}

// ====== ACTUALIZACIÓN ======
obtenerDatos();
setInterval(obtenerDatos,300000);
































