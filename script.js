// ----------------------------
// script.js para Meteo-Cosuenda
// ----------------------------

// ⚠️ Sustituye estos valores por los de tu estación
const APP_KEY = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const API_KEY = "adf65434-1ace-43dd-b9a9-27915843d243";
const MAC = "84:CC:A8:B4:B1:F6";

// URL de la API
const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${APP_KEY}&api_key=${API_KEY}&mac=${MAC}&call_back=all`;

// ----------------------------
// Funciones de conversión
// ----------------------------
const fToC = f => ((parseFloat(f) - 32) * 5 / 9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches) * 25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639).toFixed(1);

// ----------------------------
// Inicializar Skycons
// ----------------------------
const skycons = new Skycons({"color": "white"});
skycons.add("weatherIcon", Skycons.CLEAR_DAY);
skycons.play();

// ----------------------------
// Función principal
// ----------------------------
async function obtenerDatos() {
  try {
    const response = await fetch(url);
    const json = await response.json();
    
    console.log("Temperatura cruda:", json.data.outdoor.temperature);
    console.log("Respuesta completa:", JSON.stringify(json, null, 2));

    if (!json || !json.data) {
      mostrarDatosFallback();
      return;
    }

    // ----------------------------
    // Temperatura
    // ----------------------------
    let temp = json.data?.outdoor?.temperature?.value ?? "--";
    const tempUnit = json.data?.outdoor?.temperature?.unit ?? "C";
    if (tempUnit === "F") temp = fToC(temp);
    if (temp > 50 || temp < -10) temp = "--"; // Filtrar valores absurdos

    // ----------------------------
    // Humedad
    // ----------------------------
    const humedad = json.data?.outdoor?.humidity?.value ?? "--";

    // ----------------------------
    // Viento
    // ----------------------------
    let viento = json.data?.wind?.speed_avg?.value ?? json.data?.wind?.speed_max?.value ?? "--";
    const vientoUnit = json.data?.wind?.speed_avg?.unit ?? json.data?.wind?.speed_max?.unit ?? "km/h";
    if (vientoUnit === "mph") viento = mphToKmh(viento);

    // ----------------------------
    // Lluvia
    // ----------------------------
    let lluvia = json.data?.rainfall?.rate?.value ?? 0;
    const lluviaUnit = json.data?.rainfall?.rate?.unit ?? "mm";
    if (lluviaUnit === "in") lluvia = inToMm(lluvia);

    // ----------------------------
    // Presión
    // ----------------------------
    let presion = json.data?.barometer?.pressure?.value ?? "--";
    const presionUnit = json.data?.barometer?.pressure?.unit ?? "hPa";
    if (presionUnit === "inHg") presion = inHgToHpa(presion);

    // ----------------------------
    // Mostrar datos en HTML
    // ----------------------------
    document.getElementById("temp").innerText = temp + "°C";
    document.getElementById("extraData").innerText =
      `💧 ${humedad}%   💨 ${viento} km/h   🌦 ${lluvia} mm   🌡 ${presion} hPa`;

    // ----------------------------
    // Iconos y fondo dinámico
    // ----------------------------
    const hora = new Date().getHours();
    const esNoche = hora >= 20 || hora <= 6;

    let icono, descripcion, fondo;

    if (lluvia > 0) {
      icono = Skycons.RAIN;
      descripcion = "Lluvia";
      fondo = "linear-gradient(to top, #4e54c8, #8f94fb)";
    } 
    else if (viento > 30) {
      icono = Skycons.WIND;
      descripcion = "Viento fuerte";
      fondo = "linear-gradient(to top, #757f9a, #d7dde8)";
    } 
    else if (esNoche) {
      icono = Skycons.CLEAR_NIGHT;
      descripcion = "Noche despejada";
      fondo = "linear-gradient(to top, #141e30, #243b55)";
    } 
    else if (temp > 35) {
      icono = Skycons.CLEAR_DAY;
      descripcion = "Calor intenso";
      fondo = "linear-gradient(to top, #ff512f, #f09819)";
    } 
    else {
      icono = Skycons.PARTLY_CLOUDY_DAY;
      descripcion = "Parcialmente nublado";
      fondo = "linear-gradient(to top, #bdc3c7, #2c3e50)";
    }

    skycons.set("weatherIcon", icono);
    document.getElementById("description").innerText = descripcion;
    document.body.style.background = fondo;

  } catch (error) {
    console.error("Error cargando datos:", error);
    mostrarDatosFallback();
  }
}

// ----------------------------
// Función para mostrar fallback si hay error
// ----------------------------
function mostrarDatosFallback() {
  document.getElementById("description").innerText = "Error de conexión";
  document.getElementById("temp").innerText = "--°C";
  document.getElementById("extraData").innerText = "💧 --%   💨 -- km/h   🌦 -- mm   🌡 -- hPa";
  skycons.set("weatherIcon", Skycons.CLEAR_DAY);
  document.body.style.background = "linear-gradient(to top, #4facfe, #00f2fe)";
}

// ----------------------------
// Llamada inicial y actualización cada 60s
// ----------------------------
obtenerDatos();
setInterval(obtenerDatos, 60000);


































