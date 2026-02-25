// ====== CLAVES API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// Conversiones
const fToC = f => ((parseFloat(f)-32)*5/9);
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;
const gradosADireccion = grados => ["N","NE","E","SE","S","SW","W","NW"][Math.round(grados/45)%8];

// Flecha de viento con color según intensidad
let angAnterior=0;
function actualizarFlecha(grados, vel){
    const flecha=document.getElementById("flechaViento");
    if(!flecha) return;
    let diff=grados-angAnterior;
    if(diff>180) diff-=360;
    if(diff<-180) diff+=360;
    angAnterior+=diff;
    flecha.style.transform=`translateX(-50%) rotate(${angAnterior}deg)`;
    flecha.style.background=vel<15?'#3498db':(vel<30?'#f1c40f':'#e74c3c');
}

// Gauges circulares (humedad y UV)
let humGauge=null, uvGauge=null;
function actualizarGauges(hum, uv){
    const ctxHum=document.getElementById("humGauge").getContext("2d");
    const ctxUV=document.getElementById("uvGauge")?.getContext("2d");
    const colorHum=hum<50?'#3498db':(hum<75?'#f1c40f':'#e74c3c');
    const colorUV=uv<3?'#2ecc71':(uv<7?'#f39c12':'#e74c3c');
    if(!humGauge){
        humGauge=new Chart(ctxHum,{type:'doughnut',data:{datasets:[{data:[hum,100-hum],backgroundColor:[colorHum,'#eee'],borderWidth:0}]},options:{rotation:-90*(Math.PI/180),circumference:180,cutout:'70%',plugins:{legend:{display:false}}}});
    }else{ humGauge.data.datasets[0].data=[hum,100-hum]; humGauge.data.datasets[0].backgroundColor=[colorHum,'#eee']; humGauge.update(); }
    if(uv!==null && ctxUV){
        if(!uvGauge){
            uvGauge=new Chart(ctxUV,{type:'doughnut',data:{datasets:[{data:[uv,11-uv],backgroundColor:[colorUV,'#eee'],borderWidth:0}]},options:{rotation:-90*(Math.PI/180),circumference:180,cutout:'70%',plugins:{legend:{display:false}}}});
        }else{ uvGauge.data.datasets[0].data=[uv,11-uv]; uvGauge.data.datasets[0].backgroundColor=[colorUV,'#eee']; uvGauge.update(); }
    }
}

// Extremos y récords
function actualizarExtremos(temp, hum, wind){
    const hoy=new Date().toDateString();
    let datos=JSON.parse(localStorage.getItem("extremos"));
    if(!datos || datos.fecha!==hoy){ datos={fecha:hoy,tempMin:temp,tempMax:temp,humMax:hum,windMax:wind}; }
    else{ if(temp<datos.tempMin) datos.tempMin=temp; if(temp>datos.tempMax) datos.tempMax=temp; if(hum>datos.humMax) datos.humMax=hum; if(wind>datos.windMax) datos.windMax=wind; }
    localStorage.setItem("extremos",JSON.stringify(datos));
    return datos;
}
function actualizarRecord(temp){
    let record=JSON.parse(localStorage.getItem("recordTemp"));
    if(!record) record={max:temp,min:temp};
    else{ if(temp>record.max) record.max=temp; if(temp<record.min) record.min=temp; }
    localStorage.setItem("recordTemp",JSON.stringify(record));
    return record;
}
function actualizarLluvia(rain){
    const hoy=new Date(); const mes=hoy.getMonth(); const año=hoy.getFullYear();
    let datos=JSON.parse(localStorage.getItem("lluviaTotal"));
    if(!datos) datos={mes,año,totalMes:rain,totalAño:rain};
    else{ if(datos.mes!==mes) datos.totalMes=rain, datos.mes=mes; else if(rain>datos.totalMes) datos.totalMes=rain;
           if(datos.año!==año) datos.totalAño=rain, datos.año=año; else if(rain>datos.totalAño) datos.totalAño=rain; }
    localStorage.setItem("lluviaTotal",JSON.stringify(datos));
    return datos;
}

