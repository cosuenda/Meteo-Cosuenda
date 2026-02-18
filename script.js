// ====== Claves y URL API ======
const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time?application_key=${APP_KEY}&api_key=${API_KEY}&mac=${MAC}&call_back=all`;

async function obtenerDatos() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Ajusta según tu estructura de API
    document.getElementById('temperature').innerText = `${data.temperature} °C`;
    document.getElementById('humidity').innerText = `${data.humidity} %`;
    document.getElementById('wind').innerText = `${data.wind_speed} km/h`;

    // Selección de icono según condición
    const icon = document.getElementById('weather-icon');
    const cond = data.weather_condition.toLowerCase();

    if(cond.includes('sun') || cond.includes('clear')) icon.src = "icons/sun.png";
    else if(cond.includes('cloud')) icon.src = "icons/clouds.png";
    else if(cond.includes('rain')) icon.src = "icons/rain.png";
    else icon.src = "icons/sun.png";

  } catch (err) {
    console.error("Error al obtener datos:", err);
  }
}

obtenerDatos();
setInterval(obtenerDatos, 300000); // Actualiza cada 5 min

// ----------------------
// Galería con ampliación
// ----------------------
const images = document.querySelectorAll('.images img');

images.forEach(img => {
  img.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.cursor = 'pointer';
    overlay.style.zIndex = '1000';

    const imgClone = img.cloneNode();
    imgClone.style.maxWidth = '90%';
    imgClone.style.maxHeight = '90%';
    imgClone.style.borderRadius = '10px';
    overlay.appendChild(imgClone);

    overlay.addEventListener('click', () => overlay.remove());

    document.body.appendChild(overlay);
  });
});






























