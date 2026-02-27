// ====== API ======
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";

const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ===== CONVERSIONES =====
const fToC=f=>(f-32)*5/9;
const mphToKmh=m=>m*1.60934;
const inToMm=i=>i*25.4;
const inHgToHpa=i=>i*33.8639;

function gradosADireccion(g){
 const d=["N","NE","E","SE","S","SW","W","NW"];
 return d[Math.round(g/45)%8];
}

// ===== ROSA =====
function crearRosa(){
 const rosa=document.getElementById("rosa");
 for(let i=0;i<360;i+=10){
   const m=document.createElement("div");
   m.className="marca";
   m.style.transform=`translateX(-50%) rotate(${i}deg)`;
   rosa.appendChild(m);
 }
 const puntos=["N","E","S","W"];
 const pos=[[50,5],[95,50],[50,95],[5,50]];
 puntos.forEach((p,i)=>{
   const el=document.createElement("div");
   el.className="cardinal";
   el.style.left=pos[i][0]+"%";
   el.style.top=pos[i][1]+"%";
   el.style.transform="translate(-50%,-50%)";
   el.innerText=p;
   rosa.appendChild(el);
 });
}
crearRosa();

// ===== FLECHA =====
let ang=0;
function actualizarFlecha(grados,vel){
 const f=document.getElementById("flechaViento");
 if(!f) return;
 let diff=grados-ang;
 if(diff>180) diff-=360;
 if(diff<-180) diff+=360;
 ang+=diff;
 f.style.transform=`translateX(-50%) rotate(${ang}deg)`;
 f.style.background=vel<15?"blue":vel<30?"orange":"red";
}

// ===== GAUGE =====
function actualizarGauge(id,val,max){
 const g=document.getElementById(id+"Gauge");
 if(!g) return;
 const deg=(val/max)*180;
 g.style.transform=`rotate(${deg}deg)`;
}

// ===== GRÁFICO =====
let chart;
const labels=[],temps=[];
function actualizarGrafico(t){
 const ahora=new Date();
 labels.push(ahora.getHours()+":"+String(ahora.getMinutes()).padStart(2,"0"));
 temps.push(t);
 if(labels.length>24){labels.shift();temps.shift();}
 if(!chart){
  chart=new Chart(document.getElementById("tempChart"),{
   type:"line",
   data:{labels:labels,datasets:[{data:temps,borderColor:"#ff5733",tension:.3}]},
   options:{plugins:{legend:{display:false}}}
  });
 }else{
  chart.data.labels=labels;
  chart.data.datasets[0].data=temps;
  chart.update();
 }
}

// ===== EXTREMOS =====
function extremos(temp,hum,wind){
 const hoy=new Date().toDateString();
 let e=JSON.parse(localStorage.getItem("ext"));
 if(!e||e.fecha!==hoy)
   e={fecha:hoy,min:temp,max:temp,humMax:hum,windMax:wind};
 else{
  if(temp<e.min)e.min=temp;
  if(temp>e.max)e.max=temp;
  if(hum>e.humMax)e.humMax=hum;
  if(wind>e.windMax)e.windMax=wind;
 }
 localStorage.setItem("ext",JSON.stringify(e));
 return e;
}

// ===== PRINCIPAL =====
async function obtenerDatos(){
 try{
  const r=await fetch(url);
  const d=await r.json();
  if(d.code!==0) return;

  const o=d.data.outdoor;
  const w=d.data.wind;
  const rain=d.data.rainfall;
  const p=d.data.pressure;

  const temp=fToC(o.temperature.value);
  const feels=fToC(o.feels_like?.value||o.temperature.value);
  const hum=o.humidity.value;
  const wind=mphToKmh(w.wind_speed.value);
  const gust=mphToKmh(w.wind_gust.value);
  const deg=w.wind_direction.value;
  const rainDay=inToMm(rain.daily.value);
  const press=inHgToHpa(p.relative.value);
  const uv=o.uv?.value||0;
  const solar=o.solar_radiation?.value||0;

  document.getElementById("tempBig").innerText=temp.toFixed(1)+" °C";
  document.getElementById("feelsLike").innerText="Sensación: "+feels.toFixed(1)+" °C";
  document.getElementById("hum").innerText=hum+" %";
  document.getElementById("wind").innerText="Viento: "+wind.toFixed(1)+" km/h";
  document.getElementById("gust").innerText="Racha: "+gust.toFixed(1)+" km/h";
  document.getElementById("windDirText").innerText="Dirección: "+deg+"° "+gradosADireccion(deg);
  document.getElementById("rainDay").innerText="Hoy: "+rainDay.toFixed(1)+" mm";
  document.getElementById("press").innerText=press.toFixed(1)+" hPa";
  document.getElementById("uvText").innerText="Índice UV: "+uv;
  document.getElementById("solar").innerText=solar+" W/m²";

  actualizarFlecha(deg,wind);
  actualizarGauge("hum",hum,100);
  actualizarGauge("uv",uv,11);
  actualizarGrafico(temp);

  const ex=extremos(temp,hum,wind);
  document.getElementById("tempMin").innerText="Mín: "+ex.min.toFixed(1)+" °C";
  document.getElementById("tempMax").innerText="Máx: "+ex.max.toFixed(1)+" °C";
  document.getElementById("humMax").innerText="Humedad máx: "+ex.humMax+" %";
  document.getElementById("windMax").innerText="Racha máx: "+ex.windMax.toFixed(1)+" km/h";

  const hora=new Date().getHours();
  document.body.style.background=
    hora>=6&&hora<18
    ?"linear-gradient(to bottom,#87CEEB,#f0f8ff)"
    :"linear-gradient(to bottom,#001848,#0a1f44)";

 }catch(e){console.log("Error",e);}
}

obtenerDatos();
setInterval(obtenerDatos,300000);
