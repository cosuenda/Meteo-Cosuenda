const APP_KEY = 26C4D6AD21CF8F8C4F3BA85E1CAF6701;
const API_KEY = adf65434-1ace-43dd-b9a9-27915843d243;
const MAC = 84:CC:A8:B4:B1:F6;
const url =https://www.ecowitt.net/home/index?id=61227
// Elementos en la página
const tempEl = document.getElementById("temp");
const humEl  = document.getElementById("hum");
const presEl = document.getElementById("pres");
const estadoEl = document.getElementById("estado");

// Función principal
async function obtenerDatos() {
  estadoEl.textContent = "Cargando datos...";
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.outdoor) {
      throw new Error("Datos de la estación no disponibles");
    }

    tempEl.textContent = data.data.outdoor.temperature?.value ?? "--";
    humEl.textContent  = data.data.outdoor.humidity?.value ?? "--";
    presEl.textContent = data.data.pressure?.relative?.value ?? "--";

    estadoEl.textContent = "Datos actualizados ✔";

  } catch (error) {
    console.error(error);
    estadoEl.textContent = `Error cargando datos: ${error.message}`;
    tempEl.textContent = "--";
    humEl.textContent = "--";
    presEl.textContent = "--";
  }
}

// Actualiza cada 60 segundos
obtenerDatos();
setInterval(obtenerDatos, 60000);


