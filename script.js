const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

const fToC=f=>(parseFloat(f)-32)*5/9;
const mphToKmh=m=>parseFloat(m)*1.60934;
const inToMm=i=>parseFloat(i)*25.4;
const inHgToHpa=i=>parseFloat(i)*33.8639;

function gradosADireccion(g){
const d=["N","NE","E","SE","S","SW","W","NW"];
return d[Math.round(g/45)%8];
}

function inicializarDia(){
const hoy=new Date().toISOString().split("T")[0];
if(localStorage.getItem("diaActual")!==hoy){
localStorage.setItem("diaActual",hoy);
localStorage.setItem("tempMin","999");
localStorage.setItem("tempMax","-999");
localStorage.setItem("windMax","0");
}
}
inicializarDia();

async function obtenerDatos(){
try{
const resp=await fetch(url);
const data=await resp.json();
if(data.code!==0)return;

const o=data.data.outdoor;
const w=data.data.wind;
const r=data.data.rainfall;
const p=data.data.pressure;

const tempC=fToC(o.temperature.value);
const hum=o.humidity.value;
const windKm=mphToKmh(w.wind_speed.value);
const windDeg=w.wind_direction.value;
const windGust=mphToKmh(w.wind_gust.value ?? 0);
const rainMm=inToMm(r.daily.value);
const rainMonth=inToMm(r.month?.value ?? 0);
const press=inHgToHpa(p.relative?.value ?? 1013);

let sens=tempC.toFixed(1)+"°";
if(o.heat_index?.value!=null) sens=fToC(o.heat_index.value).toFixed(1)+"°";
if(o.windchill?.value!=null) sens=fToC(o.windchill.value).toFixed(1)+"°";

let uv=data.data.uv?.value ?? "--";
let solar=data.data.solar_radiation?.value?data.data.solar_radiation.value+" W/m²":"--";

let tMin=parseFloat(localStorage.getItem("tempMin"));
let tMax=parseFloat(localStorage.getItem("tempMax"));
let wMax=parseFloat(localStorage.getItem("windMax"));

if(tempC<tMin){tMin=tempC;localStorage.setItem("tempMin",tMin);}
if(tempC>tMax){tMax=tempC;localStorage.setItem("tempMax",tMax);}
if(windGust>wMax){wMax=windGust;localStorage.setItem("windMax",wMax);}

document.getElementById("tempBig").textContent=tempC.toFixed(1)+"°";
document.getElementById("tempMin").textContent="Min: "+tMin.toFixed(1)+"°";
document.getElementById("tempMax").textContent="Max: "+tMax.toFixed(1)+"°";
document.getElementById("sensacion").textContent="Sensación térmica: "+sens;

document.getElementById("hum").textContent=hum+" %";
document.getElementById("wind").textContent=windKm.toFixed(1)+" km/h";
document.getElementById("windMax").textContent=wMax.toFixed(1)+" km/h";
document.getElementById("windDirText").textContent="Dirección: "+gradosADireccion(windDeg);
document.getElementById("rain").textContent=rainMm.toFixed(1)+" mm";
document.getElementById("rainMonth").textContent=rainMonth.toFixed(1)+" mm";
document.getElementById("press").textContent=press.toFixed(1)+" hPa";
document.getElementById("uv").textContent=uv;
document.getElementById("solar").textContent=solar;

document.getElementById("flechaViento").style.transform=`translateX(-50%) rotate(${windDeg}deg)`;

const ahora=new Date();
document.getElementById("ultimaActualizacion").textContent=
"Última actualización: "+ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0");

}catch(e){console.log("Error:",e);}
}

const ctx=document.getElementById("tempChart").getContext("2d");
new Chart(ctx,{
type:"line",
data:{labels:[],datasets:[{data:[],borderColor:"#ff4c4c",backgroundColor:"rgba(255,0,0,0.1)",fill:true,tension:0.4}]},
options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:false}}}
});

obtenerDatos();
setInterval(obtenerDatos,300000);
