// Modo día/noche
function actualizarModo(){
    const hora = new Date().getHours();
    if(hora>=19 || hora<6){
        document.body.classList.remove('day');
        document.body.classList.add('night');
    }else{
        document.body.classList.remove('night');
        document.body.classList.add('day');
    }
}
actualizarModo();
setInterval(actualizarModo,60000);

// Rosa de los vientos
function crearRosa(){
    const rosa = document.getElementById("rosa");
    for(let i=0;i<360;i+=10){
        const m = document.createElement("div");
        m.className="marca";
        m.style.transform = `translateX(-50%) rotate(${i}deg)`;
        rosa.appendChild(m);
    }
    const puntos=["N","NE","E","SE","S","SW","W","NW"];
    puntos.forEach((p,i)=>{
        const c = document.createElement("div");
        c.className="cardinal";
        const angle = i*45;
        const radius = 90;
        const rad = angle*Math.PI/180;
        c.style.left = 50 + radius*Math.sin(rad)/100*100 + "%";
        c.style.top = 50 - radius*Math.cos(rad)/100*100 + "%";
        c.textContent = p;
        rosa.appendChild(c);
    });
}
crearRosa();

// Flecha viento
let angAnterior = 0;
function actualizarFlecha(grados){
    const flecha = document.getElementById("flechaViento");
    if(!flecha) return;
    let diff = grados - angAnterior;
    if(diff>180) diff-=360;
    if(diff<-180) diff+=360;
    angAnterior += diff;
    flecha.style.transform = `translateX(-50%) rotate(${angAnterior}deg)`;
}

// Gráfico temperatura
let tempChart=null;
const tLabels=[], tData=[];
function actualizarGraficoTemp(temp){
    tLabels.push(new Date().getHours()+":"+String(new Date().getMinutes()).padStart(2,"0"));
    tData.push(temp);
    if(tLabels.length>24){ tLabels.shift(); tData.shift(); }
    if(!tempChart){
        const ctx = document.getElementById("tempChart").getContext("2d");
        tempChart = new Chart(ctx,{
            type:'line',
            data:{labels:tLabels,datasets:[{data:tData,borderColor:"#ff5733",fill:false}]},
            options:{plugins:{legend:{display:false}}}
        });
    }else{
        tempChart.data.labels = tLabels;
        tempChart.data.datasets[0].data = tData;
        tempChart.update();
    }
}

// API Ecowitt
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";
const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;
function gradosADireccion(g){
    const d = ["N","NE","E","SE","S","SW","W","NW"];
    return d[Math.round(g/45)%8];
}

// Neón dinámico según temperatura
function actualizarNeon(temp){
    const el = document.getElementById("tempBig");
    let color;
    if(temp<5) color="#00f";      // azul frío
    else if(temp<15) color="#0f0"; // verde templado
    else if(temp<25) color="#ff0"; // amarillo cálido
    else color="#f00";             // rojo caliente

    let brillo = Math.min(Math.max(temp*2, 5), 60);
    el.style.color = color;
    el.style.textShadow =
        `0 0 ${brillo/12}px ${color},
         0 0 ${brillo/6}px ${color},
         0 0 ${brillo/3}px ${color},
         0 0 ${brillo}px ${color}`;
}

// Obtener datos reales
async function obtenerDatos(){
    try{
        const response = await fetch(url);
        const data = await response.json();
        if(data.code!==0) return;

        const o = data.data.outdoor;
        const w = data.data.wind;
        const rain = data.data.rainfall;
        const p = data.data.pressure;

        const tempC = fToC(o.temperature.value);
        const hum = parseFloat(o.humidity.value);
        const windKm = mphToKmh(w.wind_speed.value);
        const windDeg = parseFloat(w.wind_direction.value);
        const rainMm = inToMm(rain.daily.value);
        const pressHpa = inHgToHpa(p.relative.value);
        const uvIndex = data.data.uv?.value ?? "--";
        const solar = data.data.solar_radiation?.value ?? "--";

        document.getElementById("tempBig").textContent = tempC.toFixed(1)+" °C";
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        document.getElementById("uv").textContent = uvIndex;
        document.getElementById("solar").textContent = solar+" W/m²";

        actualizarFlecha(windDeg);
        actualizarGraficoTemp(tempC);
        actualizarNeon(tempC);

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
