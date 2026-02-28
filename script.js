// ===== API Ecowitt =====
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ===== CONVERSIONES =====
const fToC = f => (parseFloat(f)-32)*5/9;
const mphToKmh = mph => parseFloat(mph)*1.60934;
const inToMm = inches => parseFloat(inches)*25.4;
const inHgToHpa = inHg => parseFloat(inHg)*33.8639;

// ===== FECHA ACTUAL =====
function fechaHoy(){
    const d=new Date();
    return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
}

if(localStorage.getItem("fecha")!==fechaHoy()){
    localStorage.clear();
    localStorage.setItem("fecha",fechaHoy());
}

// ===== VARIABLES PERSISTENTES =====
let minTemp = parseFloat(localStorage.getItem("minTemp"));
let maxTemp = parseFloat(localStorage.getItem("maxTemp"));
let gustMax = parseFloat(localStorage.getItem("gustMax"));

// ===== ROSA DE LOS VIENTOS =====
function crearRosa(){
    const rosa=document.getElementById("rosa");

    for(let i=0;i<360;i+=10){
        const m=document.createElement("div");
        m.className="marca";
        m.style.transform=`rotate(${i}deg)`;
        rosa.appendChild(m);
    }

    const puntos=["N","NE","E","SE","S","SW","W","NW"];
    puntos.forEach((p,i)=>{
        const c=document.createElement("div");
        c.className="cardinal";
        c.style.transform=`rotate(${i*45}deg) translate(85px) rotate(-${i*45}deg)`;
        c.textContent=p;
        rosa.appendChild(c);
    });
}
crearRosa();

let angAnterior=0;
function actualizarFlecha(grados){
    const flecha=document.getElementById("flechaViento");
    let diff=grados-angAnterior;
    if(diff>180) diff-=360;
    if(diff<-180) diff+=360;
    angAnterior+=diff;
    flecha.style.transform=`rotate(${angAnterior}deg)`;
}

// ===== GRÁFICA =====
let chart;
const labels=[];
const datos=[];

function actualizarGrafica(temp){
    const hora=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    labels.push(hora);
    datos.push(temp);
    if(labels.length>24){labels.shift();datos.shift();}

    if(!chart){
        const ctx=document.getElementById("tempChart");
        chart=new Chart(ctx,{
            type:'line',
            data:{
                labels:labels,
                datasets:[{
                    data:datos,
                    borderColor:"#ff5733",
                    fill:false,
                    tension:0.3
                }]
            },
            options:{
                responsive:true,
                plugins:{legend:{display:false}}
            }
        });
    }else{
        chart.update();
    }
}

// ===== MIN / MAX =====
function actualizarMinMax(temp){
    if(isNaN(minTemp) || temp<minTemp){
        minTemp=temp;
        localStorage.setItem("minTemp",minTemp);
    }
    if(isNaN(maxTemp) || temp>maxTemp){
        maxTemp=temp;
        localStorage.setItem("maxTemp",maxTemp);
    }

    document.getElementById("tempMin").textContent=minTemp.toFixed(1);
    document.getElementById("tempMax").textContent=maxTemp.toFixed(1);
}

function actualizarRacha(gust){
    if(isNaN(gustMax) || gust>gustMax){
        gustMax=gust;
        localStorage.setItem("gustMax",gustMax);
    }
    document.getElementById("gustMax").textContent=gustMax.toFixed(1)+" km/h";
}

// ===== OBTENER DATOS =====
async function obtenerDatos(){
    try{
        const response=await fetch(url);
        const data=await response.json();
        if(data.code!==0) return;

        const o=data.data.outdoor;
        const w=data.data.wind;
        const rain=data.data.rainfall;
        const p=data.data.pressure;

        const tempC=fToC(o.temperature.value);
        const hum=o.humidity.value;
        const windKm=mphToKmh(w.wind_speed.value);
        const gustKm=mphToKmh(w.wind_gust.value);
        const windDeg=w.wind_direction.value;
        const rainMm=inToMm(rain.daily.value);
        const press=inHgToHpa(p.relative.value);

        document.getElementById("tempBig").textContent=tempC.toFixed(1);
        document.getElementById("hum").textContent=hum+" %";
        document.getElementById("wind").textContent=windKm.toFixed(1)+" km/h";
        document.getElementById("windDirText").textContent="Dirección: "+windDeg+"°";
        document.getElementById("rain").textContent=rainMm.toFixed(1)+" mm";
        document.getElementById("press").textContent=press.toFixed(1)+" hPa";
        document.getElementById("uv").textContent=data.data.uv?.value ?? "--";
        document.getElementById("solar").textContent=data.data.solar_radiation?.value ?? "--";

        actualizarMinMax(tempC);
        actualizarRacha(gustKm);
        actualizarFlecha(windDeg);
        actualizarGrafica(tempC);

    }catch(e){
        console.log("Error conexión",e);
    }
}

obtenerDatos();
setInterval(obtenerDatos,300000);
