// ===== Modo día/noche =====
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

// ===== Rosa de los vientos =====
function crearRosa(){
    const rosa = document.getElementById("rosa");
    rosa.innerHTML = '<div id="flechaViento" class="flecha"></div>';

    for(let i=0;i<360;i+=10){
        const m = document.createElement("div");
        m.className="marca";
        m.style.transform = `translateX(-50%) rotate(${i}deg)`;
        rosa.appendChild(m);
    }

    const puntos = ["N","NE","E","SE","S","SW","W","NW"];
    puntos.forEach((p,i)=>{
        const ang = i*45;
        const rad = ang*Math.PI/180;
        const c = document.createElement("div");
        c.className="cardinal";
        c.textContent = p;
        const x = 50 + Math.sin(rad)*45;
        const y = 50 - Math.cos(rad)*45;
        c.style.left = `${x}%`;
        c.style.top = `${y}%`;
        rosa.appendChild(c);
    });

    actualizarRosaColor();
}
crearRosa();

function actualizarRosaColor(){
    const rosa = document.getElementById("rosa");
    const cardinals = rosa.querySelectorAll(".cardinal");
    const flecha = document.getElementById("flechaViento");

    if(document.body.classList.contains("night")){
        cardinals.forEach(c => { c.style.color="#a0c4ff"; c.style.textShadow="0 0 3px #000"; });
        flecha.style.background="#00ffff";
    }else{
        cardinals.forEach(c => { c.style.color="#003366"; c.style.textShadow="0 0 2px #fff"; });
        flecha.style.background="blue";
    }
}
setInterval(actualizarRosaColor,1000);

// ===== Flecha viento =====
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

// ===== Gráfico temperatura =====
let tempChart=null;
const tLabels=[], tData=[], tempHist=[];

function actualizarGraficoTemp(temp){
    const ahora = new Date();
    tLabels.push(ahora.getHours() + ":" + String(ahora.getMinutes()).padStart(2,"0"));
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

// ===== API Ecowitt =====
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";
const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ===== Conversiones =====
const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;
function gradosADireccion(g){
    const d = ["N","NE","E","SE","S","SW","W","NW"];
    return d[Math.round(g/45)%8];
}

// ===== Sensación térmica =====
function calcularSensacionTermica(tempC, hum, vientoKmh){
    let sensacion = tempC;
    if(tempC <= 10 && vientoKmh > 4.8){ 
        sensacion = 13.12 + 0.6215*tempC - 11.37*Math.pow(vientoKmh,0.16) + 0.3965*tempC*Math.pow(vientoKmh,0.16);
    }
    else if(tempC >= 27 && hum >= 40){ 
        const T = tempC;
        const R = hum;
        sensacion = -8.784695 + 1.61139411*T + 2.338549*R - 0.14611605*T*R 
                    - 0.012308094*Math.pow(T,2) - 0.016424828*Math.pow(R,2) 
                    + 0.002211732*Math.pow(T,2)*R + 0.00072546*T*Math.pow(R,2) 
                    - 0.000003582*Math.pow(T,2)*Math.pow(R,2);
    }
    return sensacion.toFixed(1);
}

// ===== Neón temperatura =====
function actualizarNeon(temp){
    const el = document.getElementById("tempBig");
    let color;
    if(temp<5) color="#00f";      
    else if(temp<15) color="#0f0"; 
    else if(temp<25) color="#ff0"; 
    else color="#f00";             
    let brillo = Math.min(Math.max(temp*2,5),60);
    el.style.color = color;
    el.style.textShadow = `0 0 ${brillo/12}px ${color}, 0 0 ${brillo/6}px ${color}, 0 0 ${brillo/3}px ${color}, 0 0 ${brillo}px ${color}`;
}

// ===== Neón humedad =====
function actualizarNeonHum(hum){
    const el = document.getElementById("hum");
    let color;
    if(hum < 30) color = "#00f";
    else if(hum < 60) color = "#0f0";
    else color = "#ff0";
    let brillo = Math.min(Math.max(hum,5),60);
    el.style.color = color;
    el.style.textShadow = `0 0 ${brillo/12}px ${color}, 0 0 ${brillo/6}px ${color}, 0 0 ${brillo/3}px ${color}, 0 0 ${brillo}px ${color}`;
}

// ===== Lluvia mensual =====
let mesActual = new Date().getMonth();
let lluviaMensual = 0;

// ===== Min/max diario =====
let fechaActual = new Date().toISOString().split("T")[0];

// ===== Obtener datos =====
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

        // ===== Lluvia mensual =====
        const mesHoy = new Date().getMonth();
        if(mesHoy !== mesActual){
            mesActual = mesHoy;
            lluviaMensual = 0;
        }
        const lluviaMesHoy = rain.month?.value ?? 0;
        lluviaMensual = inToMm(lluviaMesHoy);
        document.getElementById("rainMonth").textContent = lluviaMensual.toFixed(1) + " mm";

        const pressHpa = inHgToHpa(p.relative.value);
        const uvIndex = data.data.uv?.value ?? "--";
        const solar = data.data.solar_radiation?.value ?? "--";

        const hoy = new Date().toISOString().split("T")[0];
        if(hoy !== fechaActual){ tempHist.length=0; fechaActual=hoy; }
        tempHist.push(tempC);

        const tempMinC = Math.min(...tempHist);
        const tempMaxC = Math.max(...tempHist);

        // ===== Actualizar HTML =====
        document.getElementById("tempBig").textContent = tempC.toFixed(1);
        document.getElementById("sensacion").textContent = "Sensación térmica: " + calcularSensacionTermica(tempC, hum, windKm);
        document.getElementById("tempMin").textContent = "Min diaria: " + tempMinC.toFixed(1);
        document.getElementById("tempMax").textContent = "Max diaria: " + tempMaxC.toFixed(1);
        document.getElementById("hum").textContent = hum+" %";
        document.getElementById("wind").textContent = windKm.toFixed(1)+" km/h";
        document.getElementById("windDirText").textContent = "Dirección: "+gradosADireccion(windDeg);
        document.getElementById("rain").textContent = rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent = pressHpa.toFixed(1)+" hPa";
        document.getElementById("uv").textContent = uvIndex;
        document.getElementById("solar").textContent = solar+" W/m²";

        const ahora = new Date();
        document.getElementById("ultimaActualizacion").textContent = 
            "Última actualización: " + ahora.getHours() + ":" + String(ahora.getMinutes()).padStart(2,"0");

        actualizarFlecha(windDeg);
        actualizarGraficoTemp(tempC);
        actualizarNeon(tempC);
        actualizarNeonHum(hum);
        actualizarRosaColor();

    }catch(error){
        console.log("Error conexión", error);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
