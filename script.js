// ====== API ======
const appKey="26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey="adf65434-1ace-43dd-b9a9-27915843d243";
const mac="84:CC:A8:B4:B1:F6";
const url=`https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Conversiones ======
const fToC=f=>((parseFloat(f)-32)*5/9).toFixed(1);
const mphToKmh=mph=>(parseFloat(mph)*1.60934).toFixed(1);
const inToMm=inches=>(parseFloat(inches)*25.4).toFixed(1);
const inHgToHpa=inHg=>(parseFloat(inHg)*33.8639).toFixed(1);

// ====== Animación ======
function animarValor(el,nuevo,unidad=""){
  const valAct=parseFloat(el.getAttribute("data-valor"))||0;
  const valFin=parseFloat(nuevo);
  let start=valAct; const step=(valFin-start)/20; let i=0;
  const anim=setInterval(()=>{ start+=step; el.textContent=start.toFixed(1)+unidad; i++; if(i>=20){el.textContent=valFin.toFixed(1)+unidad; el.setAttribute("data-valor",valFin); clearInterval(anim);}},50);
}

// ====== Mapa ======
const map=L.map('map').setView([41.3,-1.3],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const marker=L.marker([41.3,-1.3]).addTo(map).bindPopup('Estación Meteo Cosuenda').openPopup();

// ====== Histórico y min/max ======
function guardarHistorico(ts,temp,hum,wind,rain,press,solar,uvi,windDir){
  let hist=JSON.parse(localStorage.getItem('meteoHist'))||[];
  hist.push({ts,temp,hum,wind,rain,press,solar,uvi,windDir});
  if(hist.length>24*12) hist.shift();
  localStorage.setItem('meteoHist',JSON.stringify(hist));
  return hist;
}
function calcularMinMax(hist){
  if(!hist.length) return {};
  return {
    tempMin:Math.min(...hist.map(e=>e.temp)),
    tempMax:Math.max(...hist.map(e=>e.temp)),
    humMin:Math.min(...hist.map(e=>e.hum)),
    humMax:Math.max(...hist.map(e=>e.hum)),
    windMin:Math.min(...hist.map(e=>e.wind)),
    windMax:Math.max(...hist.map(e=>e.wind)),
    rainMin:Math.min(...hist.map(e=>e.rain)),
    rainMax:Math.max(...hist.map(e=>e.rain)),
    pressMin:Math.min(...hist.map(e=>e.press)),
    pressMax:Math.max(...hist.map(e=>e.press)),
    solarMin:Math.min(...hist.map(e=>e.solar)),
    solarMax:Math.max(...hist.map(e=>e.solar)),
    uviMin:Math.min(...hist.map(e=>e.uvi)),
    uviMax:Math.max(...hist.map(e=>e.uvi))
  };
}

// ====== Dirección viento ======
function gradosADireccion(grados){
  const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
  return dirs[Math.round(grados/22.5)%16];
}

// ====== Función principal ======
async function obtenerDatos(){
  try{
    const resp=await fetch(url);
    const json=await resp.json();
    if(json.code!==0){ console.error("Error API",json); return;}

    const outdoor=json.data.outdoor;
    const wind=json.data.wind;
    const rainfall=json.data.rainfall;
    const pressure=json.data.pressure;
    const solarVal=json.data.solar_and_uvi.solar.value;
    const uviVal=json.data.solar_and_uvi.uvi.value;

    const tempC=parseFloat(fToC(outdoor.temperature.value));
    const humVal=parseInt(outdoor.humidity.value);
    const windKmH=parseFloat(mphToKmh(wind.wind_speed.value));
    const rainMm=parseFloat(inToMm(rainfall.daily.value));
    const pressHpa=parseFloat(inHgToHpa(pressure.relative.value));
    const windDirText=gradosADireccion(parseFloat(wind.wind_direction.value));

    // Animaciones
    animarValor(document.getElementById("tempBigVal"),tempC," °C");
    animarValor(document.getElementById("hum"),humVal,"%");
    animarValor(document.getElementById("wind"),windKmH," km/h");
    animarValor(document.getElementById("rain"),rainMm," mm");
    animarValor(document.getElementById("press"),pressHpa," hPa");
    animarValor(document.getElementById("solar"),solarVal," W/m²");
    animarValor(document.getElementById("uvi"),uviVal,"");
    document.getElementById("windDir").textContent=windDirText;

    const ts=new Date().toLocaleTimeString();
    const hist=guardarHistorico(ts,tempC,humVal,windKmH,rainMm,pressHpa,solarVal,uviVal,windDirText);
    const mm=calcularMinMax(hist);

    // Mostrar min/max con color
    const campos=[['temp','°C'],['hum','%'],['wind','km/h'],['rain','mm'],['press','hPa'],['solar',' W/m²'],['uvi','']];
    campos.forEach(c=>{
      const id=c[0];
      document.getElementById(id+'Min').textContent=mm[id+'Min'].toFixed(1);
      document.getElementById(id+'Max').textContent=mm[id+'Max'].toFixed(1);
    });

    // Fondo día/noche
    const hour=new Date().getHours();
    document.body.style.background=(hour>=6 && hour<18)?"linear-gradient(to bottom,#87CEEB,#f0f8ff)":"linear-gradient(to bottom,#001848,#0a1f44)";

    // Mapa popup
    marker.setPopupContent(`Estación Meteo Cosuenda<br>Temp: ${tempC} °C<br>Humedad: ${humVal}%<br>Viento: ${windKmH} km/h ${windDirText}`).openPopup();

  }catch(err){ console.error("Error conexión",err);}
}

obtenerDatos();
setInterval(obtenerDatos,300000);
</script>
</body>
</html>

