// Gráfico temperatura últimas 24h
let tempChart=null, tiempos=[], temps=[];
function actualizarGraficoTemp(temp){
    const ahora=new Date();
    tiempos.push(ahora.getHours()+":"+ahora.getMinutes());
    temps.push(temp);
    if(tiempos.length>24){ tiempos.shift(); temps.shift(); }
    if(!tempChart){
        const ctx=document.getElementById("tempChart").getContext("2d");
        tempChart=new Chart(ctx,{type:'line',data:{labels:tiempos,datasets:[{label:"°C",data:temps,borderColor:"#FF5733",fill:false,tension:0.3}]},options:{responsive:true,plugins:{legend:{display:false}}}});
    }else{ tempChart.data.labels=tiempos; tempChart.data.datasets[0].data=temps; tempChart.update(); }
}

// ====== OBTENER DATOS ======
async function obtenerDatos(){
    try{
        const res=await fetch(url);
        const data=await res.json();
        if(data.code!==0) return;
        const outdoor=data.data.outdoor;
        const wind=data.data.wind;
        const rainfall=data.data.rainfall;
        const pressure=data.data.pressure;

        const uvIndex=outdoor.uv?.value ?? null;
        const solarRadiation=outdoor.solar_radiation?.value ?? null;

        const tempC=fToC(outdoor.temperature.value);
        const hum=parseFloat(outdoor.humidity.value);
        const windKm=mphToKmh(wind.wind_speed.value);
        const rainMm=inToMm(rainfall.daily.value);
        const pressHpa=inHgToHpa(pressure.relative.value);
        const windDeg=parseFloat(wind.wind_direction.value);

        document.getElementById("tempBig").textContent=tempC.toFixed(1)+" °C";
        document.getElementById("hum").textContent=hum+" %";
        document.getElementById("wind").textContent=windKm.toFixed(1)+" km/h";
        document.getElementById("rain").textContent=rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent=pressHpa.toFixed(1)+" hPa";
        document.getElementById("windDirText").textContent="Dirección: "+gradosADireccion(windDeg);

        actualizarFlecha(windDeg, windKm);
        actualizarGauges(hum, uvIndex);
        actualizarGraficoTemp(tempC);

        const extremos=actualizarExtremos(tempC, hum, windKm);
        document.getElementById("tempMin").textContent=`Min diaria: ${extremos.tempMin.toFixed(1)} °C | Max diaria: ${extremos.tempMax.toFixed(1)} °C`;
        document.getElementById("humMax").textContent="Max diaria: "+extremos.humMax+" %";
        document.getElementById("windMax").textContent="Racha máxima diaria: "+extremos.windMax.toFixed(1)+" km/h";

        const record=actualizarRecord(tempC);
        document.getElementById("tempRecordMax").textContent="🏆 Récord Máx: "+record.max.toFixed(1)+" °C";
        document.getElementById("tempRecordMin").textContent="🏆 Récord Mín: "+record.min.toFixed(1)+" °C";

        const lluvia=actualizarLluvia(rainMm);
        document.getElementById("rainMonth").textContent="Mes: "+lluvia.totalMes.toFixed(1)+" mm";
        document.getElementById("rainYear").textContent="Año: "+lluvia.totalAño.toFixed(1)+" mm";

        const uvCard=document.getElementById("uvCard");
        const solarCard=document.getElementById("solarCard");
        if(uvIndex!==null){ uvCard.classList.remove("oculto"); document.getElementById("uv").textContent=uvIndex.toFixed(1); }
        else uvCard.classList.add("oculto");
        if(solarRadiation!==null){ solarCard.classList.remove("oculto"); document.getElementById("solar").textContent=solarRadiation.toFixed(0)+" W/m²"; }
        else solarCard.classList.add("oculto");

        const h=new Date().getHours();
        document.body.style.background=(h>=6 && h<18)?"linear-gradient(to bottom,#87CEEB,#f0f8ff)":"linear-gradient(to bottom,#001848,#0a1f44)";

    }catch(e){ console.log("Error conexión", e); }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
