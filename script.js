// ====== API ======
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== CONVERSIONES ======
const fToC = f => ((parseFloat(f)-32)*5/9);
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

function gradosADireccion(grados){
    const dir=["N","NE","E","SE","S","SW","W","NW"];
    return dir[Math.round(grados/45)%8];
}

// ==== Rosa viento segura ====
let angAnterior=0;
function actualizarFlecha(grados, velocidad){
    const flecha=document.getElementById("flechaViento");
    if(!flecha) return;

    let diff=grados-angAnterior;
    if(diff>180) diff-=360;
    if(diff<-180) diff+=360;
    angAnterior+=diff;

    flecha.style.transform=`translateX(-50%) rotate(${angAnterior}deg)`;

    if(velocidad<15) flecha.style.background="blue";
    else if(velocidad<30) flecha.style.background="orange";
    else flecha.style.background="red";
}

// ==== Gauge ====
function actualizarGauge(id, valor, max){
    const fill=document.getElementById(id+"Gauge");
    if(!fill) return;
    const grados=(valor/max)*180;
    fill.style.transform=`rotate(${grados}deg)`;
}

// ==== Gráfico ====
let tempChart=null;
const tiempos=[], temperaturas=[];

function actualizarGraficoTemp(temp){
    const ahora=new Date();
    tiempos.push(ahora.getHours()+":"+ahora.getMinutes());
    temperaturas.push(temp);
    if(tiempos.length>24){ tiempos.shift(); temperaturas.shift(); }

    if(!tempChart){
        const ctx=document.getElementById("tempChart").getContext("2d");
        tempChart=new Chart(ctx,{
            type:'line',
            data:{
                labels:tiempos,
                datasets:[{
                    label:"°C",
                    data:temperaturas,
                    borderColor:"#ff5733",
                    fill:false,
                    tension:0.3
                }]
            },
            options:{responsive:true}
        });
    }else{
        tempChart.data.labels=tiempos;
        tempChart.data.datasets[0].data=temperaturas;
        tempChart.update();
    }
}

// ====== PRINCIPAL ======
async function obtenerDatos(){
    try{
        const response=await fetch(url);
        const data=await response.json();
        if(data.code!==0) return;

        const outdoor=data.data.outdoor;
        const wind=data.data.wind;
        const rainfall=data.data.rainfall;
        const pressure=data.data.pressure;

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
        actualizarGauge("hum", hum, 100);
        actualizarGraficoTemp(tempC);

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
