// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Conversiones ======
const fToC = f => ((parseFloat(f)-32)*5/9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph)*1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches)*25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg)*33.8639).toFixed(1);

// ====== Función para animar valores ======
function animarValor(el,nuevo,unidad=""){
    const valAct=parseFloat(el.getAttribute("data-valor"))||0;
    const valFin=parseFloat(nuevo);
    let start=valAct; const step=(valFin-start)/20; let i=0;
    const anim=setInterval(()=>{
        start+=step;
        el.textContent=start.toFixed(1)+unidad;
        i++; if(i>=20){ el.textContent=valFin.toFixed(1)+unidad; el.setAttribute("data-valor",valFin); clearInterval(anim);}
    },50);
}

// ====== Min/Max diario ======
function actualizarMinMax(dato, clave){
    const hoy = new Date().toISOString().slice(0,10);
    let minmax = JSON.parse(localStorage.getItem('minMax'))||{};
    if(!minmax[hoy]) minmax[hoy]={};
    if(!minmax[hoy][clave]) minmax[hoy][clave]={min:dato,max:dato};
    else{ if(dato<minmax[hoy][clave].min) minmax[hoy][clave].min=dato; if(dato>minmax[hoy][clave].max) minmax[hoy][clave].max=dato;}
    localStorage.setItem('minMax',JSON.stringify(minmax));
    return minmax[hoy][clave];
}

// ====== Actualizar barra de progreso ======
function actualizarBar(id,valor,min,max){
    let perc = (valor - min)/(max - min) * 100;
    if(isNaN(perc)) perc=0; if(perc>100) perc=100;
    document.getElementById(id).style.width = perc+"%";
}

// ====== Función principal ======
async function obtenerDatos(){
    try{
        const res = await fetch(url);
        const data = await res.json();
        if(data.code!==0){ console.error("Error API:",data); return;}

        const outdoor = data.data.outdoor;
        const wind = data.data.wind;
        const rainfall = data.data.rainfall;
        const pressure = data.data.pressure;

        // --- Temperatura
        const tempC = parseFloat(fToC(outdoor.temperature.value));
        const tempEl = document.getElementById("tempBig");
        const iconEl = document.getElementById("tempIcon");
        tempEl.textContent = tempC+" °C";
        if(tempC<=0){ iconEl.textContent="❄️"; tempEl.style.color="#00f"; }
        else if(tempC<=15){ iconEl.textContent="🌤️"; tempEl.style.color="#0aa"; }
        else if(tempC<=30){ iconEl.textContent="☀️"; tempEl.style.color="#fa0"; }
        else{ iconEl.textContent="🔥"; tempEl.style.color="#f00"; }

        animarValor(document.getElementById("hum"),outdoor.humidity.value,"%");
        animarValor(document.getElementById("wind"),mphToKmh(wind.wind_speed.value)," km/h");
        animarValor(document.getElementById("rain"),inToMm(rainfall.daily.value)," mm");
        const pressHpa = inHgToHpa(pressure.relative.value);
        animarValor(document.getElementById("press"),pressHpa," hPa");

        // --- Actualizar min/max y barras
        const tempMM = actualizarMinMax(tempC,'temp'); document.getElementById('tempMinMax').textContent=`Min: ${tempMM.min}°C | Max: ${tempMM.max}°C`; actualizarBar('tempBar',tempC,tempMM.min,tempMM.max);
        const humMM = actualizarMinMax(parseInt(outdoor.humidity.value),'hum'); document.getElementById('humMinMax').textContent=`Min: ${humMM.min}% | Max: ${humMM.max}%`; actualizarBar('humBar',parseInt(outdoor.humidity.value),humMM.min,humMM.max);
        const windMM = actualizarMinMax(parseFloat(mphToKmh(wind.wind_speed.value)),'wind'); document.getElementById('windMinMax').textContent=`Min: ${windMM.min} km/h | Max: ${windMM.max} km/h`; actualizarBar('windBar',parseFloat(mphToKmh(wind.wind_speed.value)),windMM.min,windMM.max);
        const rainMM = actualizarMinMax(parseFloat(inToMm(rainfall.daily.value)),'rain'); document.getElementById('rainMinMax').textContent=`Min: ${rainMM.min} mm | Max: ${rainMM.max} mm`; actualizarBar('rainBar',parseFloat(inToMm(rainfall.daily.value)),rainMM.min,rainMM.max);
        const pressMM = actualizarMinMax(pressHpa,'press'); document.getElementById('pressMinMax').textContent=`Min: ${pressMM.min} hPa | Max: ${pressMM.max} hPa`; actualizarBar('pressBar',pressHpa,pressMM.min,pressMM.max);

        // Fondo día/noche
        const hour = new Date().getHours();
        document.body.style.background = (hour>=6 && hour<18)? "linear-gradient(to bottom,#87CEEB,#f0f8ff)":"linear-gradient(to bottom,#001848,#0a1f44)";
    }catch(e){ console.error("Error de conexión:",e);}
}

// ====== Carga inicial + actualización cada 5 min ======
obtenerDatos();
setInterval(obtenerDatos,300000);




























