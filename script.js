// ----------------------------
// CONFIGURACIÓN ECOWITT
// ----------------------------
const APP_KEY = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const API_KEY = "adf65434-1ace-43dd-b9a9-27915843d243";
const MAC = "84:CC:A8:B4:B1:F6";

const url = `https://www.ecowitt.net/home/index?id=61227&application_key=${APP_KEY}&api_key=${API_KEY}&mac=${MAC}&call_back=all`;

// ----------------------------
// CONVERSIÓN DE UNIDADES
// ----------------------------
function fToC(f) { return ((f - 32) * 5/9); }
function mphToKmh(mph) { return mph * 1.60934; }
function inHgToHpa(inhg) { return inhg * 33.8639; }
function inToMm(rain) { return rain * 25.4; }

// ----------------------------
// ANIMACIÓN DE LLUVIA
// ----------------------------
const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");
let gotas = [];

function crearGotas(lluvia) {
  gotas = [];
  let cantidad = Math.min(lluvia * 10, 50);
  for(let i=0;i<cantidad;i++){
    gotas.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, velocidad:2+Math.random()*3, largo:5+Math.random()*5 });
  }
}

function animarGotas() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "rgba(0,0,255,0.6)";
  ctx.lineWidth = 2;
  gotas.forEach(g => {
    ctx.beginPath();
    ctx.moveTo(g.x,g.y);
    ctx.lineTo(g.x,g.y+g.largo);
    ctx.stroke();
    g.y += g.velocidad;
    if(g.y > canvas.height) g.y = -g.largo;
  });
  requestAnimationFrame(animarGotas);
}
animarGotas();

function actualizarAnimacionLluvia(lluvia){
  if(lluvia>0){ crearGotas(lluvia); canvas.style.display="block"; }
  else canvas.style.display="none";
}

// ----------------------------
// COLORES DINÁMICOS
// ----------------------------
function actualizarColores(temp, hum, wind, lluvia, presion){
  const tempCard = document.querySelector("#temp").parentElement;
  if(temp<10) tempCard.style.background="#a3c4f3";
  else if(temp<=25) tempCard.style.background="#c3f3a3";
  else tempCard.style.background="#f3a3a3";

  const humCard = document.querySelector("#hum").parentElement;
  if(hum<30) humCard.style.background="#fff4a3";
  else if(hum<=70) humCard.style.background="#a3d4f3";
  else humCard.style.background="#3a7bd5";

  const windCard = document.querySelector("#wind").parentElement;
  if(wind>20) windCard.style.boxShadow="0 0 15px 3px rgba(0,0,255,0.5)";
  else windCard.style.boxShadow="0 4px 8px rgba(0,0,0,0.1)";

  const rainCard = document.querySelector("#rain").parentElement;
  if(lluvia>0) rainCard.style.background="linear-gradient(to bottom, #a3c4f3 0%, #3a7bd5 100%)";
  else rainCard.style.background="#ffffff";

  const pressCard = document.querySelector("#press").parentElement;
  if(presion>1020) pressCard.style.border="3px solid green";
  else if(presion<1000) pressCard.style.border="3px solid red";
  else pressCard.style.border="3px solid #ccc";
}

// ----------------------------
// MÁXIMOS Y MÍNIMOS LOCALES
// ----------------------------
function actualizarMaximos(temp, hum, presion, lluvia){
  const ahora = new Date(); 
  const año=ahora.getFullYear(), mes=ahora.getMonth()+1, dia=ahora.getDate();
  const claves = [
    {key:`dia_${año}_${mes}_${dia}`,type:"Diario"},
    {key:`mes_${año}_${mes}`,type:"Mensual"},
    {key:`anual_${año}`,type:"Anual"}
  ];
  claves.forEach(c=>{
    let maxMin = JSON.parse(localStorage.getItem(c.key)) || 
      {tempMax:-100,tempMin:100,humMax:0,humMin:100,presMax:0,presMin:2000,lluviaTotal:0};
    if(temp>maxMin.tempMax) maxMin.tempMax=temp;
    if(temp<maxMin.tempMin) maxMin.tempMin=temp;
    if(hum>maxMin.humMax) maxMin.humMax=hum;
    if(hum<maxMin.humMin) maxMin.humMin=hum;
    if(presion>maxMin.presMax) maxMin.presMax=presion;
    if(presion<maxMin.presMin) maxMin.presMin=presion;
    maxMin.lluviaTotal+=lluvia;
    localStorage.setItem(c.key,JSON.stringify(maxMin));
    document.getElementById(`tempMax${c.type}`).textContent=maxMin.tempMax.toFixed(1);
    document.getElementById(`tempMin${c.type}`).textContent=maxMin.tempMin.toFixed(1);
    document.getElementById(`humMax${c.type}`).textContent=maxMin.humMax;
    document.getElementById(`humMin${c.type}`).textContent=maxMin.humMin;
    document.getElementById(`presMax${c.type}`).textContent=maxMin.presMax.toFixed(1);
    document.getElementById(`presMin${c.type}`).textContent=maxMin.presMin.toFixed(1);
    document.getElementById(`lluvia${c.type}`).textContent=maxMin.lluviaTotal.toFixed(1);
  });
}

// ----------------------------
// OBTENER DATOS Y ACTUALIZAR
// ----------------------------
async function obtenerDatos(){
  try{
    const response = await fetch(url);
    const data = await response.json();
    if(data.code!==0){ console.error("Error API:",data); return; }

    const outdoor = data.data.outdoor;
    const temp = fToC(parseFloat(outdoor.temperature.value));
    const humedad = parseFloat(outdoor.humidity.value);
    const presion = inHgToHpa(parseFloat(data.data.pressure.relative.value));
    const lluvia = inToMm(parseFloat(data.data.rainfall.daily.value));
    const wind = mphToKmh(parseFloat(data.data.wind.wind_speed.value));

    document.getElementById("temp").textContent = temp.toFixed(1)+" °C";
    document.getElementById("hum").textContent = humedad+" %";
    document.getElementById("press").textContent = presion.toFixed(1)+" hPa";
    document.getElementById("wind").textContent = wind.toFixed(1)+" km/h";
    document.getElementById("rain").textContent = lluvia.toFixed(1)+" mm";
    document.getElementById("update").textContent = "Última actualización: "+new Date().toLocaleString();

    actualizarColores(temp, humedad, wind, lluvia, presion);
    actualizarAnimacionLluvia(lluvia);
    actualizarMaximos(temp, humedad, presion, lluvia);

  } catch(err){ console.error("Error conexión:",err); }
}

// ----------------------------
// EXPORTAR CSV
// ----------------------------
function exportarCSV(){
  let datos=[];
  for(let clave in localStorage){
    if(clave.startsWith("dia_")||clave.startsWith("mes_")||clave.startsWith("anual_")){
      let v=JSON.parse(localStorage.getItem(clave));
      datos.push([clave,v.tempMax,v.tempMin,v.humMax,v.humMin,v.presMax,v.presMin,v.lluviaTotal].join(","));
    }
  }
  let contenido="Fecha,TempMax,TempMin,HumMax,HumMin,PresMax,PresMin,LluviaTotal\n"+datos.join("\n");
  let blob=new Blob([contenido],{type:"text/csv"});
  let url=URL.createObjectURL(blob);
  let a=document.createElement("a"); a.href=url; a.download="historico_meteo.csv"; a.click();
}

// ----------------------------
// INICIALIZAR
// ----------------------------
obtenerDatos();
setInterval(obtenerDatos, 10*60*1000); // actualizar cada 10 min






















