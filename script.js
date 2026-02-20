<script>
// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Conversión ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches) * 25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639).toFixed(1);

// ====== Animar valores ======
function animarValor(el,nuevo,unidad=""){
    const valAct=parseFloat(el.getAttribute("data-valor"))||0;
    const valFin=parseFloat(nuevo);
    let start=valAct;
    const step=(valFin-start)/20;
    let i=0;
    const anim=setInterval(()=>{
        start+=step;
        el.textContent=start.toFixed(1)+unidad;
        i++;
        if(i>=20){
            el.textContent=valFin.toFixed(1)+unidad;
            el.setAttribute("data-valor",valFin);
            clearInterval(anim);
        }
    },50);
}

// ====== Función principal ======
async function obtenerDatos(){
    try{
        const response=await fetch(url);
        const data=await response.json();

        if(data.code!==0){
            console.error("Error API:",data);
            return;
        }

        const outdoor=data.data.outdoor;
        const wind=data.data.wind;
        const rainfall=data.data.rainfall;
        const pressure=data.data.pressure;

        const tempC=parseFloat(fToC(outdoor.temperature.value));

        // ====== TEMPERATURA GRANDE ======
        document.getElementById("tempBig").textContent=tempC+" °C";
        // ====== MINIMAS Y MAXIMAS DIARIAS ======
if(outdoor.temperature.min && outdoor.temperature.max){
    const tempMin = fToC(outdoor.temperature.min);
    const tempMax = fToC(outdoor.temperature.max);

    document.getElementById("tempMin").textContent = tempMin + " °C";
    document.getElementById("tempMax").textContent = tempMax + " °C";
}

        // ====== MINIMA Y MAXIMA DIARIA ======
        let hoy=new Date().toDateString();
        let datosDia=JSON.parse(localStorage.getItem("meteoDia"))||{
            fecha:hoy,
            min:tempC,
            max:tempC
        };

        if(datosDia.fecha!==hoy){
            datosDia={
                fecha:hoy,
                min:tempC,
                max:tempC
            };
        }

        if(tempC<datosDia.min) datosDia.min=tempC;
        if(tempC>datosDia.max) datosDia.max=tempC;

        localStorage.setItem("meteoDia",JSON.stringify(datosDia));

        document.getElementById("tempMin").textContent=datosDia.min.toFixed(1)+" °C";
        document.getElementById("tempMax").textContent=datosDia.max.toFixed(1)+" °C";

        // ====== OTROS VALORES ======
        animarValor(document.getElementById("hum"),outdoor.humidity.value,"%");
        animarValor(document.getElementById("wind"),mphToKmh(wind.wind_speed.value)," km/h");
        animarValor(document.getElementById("rain"),inToMm(rainfall.daily.value)," mm");
        animarValor(document.getElementById("press"),inHgToHpa(pressure.relative.value)," hPa");

        // ====== FONDO DIA/NOCHE ======
        const hour=new Date().getHours();
        if(hour>=6 && hour<18)
            document.body.style.background="linear-gradient(to bottom,#87CEEB,#f0f8ff)";
        else
            document.body.style.background="linear-gradient(to bottom,#001848,#0a1f44)";

    }catch(error){
        console.error("Error de conexión:",error);
    }
}

// ====== Carga inicial + actualización cada 5 min ======
obtenerDatos();
setInterval(obtenerDatos,300000);

</script>

























