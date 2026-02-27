// ====== API ======
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

const fToC=f=>((parseFloat(f)-32)*5/9);
const mphToKmh=mph=>parseFloat(mph)*1.60934;

let angActual=0;
let humActual=0;
let uvActual=0;

let humGauge, uvGauge, tempChart;
let tiempos=[], temps=[];

// ===== Animación suave =====
function animarValor(actual, objetivo, velocidad=0.05){
    return actual + (objetivo-actual)*velocidad;
}

// ===== Flecha viento =====
function actualizarFlecha(grados, vel){
    const flecha=document.getElementById("flecha");
    angActual=animarValor(angActual, grados, 0.1);
    flecha.style.transform=`translateX(-50%) rotate(${angActual}deg)`;

    if(vel<15) flecha.style.background="#3498db";
    else if(vel<30) flecha.style.background="#f1c40f";
    else flecha.style.background="#e74c3c";
}

// ===== Crear gauges =====
function crearGauge(ctx, valor, max, color){
    return new Chart(ctx,{
        type:'doughnut',
        data:{
            datasets:[{
                data:[valor,max-valor],
                backgroundColor:[color,"#eee"],
                borderWidth:0
            }]
        },
        options:{
            rotation:-90*Math.PI/180,
            circumference:180*Math.PI/180,
            cutout:"70%",
            animation:{duration:800},
            plugins:{legend:{display:false}}
        }
    });
}

// ===== Gráfico temperatura =====
function actualizarGrafico(temp){
    const ahora=new Date();
    tiempos.push(ahora.getHours()+":"+ahora.getMinutes());
    temps.push(temp);
    if(tiempos.length>24){tiempos.shift();temps.shift();}

    if(!tempChart){
        tempChart=new Chart(document.getElementById("tempChart"),{
            type:"line",
            data:{labels:tiempos,datasets:[{data:temps,borderColor:"#e74c3c",fill:false,tension:0.4}]},
            options:{plugins:{legend:{display:false}}}
        });
    }else{
        tempChart.data.labels=tiempos;
        tempChart.data.datasets[0].data=temps;
        tempChart.update();
    }
}

// ===== PRINCIPAL =====
async function obtenerDatos(){
    try{
        const res=await fetch(url);
        const data=await res.json();
        if(data.code!==0) return;

        const outdoor=data.data.outdoor;
        const wind=data.data.wind;

        const tempC=fToC(outdoor.temperature.value);
        const hum=parseFloat(outdoor.humidity.value);
        const windKm=mphToKmh(wind.wind_speed.value);
        const windDeg=parseFloat(wind.wind_direction.value);
        const uv=outdoor.uv?.value ?? 0;
        const solar=outdoor.solar_radiation?.value ?? 0;

        document.getElementById("tempBig").textContent=tempC.toFixed(1)+" °C";
        document.getElementById("hum").textContent=hum+" %";
        document.getElementById("wind").textContent=windKm.toFixed(1)+" km/h";
        document.getElementById("uv").textContent=uv.toFixed(1);
        document.getElementById("solar").textContent=solar.toFixed(0)+" W/m²";
        document.getElementById("windDirText").textContent="Dirección: "+windDeg+"°";

        // Animaciones suaves
        actualizarFlecha(windDeg, windKm);

        humActual=animarValor(humActual, hum);
        uvActual=animarValor(uvActual, uv);

        if(!humGauge)
            humGauge=crearGauge(document.getElementById("humGauge"), humActual,100,"#3498db");
        else{
            humGauge.data.datasets[0].data=[humActual,100-humActual];
            humGauge.update();
        }

        if(!uvGauge)
            uvGauge=crearGauge(document.getElementById("uvGauge"), uvActual,11,"#f39c12");
        else{
            uvGauge.data.datasets[0].data=[uvActual,11-uvActual];
            uvGauge.update();
        }

        actualizarGrafico(tempC);

    }catch(e){
        console.log("Error conexión",e);
    }
}

setInterval(()=>{
    obtenerDatos();
},5000);

obtenerDatos();
