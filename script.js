// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${appKey}&api_key=${apiKey}&mac=${mac}&call_back=all`;

// ====== Funciones de conversión ======
const fToC = f => ((parseFloat(f) - 32) * 5 / 9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches) * 25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639).toFixed(1);

// ====== Animación de valores ======
function animarValor(element, nuevoValor, unidad = "") {
  const valorActual = parseFloat(element.getAttribute("data-valor")) || 0;
  const valorFinal = parseFloat(nuevoValor);
  let start = valorActual;
  const step = (valorFinal - start) / 20;

  let i = 0;
  const anim = setInterval(() => {
    start += step;
    element.textContent = start.toFixed(1) + unidad;
    i++;
    if (i >= 20) {
      element.textContent = valorFinal.toFixed(1) + unidad;
      element.setAttribute("data-valor", valorFinal);
      clearInterval(anim);
    }
  }, 50);
}

// ====== Función principal ======
// 🔹 Funciones de conversión
const fToC = f => ((parseFloat(f) - 32) * 5 / 9).toFixed(1);
const mphToKmh = mph => (parseFloat(mph) * 1.60934).toFixed(1);
const inToMm = inches => (parseFloat(inches) * 25.4).toFixed(1);
const inHgToHpa = inHg => (parseFloat(inHg) * 33.8639).toFixed(1);

// 🔹 Función principal
async function obtenerDatos() {
  try {
    const response = await fetch(url);
    const json = await response.json();
    const json = await response.json();

// Mostrar todos los datos legibles
console.log("Respuesta API completa:", JSON.stringify(json, null, 2));
console.dir(json); // para expandir objetos fácilmente

  console.log("Respuesta API completa:", json);
    
console.log("Temperatura:", json.data?.outdoor?.temperature);
console.log("Humedad:", json.data?.outdoor?.humidity);
console.log("Viento:", json.data?.wind?.speed);
console.log("Lluvia:", json.data?.rainfall?.rate);
console.log("Presión:", json.data?.barometer?.pressure);

    console.log("Respuesta API:", json); // Para depuración

    if (!json || !json.data) {
      document.getElementById("description").innerText = "No hay datos disponibles";
      document.getElementById("temp").innerText = "--°C";
      document.getElementById("extraData").innerText = "💧 --%   💨 -- km/h   🌦 -- mm   🌡 -- hPa";
      skycons.set("weatherIcon", Skycons.CLEAR_DAY);
      document.body.style.background = "linear-gradient(to top, #4facfe, #00f2fe)";
      return;
    }

    // 🔹 Temperatura
    let temp = json.data?.outdoor?.temperature?.value ?? "--";
    const tempUnit = json.data?.outdoor?.temperature?.unit ?? "C";
    if (tempUnit === "F") temp = fToC(temp);
    if (temp > 50 || temp < -10) temp = "--"; // Filtrar valores extremos

    // 🔹 Humedad
    const humedad = json.data?.outdoor?.humidity?.value ?? "--";

    // 🔹 Viento
    let viento = json.data?.wind?.speed?.value ?? "--";
    const vientoUnit = json.data?.wind?.speed?.unit ?? "km/h";
    if (vientoUnit === "mph") viento = mphToKmh(viento);

    // 🔹 Lluvia
    let lluvia = json.data?.rainfall?.rate?.value ?? 0;
    const lluviaUnit = json.data?.rainfall?.rate?.unit ?? "mm";
    if (lluviaUnit === "in") lluvia = inToMm(lluvia);

    // 🔹 Presión
    let presion = json.data?.barometer?.pressure?.value ?? "--";
    const presionUnit = json.data?.barometer?.pressure?.unit ?? "hPa";
    if (presionUnit === "inHg") presion = inHgToHpa(presion);

    // 🔹 Mostrar datos
    document.getElementById("temp").innerText = temp + "°C";
    document.getElementById("extraData").innerText =
      `💧 ${humedad}%   💨 ${viento} km/h   🌦 ${lluvia} mm   🌡 ${presion} hPa`;

    // 🔹 Iconos y fondo dinámico
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
    document.getElementById("description").innerText = "Error de conexión";
    document.getElementById("temp").innerText = "--°C";
    document.getElementById("extraData").innerText = "💧 --%   💨 -- km/h   🌦 -- mm   🌡 -- hPa";
    skycons.set("weatherIcon", Skycons.CLEAR_DAY);
    document.body.style.background = "linear-gradient(to top, #4facfe, #00f2fe)";
  }
}

































